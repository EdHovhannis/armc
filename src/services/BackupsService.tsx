import { IndexConfig } from '@src/store/config/Types';
import { clone } from 'lodash';

import { FilterDefinition, FilterSelection, FilterSelections, IBackupsFilter, IFilterCollections, IListBackups } from '../components/backups/types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис размещений в данный момент недоступен. Обратитесь к администратору.';

export const BACKUPS_PATH = {
  index: 'control',
  backupRecovery: 'backup_recovery',
  backup: 'backup',
  savepoint: 'savepoint',
  savepointRecovery: 'savepoint_recovery',
  recoveryOverview: 'recovery_overview',
  incidents: 'incidents',
};

const DEFAULT_PATH = '/internal/index/fulltext';

// Формирование url для запроса восстановления
const buildRequestUrl = (path: string | null, filter: IBackupsFilter, useName = false) => {
  let params = {};

  const paramsMap: Record<string, any> = {
    backupFilter: filter.backupFilter && filter.backupFilter.length > 0 ? filter.backupFilter.join(',') : undefined,
    fromFilter: filter.fromFilter,
    toFilter: filter.toFilter,
    finishFilter: filter.finishFilter,
    corrupted: filter.corrupted !== undefined ? String(filter.corrupted) : undefined,
    page: filter.page,
    pageSize: filter.pageSize,
  };

  Object.entries(paramsMap).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = { ...params, [key]: value };
    }
  });

  const collectionPart = filter.collection ? `/collection/${filter.collection}` : '';

  let url = `/${path ?? ''}/project/${filter.projectShortName}`;
  if (filter.taskName) {
    url += `/${useName ? 'name' : 'task'}/${filter.taskName}`;
  }
  if (filter.zoneId) {
    url += `/zone/${filter.zoneId}`;
  }
  url += collectionPart;

  return {
    url: url.replace(/\/+/g, '/'),
    params: params ?? {},
  };
};

export default class BackupsService {
  // Получение информации о способах восстановления индекса
  static async requestGet(
    path: string | null,
    filter: IBackupsFilter,
    okCallback: (result: any) => void,
    errorCallback: (message: string) => void,
    pathPostfix?: string,
    useName?: boolean,
  ) {
    try {
      const requestUrl = buildRequestUrl(path, filter, useName);
      const result = await BackendProvider.request('GET', `${DEFAULT_PATH}${requestUrl.url}/${pathPostfix ?? ''}`, null, requestUrl.params);

      if (result.ok) {
        if (this.isNoContent(result.status)) {
          okCallback(null);
        } else {
          okCallback(await result.json());
        }
      } else {
        const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
        errorCallback(message.message);
      }
    } catch (error) {
      errorCallback('Ошибка при выполнении запроса');
    }
  }

  static async requestPost(
    path: string,
    filter: IBackupsFilter,
    data: any,
    okCallback: (result: any) => void,
    errorCallback: (message: string) => void,
  ) {
    const cloneFilter = clone(filter);
    delete cloneFilter.collection;

    const requestUrl = buildRequestUrl(path, cloneFilter);

    const result = await BackendProvider.request('POST', `${DEFAULT_PATH}${requestUrl.url}`, null, requestUrl.params, JSON.stringify(data));

    if (result.ok) {
      if (this.isNoContent(result.status)) {
        okCallback(null);
      } else {
        okCallback(await result.json());
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async requestDelete(path: string, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', `${DEFAULT_PATH}/${path}`);

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async requestPut(path: string, data: any, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('PUT', `${DEFAULT_PATH}/${path}`, null, null, JSON.stringify(data));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchCollectionsAutocomplete(
    zone: string,
    limit: number,
    errorCallback: (message: string) => void,
    projects?: string[],
    indexes?: string[],
    q?: string,
  ): Promise<IFilterCollections | null> {
    const params: Record<string, any> = {
      q: q || '',
      limit: limit,
    };
    if (projects) {
      params.projectFilter = projects;
    }
    if (indexes) {
      params.indexFilter = indexes;
    }
    const result = await BackendProvider.request('GET', `${DEFAULT_PATH}/zone/${zone}/collections`, null, params);
    if (result.ok) {
      return (await result.json()) as IFilterCollections;
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message.message);
      return null;
    }
  }

  static async fetchBackupNamesAutocomplete(
    zone: string,
    limit: number,
    errorCallback: (message: string) => void,
    projects?: string[],
    indexes?: string[],
    collections?: string[],
    q?: string,
  ): Promise<string[] | null> {
    const params: Record<string, any> = {
      q: q || '',
      limit: limit,
    };

    if (projects) {
      params.projectFilter = projects;
    }
    if (indexes) {
      params.indexFilter = indexes;
    }
    if (collections) {
      params.collectionsFilter = collections;
    }
    const result = await BackendProvider.request('GET', `${DEFAULT_PATH}/backup/zone/${zone}/backup_names`, null, params);
    if (result.ok) {
      return (await result.json()) as string[];
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message.message);
      return null;
    }
  }
  static createFilterParams = (
    filterDefinitionsMap: Map<string, FilterDefinition>,
    filtersMap: Map<string, FilterSelection>,
  ): Record<string, string> => {
    const params: Record<string, string> = {};
    for (const [key, filterDef] of filterDefinitionsMap) {
      const filterValue = filtersMap.get(key);
      if (!filterValue || !filterDef.serializeToUrlParam) continue;

      const serialized = filterDef.serializeToUrlParam(filterValue);
      if (!serialized) continue;

      if (filterDef.type !== 'daterange') {
        // Простые фильтры: project, index, status и т.д.
        if (typeof serialized === 'string') {
          params[key] = serialized;
        }
      } else {
        // Особая логика для daterange
        if (typeof serialized === 'object') {
          if (serialized.fromFilter) params.fromFilter = serialized.fromFilter;
          if (serialized.toFilter) params.toFilter = serialized.toFilter;
        }
      }
    }
    return params;
  };

  static makeQueryParams = (filterDefinitions: FilterDefinition[], filters: FilterSelection[], page: number, pageSize: number) => {
    const filterDefinitionsMap = new Map<string, FilterDefinition>();
    for (const def of filterDefinitions) {
      filterDefinitionsMap.set(def.key, def);
    }
    const filtersMap = new Map<string, FilterSelection>();
    for (const filter of filters) {
      filtersMap.set(filter.key, filter);
    }
    const filterParams = BackupsService.createFilterParams(filterDefinitionsMap, filtersMap);
    const params: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
      ...filterParams,
    };
    return params;
  };

  static async fetchBackupList(
    zone: string,
    path: string,
    filterDefinitions: FilterDefinition[],
    filters: FilterSelections,
    page: number,
    pageSize: number,
    okCallback: (data: IListBackups) => void,
    errorCallback: (message: string) => void,
  ) {
    const params = BackupsService.makeQueryParams(filterDefinitions, filters, page, pageSize);
    const result = await BackendProvider.request('GET', `${DEFAULT_PATH}/${path}/zone/${zone}`, null, params);
    if (result.ok) {
      okCallback((await result.json()) as IListBackups);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message.message);
    }
  }

  static isNoContent = (statusCode: number) => statusCode === 200;
}

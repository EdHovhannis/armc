import Papa from 'papaparse';

import { DictionaryQuota, Lookup, LookupQuota, ShortInfo, Dictionary } from '../store/lookup/Types';
import { ErrorHandling } from '../utils/ErrorHandling';
import { COLUMN_PREFIX } from '../utils/LookupUtils';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Cервис мониторинга в данный момент недоступен';

const apiRoot = '/internal/index/analytical';

export const PAPA_CONFIG = {
  delimiter: ',',
  header: true,
  chunkSize: 3,
};

export default class LookupService {
  static async createLookup(
    projectShortName: string,
    name: string,
    zone: string,
    lookup: Lookup,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      apiRoot + '/lookup/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
      null,
      null,
      JSON.stringify(lookup),
    );

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getAllDictionaryLookups(
    projectShortName: string,
    dictionary: string,
    zone: string,
    okCallback: (lookups: ShortInfo[]) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'GET',
      apiRoot + '/lookup/project/' + projectShortName + '/dictionary/' + dictionary + '/zone/' + zone + '/list',
    );

    if (result.ok) {
      const data = await result.json();
      okCallback(data as ShortInfo[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${dictionary}`);
      errorCallback(message.message);
    }
  }

  static async getLookup(
    projectShortName: string,
    name: string,
    zone: string,
    okCallback: (lookup: Lookup) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'GET',
      apiRoot + '/lookup/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
    );

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Lookup);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async updateLookup(
    projectShortName: string,
    name: string,
    zone: string,
    lookup: Lookup,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'PUT',
      apiRoot + '/lookup/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
      null,
      null,
      JSON.stringify(lookup),
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async deleteLookup(
    projectShortName: string,
    name: string,
    zone: string,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'DELETE',
      apiRoot + '/lookup/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async fetchAllLookups(okCallback: (id: ShortInfo[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/lookup/list');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as ShortInfo[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async createDictionary(
    projectShortName: string,
    name: string,
    zone: string,
    data: string,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      apiRoot + '/dictionary/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
      null,
      null,
      data,
      true,
    );

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async updateDictionary(
    projectShortName: string,
    name: string,
    zone: string,
    data: string,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'PUT',
      apiRoot + '/dictionary/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
      null,
      null,
      data,
      true,
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getDictionary(
    projectShortName: string,
    name: string,
    zone: string,
    needColumnPrefix: boolean,
    okCallback: (data: any[]) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'GET',
      apiRoot + '/dictionary/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
    );

    if (result.ok) {
      const data = await result.text();
      const order = Papa.parse(data).data[0];
      const resData: any[] = Papa.parse(data, PAPA_CONFIG).data;
      resData.map((dataLine) => {
        return Object.keys(dataLine).map((key) => (dataLine[key] = dataLine[key].split('\r').join('').split('\n').join('')));
      });
      if (needColumnPrefix) {
        resData.map((row, ind) => {
          Object.keys(row).map((column_name) => {
            const tmp = row[column_name];
            delete row[column_name];
            row[COLUMN_PREFIX + column_name] = tmp;
          });
          row['id'] = ind;
        });
      }
      okCallback(resData, order);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
      okCallback([]);
    }
  }

  static async deleteDictionary(
    projectShortName: string,
    name: string,
    zone: string,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'DELETE',
      apiRoot + '/dictionary/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance',
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async fetchAllDictionary(okCallback: (dictionaries: Dictionary[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/dictionary/list');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Dictionary[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getDictionaryQuota(
    projectShortName: string,
    okCallback: (quota: DictionaryQuota) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request('GET', apiRoot + '/dictionary/quota/' + projectShortName);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as DictionaryQuota);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async getListDictionaryQuota(okCallback: (quotas: DictionaryQuota[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/dictionary/quota/list');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as DictionaryQuota[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async createDictionaryQuota(
    projectShortName: string,
    maxSize: number,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request('POST', apiRoot + '/dictionary/quota/' + projectShortName, null, { maxSize: maxSize });

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async getLookupQuota(projectShortName: string, okCallback: (quota: LookupQuota) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/lookup/quota/' + projectShortName);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as LookupQuota);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async createLookupQuota(projectShortName: string, maxCount: number, okCallback: () => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('POST', apiRoot + '/lookup/quota/' + projectShortName, null, { maxCount: maxCount });

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async getDictionaryId(
    projectShortName: string,
    name: string,
    zone: string,
    okCallback: (id: number) => void,
    errorCallback: (msg: string) => void,
  ) {
    const result = await BackendProvider.request(
      'GET',
      apiRoot + '/dictionary/project/' + projectShortName + '/name/' + name + '/zone/' + zone + '/instance/id',
    );

    if (result.ok) {
      const data = await result.json();
      okCallback(data as number);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getListLookupQuota(okCallback: (quotas: LookupQuota[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/lookup/quota/list');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as LookupQuota[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

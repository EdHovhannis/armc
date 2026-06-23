import { ERROR_500_MESSAGE } from '../containers/App';
import { Versions } from '../store/config/Types';
import { TracingSupervisorDescription } from '../store/tracingDatasources/Types';
import { Error, ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис трейсинга в данный момент недоступен. Обратитесь к администратору.';

export default class TracingSearchService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/tracing/metadata/version');

    if (result.ok) {
      const data = await result.text();
      try {
        const res = JSON.parse(data);
        okCallback(data, res);
      } catch (e) {
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchDatasources(okCallback: (datasources: TracingSupervisorDescription[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/tracing/datasources');
    const data = await result.json();
    if (result.ok) okCallback(data as TracingSupervisorDescription[]);
    else data.status === 500 ? errorCallback(ERROR_500_MESSAGE) : errorCallback(data.message);
  }

  static async fetchDatasourceById(
    id: number,
    okCallback: (datasources: TracingSupervisorDescription) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', `/internal/tracing/datasources/${id}`);
    const data = await result.json();
    if (result.ok) okCallback(data as TracingSupervisorDescription);
    else data.status === 500 ? errorCallback(ERROR_500_MESSAGE) : errorCallback(data.message);
  }

  static async createDatasource(
    name: string,
    projectId: number,
    traceSupervisorId: number,
    callsSupervisorId: number | undefined,
    treeSupervisorId: number | undefined,
    okCallback: (supervisor: TracingSupervisorDescription) => void,
    errorCallback: (msg: any) => void,
  ) {
    const params: any = {
      name: name,
      projectId: projectId,
      traceSupervisorId: traceSupervisorId,
    };

    if (callsSupervisorId != null) {
      params.callsSupervisorId = callsSupervisorId;
    }

    if (treeSupervisorId != null) {
      params.treeSupervisorId = treeSupervisorId;
    }

    const result = await BackendProvider.request('POST', '/internal/tracing/datasources', undefined, params);
    const data = await result.json();
    if (result.ok) {
      okCallback(data as TracingSupervisorDescription);
    } else {
      errorCallback(ErrorHandling.getDetailedError(data));
      // data.status === 500 ? errorCallback(ERROR_500_MESSAGE) : errorCallback(data.message);
    }
  }

  static async updateDatasource(
    id: number,
    name: string,
    traceSupervisorId: number,
    callsSupervisorId: number | undefined,
    treeSupervisorId: number | undefined,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    const params: any = {
      name: name,
      traceSupervisorId: traceSupervisorId,
    };

    if (callsSupervisorId != undefined) {
      params.callsSupervisorId = callsSupervisorId;
    }

    if (treeSupervisorId != null) {
      params.treeSupervisorId = treeSupervisorId;
    }

    const result = await BackendProvider.request('POST', `/internal/tracing/datasources/${id}`, undefined, params);
    if (result.ok) {
      okCallback();
    } else {
      const data = await result.json();
      data.status === 500 ? errorCallback(ERROR_500_MESSAGE) : errorCallback(data.message);
    }
  }

  static async deleteDatasource(id: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', `/internal/tracing/datasources/${id}`);
    if (result.ok) {
      okCallback();
    } else {
      const data = await result.json();
      data.status === 500 ? errorCallback(ERROR_500_MESSAGE) : errorCallback(data.message);
    }
  }
}

import { Versions } from '../store/config/Types';
import {
  DruidConfigurationInfo,
  DruidDatasource,
  DruidSupervisor,
  DruidSupervisorPrevious,
  GenericSupervisorInfo,
  GlobalConfigs,
  GlobalConfigVersion,
  GranularitySpec,
  MonitoringQuota,
  SupervisorDruidConfigurationInfo,
  TaskData,
} from '../store/monitoring/Types';
import { ErrorHandling } from '../utils/ErrorHandling';
import { GlobalConfigsUtil } from '../utils/GlobalConfigsUtil';
import { Utils } from '../utils/Utils';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Cервис мониторинга в данный момент недоступен';

export default class MonitoringService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/analytical/metadata/version');

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

  static async submitConfig(
    project_id: number,
    topic_id: number,
    isTracing: boolean,
    task_data: TaskData,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/internal/index/analytical/config',
      null,
      {
        project_id: project_id.toString(),
        topic_id: topic_id.toString(),
        isTracing: isTracing,
      },
      JSON.stringify(task_data),
    );

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ``, ` ${task_data.datasource}`, '', '', ``);
      errorCallback(message.message);
    }
  }

  static async updateConfig(
    task_id: number,
    project_id: number,
    topic_id: number,
    isTracing: boolean,
    task_data: TaskData,
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'PUT',
      '/internal/index/analytical/supervisor/' + task_id + '/config',
      null,
      {
        project_id: project_id.toString(),
        topic_id: topic_id.toString(),
        isTracing: isTracing ? isTracing : false,
      },
      JSON.stringify(task_data),
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ``, ` ${task_data.datasource}`, '', '', ``);
      errorCallback(message.message);
    }
  }

  static async fetchConfigById(id: number, okCallback: (task: DruidSupervisor) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/analytical/supervisor/' + id + '/config');

    if (result.ok) {
      const data = await result.json();
      const dataRes: DruidSupervisor = data;
      if (dataRes.data.granularitySpec == undefined) {
        const dataPrev: DruidSupervisorPrevious = data;
        dataRes.data.granularitySpec = {
          queryGranularity: dataPrev.data.queryGranularity,
          rollup: dataPrev.data.rollup,
          type: 'uniform',
          segmentGranularity: 'HOUR',
        };
        okCallback(dataRes);
      } else {
        okCallback(data as DruidSupervisor);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deleteConfigById(id: number, okCallback: () => void, errorCallback: (errorMsg: { message: string; details?: string }) => void) {
    const result = await BackendProvider.request('DELETE', '/internal/index/analytical/supervisor/' + id + '/config');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchAllSupervisors(
    labels: string[] | undefined,
    okCallback: (id: GenericSupervisorInfo[]) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    let params = null;
    if (labels) {
      params = {
        labels: labels.join(',').toString(),
      };
    }
    const result = await BackendProvider.request('GET', '/internal/index/analytical/supervisors', null, params);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as GenericSupervisorInfo[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchSupervisorById(
    id: number,
    okCallback: (supervisor: GenericSupervisorInfo) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request('GET', `/internal/index/analytical/supervisors/${id}`);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as GenericSupervisorInfo);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchAllLabels(okCallback: (labels: string[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/analytical/supervisors');

    if (result.ok) {
      const data = await result.json();
      const labels = Utils.getAllPossibleSupervisorsLabels(data);
      okCallback(labels);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchDatasourcesForZone(zoneId: string, okCallback: (id: DruidDatasource[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/index/analytical/zone/${zoneId}/datasources`);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as DruidDatasource[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deleteSupervisorInstanceById(
    id: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('DELETE', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance`);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async addSupervisorInstanceById(
    id: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance`);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getSupervisorInstanceById(id: number, zoneId: string, okCallback: () => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance`);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateSupervisorInstanceById(
    id: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('PUT', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance`);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async resetSupervisorInstanceById(
    id: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance/reset`);

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async startSupervisorInstanceById(
    id: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance/start`);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async stopSupervisorInstanceById(
    id: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance/stop`);

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchQuota(projectIds: Array<number>, okCallback: (records: Array<MonitoringQuota>) => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/index/analytical/quota', null, null, JSON.stringify(projectIds));

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateQuota(projectId: number, maxTaskCount: number, okCallback: () => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/index/analytical/quota/' + projectId, null, { maxTaskCount: maxTaskCount });

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchSupervisorLabels(
    projectId: number,
    name: string,
    okCallback: (labels: string[]) => void,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/index/analytical/supervisor/project/${projectId}/name/${name}/labels`);

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ``, ` ${name}`);
      errorCallback(message.message);
    }
  }

  static async addSupervisorLabel(projectId: number, name: string, label: string, okCallback, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('POST', `/internal/index/analytical/supervisor/project/${projectId}/name/${name}/label/${label}`);

    if (res.ok) {
      // let data = await res.json();
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ``, ` ${name}`);
      errorCallback(message.message);
    }
  }

  static async deleteSupervisorLabels(projectId: number, name: string, label: string, okCallback, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('DELETE', `/internal/index/analytical/supervisor/project/${projectId}/name/${name}/label/${label}`);

    if (res.ok) {
      // let data = await res.json();
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ``, ` ${name}`);
      errorCallback(message.message);
    }
  }

  static async getGlobalConfigurationsForDruid(
    zoneId: string,
    okCallback: (config: GlobalConfigs | undefined) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/global/configuration/index/analytical/${zoneId}`);

    if (res.ok) {
      if (res.status === 204) {
        okCallback(undefined);
      } else {
        const data: GlobalConfigs = (await res.json()) as GlobalConfigs;
        okCallback(data);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ``, ` ${name}`);
      errorCallback(message.message);
    }
  }

  static async overwriteGlobalConfigurationsForDruid(
    config: GlobalConfigs,
    okCallback: (version: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('POST', `/internal/global/configuration/index/analytical`, null, null, JSON.stringify(config));

    if (res.ok) {
      const data: string = await res.text();
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ``, ` ${name}`);
      errorCallback(message.message);
    }
  }

  static async getGlobalConfigurationVersion(
    okCallback: (globalVersions: GlobalConfigVersion[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/global/configuration/index/analytical/version/current/all`);

    if (res.ok) {
      const data: GlobalConfigVersion[] = (await res.json()) as GlobalConfigVersion[];
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getCurrentIndexTaskConfigurationDruidInfo(
    id: number,
    zoneId: string,
    okCallback: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance/current/info`);

    if (res.ok) {
      const data: SupervisorDruidConfigurationInfo = (await res.json()) as SupervisorDruidConfigurationInfo;
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getCurrentIndexTaskConfigurationDruidInfoFromConfiguration(
    id: number,
    zoneId: string,
    okCallback: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'GET',
      `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance/current/configuration/info`,
    );

    if (res.ok) {
      const data: SupervisorDruidConfigurationInfo = (await res.json()) as SupervisorDruidConfigurationInfo;
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getExpectedIndexTaskConfigurationDruidInfo(
    id: number,
    zoneId: string,
    okCallback: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/index/analytical/supervisor/${id}/zone/${zoneId}/instance/expected/info`);

    if (res.ok) {
      const data: SupervisorDruidConfigurationInfo = (await res.json()) as SupervisorDruidConfigurationInfo;
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getExpectedDruidSpecForConfiguration(
    topic_id: number,
    project_id: number,
    task_data: TaskData,
    okCallback: (indexConfiguration: DruidConfigurationInfo) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      `/internal/index/analytical/supervisor/spec/expected`,
      null,
      { topicId: topic_id, projectId: project_id },
      JSON.stringify(task_data),
    );

    if (res.ok) {
      const data: DruidConfigurationInfo = (await res.json()) as DruidConfigurationInfo;
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ``, ` ${task_data.datasource}`);
      errorCallback(message.message);
    }
  }

  static async getCurrentAnalyticalIndexSupervisorSpec(
    supervisor_id: number,
    okCallback: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/index/analytical/supervisor/${supervisor_id}/spec/latest`);

    if (res.ok) {
      const data: SupervisorDruidConfigurationInfo = (await res.json()) as SupervisorDruidConfigurationInfo;
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getGlobalConfigsVersions(
    zoneId: string,
    okCallback: (versions: string[]) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/global/configuration/index/analytical/${zoneId}/version/all`);

    if (res.ok) {
      const data: string[] = (await res.json()) as string[];
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getGlobalConfigByVersion(
    version: string,
    okCallback: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/global/configuration/index/analytical/version`, null, { version: version });

    if (res.ok) {
      const data: GlobalConfigs = (await res.json()) as GlobalConfigs;
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deleteUnusedGlobalConfigurations(
    zoneId: string,
    okCallback: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('DELETE', `/internal/global/configuration/index/analytical/${zoneId}/unused`);

    if (res.ok) {
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async setGlobalConfigurationActive(
    zoneId: string,
    version: string,
    okCallback: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('POST', `/internal/global/configuration/index/analytical/${zoneId}/active`, null, { version: version });

    if (res.ok) {
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

import {
  ArchivalQuota,
  ArchivalQuotaWithProject,
  ArchiveProjectQuota,
  ArchiveQuotaEstimation,
  ArchiveTask,
  ShortArchiveTask,
  ShortArchiveTaskWithId,
  ArchiveTaskInstanceStatus,
  ArchivalStatus,
  ArchivalQuotaRequestData,
  ArchiveQuotaResponseDTO,
  ArchiveQuota,
} from '../store/archive/Types';
import { Versions } from '../store/config/Types';
import { ErrorHandling, ErrorMsg } from '../utils/ErrorHandling';
import { Utils } from '../utils/Utils';

import BackendProvider, { SystemType } from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис архива недоступен в данный момент. Обратитесь к администратору.';

export default class ArchiveService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/archive/metadata/version');

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

  static async createArchiveTask(
    task: ArchiveTask,
    project: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: any; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('POST', `/internal/index/archive/task/project/${project}/config`, null, null, JSON.stringify(task));

    if (res.ok) {
      if (okCallback) {
        okCallback();
      }
    } else if (errorCallback) {
      const getTopicNotFoundText = () => {
        if (task.deadLetterQueue) {
          return `${task.deadLetterQueue.target.kafka.projectKey}/${task.deadLetterQueue.target.kafka.name} (один или несколько)`;
        }
        return `${task.source.kafka
          .map((value) => {
            return value.project + '/' + value.name;
          })
          .join(', ')} (один или несколько)`;
      };
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${project}`,
        ` ${project}/${task.name}`,
        '',
        '',
        getTopicNotFoundText(),
      );
      errorCallback(message);
    }
  }

  static async updateArchiveTask(
    task: ArchiveTask,
    project: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: any; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'PUT',
      // '/index/archive/task/project/' + project + '/name/' + task.name,
      `/internal/index/archive/task/project/${project}/name/${task.name}/config`,
      null,
      null,
      JSON.stringify(task),
    );

    if (res.ok) {
      if (okCallback) {
        okCallback();
      }
    } else if (errorCallback) {
      const getTopicNotFoundText = () => {
        if (task.deadLetterQueue) {
          return ` ${task.deadLetterQueue.target.kafka.projectKey}/${task.deadLetterQueue.target.kafka.name} (один или несколько)`;
        }
        return `${task.source.kafka
          .map((value) => {
            return value.project + '/' + value.name;
          })
          .join(', ')} (один или несколько)`;
      };
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${project}`,
        ` ${project}/${task.name}`,
        '',
        '',
        getTopicNotFoundText(),
      );
      errorCallback(message.message);
    }
  }

  /**
   * не нашёл мест, где используется этот метод. Возможно, нужно удалить его
   */
  static async listArchiveTasks(okCallback?: (tasks: ShortArchiveTask[]) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/mock/index/archive/task/list');

    if (res.ok) {
      if (res.status === 204) {
        if (okCallback) okCallback([] as ShortArchiveTask[]);
      } else {
        const data = await res.json();
        if (okCallback) okCallback(data as ShortArchiveTask[]);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async listArchiveTasksWithIds(
    filters?: any,
    okCallback?: (tasks: ShortArchiveTaskWithId[]) => void,
    errorCallback?: (errorMsg: string) => void,
    page?: number,
    nameLike?: string,
    getCountCallBack?: (count: number) => void,
  ) {
    let updatedFilters = [...filters];
    if (nameLike) {
      updatedFilters = updatedFilters.concat({ field: 'nameLike', op: 'like', values: [`%${nameLike}%`] });
    }
    const jsonString = updatedFilters.length ? JSON.stringify(updatedFilters) : '';
    const params: any = {
      pageSize: 10,
      pageNumber: page ?? 1,
    };
    if (jsonString) {
      params.filters = jsonString;
    }

    const url = `/internal/index/archive/list/paginated`;
    const [res, countRes] = await Promise.all([
      BackendProvider.request('GET', url, null, params),
      BackendProvider.request('GET', '/internal/index/archive/list/page-count', null, { ...params, pageSize: 1 }),
    ]);
    if (countRes.ok) {
      const archivesCount = await countRes.json();
      getCountCallBack?.(archivesCount);
    }

    if (res.ok) {
      if (res.status === 204) {
        if (okCallback) okCallback([] as ShortArchiveTaskWithId[]);
      } else {
        let data = await res.json();
        if (Array.isArray(data)) {
          data = data.map((archiveTask) => {
            const { instances, ...restTaskParams } = archiveTask;
            return {
              ...restTaskParams,
              instances: instances || [],
            };
          });
        }
        if (okCallback) {
          okCallback(data as ShortArchiveTaskWithId[]);
        }
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deleteArchiveTask(projectShortName: string, name: string, okCallback?: () => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('DELETE', `/internal/index/archive/task/project/${projectShortName}/name/${name}/config`);

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async deleteArchiveTaskInstances(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[],
    okCallback: (
      responses: {
        archiveTaskInstanceId: string;
        errorMsg: { message: string; details?: string } | string;
      }[],
    ) => void,
  ) {
    const responses = await Promise.all(
      instancesParams.map((instanceParams) =>
        (async () => {
          try {
            const { project, name, zoneId } = instanceParams;
            const res = await BackendProvider.request(
              'DELETE',
              `/internal/index/archive/task/project/${project}/name/${name}/zone/${zoneId}/instance`,
            );
            if (res.ok) {
              return {
                archiveTaskInstanceId: instanceParams.archiveTaskInstanceId,
                errorMsg: 'ok',
              };
            }
            const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${project}`, ` ${project}/${name}`);
            return {
              archiveTaskInstanceId: instanceParams.archiveTaskInstanceId,
              errorMsg: message,
            };
          } catch (e) {
            return {
              archiveTaskInstanceId: instanceParams.archiveTaskInstanceId,
              errorMsg: { message: 'неизвестная ошибка', details: e },
            };
          }
        })(),
      ),
    );
    okCallback(responses);
  }

  static async getArchiveTaskInfo(
    projectShortName: string,
    name: string,
    okCallback?: (task: ArchiveTask) => void,
    errorCallback?: (errorMsg: string) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/index/archive/task/project/${projectShortName}/name/${name}/config`);

    if (res.ok) {
      const data = await res.json();
      if (okCallback) {
        okCallback(data as ArchiveTask);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async resumeArchiveTaskInstances(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[],
    okCallback: (results: { archiveTaskInstanceId: string; res: string }[]) => void,
  ) {
    const results = await Promise.all(
      instancesParams.map((instanceParams) =>
        (async () => {
          const { project, name, zoneId, archiveTaskInstanceId } = instanceParams;
          try {
            const res = await BackendProvider.request(
              'POST',
              `/internal/index/archive/task/project/${project}/name/${name}/zone/${zoneId}/instance/resume`,
            );

            if (res.ok) {
              return { archiveTaskInstanceId, res: 'ok' };
            } else {
              const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${project}`, ` ${project}/${name}/${zoneId}`);
              return { archiveTaskInstanceId, res: message.message };
            }
          } catch (e) {
            return { archiveTaskInstanceId, res: e };
          }
        })(),
      ),
    );
    okCallback(results);
  }

  static async suspendArchiveTaskInstances(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[],
    okCallback: (results: { archiveTaskInstanceId: string; res: string }[]) => void,
  ) {
    const results = await Promise.all(
      instancesParams.map((instanceParams) =>
        (async () => {
          const { project, name, zoneId, archiveTaskInstanceId } = instanceParams;
          try {
            const res = await BackendProvider.request(
              'POST',
              `/internal/index/archive/task/project/${project}/name/${name}/zone/${zoneId}/instance/suspend`,
            );

            if (res.ok) {
              return { archiveTaskInstanceId, res: 'ok' };
            }
            const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${project}`, ` ${project}/${name}/${zoneId}`);
            return { archiveTaskInstanceId, res: message.message };
          } catch (e) {
            return { archiveTaskInstanceId, res: e };
          }
        })(),
      ),
    );
    okCallback(results);
  }

  static async resetArchiveTaskInstance(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: string) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      `/internal/index/archive/task/project/${projectShortName}/name/${name}/zone/${zoneId}/instance/reset`,
    );

    if (res.ok) {
      if (okCallback) {
        okCallback('ok');
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getArchiveId(projectShortName: string, name: string, okCallback: (id: number) => void, errorCallback: (msg: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/index/archive/project/${projectShortName}/name/${name}/id`);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as number);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getArchiveQuota(projectShortName: string, okCallback?: (quota: ArchivalQuota) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', `/index/archive/quota/project/${projectShortName}`);

    if (res.ok) {
      if (okCallback) {
        const data = await res.json();
        okCallback(data as ArchivalQuota);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async postArchiveQuota(
    projectShortName: string,
    quota: ArchiveProjectQuota,
    okCallback?: () => void,
    errorCallback?: (errorMsg: string) => void,
  ) {
    const res = await BackendProvider.request('POST', `/internal/index/archive/quota/project/${projectShortName}`, null, null, JSON.stringify(quota));

    if (res.ok) {
      if (okCallback) {
        okCallback();
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async listArchiveQuota(okCallback?: (quotas: ArchivalQuotaWithProject[]) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/index/archive/quota/list');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) {
        okCallback(data as ArchivalQuotaWithProject[]);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getEstimatedArchiveQuota(
    projectShortName: string,
    maxDataRateBytesPerSec: number,
    maxSizeBytes: number,
    okCallback?: (quotaEstimate: ArchiveQuotaEstimation) => void,
    errorCallback?: (errorMsg: string) => void,
    index?: string,
  ) {
    const res = await BackendProvider.request(
      'POST',
      `/internal/index/archive/quota/project/${projectShortName}/estimate`,
      null,
      index ? { index: index } : null,
      JSON.stringify({
        maxDataRateBytesPerSec: maxDataRateBytesPerSec,
        maxSizeBytes: maxSizeBytes,
      }),
    );

    if (res.ok) {
      if (okCallback) {
        const data = await res.json();
        okCallback(data as ArchiveQuotaEstimation);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async getEstimatedArchiveQuotaWithTime({
    data,
    okCallback,
    errorCallback,
  }: {
    data: ArchivalQuotaRequestData;
    okCallback?: (quotaEstimate: ArchiveQuotaResponseDTO) => void;
    errorCallback?: (errorMsg: string) => void;
  }) {
    const { projectShortName, indexName, ...rest } = data;
    const url = `/v2/index/archive/task/project/${projectShortName}/quota/estimate`;
    const payload = {
      name: indexName ? indexName : null,
      quotaEstimateRequestClientDto: rest,
    };
    const res = await BackendProvider.request('POST', url, null, null, JSON.stringify(payload), false, SystemType.legacy_api_path_without_version);

    if (res.ok) {
      if (okCallback) {
        const response = await res.json();
        response.estimateBySize = !!data.maxSizeBytes;
        okCallback(response);
      }
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async fetchArchiveLabels(
    projectShortName: string,
    name: string,
    okCallback: (labels: string[]) => void,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request('GET', `/index/archive/task/project/${projectShortName}/name/${name}/labels`);

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async addArchiveLabel(
    projectShortName: string,
    name: string,
    label: string,
    okCallback: () => void,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request('POST', `/index/archive/task/project/${projectShortName}/name/${name}/label/${label}`);

    if (res.ok) {
      // let data = await res.json();
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async deleteArchiveLabel(
    projectShortName: string,
    name: string,
    label: string,
    okCallback: () => void,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request('DELETE', `/index/archive/task/project/${projectShortName}/name/${name}/label/${label}`);

    if (res.ok) {
      // let data = await res.json();
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getArchiveFilterValues(okCallback: (labels: string[]) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/index/archive/list/filter-values');

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getArchiveTaskInstanceStatuses(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      /** внутренний идентификтор, для связки внутри redux-стора **/
      archiveTaskInstanceId: string;
    }[],
    okCallback: (statuses: ArchiveTaskInstanceStatus[]) => void,
  ) {
    const instanceStatuses = await Promise.all(
      instancesParams.map(({ project, name, zoneId, archiveTaskInstanceId }) =>
        (async () => {
          try {
            const res = await BackendProvider.request(
              'GET',
              `/internal/index/archive/task/project/${project}/name/${name}/zone/${zoneId}/instance/status`,
            );
            if (res.ok) {
              const data = await res.json();
              return {
                ...data,
                archiveTaskProject: project,
                archiveTaskProjectTaskName: name,
                zoneId,
                archiveTaskInstanceId,
              };
            } else {
              const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
              return {
                archiveTaskInstanceId,
                archiveTaskProject: project,
                archiveTaskProjectTaskName: name,
                zoneId,
                storage: {
                  currentSizeBytes: 0,
                  maxSizeBytes: 0,
                },
                indexing: {
                  status: ArchivalStatus.WITHOUT_RESPONSE, // -> для кейсов когда по экземпляру ответ без статуса (например "Flow instance not found")
                },
                errorStatusMessage: message.message,
              };
            }
          } catch (e) {
            return {
              archiveTaskInstanceId,
              archiveTaskProject: project,
              archiveTaskProjectTaskName: name,
              zoneId,
              storage: {
                currentSizeBytes: 0,
                maxSizeBytes: 0,
              },
              indexing: {
                status: ArchivalStatus.WITHOUT_RESPONSE, // -> для кейсов когда по экземпляру ответ без статуса
              },
              errorStatusMessage: e.toString(),
            };
          }
        })(),
      ),
    );
    okCallback(instanceStatuses);
  }

  static async updateArchiveTaskInstance(
    projectName: string,
    taskName: string,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (message: string, error?: ErrorMsg) => void,
  ) {
    try {
      const res = await BackendProvider.request(
        'PUT',
        `/internal/index/archive/task/project/${projectName}/name/${taskName}/zone/${zoneId}/instance`,
      );
      if (res.ok && res.status === 200) {
        okCallback();
      } else {
        const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
        errorCallback(message.message);
      }
    } catch (e) {
      if (errorCallback) {
        errorCallback(`Произошла ошибка `, e);
      }
    }
  }

  static async createArchiveTaskInstance(
    projectName: string,
    taskName: string,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (error: ErrorMsg['message']) => void,
  ) {
    const res = await BackendProvider.request('POST', `/internal/index/archive/task/project/${projectName}/name/${taskName}/zone/${zoneId}/instance`);
    if (res.ok && res.status === 201) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async resetZoneOverdraft(zoneId: string, okCallback?: () => void, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('POST', '/internal/index/archive/task/zone/' + zoneId + '/instance/overdraft/reset/all');

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${zoneId}`, ` ${zoneId}`);
      errorCallback(message.message);
    }
  }

  static async changeArchiveInstanceOverdraft(
    projectName: string,
    taskName: string,
    zoneId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (error: ErrorMsg) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/index/archive/task/project/' + projectName + '/name/' + taskName + '/zone/' + zoneId + '/instance/overdraft',
      null,
      null,
      JSON.stringify({ overdraftPercent: value }),
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectName}`, ` ${projectName}/${taskName}/${zoneId}`);
      errorCallback(message.message);
    }
  }

  static async resetInstanceOverdrafts(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      /** внутренний идентификтор, для связки внутри redux-стора **/
      archiveTaskInstanceId: string;
    }[],
    okCallback: (
      requestResults: {
        archiveTaskInstanceId: string;
        res: string | { message: string; details?: string };
      }[],
    ) => void,
  ) {
    const requests = await Promise.all(
      instancesParams.map(({ project, name, zoneId, archiveTaskInstanceId }) =>
        (async () => {
          try {
            const res = await BackendProvider.request(
              'POST',
              '/internal/index/archive/task/project/' + project + '/name/' + name + '/zone/' + zoneId + '/instance/overdraft/reset',
            );
            if (res.ok) {
              return { archiveTaskInstanceId, res: 'ok' };
            } else {
              const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${project}`, ` ${project}/${name}/${zoneId}`);
              return { archiveTaskInstanceId, res: message };
            }
          } catch (e) {
            return {
              archiveTaskInstanceId,
              res: {
                message: `${project}/${name}/${zoneId}: произошла неизвестная ошибка`,
                details: e,
              },
            };
          }
        })(),
      ),
    );
    okCallback(requests);
  }

  static async getOverdraftValue(quota: any, okCallback?: (value: number) => void, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('POST', '/internal/index/archive/task/overdraft/estimate', null, null, JSON.stringify(quota));

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data.maxAvailableOverdraft);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getArchiveTaskInstanceConfig(project: string, name: string, zoneId: string, archiveTaskInstanceId: string) {
    try {
      const res = await BackendProvider.request(
        'GET',
        `/internal/index/archive/task/project/${project}/name/${name}/zone/${zoneId}/instance/config/current`,
      );
      if (res.ok) {
        const config = await res.json();
        return { archiveTaskInstanceId: archiveTaskInstanceId, config: config };
      }
      throw res;
    } catch (e) {
      const error = await ErrorHandling.handleError(e, ERROR_502_MESSAGE);
      return {
        archiveTaskInstanceId: archiveTaskInstanceId,
        config: error.message,
      };
    }
  }

  static async getArchiveTaskInstancesConfig(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[],
  ) {
    return await Promise.all(
      instancesParams.map(({ project, name, zoneId, archiveTaskInstanceId }) =>
        ArchiveService.getArchiveTaskInstanceConfig(project, name, zoneId, archiveTaskInstanceId),
      ),
    );
  }

  static async getArchiveTaskInstanceOverdraft(project: string, name: string, zoneId: string, archiveTaskInstanceId: string) {
    try {
      const res = await BackendProvider.request(
        'GET',
        `/internal/index/archive/task/project/${project}/name/${name}/zone/${zoneId}/instance/overdraft`,
      );

      if (res.ok) {
        const data = await res.json();
        return { archiveTaskInstanceId, overdraft: data };
      }

      throw res;
    } catch (e) {
      const message = await ErrorHandling.handleError(e, ERROR_502_MESSAGE);
      return { archiveTaskInstanceId, error: message.message };
    }
  }

  /** todo удалить **/
  static async getArchiveTaskInstancesOverdraft(
    instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[],
  ) {
    return await Promise.all(
      instancesParams.map(({ project, name, zoneId, archiveTaskInstanceId }) =>
        ArchiveService.getArchiveTaskInstanceOverdraft(project, name, zoneId, archiveTaskInstanceId),
      ),
    );
  }

  static async updateArchiveInstanceQuota(
    data: {
      projectShortName: string;
      name: string;
      zoneId: string;
      quota: ArchiveQuota;
    },
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const { projectShortName, name, zoneId, quota } = data;
    const { maxStorageTimeSec, maxDataRateBytesPerSec, maxSizeBytes } = quota;
    const res = await BackendProvider.request(
      'PUT',
      '/internal/index/archive/task/project/' +
        projectShortName +
        '/name/' +
        name +
        '/zone/' +
        zoneId +
        '/instance/quotas' +
        `?maxSizeBytes=${maxSizeBytes}&maxDataRateBytesPerSec=${maxDataRateBytesPerSec}&maxStorageTimeSec=${maxStorageTimeSec}`,
      null,
    );
    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }
}

import { saveAs } from 'file-saver';
import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import MonitoringService from '../../services/MonitoringService';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';

import {
  DruidConfigurationInfo,
  DruidDatasource,
  DruidSupervisor,
  GenericSupervisorInfo,
  GlobalConfigs,
  GlobalConfigVersion,
  MonitoringQuota,
  SupervisorDruidConfigurationInfo,
  TaskData,
} from './Types';

export const submitConfigAction = createAsyncAction('@monitoring/SUBMIT_REQ', '@monitoring/SUBMIT_SUCC', '@monitoring/SUBMIT_FAIL')<
  void,
  void,
  string
>();

export const updateConfigAction = createAsyncAction('@monitoring/UPDATE_REQ', '@monitoring/UPDATE_SUCC', '@monitoring/UPDATE_FAIL')<
  void,
  void,
  string
>();

export const deleteConfigAction = createAsyncAction('@monitoring/DELETE_REQ', '@monitoring/DELETE_SUCC', '@monitoring/DELETE_FAIL')<
  void,
  number,
  string
>();

export const fetchConfigAction = createAsyncAction('@monitoring/FETCH_CONFIG_SUBM', '@monitoring/FETCH_CONFIG_SUCC', '@monitoring/FETCH_CONFIG_FAIL')<
  void,
  DruidSupervisor,
  string
>();

export const addInstanceAction = createAsyncAction('@monitoring/INSTANCE_ADD_REQ', '@monitoring/INSTANCE_ADD_SUCC', '@monitoring/INSTANCE_ADD_FAIL')<
  void,
  void,
  string
>();

export const updateInstanceAction = createAsyncAction(
  '@monitoring/INSTANCE_UPDATE_REQ',
  '@monitoring/INSTANCE_UPDATE_SUCC',
  '@monitoring/INSTANCE_UPDATE_FAIL',
)<void, void, string>();

export const getInstanceAction = createAsyncAction('@monitoring/INSTANCE_GET_REQ', '@monitoring/INSTANCE_GET_SUCC', '@monitoring/INSTANCE_GET_FAIL')<
  void,
  void,
  string
>();

export const deleteInstanceAction = createAsyncAction(
  '@monitoring/INSTANCE_DELETE_SUBM',
  '@monitoring/INSTANCE_DELETE_SUCC',
  '@monitoring/INSTANCE_DELETE_FAIL',
)<void, [number, string], string>();

export const statusUpdatedAction = createStandardAction('@monitoring/STATUS_UPDATED')<[number, string, string]>();
export const setMonitoringFilterAction = createStandardAction('@monitoring/SET_FILTER')<{
  filter: FilterMenuItem[] | undefined;
  isRefetch: boolean;
}>();
export const saveCurrentGlobalConfigZoneAction = createStandardAction('@monitoring/SAVE_ZONE')<string>();

export const fetchAllSupervisorsAction = createAsyncAction(
  '@monitoring/FETCH_ALL_SUPERVISORS_SUBM',
  '@monitoring/FETCH_ALL_SUPERVISORS_SUCC',
  '@monitoring/FETCH_ALL_SUPERVISORS_FAIL',
)<void, GenericSupervisorInfo[], string>();

export const fetchSupervisorByIdAction = createAsyncAction(
  '@monitoring/FETCH_SUPERVISOR_BY_ID_SUBM',
  '@monitoring/FETCH_SUPERVISOR_BY_ID_SUCC',
  '@monitoring/FETCH_SUPERVISOR_BY_ID_FAIL',
)<void, GenericSupervisorInfo, string>();

export const fetchAllLabelsAction = createAsyncAction(
  '@monitoring/FETCH_ALL_LABELS_SUBM',
  '@monitoring/FETCH_ALL_LABELS_SUCC',
  '@monitoring/FETCH_ALL_LABELS_FAIL',
)<void, string[], string>();

export const fetchZoneDatasourcesAction = createAsyncAction(
  '@monitoring/FETCH_DATASOURCES_ZONE_SUBM',
  '@monitoring/FETCH_DATASOURCES_ZONE_SUCC',
  '@monitoring/FETCH_DATASOURCES_ZONE_FAIL',
)<void, DruidDatasource[], string>();

export const selectNewTask = createStandardAction('@monitoring/SELECT_NEW')<void>();
export const actionStarted = createStandardAction('@monitoring/LOADING_START')<void>();
export const replaceCurrentConfigAction = createStandardAction('@monitoring/REPLACE_CURRENT')<TaskData>();

export const fetchQuotasActions = createAsyncAction('@monitoring/FETCH_QUOTAS_REQ', '@monitoring/FETCH_QUOTAS_SUCC', '@monitoring/FETCH_QUOTAS_FAIL')<
  void,
  MonitoringQuota[],
  void
>();

export const updateQuotasActions = createAsyncAction('@monitoring/UPD_QUOTAS_REQ', '@monitoring/UPD_QUOTAS_SUCC', '@monitoring/UPD_QUOTAS_FAIL')<
  void,
  void,
  void
>();

export const fetchLabelsActions = createAsyncAction('@monitoring/LABELS_REQ', '@monitoring/LABELS_SUCC', '@monitoring/LABELS_FAIL')<
  void,
  string[],
  void
>();

export const addLabelsActions = createAsyncAction('@monitoring/ADD_LABEL_REQ', '@monitoring/ADD_LABEL_SUCC', '@monitoring/ADD_LABEL_FAIL')<
  void,
  void,
  void
>();

export const deleteLabelsActions = createAsyncAction(
  '@monitoring/DELETE_LABEL_REQ',
  '@monitoring/DELETE_LABEL_SUCC',
  '@monitoring/DELETE_LABEL_FAIL',
)<void, void, void>();

export const getGlobalConfigActions = createAsyncAction(
  '@monitoring/GET_GLOBAL_CONFIG_REQ',
  '@monitoring/GET_GLOBAL_CONFIG_SUCC',
  '@monitoring/GET_GLOBAL_CONFIG_FAIL',
)<void, GlobalConfigs | undefined, void>();

export const getGlobalConfigByVersionActions = createAsyncAction(
  '@monitoring/GET_GLOBAL_CONFIG_BY_VERSION_REQ',
  '@monitoring/GET_GLOBAL_CONFIG_BY_VERSION_SUCC',
  '@monitoring/GET_GLOBAL_CONFIG_BY_VERSION_FAIL',
)<void, GlobalConfigs, void>();

export const getGlobalConfigVersionActions = createAsyncAction(
  '@monitoring/GET_GLOBAL_CONFIG_VERSION_REQ',
  '@monitoring/GET_GLOBAL_CONFIG_VERSION_SUCC',
  '@monitoring/GET_GLOBAL_CONFIG_VERSION_FAIL',
)<void, GlobalConfigVersion[], void>();

export const getCurrentDruidConfigurationForTaskActions = createAsyncAction(
  '@monitoring/GET_DRUID_SPEC_CONFIG_REQ',
  '@monitoring/GET_DRUID_SPEC_CONFIG_SUCC',
  '@monitoring/GET_DRUID_SPEC_CONFIG_FAIL',
)<void, SupervisorDruidConfigurationInfo, void>();

export const getCurrentDruidConfigurationForTaskFromConfigurationActions = createAsyncAction(
  '@monitoring/GET_DRUID_SPEC_CONFIG_FROM_CONFIG_REQ',
  '@monitoring/GET_DRUID_SPEC_CONFIG_FROM_CONFIG_SUCC',
  '@monitoring/GET_DRUID_SPEC_CONFIG_FROM_CONFIG_FAIL',
)<void, SupervisorDruidConfigurationInfo, void>();

export const getExpectedDruidConfigurationForTaskActions = createAsyncAction(
  '@monitoring/GET_EXPECTED_DRUID_SPEC_CONFIG_REQ',
  '@monitoring/GET_EXPECTED_DRUID_SPEC_CONFIG_SUCC',
  '@monitoring/GET_EXPECTED_DRUID_SPEC_CONFIG_FAIL',
)<void, SupervisorDruidConfigurationInfo, void>();

export const getExpectedDruidSpecForConfigurationActions = createAsyncAction(
  '@monitoring/GET_EXPECTED_DRUID_SPEC_FOR_DATA_REQ',
  '@monitoring/GET_EXPECTED_DRUID_SPEC_FOR_DATA_SUCC',
  '@monitoring/GET_EXPECTED_DRUID_SPEC_FOR_DATA_FAIL',
)<void, DruidConfigurationInfo, void>();

export const getCurrentDruidSpecForConfigurationActions = createAsyncAction(
  '@monitoring/GET_CURRENT_DRUID_SPEC_FOR_DATA_REQ',
  '@monitoring/GET_CURRENT_DRUID_SPEC_FOR_DATA_SUCC',
  '@monitoring/GET_CURRENT_DRUID_SPEC_FOR_DATA_FAIL',
)<void, SupervisorDruidConfigurationInfo, void>();

export const getGlobalConfigsVersionsActions = createAsyncAction(
  '@monitoring/GET_ALL_GLOBAL_VERSIONS_REQ',
  '@monitoring/GET_ALL_GLOBAL_VERSIONS_SUCC',
  '@monitoring/GET_ALL_GLOBAL_VERSIONS_FAIL',
)<void, string[], void>();

export const overwriteGlobalConfigActions = createAsyncAction(
  '@monitoring/OVERWRITE_GLOBAL_CONFIG_REQ',
  '@monitoring/OVERWRITE_GLOBAL_CONFIG_SUCC',
  '@monitoring/OVERWRITE_GLOBAL_CONFIG_FAIL',
)<void, string, void>();

export const deleteUnusedGlobalConfigurationsActions = createAsyncAction(
  '@monitoring/DELETE_UNUSED_GLOBAL_CONFIG_REQ',
  '@monitoring/DELETE_UNUSED_GLOBAL_CONFIG_SUCC',
  '@monitoring/DELETE_UNUSED_GLOBAL_CONFIG_FAIL',
)<void, string, void>();

export const setGlobalConfigurationsActiveActions = createAsyncAction(
  '@monitoring/SET_ACTIVE_GLOBAL_CONFIG_REQ',
  '@monitoring/SET_ACTIVE_GLOBAL_CONFIG_SUCC',
  '@monitoring/SET_ACTIVE_GLOBAL_CONFIG_FAIL',
)<void, string, void>();

export const getVersionAction = createAsyncAction('@monitoring/VERSION_REQ', '@monitoring/VERSION_SUCC', '@monitoring/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    MonitoringService.getVersion(
      (data, res) => {
        if (res) {
          dispatch(getVersionAction.success(res));
        } else {
          dispatch(getVersionAction.success(data));
        }
      },
      (str) => {
        dispatch(getVersionAction.failure());
      },
    );
  };
};

export function downloadConfig(task_id: number) {
  return (dispatch, getState) => {
    MonitoringService.fetchConfigById(
      task_id,
      (task: DruidSupervisor) => {
        //TODO Бэк будет возвращать название датасорса без префикса
        task.data.datasource = task.datasource;
        const blob = new Blob([JSON.stringify(task.data, null, '\t')], { type: 'application/json' });
        saveAs(blob, task.datasource + '.json');
        dispatch(notificationActions.success('Конфигурация задачи ' + task.datasource + ' сохранена'));
      },
      (errorMessage) => {
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function replaceCurrentConfig(task: TaskData) {
  return replaceCurrentConfigAction(task);
}

export function submitConfig(team_id, topic_id, isTracing: boolean, task: TaskData, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    MonitoringService.submitConfig(
      team_id,
      topic_id,
      isTracing,
      task,
      () => {
        dispatch(submitConfigAction.success());
        dispatch(notificationActions.success('Конфигурация ' + task.datasource.split('.').splice(1).join('.') + ' создана'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(submitConfigAction.failure(errorMessage));
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function fetchConfigById(id: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(actionStarted());
    MonitoringService.fetchConfigById(
      id,
      (task) => {
        dispatch(fetchConfigAction.success(task));
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(fetchConfigAction.failure(errorMessage));
        if (errorCallback) {
          errorCallback(errorMessage);
        }
        // dispatch(notificationActions.error("Ошибка при получении конфигурации: " + errorMessage))
      },
    );
  };
}

export function updateConfig(task_id, team_id, topic_id, isTracing, task: TaskData, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    MonitoringService.updateConfig(
      task_id,
      team_id,
      topic_id,
      isTracing,
      task,
      () => {
        dispatch(updateConfigAction.success());
        if (okCallback) okCallback();
        dispatch(notificationActions.success('Конфигурация ' + task.datasource.split('.').splice(1).join('.') + ' обновлена'));
      },
      (errorMessage) => {
        dispatch(submitConfigAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        // dispatch(notificationActions.error(errorMessage))
      },
    );
  };
}

export function deleteConfigById(id: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(actionStarted());
    MonitoringService.deleteConfigById(
      id,
      () => {
        dispatch(deleteConfigAction.success(id));
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(deleteConfigAction.failure(errorMessage));
        if (errorCallback) {
          errorCallback(errorMessage);
        }
        // dispatch(notificationActions.error("Ошибка при получении конфигурации: " + errorMessage))
      },
    );
  };
}

export function resetSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    MonitoringService.resetSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(statusUpdatedAction([taskId, zoneId, 'ACTIVE']));
        // dispatch(notificationActions.success("Задача была сброшена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function stopSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    MonitoringService.stopSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(statusUpdatedAction([taskId, zoneId, 'DISABLED']));
        // dispatch(notificationActions.success("Задача остановлена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function startSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    MonitoringService.startSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(statusUpdatedAction([taskId, zoneId, 'ACTIVE']));
        // dispatch(notificationActions.success("Задача запущена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function fetchAllSupervisors(labels?: string[]) {
  return (dispatch, getState) => {
    dispatch(fetchAllSupervisorsAction.request());
    MonitoringService.fetchAllSupervisors(
      labels,
      (tasks) => {
        dispatch(fetchAllSupervisorsAction.success(tasks));
      },
      (errorMessage: any) => {
        dispatch(fetchAllSupervisorsAction.failure(errorMessage.message));
        dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех задач: ${errorMessage.message}` }));
      },
    );
  };
}

export function fetchSupervisorById(id: number, okCallback?: () => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    MonitoringService.fetchSupervisorById(
      id,
      (supervisor) => {
        dispatch(fetchSupervisorByIdAction.success(supervisor));
        if (okCallback) okCallback();
      },
      (errorMessage: string) => {
        dispatch(fetchSupervisorByIdAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
      },
    );
  };
}

export function fetchDatasourcesForZone(zoneId: string) {
  return (dispatch, getState) => {
    dispatch(fetchZoneDatasourcesAction.request());
    MonitoringService.fetchDatasourcesForZone(
      zoneId,
      (tasks) => {
        dispatch(fetchZoneDatasourcesAction.success(tasks));
      },
      (errorMessage: any) => {
        dispatch(fetchZoneDatasourcesAction.failure(errorMessage.message));
        dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех задач: ${errorMessage.message}` }));
      },
    );
  };
}

export function deleteSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(actionStarted());
    MonitoringService.deleteSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(deleteInstanceAction.success([taskId, zoneId]));
        // dispatch(notificationActions.success("Задача была успешно удалена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(deleteInstanceAction.failure(errorMessage.message));
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function addSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(actionStarted());
    MonitoringService.addSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(addInstanceAction.success());
        // dispatch(notificationActions.success("Задача была успешно удалена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(addInstanceAction.failure(errorMessage));
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function updateSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(actionStarted());
    MonitoringService.updateSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(updateInstanceAction.success());
        // dispatch(notificationActions.success("Задача была успешно удалена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(updateInstanceAction.failure(errorMessage.message));
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function getSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(actionStarted());
    MonitoringService.getSupervisorInstanceById(
      taskId,
      zoneId,
      () => {
        dispatch(getInstanceAction.success());
        // dispatch(notificationActions.success("Задача была успешно удалена"))
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(getInstanceAction.failure(errorMessage));
        // dispatch(notificationActions.error(errorMessage))
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
}

export function fetchQuotas(projectIds: Array<number>) {
  return (dispatch, getState) => {
    dispatch(fetchQuotasActions.request());
    MonitoringService.fetchQuota(
      projectIds,
      (quotas: MonitoringQuota[]) => {
        dispatch(fetchQuotasActions.success(quotas));
      },
      (error) => {
        dispatch(fetchQuotasActions.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateQuotas(projectId: number, maxPartitions: number) {
  return (dispatch, getState) => {
    dispatch(updateQuotasActions.request());
    MonitoringService.updateQuota(
      projectId,
      maxPartitions,
      () => {
        // dispatch(notificationActions.success(error))
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function setMonitoringFilter(filter: FilterMenuItem[] | undefined, isRefetch: boolean) {
  return (dispatch, getState) => {
    dispatch(setMonitoringFilterAction({ filter: filter, isRefetch: isRefetch }));
  };
}

export function fetchAllLabels() {
  return (dispatch, getState) => {
    dispatch(fetchAllLabelsAction.request());
    MonitoringService.fetchAllLabels(
      (labels) => {
        dispatch(fetchAllLabelsAction.success(labels));
      },
      (errorMessage) => {
        dispatch(fetchAllLabelsAction.failure(errorMessage));
        dispatch(notificationActions.error('Ошибка при получении всех меток: ' + errorMessage.message));
      },
    );
  };
}

export function fetchLabels(projectId: number, name: string, okCallback?: (labels: string[]) => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchLabelsActions.request());
    MonitoringService.fetchSupervisorLabels(
      projectId,
      name,
      (labels) => {
        dispatch(fetchLabelsActions.success(labels));
        if (okCallback) {
          okCallback(labels);
        }
      },
      (error) => {
        dispatch(fetchLabelsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function addLabel(projectId: number, name: string, label: string, okCallback?, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(addLabelsActions.request());
    MonitoringService.addSupervisorLabel(
      projectId,
      name,
      label,
      () => {
        dispatch(addLabelsActions.success());
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(addLabelsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function deleteLabels(projectId: number, name: string, label: string, okCallback?, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(deleteLabelsActions.request());
    MonitoringService.deleteSupervisorLabels(
      projectId,
      name,
      label,
      () => {
        dispatch(deleteLabelsActions.success());
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(deleteLabelsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getGlobalConfigurationsForDruid(
  zoneId: string,
  okCallback?: (config: GlobalConfigs | undefined) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getGlobalConfigActions.request());
    MonitoringService.getGlobalConfigurationsForDruid(
      zoneId,
      (config) => {
        dispatch(getGlobalConfigActions.success(config));
        if (okCallback) okCallback(config);
      },
      (error) => {
        dispatch(getGlobalConfigActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getGlobalConfigByVersion(
  version: string,
  okCallback?: (config: GlobalConfigs) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getGlobalConfigByVersionActions.request());
    MonitoringService.getGlobalConfigByVersion(
      version,
      (config) => {
        dispatch(getGlobalConfigByVersionActions.success(config));
        if (okCallback) okCallback(config);
      },
      (error) => {
        dispatch(getGlobalConfigByVersionActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function overwriteGlobalConfigurationsForDruid(
  config: GlobalConfigs,
  okCallback?: (version: string) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(overwriteGlobalConfigActions.request());
    MonitoringService.overwriteGlobalConfigurationsForDruid(
      config,
      (version) => {
        dispatch(overwriteGlobalConfigActions.success(version));
        if (okCallback) okCallback(version);
      },
      (error) => {
        dispatch(overwriteGlobalConfigActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function deleteUnusedGlobalConfigurations(
  zoneId: string,
  okCallback: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(deleteUnusedGlobalConfigurationsActions.request());
    MonitoringService.deleteUnusedGlobalConfigurations(
      zoneId,
      () => {
        dispatch(deleteUnusedGlobalConfigurationsActions.success(zoneId));
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(deleteUnusedGlobalConfigurationsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function setGlobalConfigurationActive(
  zoneId: string,
  version: string,
  okCallback: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(setGlobalConfigurationsActiveActions.request());
    MonitoringService.setGlobalConfigurationActive(
      zoneId,
      version,
      () => {
        dispatch(setGlobalConfigurationsActiveActions.success(version));
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(setGlobalConfigurationsActiveActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getGlobalConfigurationVersionForDruid(
  okCallback?: (globalVersion: GlobalConfigVersion[]) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getGlobalConfigVersionActions.request());
    MonitoringService.getGlobalConfigurationVersion(
      (globalVersion) => {
        dispatch(getGlobalConfigVersionActions.success(globalVersion));
        if (okCallback) okCallback(globalVersion);
      },
      (error) => {
        dispatch(getGlobalConfigVersionActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getCurrentIndexTaskConfigurationDruidInfoFromDruid(
  id: number,
  zoneId: string,
  okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getCurrentDruidConfigurationForTaskActions.request());
    MonitoringService.getCurrentIndexTaskConfigurationDruidInfo(
      id,
      zoneId,
      (indexConfiguration) => {
        dispatch(getCurrentDruidConfigurationForTaskActions.success(indexConfiguration));
        if (okCallback) okCallback(indexConfiguration);
      },
      (error) => {
        dispatch(getCurrentDruidConfigurationForTaskActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getCurrentIndexTaskConfigurationDruidInfoFromConfiguration(
  id: number,
  zoneId: string,
  okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getCurrentDruidConfigurationForTaskFromConfigurationActions.request());
    MonitoringService.getCurrentIndexTaskConfigurationDruidInfoFromConfiguration(
      id,
      zoneId,
      (indexConfiguration) => {
        dispatch(getCurrentDruidConfigurationForTaskFromConfigurationActions.success(indexConfiguration));
        if (okCallback) okCallback(indexConfiguration);
      },
      (error) => {
        dispatch(getCurrentDruidConfigurationForTaskFromConfigurationActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getExpectedIndexTaskConfigurationDruidInfo(
  id: number,
  zoneId: string,
  okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getExpectedDruidConfigurationForTaskActions.request());
    MonitoringService.getExpectedIndexTaskConfigurationDruidInfo(
      id,
      zoneId,
      (indexConfiguration) => {
        dispatch(getExpectedDruidConfigurationForTaskActions.success(indexConfiguration));
        if (okCallback) okCallback(indexConfiguration);
      },
      (error) => {
        dispatch(getExpectedDruidConfigurationForTaskActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getExpectedDruidSpecForConfiguration(
  topic_id: number,
  project_id: number,
  task_data: TaskData,
  okCallback?: (indexConfiguration: DruidConfigurationInfo) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getExpectedDruidSpecForConfigurationActions.request());
    MonitoringService.getExpectedDruidSpecForConfiguration(
      topic_id,
      project_id,
      task_data,
      (indexConfiguration) => {
        dispatch(getExpectedDruidSpecForConfigurationActions.success(indexConfiguration));
        if (okCallback) okCallback(indexConfiguration);
      },
      (error) => {
        dispatch(getExpectedDruidSpecForConfigurationActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getCurrentAnalyticalIndexSupervisorSpec(
  supervisor_id: number,
  okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getCurrentDruidSpecForConfigurationActions.request());
    MonitoringService.getCurrentAnalyticalIndexSupervisorSpec(
      supervisor_id,
      (indexConfiguration) => {
        dispatch(getCurrentDruidSpecForConfigurationActions.success(indexConfiguration));
        if (okCallback) okCallback(indexConfiguration);
      },
      (error) => {
        dispatch(getCurrentDruidSpecForConfigurationActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getGlobalConfigsVersions(
  zoneId: string,
  okCallback?: (versions: string[]) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getGlobalConfigsVersionsActions.request());
    MonitoringService.getGlobalConfigsVersions(
      zoneId,
      (versions) => {
        dispatch(getGlobalConfigsVersionsActions.success(versions));
        if (okCallback) okCallback(versions);
      },
      (error) => {
        dispatch(getGlobalConfigsVersionsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function getAllGlobalConfigsVersions(
  zones: string[],
  okCallback?: (versions: string[]) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(getGlobalConfigsVersionsActions.request());
    let hasError: boolean = false;
    const versions: string[] = [];
    zones.map((zoneId, ind) => {
      MonitoringService.getGlobalConfigsVersions(
        zoneId,
        (zoneVersions) => {
          versions.push(...zoneVersions);
          if (zones.length - 1 == ind && !hasError) {
            dispatch(getGlobalConfigsVersionsActions.success(versions));
            if (okCallback) okCallback(versions);
          }
        },
        (error) => {
          hasError = true;
          dispatch(getGlobalConfigsVersionsActions.failure());
          if (errorCallback) {
            errorCallback(error);
          }
        },
      );
    });
  };
}

export function saveCurrentGlobalConfigZone(zone: string) {
  return saveCurrentGlobalConfigZoneAction(zone);
}

import { ErrorMsg } from '@src/utils/ErrorHandling';
import { saveAs } from 'file-saver';
import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import ArchiveService from '../../services/ArchiveService';
import FlowService from '../../services/FlowService';
import ProjectService from '../../services/ProjectService';
import RoleService from '../../services/RoleService';
import { ArchiveUtils } from '../../utils/ArchiveUtils';
import { Utils } from '../../utils/Utils';
import * as authSelectors from '../auth/Reducer';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';
import { Resource, Role } from '../role/Types';

import * as archiveSelectors from './Reducer';
import { getArchiveTaskInstance, getArchiveTaskInstancesDelete } from './Reducer';
import * as ArchiveSelectors from './Reducer';
import {
  ArchivalQuota,
  ArchivalQuotaWithProject,
  ArchiveMeta,
  ArchiveQuotaEstimation,
  ArchiveTask,
  ShortArchiveTask,
  ShortArchiveTaskWithId,
  ArchiveTaskInstance,
  ArchiveTaskInstanceStatus,
  ArchiveTaskInstanceConfigCurrent,
  ArchiveTaskDelete,
  ArchiveTaskRequestStatus,
  ArchiveInputFormatListEnum,
  ArchivalStatus,
} from './Types';

export interface ArchiveMetaForAction {
  projectShortName: string;
  name: string;
  meta: ArchiveMeta;
}

export interface ArchiveQuotaForAction {
  projectShortName: string;
  quota: ArchivalQuota;
}

export interface ArchiveQuotaUpdateForAction {
  projectShortName: string;
  rate: number;
  volume: number;
}

export interface ShortArchiveTaskWithRole {
  id: number;
  project: string;
  name: string;
  labels?: string[];
  canEdit: boolean;
  canView: boolean;
  instances: ArchiveTaskInstance[];
  instancesIds: string[];
  version: string;
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStorageTimeSec?: number;
  flowActions: string[];
  indexActions: string[];
}

export const reqStart = createStandardAction('@archive/REQ_START')<void>();
export const reqFinished = createStandardAction('@archive/REQ_FINISH')<void>();

export const replaceCurrentArchiveTaskAction = createStandardAction('@archive/REPLACE_CURRENT')<ArchiveTask>();
export const selectNewArchiveTaskAction = createStandardAction('@archive/SELECT_NEW')<void>();

export const createArchiveTaskAction = createAsyncAction(
  '@archive/CREATE_ARCHIVE_REQ',
  '@archive/CREATE_ARCHIVE_SUCCESS',
  '@archive/CREATE_ARCHIVE_FAILURE',
)<void, any, string>();

export const listArchiveTasksAction = createAsyncAction(
  '@archive/LIST_ARCHIVES_REQ',
  '@archive/LIST_ARCHIVES_SUCCESS',
  '@archive/LIST_ARCHIVES_FAILURE',
)<void, ShortArchiveTask[], string>();

export const listArchiveTasksWithIdsAction = createAsyncAction(
  '@archive/LIST_ARCHIVES_IDS_REQ',
  '@archive/LIST_ARCHIVES_IDS_SUCCESS',
  '@archive/LIST_ARCHIVES_IDS_FAILURE',
)<void, ShortArchiveTaskWithId[], string>();

export const listArchiveTaskWithRolesAction = createAsyncAction(
  '@archive/LIST_ARCHIVES_ROLES_REQ',
  '@archive/LIST_ARCHIVES_ROLES_SUCC',
  '@archive/LIST_ARCHIVESY_ROLES_FAIL',
)<void, ShortArchiveTaskWithRole[], string>();

export const archiveMetaAction = createAsyncAction('@archive/META_ARCHIVES_REQ', '@archive/META_ARCHIVES_SUCCESS', '@archive/META_ARCHIVES_FAILURE')<
  void,
  ArchiveMetaForAction,
  string
>();

export const getArchiveTaskInfoAction = createAsyncAction(
  '@archive/GET_ARCHIVE_INFO_REQ',
  '@archive/GET_ARCHIVE_INFO_SUCCESS',
  '@archive/GET_ARCHIVE_INFO_FAILURE',
)<void, ArchiveTask, string>();

export const archiveSuspendAction = createAsyncAction(
  '@archive/SUSPEND_ARCHIVE_REQ',
  '@archive/SUSPEND_ARCHIVE_SUCCESS',
  '@archive/SUSPEND_ARCHIVE_FAILURE',
)<string, string, string>();

export const archiveResumeAction = createAsyncAction(
  '@archive/RESUME_ARCHIVE_REQ',
  '@archive/RESUME_ARCHIVE_SUCCESS',
  '@archive/RESUME_ARCHIVE_FAILURE',
)<string, string, string>();

export const getIdArchiveTaskAction = createAsyncAction('@archive/GET_ID_REQ', '@archive/GET_ID_SUCC', '@archive/GET_ID_FAIL')<void, void, string>();

export const updateArchiveTaskAction = createAsyncAction('@archive/UPDATE_REQ', '@archive/UPDATE_SUCC', '@archive/UPDATE_FAIL')<void, void, string>();

export const createArchiveTaskInstanceAction = createAsyncAction(
  '@archive/CREATE_ARCHIVE_INSTANCE_REQ',
  '@arhive/CREATE_ARCHIVE_INSTANCE_SUCC',
  '@archive/CREATE_ARCHIVE_INSTANCE_FAIL',
)<void, void, string>();

export const fetchArchiveQuotaAction = createAsyncAction('@archive/FETCH_QUOTA', '@archive/FETCH_QUOTA_SUCCESS', '@archive/FETCH_QUOTA_FAILURE')<
  void,
  ArchiveQuotaForAction,
  string
>();

export const fetchArchiveQuotasAction = createAsyncAction('@archive/FETCH_QUOTAS', '@archive/FETCH_QUOTAS_SUCCESS', '@archive/FETCH_QUOTAS_FAILURE')<
  void,
  ArchivalQuotaWithProject[],
  string
>();

export const updateQuotaForProjectAction = createAsyncAction(
  '@archive/UPDATE_QUOTA_FOR_PROJECT_REQ',
  '@archive/UPDATE_QUOTA_FOR_PROJECT_SUCCESS',
  '@archive/UPDATE_QUOTA_FOR_PROJECT_FAILURE',
)<void, ArchiveQuotaUpdateForAction, string>();

export const fetchCalculatedQuotaAction = createAsyncAction(
  '@archive/FETCH_ESTIMATED_QUOTA',
  '@archive/FETCH_ESTIMATED_QUOTA_SUCCESS',
  '@archive/FETCH_ESTIMATED_QUOTA_FAILURE',
)<void, ArchiveQuotaEstimation, string>();

export const getArchiveFilterValuesAction = createAsyncAction(
  '@archive/LIST_ALL_FILTER_VALUES_REQ',
  '@archive/LIST_ALL_FILTER_VALUES_SUCCESS',
  '@archive/LIST_ALL_FILTER_VALUES_FAILURE',
)<void, string[], string>();

export const getArchivesTotalCountAction = createAsyncAction(
  '@archive/LIST_TOTAL_COUNT_REQ',
  '@archive/LIST_TOTAL_COUNT_SUCCESS',
  '@archive/LIST_TOTAL_COUNT_FAILURE',
)<void, number, string>();

export const fetchLabelsActions = createAsyncAction('@archive/LABELS_REQ', '@archive/LABELS_SUCC', '@archive/LABELS_FAIL')<void, string[], void>();

export const addLabelsActions = createAsyncAction('@archive/ADD_LABEL_REQ', '@archive/ADD_LABEL_SUCC', '@archive/ADD_LABEL_FAIL')<void, void, void>();

export const deleteLabelsActions = createAsyncAction('@archive/DELETE_LABEL_REQ', '@archive/DELETE_LABEL_SUCC', '@archive/DELETE_LABEL_FAIL')<
  void,
  void,
  void
>();

export const getVersionAction = createAsyncAction('@archive/VERSION_REQ', '@archive/VERSION_SUCC', '@archive/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    ArchiveService.getVersion(
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

/**
 * @todo отказаться в пользу fetchArchiveTaskConfig
 * и хранить в currentArchiveTask идентификатор задачи
 */
export function getArchiveTaskInfo(
  projectShortName: string,
  name: string,
  okCallback?: (task: ArchiveTask) => void,
  errorCallback?: (errorMsg: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(getArchiveTaskInfoAction.request());

    ArchiveService.getArchiveTaskInfo(
      projectShortName,
      name,
      (task: ArchiveTask) => {
        dispatch(getArchiveTaskInfoAction.success(task));
        if (okCallback) {
          okCallback(task);
        }
        dispatch(reqFinished());
      },
      (msg: string) => {
        dispatch(getArchiveTaskInfoAction.failure(msg));

        if (errorCallback) {
          errorCallback(msg);
        }
      },
    );
    // dispatch(reqFinished());
  };
}

export function downloadArchiveTask(projectShortName: string, name: string) {
  return (dispatch, getState) => {
    ArchiveService.getArchiveTaskInfo(
      projectShortName,
      name,
      (task: ArchiveTask) => {
        const blob = new Blob([JSON.stringify(task, null, '\t')], {
          type: 'application/json',
        });
        saveAs(blob, task.name + '.json');
        dispatch(notificationActions.success('Конфигурация архива ' + task.name + ' сохранена'));
      },
      (errorMessage) => {
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function replaceArchiveTask(task: ArchiveTask) {
  return replaceCurrentArchiveTaskAction(task);
}

export const deleteArchiveTaskAction = createAsyncAction(
  '@archive/DELETE_ARCHIVE_REQ',
  '@archive/DELETE_ARCHIVE_SUCCESS',
  '@archive/DELETE_ARCHIVE_FAILURE',
)<void, void, string>();
export const clearDeleteArchiveTaskAction = createStandardAction('@archive/CLEAR_DELETE_ARCHIVE')<void>();
export function deleteArchiveTask(projectShortName: string, name: string, okCallback?: () => void, errorCallback?: (errorMsg: string) => void) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    dispatch(deleteArchiveTaskAction.request);
    ArchiveService.deleteArchiveTask(
      projectShortName,
      name,
      () => {
        dispatch(deleteArchiveTaskAction.success);
        dispatch(notificationActions.success('Архив успешно удален'));
        if (okCallback) {
          okCallback();
        }
        dispatch(reqFinished());
      },
      (msg: string) => {
        dispatch(deleteArchiveTaskAction.failure(msg));
        if (errorCallback) {
          errorCallback(msg);
        }
      },
    );
    dispatch(reqFinished());
  };
}

export const deleteArchiveTaskInstancesAction = createAsyncAction(
  '@archive/DELETE_ARCHIVE_INSTANCES_REQ',
  '@archive/DELETE_ARCHIVE_INSTANCES_SUCCESS',
  '@archive/DELETE_ARCHIVE_INSTANCES_FAILURE',
)<
  string[],
  string[],
  {
    archiveTaskInstanceId: string;
    errorMsg: { message: string; details?: string } | string;
  }[]
>();
export function deleteArchiveTaskInstances(archiveTaskInstancesId: string[]) {
  return (dispatch, getState) => {
    const instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[] = [];
    archiveTaskInstancesId.forEach((archiveTaskInstanceId) => {
      const instance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
      if (!instance) {
        return;
      }
      instancesParams.push({
        project: instance.project,
        name: instance.name,
        zoneId: instance.zoneId,
        archiveTaskInstanceId: instance.archiveTaskInstanceId,
      });
    });
    dispatch(deleteArchiveTaskInstancesAction.request(archiveTaskInstancesId));
    ArchiveService.deleteArchiveTaskInstances(instancesParams, (responses) => {
      const okRequests = responses.filter(({ errorMsg }) => errorMsg === 'ok');
      const badRequests = responses.filter(({ errorMsg }) => errorMsg !== 'ok');
      dispatch(deleteArchiveTaskInstancesAction.success(okRequests.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId)));
      if (badRequests.length > 0) {
        dispatch(deleteArchiveTaskInstancesAction.failure(badRequests));
      }
    });
  };
}

export const clearDeleteArchiveTaskInstancesAction = createStandardAction('@archive/CLEAR_DELETE_ARCHIVE_INSTANCES')<void>();
export function clearDeleteArchiveTaskInstances() {
  return (dispatch, getState) => {
    dispatch(clearDeleteArchiveTaskInstancesAction());
  };
}

export function listArchiveTasks(okCallback?: (tasks: ShortArchiveTask[]) => void, errorCallback?: (errorMsg: string) => void) {
  return (dispatch, getState) => {
    dispatch(reqStart());

    ArchiveService.listArchiveTasks(
      (tasks: ShortArchiveTask[]) => {
        dispatch(listArchiveTasksAction.success(tasks));
        if (okCallback) {
          okCallback(tasks);
        }
        dispatch(reqFinished());
      },
      (errorText: string) => {
        dispatch(listArchiveTasksAction.failure);
        if (errorCallback) {
          errorCallback(errorText);
        }
      },
    );
    dispatch(reqFinished());
  };
}

export function listArchiveTasksWithIds(
  labels?: string[],
  okCallback?: (tasks: ShortArchiveTask[]) => void,
  errorCallback?: (errorMsg: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(reqStart());

    ArchiveService.listArchiveTasksWithIds(
      labels,
      (tasks: ShortArchiveTaskWithId[]) => {
        dispatch(listArchiveTasksWithIdsAction.success(tasks));
        if (okCallback) {
          okCallback(tasks);
        }
        dispatch(reqFinished());
      },
      (errorText: string) => {
        dispatch(listArchiveTasksWithIdsAction.failure);
        if (errorCallback) {
          errorCallback(errorText);
        }
      },
    );
    dispatch(reqFinished());
  };
}

export const resumeArchiveInstances =
  (archiveTaskInstancesId: string[], okCallback?: (msg: string) => void, errorCallback?: (errorMsg: string) => void) => (dispatch, getState) => {
    const instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[] = [];
    archiveTaskInstancesId.forEach((archiveTaskInstanceId) => {
      const instance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
      if (!instance) {
        return;
      }
      instancesParams.push({
        project: instance.project,
        name: instance.name,
        zoneId: instance.zoneId,
        archiveTaskInstanceId: instance.archiveTaskInstanceId,
      });
    });
    ArchiveService.resumeArchiveTaskInstances(instancesParams, (msg) => {
      const okRequests = msg.filter((req) => req.res === 'ok');
      const badRequests = msg.filter((req) => req.res !== 'ok');
      if (badRequests.length === 1) {
        dispatch(notificationActions.error('В запросе на запуск записи в архив произошла ошибка'));
      }
      if (badRequests.length > 1) {
        dispatch(notificationActions.error('В запросах на запуск записи в архив произошла ошибка'));
      }
      if (badRequests.length === 0) {
        dispatch(notificationActions.info('Запись в архив запускается, это займёт некоторое время ( ~15 сек).'));
      }
      // dispatch(fetchArchiveTaskInstanceStatus(projectName, name, zoneId, instanceId));
      dispatch(fetchArchiveTaskInstanceStatuses(instancesParams.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId)));
    });
  };

export const archiveResetAction = createAsyncAction('@archive/RESET_ARCHIVE_REQ', '@archive/RESET_ARCHIVE_SUCCESS', '@archive/RESET_ARCHIVE_FAILURE')<
  string,
  string,
  string
>();

export function resetArchiveTaskInstance(archiveTaskInstanceId: string) {
  return (dispatch, getState) => {
    const archiveTaskInstance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
    if (!archiveTaskInstance) {
      return;
    }
    const { project, name, zoneId } = archiveTaskInstance;
    dispatch(archiveResetAction.request(archiveTaskInstanceId));
    dispatch(notificationActions.info('Сброс offset Kafka, это займёт некоторое время ( ~15 сек).'));
    ArchiveService.resetArchiveTaskInstance(
      project,
      name,
      zoneId,
      (msg) => {
        dispatch(notificationActions.success('Offset сброшен.'));
        dispatch(archiveResetAction.success(archiveTaskInstanceId));
        dispatch(fetchArchiveTaskInstanceStatuses([archiveTaskInstanceId]));
        dispatch(reqFinished());
      },
      (errorText: string) => {
        dispatch(archiveResetAction.failure(project + name + zoneId));
        dispatch(reqFinished());
      },
    );
  };
}

export const suspendArchiveInstance =
  (
    projectName: string,
    name: string,
    zoneId: string,
    instanceId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: string) => void,
  ) =>
  (dispatch, getState) => {
    // dispatch(archiveSuspendAction.request(projectName + name + zoneId));
    // ArchiveService.suspendArchiveTaskInstance(projectName, name, zoneId, (msg) => {
    //   dispatch(notificationActions.success("Запись в архив остановлена."));
    //   dispatch(archiveSuspendAction.success(projectName + name + zoneId));
    //   dispatch(fetchArchiveTaskInstanceStatus(projectName, name, zoneId, instanceId));
    //   if (okCallback) {
    //     okCallback(msg);
    //   }
    //   dispatch(reqFinished());
    // },
    // (errorText: string) => {
    //   dispatch(archiveSuspendAction.failure(projectName + name));
    //   if (errorCallback) {
    //     errorCallback(errorText);
    //   }
    //   dispatch(reqFinished());
    // })
  };

export const suspendArchiveInstances = (archiveTaskInstancesId: string[]) => (dispatch, getState) => {
  const instancesParams: {
    project: string;
    name: string;
    zoneId: string;
    archiveTaskInstanceId: string;
  }[] = [];
  archiveTaskInstancesId.forEach((archiveTaskInstanceId) => {
    const instance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
    if (!instance) {
      return;
    }
    instancesParams.push({
      project: instance.project,
      name: instance.name,
      zoneId: instance.zoneId,
      archiveTaskInstanceId: instance.archiveTaskInstanceId,
    });
  });
  ArchiveService.suspendArchiveTaskInstances(instancesParams, (msg) => {
    const okRequests = msg.filter((req) => req.res === 'ok');
    const badRequests = msg.filter((req) => req.res !== 'ok');
    if (badRequests.length === 1) {
      dispatch(notificationActions.error('В запросе на остановку записи в архив произошла ошибка'));
    }
    if (badRequests.length > 1) {
      dispatch(notificationActions.error('В запросах на остановку записи в архив произошла ошибка'));
    }
    if (badRequests.length === 0) {
      dispatch(notificationActions.success(`Запись в архив${okRequests.length > 0 ? 'ы' : ''} остановлена.`));
    }
    dispatch(fetchArchiveTaskInstanceStatuses(instancesParams.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId)));
  });
};

export function fetchQuota(projectShortName: string, fetchedCallback?: (quota: ArchivalQuota) => void, errorCallback?: (msg: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchArchiveQuotaAction.request());
    ArchiveService.getArchiveQuota(
      projectShortName,
      (quota: ArchivalQuota) => {
        dispatch(
          fetchArchiveQuotaAction.success({
            projectShortName: projectShortName,
            quota: quota,
          }),
        );
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchArchiveQuotaAction.failure(error));
        // dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchQuotas(fetchedCallback?: (quota: ArchivalQuotaWithProject[]) => void, errorCallback?: (msg: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchArchiveQuotasAction.request());
    ArchiveService.listArchiveQuota(
      (quotas) => {
        dispatch(fetchArchiveQuotasAction.success(quotas));
      },
      (error) => {
        dispatch(fetchArchiveQuotasAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
    // let quotaMap: any = {};
    // let iter = 0;
    // projects.map((projectShortName, ind) => {
    //   ArchiveService.getArchiveQuota(projectShortName, (quota: ArchivalQuota) => {
    //     quotaMap[projectShortName] = quota;
    //     if (ind === iter) {
    //       dispatch(fetchArchiveQuotasAction.success(quotaMap));
    //       if (fetchedCallback) {
    //         fetchedCallback(quotaMap);
    //       }
    //     }
    //     iter++;
    //   }, (error) => {
    //     if (errorCallback) {
    //       errorCallback(error);
    //     }
    //     if (ind === iter) {
    //       if (quotaMap.length === 0) {
    //         dispatch(fetchArchiveQuotasAction.failure(error));
    //         // dispatch(notificationActions.error(error));
    //       } else {
    //         dispatch(fetchArchiveQuotasAction.success(quotaMap));
    //         if (fetchedCallback) {
    //           fetchedCallback(quotaMap);
    //         }
    //       }
    //     }
    //     iter++;
    //   });
    // })
  };
}

export function updateQuotaForProject(projectShortName: string, volume: number, rate: number, callback?) {
  return (dispatch, getState) => {
    dispatch(updateQuotaForProjectAction.request());
    ArchiveService.postArchiveQuota(
      projectShortName,
      { totalSizeBytes: volume, totalDataRateBytesPerSec: rate },
      () => {
        dispatch(
          updateQuotaForProjectAction.success({
            projectShortName: projectShortName,
            volume: volume,
            rate: rate,
          }),
        );
        if (callback) {
          callback();
        }
      },
      (message: string) => {
        dispatch(updateQuotaForProjectAction.failure(message));
        dispatch(notificationActions.error(message));
      },
    );
    dispatch(reqFinished());
  };
}

export function getArchiveId(projectShortName: string, name: string, callback?: (id: number) => void, errorCallback?: (msg: string) => void) {
  return (dispatch, getState) => {
    dispatch(getIdArchiveTaskAction.request());
    ArchiveService.getArchiveId(
      projectShortName,
      name,
      (id) => {
        dispatch(getIdArchiveTaskAction.success());
        if (callback) {
          callback(id);
        }
      },
      (message: string) => {
        dispatch(getIdArchiveTaskAction.failure(message));
        dispatch(notificationActions.error(message));
        if (errorCallback) errorCallback(message);
      },
    );
  };
}

const convertShortArchiveTasks = (task: ShortArchiveTaskWithId): ShortArchiveTaskWithRole => {
  return {
    ...task,
    canEdit: false,
    canView: false,
  };
};

export function fetchListArchivesWithRoles(okCallback?: any, errorCallback?: any, page?: number, nameLike?: string) {
  return (dispatch, getState) => {
    const user = authSelectors.user(getState());
    if (!user) {
      return;
    }
    const archiveFilters = archiveSelectors.getArchiveFilter(getState()) || [];
    const filters = Utils.createArchiveFilters(archiveFilters);
    dispatch(listArchiveTaskWithRolesAction.request());
    const archCopy: ShortArchiveTaskWithRole[] = [];
    ArchiveService.listArchiveTasksWithIds(
      filters,
      (archives) => {
        if (archives.length === 0) {
          dispatch(listArchiveTaskWithRolesAction.success(archCopy));
          if (okCallback) okCallback(archCopy);
        } else {
          archives.map((archive) => {
            archCopy.push(convertShortArchiveTasks(archive));
            if (archives.length === archCopy.length) {
              dispatch(listArchiveTaskWithRolesAction.success(archCopy));
            }
          });
          if (okCallback) okCallback(archCopy);
        }
      },
      (errorMessage) => {
        dispatch(listArchiveTaskWithRolesAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error('Ошибка при получении всех архивов: ' + errorMessage.message));
      },
      page,
      nameLike,
      (count) => {
        setTimeout(() => dispatch(getArchivesTotalCountAction.success(count)), 300);
      },
    );
  };
}

export function fetchEstimateQuota(
  projectShortName: string,
  size: number,
  rate: number,
  fetchedCallback?: (quota: ArchiveQuotaEstimation) => void,
  notFetchedCallback?: (msg: string) => void,
  index?: string,
) {
  return (dispatch, getState) => {
    dispatch(fetchCalculatedQuotaAction.request());
    ArchiveService.getEstimatedArchiveQuota(
      projectShortName,
      rate,
      size,
      (quota: ArchiveQuotaEstimation) => {
        dispatch(fetchCalculatedQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (msg: string) => {
        dispatch(fetchCalculatedQuotaAction.failure(msg));
        if (notFetchedCallback) {
          notFetchedCallback(msg);
        }
      },
      index,
    );
    dispatch(reqFinished());
  };
}

export const setArchiveFilterAction = createStandardAction('@archive/SET_FILTER')<{ filter: FilterMenuItem[] | undefined }>();
export const setArchiveFilter =
  (filter: FilterMenuItem[] | undefined = [], isRefetch) =>
  (dispatch) => {
    dispatch(setArchiveFilterAction({ filter: filter, isRefetch: isRefetch }));
  };

export function getArchiveFilterValues(okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(getArchiveFilterValuesAction.request());
    ArchiveService.getArchiveFilterValues(
      (labels) => {
        dispatch(getArchiveFilterValuesAction.success(labels));
        if (okCallback) okCallback(labels);
      },
      (error) => {
        dispatch(getArchiveFilterValuesAction.failure(error));
        if (errorCallback) errorCallback(error);
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function fetchArchiveLabels(
  projectShortName: string,
  name: string,
  okCallback?: (labels: string[]) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(fetchLabelsActions.request());
    ArchiveService.fetchArchiveLabels(
      projectShortName,
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

export function addArchiveLabel(projectShortName: string, name: string, label: string, okCallback?, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(addLabelsActions.request());
    ArchiveService.addArchiveLabel(
      projectShortName,
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

export function deleteArchiveLabel(projectShortName: string, name: string, label: string, okCallback?, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(deleteLabelsActions.request());
    ArchiveService.deleteArchiveLabel(
      projectShortName,
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

export const fetchArchiveTaskInstanceStatusActions = createAsyncAction(
  '@archive/ARCHIVE_TASK_INSTANCE_STATUS_REQ',
  '@archive/ARCHIVE_TASK_INSTANCE_STATUS_SUCC',
  '@archive/ARCHIVE_TASK_INSTANCE_STATUS_FAIL',
)<string, ArchiveTaskInstanceStatus, string>();

export const fetchArchiveTasksInstanceStatusesActions = createAsyncAction(
  '@archive/ARCHIVE_TASKS_INSTANCE_STATUSES_REQ',
  '@archive/ARCHIVE_TASKS_INSTANCE_STATUSES_SUCC',
  '@archive/ARCHIVE_TASKS_INSTANCE_STATUSES_FAIL',
)<string[], ArchiveTaskInstanceStatus[], ArchiveTaskInstanceStatus[]>();

export const fetchArchiveTasksInstanceStatusesActionsPagination = createAsyncAction(
  '@archive/ARCHIVE_TASKS_INSTANCE_STATUSES_PAGINATION_REQ',
  '@archive/ARCHIVE_TASKS_INSTANCE_STATUSES_PAGINATION_SUCC',
  '@archive/ARCHIVE_TASKS_INSTANCE_STATUSES_PAGINATION_FAIL',
)<string[], ArchiveTaskInstanceStatus[], ArchiveTaskInstanceStatus[]>();

export const fetchArchiveTaskInstanceStatusesActions = createAsyncAction(
  '@archive/ARCHIVE_TASK_INSTANCE_STATUSES_REQ',
  '@archive/ARCHIVE_TASK_INSTANCE_STATUSES_SUCC',
  '@archive/ARCHIVE_TASK_INSTANCE_STATUSES_FAIL',
)<string[], ArchiveTaskInstanceStatus[], ArchiveTaskInstanceStatus[]>();

export const fetchArchiveTaskInstanceStatuses =
  (archiveTaskInstanceIds: string[], errorCallback?: (errors: string[]) => void) => (dispatch, getState) => {
    const archiveTaskInstances = archiveTaskInstanceIds
      .filter((archiveTaskInstanceId) => getArchiveTaskInstancesDelete(getState(), archiveTaskInstanceId) !== ArchiveTaskDelete.success)
      .map((archiveTaskInstanceId) => getArchiveTaskInstance(getState(), archiveTaskInstanceId))
      .filter((instance) => !!instance) as ArchiveTaskInstance[];
    dispatch(fetchArchiveTaskInstanceStatusesActions.request(archiveTaskInstanceIds));
    ArchiveService.getArchiveTaskInstanceStatuses(archiveTaskInstances, (archiveTaskInstanceStatuses) => {
      const brokenRequests: ArchiveTaskInstanceStatus[] = [];
      const okRequests: ArchiveTaskInstanceStatus[] = [];
      archiveTaskInstanceStatuses.forEach((possibleStatus) => {
        // @ts-ignore -- если possibleStatus имеет message - то это не статус - а ошибка
        if (possibleStatus.errorStatusMessage) {
          brokenRequests.push(possibleStatus as ArchiveTaskInstanceStatus);
          return;
        }
        okRequests.push(possibleStatus as ArchiveTaskInstanceStatus);
      });
      dispatch(fetchArchiveTaskInstanceStatusesActions.success(okRequests));
      if (brokenRequests.length > 0) {
        if (brokenRequests.length === 1) {
          dispatch(notificationActions.error('Во время запроса произошла ошибка: ' + brokenRequests[0].errorStatusMessage.message));
        } else {
          // @ts-ignore -- формируем список уникальных ошибок, который и покажем пользователю
          const badRequest: string[] = [];
          brokenRequests.forEach((req) => {
            const message = req.errorStatusMessage || '';
            if (!badRequest.includes(message)) {
              badRequest.push(message.message);
            }
          });
          dispatch(notificationActions.error('Во время запроса произошли ошибки: ' + badRequest.join(', ')));
        }
        dispatch(fetchArchiveTaskInstanceStatusesActions.failure(brokenRequests));
        if (errorCallback) {
          errorCallback(brokenRequests.map(({ message }) => message));
        }
      }
    });
  };

export const updateArchiveTaskInstanceAction = createAsyncAction(
  '@archive/UPDATE_ARCHIVE_INSTANCE_REQ',
  '@arhive/UPDATE_ARCHIVE_INSTANCE_SUCC',
  '@archive/UPDATE_ARCHIVE_INSTANCE_FAIL',
)<string, string, string>();
export const updateArchiveTaskInstance = (archiveTaskInstanceId: string) => (dispatch, getState) => {
  const archiveTaskInstance = getArchiveTaskInstance(getState(), archiveTaskInstanceId);
  if (!archiveTaskInstance) {
    return;
  }
  dispatch(updateArchiveTaskInstanceAction.request(archiveTaskInstanceId));
  ArchiveService.updateArchiveTaskInstance(
    archiveTaskInstance.project,
    archiveTaskInstance.name,
    archiveTaskInstance.zoneId,
    () => {
      dispatch(updateArchiveTaskInstanceAction.success(archiveTaskInstanceId));
      dispatch(notificationActions.success('Экземпляр задачи обновлён успешно'));
      dispatch(fetchListArchivesWithRoles());
    },
    (msg) => {
      dispatch(updateArchiveTaskInstanceAction.failure(archiveTaskInstanceId));
      dispatch(notificationActions.error(msg));
    },
  );
};

export const createArchiveTaskInstance = (projectName: string, taskName: string, zoneId: string, okCallback?) => (dispatch, getState) => {
  dispatch(createArchiveTaskInstanceAction.request());
  ArchiveService.createArchiveTaskInstance(
    projectName,
    taskName,
    zoneId,
    () => {
      dispatch(createArchiveTaskInstanceAction.success());
      dispatch(notificationActions.success('Экземпляр задачи создан успешно'));
      if (okCallback) okCallback();
    },
    (error: string | ErrorMsg['message']) => {
      const message = typeof error === 'string' ? error : error?.message;
      dispatch(createArchiveTaskInstanceAction.failure('Во время создания экземпляра произошла ошибка'));
      dispatch(notificationActions.error(`Во время создания экземпляра произошла ошибка ${message}`));
    },
  );
};

export const resetZoneOverdraftAction = createAsyncAction(
  '@overdraftArchive/RESET_ZONE_OVERDRAFT_REQ',
  '@overdraftArchive/RESET_ZONE_OVERDRAFT_SUCC',
  '@overdraftArchive/RESET_ZONE_OVERDRAFT_FAIL',
)<void, void, string>();

export function resetZoneOverdraft(zoneId: string, okCallback?: () => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(resetZoneOverdraftAction.request());
    ArchiveService.resetZoneOverdraft(
      zoneId,
      () => {
        dispatch(resetZoneOverdraftAction.success());
        if (okCallback) {
          okCallback();
          dispatch(notificationActions.success('Овердрафт успешно сброшен'));
        }
      },
      (errorText: string) => {
        dispatch(resetZoneOverdraftAction.failure(errorText));
        if (errorCallback) {
          errorCallback(errorText);
        }
        dispatch(notificationActions.error('Ошибка при сбросе овердрафта ' + errorText.message));
      },
    );
  };
}

export const changeArchiveInstanceOverdraftAction = createAsyncAction(
  '@overdraftArchive/CHANCHE_INSTANCE_OVERDRAFT_REQ',
  '@overdraftArchive/CHANCHE_INSTANCE_OVERDRAFT_SUCC',
  '@overdraftArchive/CHANCHE_INSTANCE_OVERDRAFT_FAIL',
)<void, void, string>();

export const changeArchiveInstanceOverdraft =
  (
    archiveTaskInstanceId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) =>
  (dispatch, getState) => {
    const instance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
    if (!instance) {
      return;
    }
    const { project, name, zoneId } = instance;
    dispatch(changeArchiveInstanceOverdraftAction.request());
    ArchiveService.changeArchiveInstanceOverdraft(
      project,
      name,
      zoneId,
      value,
      () => {
        dispatch(changeArchiveInstanceOverdraftAction.success());
        if (okCallback) okCallback();
      },
      (msg) => {
        // dispatch(changeIArchiveInstanceOverdraftAction.failure('Ошибка увеличения скорости'));
        if (errorCallback) errorCallback(msg);
      },
    );
  };

export const resetInstanceOverdraftsAction = createAsyncAction(
  '@overdraftArchive/RESET_INSTANCE_OVERDRAFTS_REQ',
  '@overdraftArchive/RESET_INSTANCE_OVERDRAFTS_SUCC',
  '@overdraftArchive/RESET_INSTANCE_OVERDRAFTS_FAIL',
)<string[], string[], { archiveTaskInstanceId: string; error: string }[]>();
export const resetInstanceOverdrafts =
  (
    archiveTaskInstancesId: string[],
    okCallback?: () => void,
    errorCallback?: (
      errors: {
        msg: { message: string; details?: string };
        archiveTaskInstanceId: string;
      }[],
    ) => void,
  ) =>
  (dispatch, getState) => {
    const instancesParams: {
      project: string;
      name: string;
      zoneId: string;
      archiveTaskInstanceId: string;
    }[] = [];
    archiveTaskInstancesId.forEach((archiveTaskInstanceId) => {
      const instance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
      if (!instance) {
        return;
      }
      instancesParams.push({
        project: instance.project,
        name: instance.name,
        zoneId: instance.zoneId,
        archiveTaskInstanceId: instance.archiveTaskInstanceId,
      });
    });
    dispatch(resetInstanceOverdraftsAction.request(instancesParams.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId)));
    ArchiveService.resetInstanceOverdrafts(instancesParams, (msg) => {
      const okRequests = msg.filter((req) => req.res === 'ok');
      const badRequests = msg.filter((req) => req.res !== 'ok');
      if (badRequests.length > 0) {
        dispatch(
          resetInstanceOverdraftsAction.failure(
            badRequests.map(({ archiveTaskInstanceId, res }) => ({
              archiveTaskInstanceId,
              error: res,
            })),
          ),
        );
        if (errorCallback) {
          errorCallback(
            badRequests.map(({ archiveTaskInstanceId, res }) => ({
              archiveTaskInstanceId,
              msg: res,
            })),
          );
        } else {
          badRequests.forEach(({ res }) => dispatch(notificationActions.error('Ошибка при сбросе овердрафта ' + res.message)));
        }
      }
      dispatch(resetInstanceOverdraftsAction.success(okRequests.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId)));
      if (okCallback) {
        okCallback();
      }
    });
  };

export const getArchiveTaskInstancesOverdraftAction = createAsyncAction(
  '@overdraftArchive/GET_ARCHIVE_INSTANCES_OVERDRAFT_REQ',
  '@overdraftArchive/GET_ARCHIVE_INSTANCES_OVERDRAFT_SUCC',
  '@overdraftArchive/GET_ARCHIVE_INSTANCES_OVERDRAFT_FAIL',
)<string[], { archiveTaskInstanceId: string; overdraftPercent: number }[], string>();
export const clearResetInstanceOverdraftsAction = createStandardAction('@archive/CLEAR_RESET_INSTANCE_OVERDRAFTS')<void>();
export const clearResetInstanceOverdrafts = () => async (dispatch, getState) => {
  const resettedArchiveTaskInstancesOverdrafts = [...ArchiveSelectors.getResetArchiveTaskInstanceOverdraftRequest(getState()).entries()];
  const successfullyResetted = resettedArchiveTaskInstancesOverdrafts.filter(
    ([archiveTaskInstanceId, resetStatus]) => resetStatus === ArchiveTaskRequestStatus.success,
  );
  dispatch(
    getArchiveTaskInstancesOverdraftAction.success(
      successfullyResetted.map(([archiveTaskInstanceId]) => ({
        archiveTaskInstanceId,
        overdraftPercent: 0,
      })),
    ),
  );
  dispatch(clearResetInstanceOverdraftsAction());
};

export const getOverdraftValueAction = createAsyncAction(
  '@overdraftArchive/GET_OVERDRAFT_VALUE_REQ',
  '@overdraftArchive/GET_OVERDRAFT_VALUE_SUCC',
  '@overdraftArchive/GET_OVERDRAFT_VALUE_FAIL',
)<void, number, string>();

export const getOverdraftValue = (quota, fetchedCallback?: (value: number) => void) => (dispatch) => {
  dispatch(getOverdraftValueAction.request());
  ArchiveService.getOverdraftValue(
    quota,
    (value: number) => {
      dispatch(getOverdraftValueAction.success(value));
      if (fetchedCallback) fetchedCallback(value);
    },
    (msg: string) => {
      dispatch(getOverdraftValueAction.failure(msg));
    },
  );
};

export const getArchiveTaskInstanceConfigAction = createAsyncAction(
  '@overdraftArchive/GET_ARCHIVE_INSTANCE_CONFIG_REQ',
  '@overdraftArchive/GET_ARCHIVE_INSTANCE_CONFIG_SUCC',
  '@overdraftArchive/GET_ARCHIVE_INSTANCE_CONFIG_FAIL',
)<string, [string, ArchiveTaskInstanceConfigCurrent], string>();

/**
 * todo выпилить!
 * Для одного запроса можно использовать getArchiveTaskInstancesConfig с единственным элементом в списке
 */
export const getArchiveTaskInstanceConfig =
  (projectName: string, name: string, zoneId: string, instanceId: string, okCallback?: () => void) => (dispatch) => {
    dispatch(getArchiveTaskInstanceConfigAction.request(ArchiveUtils.getArchiveTaskInstanceStatusId(projectName, name, zoneId)));
    ArchiveService.getArchiveTaskInstanceConfig(projectName, name, zoneId, (instanceConfig) => {
      dispatch(
        getArchiveTaskInstanceConfigAction.success([
          ArchiveUtils.getArchiveTaskInstanceStatusId(projectName, name, zoneId),
          {
            ...instanceConfig,
            instanceId,
          },
        ]),
      );
      if (okCallback) {
        okCallback();
      }
    });
  };

export const getArchiveTaskInstancesConfigAction = createAsyncAction(
  '@overdraftArchive/GET_ARCHIVE_INSTANCES_CONFIG_REQ',
  '@overdraftArchive/GET_ARCHIVE_INSTANCES_CONFIG_SUCC',
  '@overdraftArchive/GET_ARCHIVE_INSTANCES_CONFIG_FAIL',
)<string[], { instanceId: string; config: ArchiveTaskInstanceConfigCurrent }[], string[]>();

/** todo выпилить! Данные есть в /list **/
export const getArchiveTaskInstancesConfig =
  (
    instancesParams: {
      projectName: string;
      taskName: string;
      zoneId: string;
      instanceId: string;
    }[],
    okCallback?: () => void,
  ) =>
  (dispatch) => {
    dispatch(
      getArchiveTaskInstancesConfigAction.request(
        instancesParams.map((instanceParams) =>
          ArchiveUtils.getArchiveTaskInstanceStatusId(instanceParams.projectName, instanceParams.taskName, instanceParams.zoneId),
        ),
      ),
    );
    ArchiveService.getArchiveTaskInstancesConfig(instancesParams, (instancesConfig) => {
      dispatch(getArchiveTaskInstancesConfigAction.success(instancesConfig));
    });
  };

/**
 * todo выпилить!
 * Для одного запроса можно использовать getArchiveTaskInstancesOverdraftAction с единственным элементом в списке
 */
export const getArchiveTaskInstanceOverdraftAction = createAsyncAction(
  '@overdraftArchive/GET_ARCHIVE_INSTANCE_OVERDRAFT_REQ',
  '@overdraftArchive/GET_ARCHIVE_INSTANCE_OVERDRAFT_SUCC',
  '@overdraftArchive/GET_ARCHIVE_INSTANCE_OVERDRAFT_FAIL',
)<string, { instanceId: string; overdraftPercent: number }, string>();

/** todo удалить overdraftPercent приходит у экземпляра в /list **/
export const getArchiveTaskInstanceOverdraftPercent = (archiveTaskInstanceId: string, okCallback?: () => void) => (dispatch, getState) => {
  // const instance = ArchiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
  // if (!instance) {
  //   return;
  // }
  // const {project, name, zoneId} = instance;
  // dispatch(getArchiveTaskInstanceOverdraftAction.request(ArchiveUtils.getArchiveTaskInstanceStatusId(project, name, zoneId),))
  // ArchiveService.getArchiveTaskInstanceOverdraft(project, name, zoneId, (archiveTaskInstanceOverdraftConfig) => {
  //   dispatch(getArchiveTaskInstanceOverdraftAction.success({
  //     instanceId: ArchiveUtils.getArchiveTaskInstanceStatusId(project, name, zoneId),
  //     overdraftPercent: archiveTaskInstanceOverdraftConfig.overdraftPercent,
  //   }));
  //   if (okCallback){
  //     okCallback();
  //   }
  // })
};

export const fetchArchiveTaskConfigAction = createAsyncAction(
  '@archive/GET_ARCHIVE_TASK_CONFIG_REQ',
  '@archive/GET_ARCHIVE_TASK_CONFIG_SUCCESS',
  '@archive/GET_ARCHIVE_TASK_CONFIG_FAILURE',
)<string, { archiveTaskId: string; archiveTaskConfig: ArchiveTask }, string>();
/**
 * @todo отказаться в пользу fetchArchiveTaskConfig
 */
export const fetchArchiveTaskConfig = (
  projectShortName: string,
  name: string,
  okCallback?: (task: ArchiveTask) => void,
  errorCallback?: (errorMsg: string) => void,
) => {
  return (dispatch, getState) => {
    const archiveTaskId = ArchiveUtils.getArchiveTaskId(projectShortName, name);
    dispatch(fetchArchiveTaskConfigAction.request(archiveTaskId));
    ArchiveService.getArchiveTaskInfo(
      projectShortName,
      name,
      (config: ArchiveTask) => {
        dispatch(
          fetchArchiveTaskConfigAction.success({
            archiveTaskId,
            archiveTaskConfig: config,
          }),
        );
      },
      (msg: string) => {
        dispatch(fetchArchiveTaskConfigAction.failure(archiveTaskId));
        if (errorCallback) {
          errorCallback(msg);
        }
      },
    );
  };
};

export const editArchiveTaskInstanceOverdraftAction = createStandardAction('@archive/ARCHIVE_TASK_INSTANCE_OVERDRAFT_EDIT')<string>();
export const closeEditArchiveTaskInstanceOverdraftAction = createStandardAction('@archive/ARCHIVE_TASK_INSTANCE_OVERDRAFT_EDIT')<void>();
export const closeEditArchiveTaskInstanceOverdraft = () => async (dispatch, getState) => {
  const archiveTaskInstanceId = archiveSelectors.getEditArchiveTaskInstanceOverdraftId(getState());
  const instance = archiveTaskInstanceId && archiveSelectors.getArchiveTaskInstance(getState(), archiveTaskInstanceId);
  if (!instance) {
    return;
  }
  const instancesConfigs = await ArchiveService.getArchiveTaskInstancesOverdraft([instance]);
  const instancesOverdraftPercents: {
    archiveTaskInstanceId: string;
    overdraftPercent: number;
  }[] = [];
  instancesConfigs.forEach(({ archiveTaskInstanceId, overdraft }) => {
    if (!overdraft) {
      return;
    }
    instancesOverdraftPercents.push({
      archiveTaskInstanceId,
      overdraftPercent: overdraft.overdraftPercent,
    });
  });
  dispatch(getArchiveTaskInstancesOverdraftAction.success(instancesOverdraftPercents));
  dispatch(closeEditArchiveTaskInstanceOverdraftAction());
};

export const getArchiveInputFormatListActions = createAsyncAction(
  '@archive/GET_INPUT_FORMAT_LIST_REQ',
  '@archive/GET_INPUT_FORMAT_LIST_SUCC',
  '@archive/GET_INPUT_FORMAT_LIST_FAIL',
)<void, ArchiveInputFormatListEnum[], string>();

export const getArchiveInputFormatList = () => async (dispatch, getState) => {
  dispatch(getArchiveInputFormatListActions.request());
  await FlowService.getInputFormatList(
    (inputFormatList: ArchiveInputFormatListEnum[]) => {
      dispatch(getArchiveInputFormatListActions.success(inputFormatList));
    },
    (msg) => {
      dispatch(getArchiveInputFormatListActions.failure(msg));
    },
  );
};

export const getArchiveSchemaNamesActions = createAsyncAction(
  '@archive/GET_SCHEMA_NAMES_REQ',
  '@archive/GET_SCHEMA_NAMES_SUCC',
  '@archive/GET_SCHEMA_NAMES_FAIL',
)<void, string[], string>();

export const getArchiveSchemaNames = () => async (dispatch, getState) => {
  dispatch(getArchiveSchemaNamesActions.request());
  await FlowService.getSchemaNames(
    (schemaNames: string[]) => {
      dispatch(getArchiveSchemaNamesActions.success(schemaNames));
    },
    (msg) => {
      dispatch(getArchiveSchemaNamesActions.failure(msg));
    },
  );
};

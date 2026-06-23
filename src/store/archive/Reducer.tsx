import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ArchiveUtils } from '../../utils/ArchiveUtils';
import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { ShortArchiveTaskWithRole } from './Actions';
import {
  ArchivalQuota,
  ArchivalStatus,
  ArchiveInputFormatListEnum,
  ArchiveTask,
  ArchiveTaskDelete,
  ArchiveTaskInstance,
  ArchiveTaskInstanceConfigCurrent,
  ArchiveTaskInstanceStatus,
  ArchiveTaskRequestStatus,
  ShortArchiveTask,
  ShortArchiveTaskWithId,
} from './Types';

export interface ArchiveStoreState {
  currentArchiveTask?: ArchiveTask;
  archiveTaskConfig: Map<string, ArchiveTask | null>;
  archives: ShortArchiveTask[];
  archivesInProgress: Set<string>;
  archivesWithRoles: ShortArchiveTaskWithRole[];
  archivesWithIds: ShortArchiveTaskWithId[];
  archiveTaskInstances: Map<string, ArchiveTaskInstance>;
  archiveTaskInstanceStatus: Map<string, ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus>;
  /** todo удалить **/
  archiveTaskInstanceStatusFetch: Set<string>;
  archiveTaskInstanceStatusUpdate: Set<string>;
  archiveTaskInstanceConfigCurrent: Map<string, ArchiveTaskInstanceConfigCurrent | null>;
  statuses: any;
  isStatusesLoading: boolean;
  isLoadingStatusesPagination: boolean;
  isLoading: boolean;
  isTaskLoading: boolean;
  isTaskWithRolesLoading: boolean;
  isTaskWithIdsLoading: boolean;
  isQuotaLoading: boolean;
  filter: FilterMenuItem[] | undefined;
  quotas: Map<string, ArchivalQuota>;
  isQuotasLoading: boolean;
  filterValues: any;
  isAllLabelsLoading: boolean;
  labels: string[];
  isLabelLoading: boolean;
  archiveTaskDelete: ArchiveTaskDelete | null;
  archiveTaskInstanceDelete: Map<string, ArchiveTaskDelete | null | { message: string; details?: string }>;
  isCreatingInstance: boolean;
  isResetInstanceOverdraftsFetch: boolean;
  resetArchiveTaskInstanceOverdraftRequest: Map<string, ArchiveTaskRequestStatus | { message: string; details?: string } | null>;
  /** todo удалить **/
  archiveTaskInstanceOverdraftPercent: Map<string, number | null>;
  editArchiveTaskInstanceOverdraftId: string | null;
  inputFormatList: ArchiveInputFormatListEnum[];
  schemaNames: string[];
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
  archiveTotalCount: number;
}

export const initialState: ArchiveStoreState = {
  currentArchiveTask: undefined,
  archives: [],
  archivesInProgress: new Set<string>(),
  archivesWithRoles: [],
  archivesWithIds: [],
  archiveTaskConfig: new Map<string, ArchiveTask>(),
  archiveTaskInstances: new Map<string, ArchiveTaskInstance>(),
  archiveTaskInstanceStatus: new Map<string, ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus.failed>(),
  archiveTaskInstanceStatusFetch: new Set<string>(),
  archiveTaskInstanceStatusUpdate: new Set<string>(),
  archiveTaskInstanceConfigCurrent: new Map<string, ArchiveTaskInstanceConfigCurrent | null>(),
  statuses: {},
  isStatusesLoading: true,
  isLoadingStatusesPagination: false,
  filter: undefined,
  isTaskLoading: true,
  isTaskWithRolesLoading: true,
  isLoading: true,
  isTaskWithIdsLoading: true,
  quotas: new Map<string, ArchivalQuota>(),
  isQuotasLoading: true,
  isQuotaLoading: false,
  isAllLabelsLoading: true,
  allLabels: [],
  isLabelLoading: true,
  labels: [],
  isRefetch: false,
  archiveTaskDelete: null,
  archiveTaskInstanceDelete: new Map<string, ArchiveTaskDelete | null>(),
  isCreatingInstance: false,
  isResetInstanceOverdraftsFetch: false,
  resetArchiveTaskInstanceOverdraftRequest: new Map<string, ArchiveTaskRequestStatus>(),
  archiveTaskInstanceOverdraftPercent: new Map<string, number | null>(),
  editArchiveTaskInstanceOverdraftId: null,
  inputFormatList: [],
  schemaNames: [],
  version: [],
  isVersionLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<ArchiveStoreState> = (state: ArchiveStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.reqStart): {
      return { ...state, isLoading: true };
    }

    case getType(actions.replaceCurrentArchiveTaskAction): {
      return {
        ...state,
        currentArchiveTask: action.payload,
        isLoading: false,
      };
    }

    case getType(actions.getArchiveTaskInfoAction.request): {
      return {
        ...state,
        isTaskLoading: true,
      };
    }

    case getType(actions.getArchiveTaskInfoAction.failure):
    case getType(actions.getArchiveTaskInfoAction.success):
      return {
        ...state,
        currentArchiveTask: action.payload,
        isTaskLoading: false,
      };

    case getType(actions.fetchArchiveTaskConfigAction.request): {
      const archiveTaskConfig = new Map(state.archiveTaskConfig);
      archiveTaskConfig.set(action.payload, null);
      return {
        ...state,
        archiveTaskConfig,
      };
    }

    case getType(actions.fetchArchiveTaskConfigAction.success): {
      const archiveTaskConfig = new Map(state.archiveTaskConfig);
      archiveTaskConfig.set(action.payload.archiveTaskId, action.payload.archiveTaskConfig);
      return {
        ...state,
        archiveTaskConfig,
      };
    }

    case getType(actions.fetchArchiveTaskConfigAction.failure): {
      const archiveTaskConfig = new Map(state.archiveTaskConfig);
      archiveTaskConfig.delete(action.payload);
      return {
        ...state,
        archiveTaskConfig,
      };
    }

    case getType(actions.listArchiveTaskWithRolesAction.request): {
      return {
        ...state,
        isTaskWithRolesLoading: true,
        archiveTaskInstances: new Map(),
        // удалено, чтобы не происходило обнуление статусов, при перезапросе архивов (кэшируем статусы)
        // archiveTaskInstanceStatus: new Map(),
      };
    }

    case getType(actions.listArchiveTaskWithRolesAction.success): {
      const { archiveTaskInstances } = state;
      const archives = action.payload.map((archiveTask) => ({
        ...archiveTask,
        instancesIds: archiveTask.instances.map((instance) => {
          const archiveTaskInstanceId = ArchiveUtils.getArchiveTaskInstanceId(
            archiveTask.project,
            archiveTask.name,
            instance.zoneId,
            instance.id.toString(10),
          );
          archiveTaskInstances.set(archiveTaskInstanceId, {
            ...instance,
            project: archiveTask.project,
            name: archiveTask.name,
            archiveTaskInstanceId,
            overdraftPercent: typeof instance.overdraftPercent === 'number' ? instance.overdraftPercent : 0,
            canView: archiveTask.indexActions.includes('VIEW'),
            canEdit: archiveTask.indexActions.includes('EDIT'),
          });
          return archiveTaskInstanceId;
        }),
      }));
      return {
        ...state,
        isTaskWithRolesLoading: false,
        archiveTaskInstances: new Map(archiveTaskInstances),
        archivesWithRoles: archives.sort(function (a, b) {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a должно быть равным b
          return 0;
        }),
      };
    }

    case getType(actions.listArchiveTasksAction.failure): {
      return { ...state, isTaskWithRolesLoading: false };
    }

    case getType(actions.listArchiveTasksAction.request): {
      return { ...state, isTaskWithRolesLoading: true };
    }

    case getType(actions.listArchiveTasksAction.success): {
      return {
        ...state,
        archives: action.payload.sort(function (a, b) {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a должно быть равным b
          return 0;
        }),
        isTaskWithRolesLoading: false,
      };
    }

    case getType(actions.listArchiveTasksWithIdsAction.failure): {
      return { ...state, isTaskWithIdsLoading: false };
    }

    case getType(actions.listArchiveTasksWithIdsAction.request): {
      return { ...state, isTaskWithIdsLoading: true };
    }

    case getType(actions.listArchiveTasksWithIdsAction.success): {
      return {
        ...state,
        archivesWithIds: action.payload.sort(function (a, b) {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a должно быть равным b
          return 0;
        }),
        isTaskWithIdsLoading: false,
      };
    }

    case getType(actions.listArchiveTaskWithRolesAction.failure): {
      return { ...state, isTaskWithRolesLoading: false };
    }

    case getType(actions.fetchArchiveQuotasAction.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.fetchArchiveQuotasAction.success): {
      const quotaMap = {};
      action.payload.map((payload) => {
        quotaMap[payload.project] = {
          currentSizeBytes: payload.archiveProjectQuotaState.occupiedSizeBytes,
          currentDataRateBytesPerSec: payload.archiveProjectQuotaState.occupiedDataRateBytesPerSec,
          maxSizeBytes: payload.archiveProjectQuotaState.totalSizeBytes,
          maxDataRateBytesPerSec: payload.archiveProjectQuotaState.totalDataRateBytesPerSec,
        };
      });
      return { ...state, quotas: quotaMap, isQuotasLoading: false };
    }

    case getType(actions.fetchArchiveQuotasAction.failure): {
      return { ...state, isQuotasLoading: false };
    }

    case getType(actions.fetchArchiveQuotaAction.request): {
      return { ...state, isQuotaLoading: true };
    }

    case getType(actions.fetchArchiveQuotaAction.success): {
      const quotaMap = state.quotas;
      quotaMap[action.payload.projectShortName] = action.payload.quota;
      return { ...state, quotas: quotaMap, isQuotaLoading: false };
    }

    case getType(actions.fetchArchiveQuotaAction.failure): {
      return { ...state, isQuotaLoading: false };
    }

    case getType(actions.updateQuotaForProjectAction.request): {
      return { ...state, isQuotaLoading: true };
    }

    case getType(actions.updateQuotaForProjectAction.failure): {
      return { ...state, isQuotaLoading: false };
    }

    case getType(actions.updateQuotaForProjectAction.success): {
      const quotaMap = state.quotas;
      const newQuota = {
        maxSizeBytes: action.payload.volume,
        maxDataRateBytesPerSec: action.payload.rate,
      };
      quotaMap[action.payload.projectShortName] = newQuota;
      return { ...state, quotas: quotaMap, isQuotaLoading: false };
    }

    case getType(actions.getArchiveFilterValuesAction.request): {
      return { ...state, isFiltersLoading: true };
    }

    case getType(actions.getArchiveFilterValuesAction.failure): {
      return { ...state, isFiltersLoading: false };
    }

    case getType(actions.getArchiveFilterValuesAction.success): {
      return { ...state, filterValues: action.payload, isFiltersLoading: false };
    }

    case getType(actions.getArchivesTotalCountAction.success): {
      return { ...state, archiveTotalCount: action.payload };
    }

    case getType(actions.fetchLabelsActions.failure): {
      return { ...state, isLabelLoading: false };
    }

    case getType(actions.fetchLabelsActions.request): {
      return { ...state, isLabelLoading: true };
    }

    case getType(actions.fetchLabelsActions.success): {
      return { ...state, labels: action.payload, isLabelLoading: false };
    }

    // suspend index
    case getType(actions.archiveSuspendAction.request): {
      state.archivesInProgress.add(action.payload);
      return {
        ...state,
        archivesInProgress: new Set(state.archivesInProgress),
      };
    }

    case getType(actions.archiveSuspendAction.success): {
      state.archivesInProgress.delete(action.payload);
      return {
        ...state,
        archivesInProgress: new Set(state.archivesInProgress),
      };
    }

    case getType(actions.archiveSuspendAction.failure): {
      state.archivesInProgress.delete(action.payload);
      return {
        ...state,
        archivesInProgress: new Set(state.archivesInProgress),
      };
    }

    case getType(actions.archiveMetaAction.success): {
      const statusMap = state.statuses;
      statusMap[action.payload.projectShortName + action.payload.name] = action.payload.meta;
      return {
        ...state,
        statuses: statusMap,
        isLoading: false,
      };
    }

    case getType(actions.selectNewArchiveTaskAction):
      return {
        ...state,
        currentPipeline: ArchiveUtils.getEmptyArchive(),
        isLoading: false,
      };

    case getType(actions.setArchiveFilterAction): {
      return {
        ...state,
        filter: action.payload.filter || [],
        isRefetch: action.payload.isRefetch,
      };
    }

    case getType(actions.fetchArchiveTasksInstanceStatusesActions.request): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.forEach((instanceId) => archiveTaskInstanceStatus.set(instanceId, ArchiveTaskRequestStatus.inProcess));
      return {
        ...state,
        isStatusesLoading: true,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTasksInstanceStatusesActions.success): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.map((instanceStatus) => {
        archiveTaskInstanceStatus.set(instanceStatus.archiveTaskInstanceId, instanceStatus);
      });
      return {
        ...state,
        isStatusesLoading: false,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTasksInstanceStatusesActions.failure): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.map((instanceStatus) => {
        archiveTaskInstanceStatus.set(instanceStatus.archiveTaskInstanceId, instanceStatus);
      });
      return {
        ...state,
        isStatusesLoading: false,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTasksInstanceStatusesActionsPagination.request): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.forEach((instanceId) => archiveTaskInstanceStatus.set(instanceId, ArchiveTaskRequestStatus.inProcess));
      return {
        ...state,
        isLoadingStatusesPagination: true,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTasksInstanceStatusesActionsPagination.success): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.map((instanceStatus) => {
        archiveTaskInstanceStatus.set(instanceStatus.archiveTaskInstanceId, instanceStatus);
      });
      return {
        ...state,
        isLoadingStatusesPagination: false,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTasksInstanceStatusesActionsPagination.failure): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.map((instanceStatus) => {
        archiveTaskInstanceStatus.set(instanceStatus.archiveTaskInstanceId, instanceStatus);
      });
      return {
        ...state,
        isLoadingStatusesPagination: false,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTaskInstanceStatusesActions.request): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.forEach((instanceId) => archiveTaskInstanceStatus.set(instanceId, ArchiveTaskRequestStatus.inProcess));
      return {
        ...state,
        isStatusesLoading: true,
        archiveTaskInstanceStatus,
      };
    }

    case getType(actions.fetchArchiveTaskInstanceStatusesActions.success): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);

      action.payload.forEach((instanceStatus) => {
        archiveTaskInstanceStatus.set(instanceStatus.archiveTaskInstanceId as string, instanceStatus);
      });

      const updatedArchivesWithRoles = state.archivesWithRoles.map((archive) => {
        const matchingPayload = action.payload.find(
          (item) => item.archiveTaskProject === archive.project && item.archiveTaskProjectTaskName === archive.name,
        );
        if (matchingPayload) {
          const { storage, indexing } = matchingPayload;
          const newInstances = archive.instances.map((it) => {
            return it.zoneId === matchingPayload.zoneId ? { ...it, status: { storage, indexing } } : it;
          });
          return {
            ...archive,
            instances: newInstances,
          };
        }
        return archive;
      });
      return {
        ...state,
        isStatusesLoading: false,
        archiveTaskInstanceStatus,
        archivesWithRoles: updatedArchivesWithRoles,
      };
    }

    case getType(actions.fetchArchiveTaskInstanceStatusesActions.failure): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      action.payload.map((instanceStatus) => {
        archiveTaskInstanceStatus.set(instanceStatus.archiveTaskInstanceId as string, instanceStatus);
      });
      const updatedArchivesWithRoles = state.archivesWithRoles.map((archive) => {
        const matchingPayload = action.payload.find(
          (item) => item.archiveTaskProject === archive.project && item.archiveTaskProjectTaskName === archive.name,
        );
        if (matchingPayload) {
          const { storage, indexing } = matchingPayload;
          const newInstances = archive.instances.map((it) => {
            return it.zoneId === matchingPayload.zoneId ? { ...it, status: { storage, indexing } } : it;
          });
          return {
            ...archive,
            instances: newInstances,
          };
        }
        return archive;
      });
      return {
        ...state,
        isStatusesLoading: false,
        archiveTaskInstanceStatus,
        archivesWithRoles: updatedArchivesWithRoles,
      };
    }

    case getType(actions.deleteArchiveTaskAction.request):
      return {
        ...state,
        archiveTaskDelete: ArchiveTaskDelete.inProcess,
      };

    case getType(actions.deleteArchiveTaskInstancesAction.request): {
      const archiveTaskInstanceDelete = new Map(state.archiveTaskInstanceDelete);
      action.payload.forEach((archiveTaskInstancesId) => {
        archiveTaskInstanceDelete.set(archiveTaskInstancesId, ArchiveTaskDelete.inProcess);
      });
      return {
        ...state,
        archiveTaskInstanceDelete,
      };
    }

    case getType(actions.deleteArchiveTaskInstancesAction.success): {
      const archiveTaskInstanceStatus = new Map(state.archiveTaskInstanceStatus);
      const archiveTaskInstanceDelete = new Map(state.archiveTaskInstanceDelete);
      action.payload.forEach((archiveTaskInstancesId) => {
        archiveTaskInstanceStatus.delete(archiveTaskInstancesId);
        archiveTaskInstanceDelete.set(archiveTaskInstancesId, ArchiveTaskDelete.success);
      });
      return {
        ...state,
        archiveTaskInstanceDelete,
        archiveTaskInstanceStatus,
      };
    }
    case getType(actions.deleteArchiveTaskAction.success):
      return {
        ...state,
        archiveTaskDelete: ArchiveTaskDelete.success,
      };
    case getType(actions.deleteArchiveTaskAction.failure):
      return {
        ...state,
        archiveTaskDelete: ArchiveTaskDelete.fail,
      };
    case getType(actions.deleteArchiveTaskInstancesAction.failure): {
      const archiveTaskInstanceDelete = new Map(state.archiveTaskInstanceDelete);
      action.payload.forEach(({ archiveTaskInstanceId, errorMsg }) => {
        archiveTaskInstanceDelete.set(archiveTaskInstanceId, errorMsg);
      });
      return {
        ...state,
        archiveTaskInstanceDelete,
      };
    }
    case getType(actions.clearDeleteArchiveTaskAction): {
      return {
        ...state,
        archiveTaskDelete: null,
      };
    }
    case getType(actions.clearDeleteArchiveTaskInstancesAction): {
      return {
        ...state,
        archiveTaskInstanceDelete: new Map(),
      };
    }

    case getType(actions.updateArchiveTaskInstanceAction.request): {
      const archiveTaskInstanceStatusUpdate = new Set(state.archiveTaskInstanceStatusUpdate);
      archiveTaskInstanceStatusUpdate.add(action.payload);
      return {
        ...state,
        archiveTaskInstanceStatusUpdate,
      };
    }

    case getType(actions.updateArchiveTaskInstanceAction.success):
    case getType(actions.updateArchiveTaskInstanceAction.failure):
      const archiveTaskInstanceStatusUpdate = new Set(state.archiveTaskInstanceStatusUpdate);
      archiveTaskInstanceStatusUpdate.delete(action.payload);
      return {
        ...state,
        archiveTaskInstanceStatusUpdate,
      };

    case getType(actions.createArchiveTaskInstanceAction.request):
      return {
        ...state,
        isCreatingInstance: true,
      };

    case getType(actions.createArchiveTaskInstanceAction.success):
    case getType(actions.createArchiveTaskInstanceAction.failure):
      return {
        ...state,
        isCreatingInstance: false,
      };

    case getType(actions.resetInstanceOverdraftsAction.request):
      const resetArchiveTaskInstanceOverdraftRequest = new Map(state.resetArchiveTaskInstanceOverdraftRequest);
      action.payload.map((archiveTaskInstanceId) => {
        resetArchiveTaskInstanceOverdraftRequest.set(archiveTaskInstanceId, ArchiveTaskRequestStatus.inProcess);
      });
      return {
        ...state,
        // isResetInstanceOverdraftsFetch: true,
        resetArchiveTaskInstanceOverdraftRequest,
      };
    case getType(actions.resetInstanceOverdraftsAction.success): {
      const resetArchiveTaskInstanceOverdraftRequest = new Map(state.resetArchiveTaskInstanceOverdraftRequest);
      action.payload.map((archiveTaskInstanceId) => {
        resetArchiveTaskInstanceOverdraftRequest.set(archiveTaskInstanceId, ArchiveTaskRequestStatus.success);
      });
      return {
        ...state,
        // isResetInstanceOverdraftsFetch: false,
        resetArchiveTaskInstanceOverdraftRequest,
      };
    }
    case getType(actions.resetInstanceOverdraftsAction.failure): {
      const resetArchiveTaskInstanceOverdraftRequest = new Map(state.resetArchiveTaskInstanceOverdraftRequest);
      action.payload.map(({ archiveTaskInstanceId, error }) => {
        resetArchiveTaskInstanceOverdraftRequest.set(archiveTaskInstanceId, error);
      });
      return {
        ...state,
        // isResetInstanceOverdraftsFetch: false,
        resetArchiveTaskInstanceOverdraftRequest,
      };
    }
    case getType(actions.clearResetInstanceOverdraftsAction): {
      return {
        ...state,
        isResetInstanceOverdraftsFetch: false,
        resetArchiveTaskInstanceOverdraftRequest: new Map(),
      };
    }

    case getType(actions.getArchiveTaskInstanceConfigAction.request): {
      const { archiveTaskInstanceConfigCurrent } = state;
      archiveTaskInstanceConfigCurrent.set(action.payload, null);
      return {
        ...state,
        archiveTaskInstanceConfigCurrent: new Map(archiveTaskInstanceConfigCurrent),
      };
    }
    case getType(actions.getArchiveTaskInstanceConfigAction.success): {
      const { archiveTaskInstanceConfigCurrent } = state;
      archiveTaskInstanceConfigCurrent.set(action.payload[0], action.payload[1]);
      return {
        ...state,
        archiveTaskInstanceConfigCurrent: new Map(archiveTaskInstanceConfigCurrent),
      };
    }

    case getType(actions.getArchiveTaskInstancesConfigAction.request): {
      const { archiveTaskInstanceConfigCurrent } = state;
      action.payload.forEach((instanceId) => archiveTaskInstanceConfigCurrent.set(instanceId, null));
      return {
        ...state,
        archiveTaskInstanceConfigCurrent: new Map(archiveTaskInstanceConfigCurrent),
      };
    }
    case getType(actions.getArchiveTaskInstancesConfigAction.success): {
      const { archiveTaskInstanceConfigCurrent } = state;
      action.payload.forEach(({ instanceId, config }) => archiveTaskInstanceConfigCurrent.set(instanceId, config));
      return {
        ...state,
        archiveTaskInstanceConfigCurrent: new Map(archiveTaskInstanceConfigCurrent),
      };
    }

    case getType(actions.getArchiveTaskInstanceOverdraftAction.request): {
      const { archiveTaskInstanceOverdraftPercent } = state;
      archiveTaskInstanceOverdraftPercent.set(action.payload, null);
      return {
        ...state,
        archiveTaskInstanceOverdraftPercent: new Map(archiveTaskInstanceOverdraftPercent),
      };
    }
    case getType(actions.getArchiveTaskInstanceOverdraftAction.success): {
      const { archiveTaskInstanceOverdraftPercent } = state;
      archiveTaskInstanceOverdraftPercent.set(action.payload.instanceId, action.payload.overdraftPercent);
      return {
        ...state,
        archiveTaskInstanceOverdraftPercent: new Map(archiveTaskInstanceOverdraftPercent),
      };
    }

    case getType(actions.getArchiveTaskInstancesOverdraftAction.success): {
      const archiveTaskInstances = new Map(state.archiveTaskInstances);
      action.payload.forEach(({ archiveTaskInstanceId, overdraftPercent }) => {
        const instance = archiveTaskInstances.get(archiveTaskInstanceId);
        if (!instance) {
          return;
        }
        archiveTaskInstances.set(archiveTaskInstanceId, {
          ...instance,
          overdraftPercent,
        });
      });
      return {
        ...state,
        archiveTaskInstances,
      };
    }

    case getType(actions.editArchiveTaskInstanceOverdraftAction): {
      return {
        ...state,
        editArchiveTaskInstanceOverdraftId: action.payload,
      };
    }

    case getType(actions.closeEditArchiveTaskInstanceOverdraftAction): {
      return {
        ...state,
        editArchiveTaskInstanceOverdraftId: null,
      };
    }

    case getType(actions.getArchiveInputFormatListActions.success): {
      return {
        ...state,
        inputFormatList: action.payload,
      };
    }
    case getType(actions.getArchiveInputFormatListActions.failure): {
      return {
        ...state,
        inputFormatList: [],
      };
    }

    case getType(actions.getArchiveSchemaNamesActions.success): {
      return {
        ...state,
        schemaNames: action.payload,
      };
    }

    case getType(actions.getArchiveSchemaNamesActions.failure): {
      return {
        ...state,
        schemaNames: [],
      };
    }

    case getType(actions.getVersionAction.request):
      return { ...state, isVersionLoading: true };

    case getType(actions.getVersionAction.success):
      return {
        ...state,
        version: action.payload,
        isVersionLoading: false,
      };

    case getType(actions.getVersionAction.failure):
      return {
        ...state,
        version: undefined,
        isVersionLoading: false,
      };

    default:
      return state;
  }
};

export function getQuotas(state: ApplicationState): any {
  return state.archive.quotas;
}

export function getQuotaByProjectName(state: ApplicationState, projectShortName: string) {
  return (
    state.archive.quotas[projectShortName] || {
      project: '',
      currentSizeBytes: 0,
      maxSizeBytes: 0,
      currentDataRateBytesPerSec: 0,
      maxDataRateBytesPerSec: 0,
    }
  );
}

export function isLoading(state: ApplicationState): any {
  return state.archive.isLoading;
}

export function isTaskLoading(state: ApplicationState): any {
  return state.archive.isTaskLoading;
}

export function isTaskWithRolesLoading(state: ApplicationState): any {
  return state.archive.isTaskWithRolesLoading;
}

export const isTaskWithRolesRefetching = (state: ApplicationState) => {
  if (!state.archive.isTaskWithRolesLoading) {
    return false;
  }
  // если в стейте уже есть конфигурации, но загрузка конфигураций в процессе - значит, мы их обновляем.
  return state.archive.archivesWithRoles.length > 0;
};

export function isTaskWithIdsLoading(state: ApplicationState): any {
  return state.archive.isTaskWithIdsLoading;
}

export function getArchivesWithIds(state: ApplicationState): ShortArchiveTaskWithId[] {
  return state.archive.archivesWithIds;
}

export function isQuotasLoading(state: ApplicationState): boolean {
  return state.archive.isQuotasLoading;
}

export function isQuotaLoading(state: ApplicationState): boolean {
  return state.archive.isQuotaLoading;
}

export function getCurrentArchiveTask(state: ApplicationState): ArchiveTask | undefined {
  return state.archive.currentArchiveTask;
}

export function getArchivesInProgress(state: ApplicationState): Set<string> {
  return state.archive.archivesInProgress;
}

export function getArchivesWithRoles(state: ApplicationState): ShortArchiveTaskWithRole[] {
  return state.archive.archivesWithRoles;
}

export function getArchives(state: ApplicationState): ShortArchiveTask[] {
  return state.archive.archives;
}

export function getArchiveTaskWithRole(state: ApplicationState, name: string, project: string): ShortArchiveTaskWithRole | undefined {
  return getArchivesWithRoles(state).find((archiveTask) => archiveTask.name === name && archiveTask.project === project);
}

export function isStatusesLoading(state: ApplicationState) {
  return state.archive.isStatusesLoading;
}

export function isLoadingStatusesPagination(state: ApplicationState) {
  return state.archive.isLoadingStatusesPagination;
}

export function getStatuses(state: ApplicationState) {
  return state.archive.statuses;
}

export function getArchiveTaskStatus(state: ApplicationState, archiveTaskProject: string, archiveTaskName: string) {
  return getStatuses(state)[archiveTaskProject + archiveTaskName];
}

export function getArchiveFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.archive.filter;
}

export function getFilterValues(state: ApplicationState): string[] {
  return state.archive.filterValues;
}

export function isLabelsLoading(state: ApplicationState): boolean {
  return state.archive.isLabelLoading;
}

export function getLabels(state: ApplicationState): string[] {
  return state.archive.labels;
}

export function isRefetch(state: ApplicationState): boolean {
  return state.archive?.isRefetch;
}

export function getArchiveTaskInstance(state: ApplicationState, archiveTaskInstanceId: string) {
  return state.archive.archiveTaskInstances.get(archiveTaskInstanceId);
}

export function getArchiveTaskInstances(state: ApplicationState): ArchiveTaskInstance[] {
  return [...state.archive.archiveTaskInstances.values()];
}

export function getArchiveTaskInstanceStatusById(state: ApplicationState, archiveTaskInstanceId: string) {
  return state.archive.archiveTaskInstanceStatus.get(archiveTaskInstanceId);
}

export function getArchiveTaskInstanceStatus(state: ApplicationState) {
  return state.archive.archiveTaskInstanceStatus;
}

export function getArchiveTaskDelete(state: ApplicationState) {
  return state.archive.archiveTaskDelete;
}

export const getArchiveTaskInstancesDeleteList = (state: ApplicationState) => [...state.archive.archiveTaskInstanceDelete.values()];

export const getArchiveTaskInstancesDeletePairs = (state: ApplicationState) => [...state.archive.archiveTaskInstanceDelete.entries()];

export const getArchiveTaskInstancesDelete = (state: ApplicationState, archiveTaskInstanceId: string) =>
  state.archive.archiveTaskInstanceDelete.get(archiveTaskInstanceId);

export const getArchiveTaskInstanceStatusFetch = (state: ApplicationState) => state.archive.archiveTaskInstanceStatusFetch;

export const getArchiveTaskInstanceStatusUpdate = (state: ApplicationState) => state.archive.archiveTaskInstanceStatusUpdate;

export const getArchiveTaskInstanceIsCreating = (state: ApplicationState) => state.archive.isCreatingInstance;

export const getIsResetInstanceOverdraftsFetch = (state: ApplicationState) => state.archive.isResetInstanceOverdraftsFetch;

export const getArchiveTaskInstanceConfigCurrent = (state: ApplicationState, project: string, name: string, zoneId: string) =>
  state.archive.archiveTaskInstanceConfigCurrent.get(ArchiveUtils.getArchiveTaskInstanceStatusId(project, name, zoneId));

export const getArchiveTaskInstanceOverdraftPercent = (
  state: ApplicationState,
  project: string,
  name: string,
  zoneId: string,
): number | null | undefined =>
  state.archive.archiveTaskInstanceOverdraftPercent.get(ArchiveUtils.getArchiveTaskInstanceStatusId(project, name, zoneId));

export const getArchiveTaskConfig = (state: ApplicationState, archiveTaskId: string) => state.archive.archiveTaskConfig.get(archiveTaskId);

export const getResetArchiveTaskInstanceOverdraftRequest = (state: ApplicationState) => state.archive.resetArchiveTaskInstanceOverdraftRequest;

export const getResetArchiveTaskInstanceOverdraftResult = (state: ApplicationState, archiveTaskInstanceId: string) =>
  state.archive.resetArchiveTaskInstanceOverdraftRequest.get(archiveTaskInstanceId);

export const getResetArchiveTaskInstanceOverdraftPairs = (state: ApplicationState) => [
  ...state.archive.resetArchiveTaskInstanceOverdraftRequest.entries(),
];

export const getEditArchiveTaskInstanceOverdraftId = (state: ApplicationState) => state.archive.editArchiveTaskInstanceOverdraftId;

export const getArchiveInputFormatList = (state: ApplicationState) => state.archive.inputFormatList;

export const getArchiveSchemaNames = (state: ApplicationState) => state.archive.schemaNames;

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.archive.version;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.role.isVersionLoading;
}

export function getArchiveTotalCount(state: ApplicationState): number {
  return state.archive.archiveTotalCount;
}

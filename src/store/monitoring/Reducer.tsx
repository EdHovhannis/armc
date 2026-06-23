import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import TaskProvider from '../../containers/monitoring/TaskProvider';
import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import {
  DruidDatasource,
  DruidSupervisorInfo,
  DruidSupervisor,
  GenericSupervisorInfo,
  MonitoringQuota,
  GlobalConfigs,
  SupervisorDruidConfigurationInfo,
  DruidConfigurationInfo,
  GlobalConfigVersion,
} from './Types';

export interface MonitoringStoreState {
  currentTask?: DruidSupervisor;
  currentGenericTask: GenericSupervisorInfo | undefined;
  supervisors: Array<DruidSupervisorInfo>;
  datasources: Array<DruidDatasource>;
  globalConfigs?: GlobalConfigs;
  isGlobalConfigLoading: boolean;
  globalConfigVersion: Map<string, string>;
  isGlobalConfigVersionLoading: boolean;
  quotas: any;
  isRefetch: boolean;
  labels: string[];
  allLabels: string[];
  isAllLabelsLoading: boolean;
  isLabelsLoading: boolean;
  filter: FilterMenuItem[] | undefined;
  isQuotasLoading: boolean;
  supervisorsIsLoading: boolean;
  datasourcesIsLoading: boolean;
  isLoading: boolean;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
  currentDruidIndexConfiguration?: SupervisorDruidConfigurationInfo;
  isDruidConfigurationLoading: boolean;
  expectedSpecForConfiguration?: DruidConfigurationInfo;
  isExpectedSpecForConfigurationLoading: boolean;
  currentSpecForConfiguration?: SupervisorDruidConfigurationInfo;
  isCurrentSpecForConfigurationLoading: boolean;
  globalConfigVersions: string[];
  isGlobalConfigVersionsLoading: boolean;
  currentGlobalConfigZone: string;
}

const initialState: MonitoringStoreState = {
  currentGenericTask: undefined,
  currentTask: undefined,
  isLoading: true,
  isRefetch: false,
  supervisors: [],
  labels: [],
  allLabels: [],
  isAllLabelsLoading: true,
  isLabelsLoading: true,
  filter: undefined,
  supervisorsIsLoading: false,
  datasourcesIsLoading: false,
  datasources: [],
  quotas: {},
  isQuotasLoading: false,
  version: [],
  isVersionLoading: true,
  isGlobalConfigLoading: true,
  globalConfigVersion: new Map<string, string>(),
  isGlobalConfigVersionLoading: true,
  isDruidConfigurationLoading: true,
  isExpectedSpecForConfigurationLoading: true,
  isCurrentSpecForConfigurationLoading: true,
  globalConfigVersions: [],
  isGlobalConfigVersionsLoading: true,
  currentGlobalConfigZone: 'PRIMARY',
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<MonitoringStoreState> = (state: MonitoringStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.actionStarted):
      return { ...state, isLoading: true };

    case getType(actions.replaceCurrentConfigAction): {
      return {
        ...state,
        currentTask: {
          id: -1,
          project_id: -1,
          topicId: -1,
          data: action.payload,
          datasource: action.payload.datasource,
          datasourceFullName: '',
          status: '',
        },
        currentGenericTask: undefined,
      };
    }

    case getType(actions.saveCurrentGlobalConfigZoneAction): {
      return { ...state, currentGlobalConfigZone: action.payload };
    }

    case getType(actions.fetchZoneDatasourcesAction.request): {
      return { ...state, datasourcesIsLoading: true };
    }

    case getType(actions.fetchZoneDatasourcesAction.success): {
      return { ...state, datasources: action.payload, datasourcesIsLoading: false };
    }

    case getType(actions.fetchZoneDatasourcesAction.failure): {
      return { ...state, datasourcesIsLoading: false, datasources: [] };
    }

    case getType(actions.fetchAllSupervisorsAction.request):
      return { ...state, supervisorsIsLoading: true };

    case getType(actions.fetchAllSupervisorsAction.success): {
      return {
        ...state,
        supervisors: action.payload.map((task) => {
          return {
            info: task,
          };
        }),
        supervisorsIsLoading: false,
        isLoading: false,
      };
    }

    case getType(actions.fetchAllSupervisorsAction.failure):
      return { ...state, supervisorsIsLoading: false };

    case getType(actions.fetchSupervisorByIdAction.success): {
      const updatedSupervisors = state.supervisors.map((superv) => {
        if (superv.info.id === action.payload.id) {
          return { info: action.payload };
        }
        return superv;
      });
      return { ...state, supervisors: updatedSupervisors };
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

    case getType(actions.fetchConfigAction.success): {
      return {
        ...state,
        currentTask: action.payload,
        currentGenericTask: state.supervisors.filter((task) => task.info.id === action.payload.id)[0].info,
        isLoading: false,
      };
    }

    case getType(actions.deleteConfigAction.success): {
      return {
        ...state,
        supervisors: state.supervisors.filter((task) => task.info.id !== action.payload),
        isLoading: false,
      };
    }

    case getType(actions.statusUpdatedAction): {
      for (let i = 0; i < state.supervisors.length; i++) {
        if (state.supervisors[i].info.id === action.payload[0]) {
          state.supervisors[i].info.instances.map((instance) => {
            if (instance.zoneId === action.payload[1]) {
              instance.status = action.payload[2];
            }
          });
          break;
        }
      }
      return { ...state, supervisors: [...state.supervisors] };
    }

    case getType(actions.deleteInstanceAction.success): {
      // let copySupervisors = state.supervisors;
      const copyInstances = state.supervisors
        .filter((superv) => superv.info.id === action.payload[0])[0]
        .info.instances.filter((inst) => inst.zoneId != action.payload[1]);
      for (let i = 0; i < state.supervisors.length; i++) {
        if (state.supervisors[i].info.id === action.payload[0]) {
          state.supervisors[i].info.instances = copyInstances;
          break;
        }
      }
      return { ...state, supervisors: [...state.supervisors] };
    }

    case getType(actions.fetchQuotasActions.request):
      return { ...state, isQuotasLoading: true };

    case getType(actions.fetchQuotasActions.failure):
      return { ...state, isQuotasLoading: false };

    case getType(actions.fetchQuotasActions.success): {
      const quotaMap = {};
      action.payload.forEach((quota: MonitoringQuota) => {
        quotaMap[quota.projectId] = quota;
      });
      return { ...state, quotas: quotaMap, isQuotasLoading: false };
    }

    case getType(actions.selectNewTask):
      return { ...state, currentTask: TaskProvider.getDruidTask(), isLoading: false };

    case getType(actions.setMonitoringFilterAction):
      return { ...state, filter: action.payload.filter, isRefetch: action.payload.isRefetch };

    case getType(actions.fetchLabelsActions.failure): {
      return { ...state, isLabelsLoading: false };
    }

    case getType(actions.fetchLabelsActions.request): {
      return { ...state, isLabelsLoading: true };
    }

    case getType(actions.fetchLabelsActions.success): {
      return { ...state, labels: action.payload, isLabelsLoading: false };
    }

    case getType(actions.fetchAllLabelsAction.failure): {
      return { ...state, isAllLabelsLoading: false };
    }

    case getType(actions.fetchAllLabelsAction.request): {
      return { ...state, isAllLabelsLoading: true };
    }

    case getType(actions.fetchAllLabelsAction.success): {
      return { ...state, allLabels: action.payload, isAllLabelsLoading: false };
    }

    case getType(actions.getGlobalConfigActions.failure): {
      return { ...state, isGlobalConfigLoading: false };
    }

    case getType(actions.getGlobalConfigActions.request): {
      return { ...state, isGlobalConfigLoading: true };
    }

    case getType(actions.getGlobalConfigActions.success): {
      return { ...state, globalConfigs: action.payload, isGlobalConfigLoading: false };
    }

    case getType(actions.getGlobalConfigByVersionActions.failure): {
      return { ...state, isGlobalConfigLoading: false };
    }

    case getType(actions.getGlobalConfigByVersionActions.request): {
      return { ...state, isGlobalConfigLoading: true };
    }

    case getType(actions.getGlobalConfigByVersionActions.success): {
      return { ...state, globalConfigs: action.payload, isGlobalConfigLoading: false };
    }

    case getType(actions.getCurrentDruidConfigurationForTaskActions.failure): {
      return { ...state, isDruidConfigurationLoading: false };
    }

    case getType(actions.getCurrentDruidConfigurationForTaskActions.request): {
      return { ...state, isDruidConfigurationLoading: true };
    }

    case getType(actions.getCurrentDruidConfigurationForTaskActions.success): {
      return { ...state, currentDruidIndexConfiguration: action.payload, isDruidConfigurationLoading: false };
    }

    case getType(actions.getCurrentDruidConfigurationForTaskFromConfigurationActions.failure): {
      return { ...state, currentSpecForConfiguration: action.payload, isCurrentSpecForConfigurationLoading: false };
    }

    case getType(actions.getCurrentDruidConfigurationForTaskFromConfigurationActions.request): {
      return { ...state, currentSpecForConfiguration: undefined, isCurrentSpecForConfigurationLoading: false };
    }

    case getType(actions.getCurrentDruidConfigurationForTaskFromConfigurationActions.success): {
      return { ...state, currentSpecForConfiguration: action.payload, isCurrentSpecForConfigurationLoading: false };
    }

    case getType(actions.getExpectedDruidConfigurationForTaskActions.failure): {
      return { ...state, isDruidConfigurationLoading: false, currentDruidIndexConfiguration: undefined };
    }

    case getType(actions.getExpectedDruidConfigurationForTaskActions.request): {
      return { ...state, isDruidConfigurationLoading: true, currentDruidIndexConfiguration: undefined };
    }

    case getType(actions.getExpectedDruidConfigurationForTaskActions.success): {
      return { ...state, currentDruidIndexConfiguration: action.payload, isDruidConfigurationLoading: false };
    }

    case getType(actions.getExpectedDruidSpecForConfigurationActions.failure): {
      return { ...state, isExpectedSpecForConfigurationLoading: false };
    }

    case getType(actions.getExpectedDruidSpecForConfigurationActions.request): {
      return { ...state, expectedSpecForConfiguration: undefined, isExpectedSpecForConfigurationLoading: true };
    }

    case getType(actions.getExpectedDruidSpecForConfigurationActions.success): {
      return { ...state, expectedSpecForConfiguration: action.payload, isExpectedSpecForConfigurationLoading: false };
    }

    case getType(actions.getCurrentDruidSpecForConfigurationActions.failure): {
      return { ...state, currentSpecForConfiguration: undefined, isCurrentSpecForConfigurationLoading: false };
    }

    case getType(actions.getCurrentDruidSpecForConfigurationActions.request): {
      return { ...state, isCurrentSpecForConfigurationLoading: true };
    }

    case getType(actions.getCurrentDruidSpecForConfigurationActions.success): {
      return { ...state, currentSpecForConfiguration: action.payload, isCurrentSpecForConfigurationLoading: false };
    }

    case getType(actions.getGlobalConfigsVersionsActions.failure): {
      return { ...state, globalConfigVersions: [], isGlobalConfigVersionsLoading: false };
    }

    case getType(actions.getGlobalConfigsVersionsActions.request): {
      return { ...state, isGlobalConfigVersionsLoading: true };
    }

    case getType(actions.getGlobalConfigsVersionsActions.success): {
      return { ...state, globalConfigVersions: action.payload, isGlobalConfigVersionsLoading: false };
    }

    case getType(actions.getGlobalConfigVersionActions.failure): {
      return { ...state, isGlobalConfigVersionLoading: false };
    }

    case getType(actions.getGlobalConfigVersionActions.request): {
      return { ...state, isGlobalConfigVersionLoading: true };
    }

    case getType(actions.getGlobalConfigVersionActions.success): {
      const globalConfigVersionMap = new Map<string, string>();
      action.payload.map((version: GlobalConfigVersion) => {
        globalConfigVersionMap.set(version.zoneId, version.version);
      });
      return { ...state, globalConfigVersion: globalConfigVersionMap, isGlobalConfigVersionLoading: false };
    }

    default:
      return state;
  }
};

export function getCurrentTask(state: ApplicationState): DruidSupervisor | undefined {
  return state.monitoring.currentTask;
}

export function getAllTasks(state: ApplicationState): Array<DruidSupervisorInfo> {
  return state.monitoring.supervisors || [];
}

export function getGenericCurrentTask(state: ApplicationState): GenericSupervisorInfo | undefined {
  return state.monitoring.currentGenericTask;
}

export function isLoading(state: ApplicationState): boolean {
  return state.monitoring.isLoading;
}

export function getDatasources(state: ApplicationState): Array<DruidDatasource> {
  return state.monitoring.datasources;
}

export function supervisorsIsLoading(state: ApplicationState): boolean {
  return state.monitoring.supervisorsIsLoading;
}

export function datasourcesIsLoading(state: ApplicationState): boolean {
  return state.monitoring.datasourcesIsLoading;
}

export function getQuotas(state: ApplicationState): any {
  return state.monitoring.quotas || {};
}

export function getQuotaForProject(state: ApplicationState, projectId: number): MonitoringQuota {
  return state.monitoring.quotas[projectId] || { projectId: projectId, currentTaskCount: 0, maxTaskCount: 0 };
}

export function isQuotaLoading(state: ApplicationState): boolean {
  return state.monitoring.isQuotasLoading;
}

export function getMonitoringFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.monitoring.filter;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.monitoring.version;
}

export function isLabelsLoading(state: ApplicationState): boolean {
  return state.monitoring.isLabelsLoading;
}

export function getLabels(state: ApplicationState): string[] {
  return state.monitoring.labels;
}

export function isAllLabelsLoading(state: ApplicationState): boolean {
  return state.monitoring.isAllLabelsLoading;
}

export function getAllLabels(state: ApplicationState): string[] {
  return state.monitoring.allLabels;
}

export function isRefetch(state: ApplicationState): boolean {
  return state.monitoring.isRefetch;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.monitoring.isVersionLoading;
}

export function getGlobalConfigs(state: ApplicationState): GlobalConfigs | undefined {
  return state.monitoring.globalConfigs;
}

export function isGlobalConfigLoading(state: ApplicationState): boolean {
  return state.monitoring.isGlobalConfigLoading;
}

export function getGlobalConfigVersion(state: ApplicationState): Map<string, string> {
  return state.monitoring.globalConfigVersion;
}

export function isGlobalConfigVersionLoading(state: ApplicationState): boolean {
  return state.monitoring.isGlobalConfigVersionLoading;
}

export function getIndexTaskConfigurationDruidInfo(state: ApplicationState): SupervisorDruidConfigurationInfo | undefined {
  return state.monitoring.currentDruidIndexConfiguration;
}

export function isDruidConfigurationLoading(state: ApplicationState): boolean {
  return state.monitoring.isDruidConfigurationLoading;
}

export function getExpectedSpecForConfiguration(state: ApplicationState): DruidConfigurationInfo | undefined {
  return state.monitoring.expectedSpecForConfiguration;
}

export function isExpectedSpecForConfigurationLoading(state: ApplicationState): boolean {
  return state.monitoring.isExpectedSpecForConfigurationLoading;
}

export function getCurrentSpecForConfiguration(state: ApplicationState): SupervisorDruidConfigurationInfo | undefined {
  return state.monitoring.currentSpecForConfiguration;
}

export function isCurrentSpecForConfigurationLoading(state: ApplicationState): boolean {
  return state.monitoring.isCurrentSpecForConfigurationLoading;
}

export function getGlobalConfigVersions(state: ApplicationState): string[] {
  return state.monitoring.globalConfigVersions;
}

export function isGlobalConfigVersionsLoading(state: ApplicationState): boolean {
  return state.monitoring.isGlobalConfigVersionsLoading;
}

export function getCurrentGlobalConfigZone(state: ApplicationState): string {
  return state.monitoring.currentGlobalConfigZone;
}

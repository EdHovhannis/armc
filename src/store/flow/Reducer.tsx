import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { FlowDetails, FlowOverview, FlowQuota, FlowServiceConfigs, QuotaUnits } from './Types';

export interface ProcessingStoreState {
  quotas: any;
  overviews: Array<FlowOverview>;
  overview: Map<number, FlowDetails>;
  createInProgress: boolean;
  flowInProgress: Set<number>;
  isQuotasLoading: boolean;
  isOverviewLoading: boolean;
  isFlowLoading: boolean;
  filter: FilterMenuItem[] | undefined;
  timeZones: Array<string>;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
  schemaNames: string[];
  flowServiceConfigs?: FlowServiceConfigs;
  quotaUnits: QuotaUnits;
}

const initialState: ProcessingStoreState = {
  quotas: {},
  overviews: [],
  filter: undefined,
  createInProgress: false,
  flowInProgress: new Set<number>(),
  overview: new Map<number, FlowDetails>(),
  isQuotasLoading: false,
  isOverviewLoading: false,
  isFlowLoading: false,
  timeZones: [],
  version: [],
  isVersionLoading: true,
  schemaNames: [],
  quotaUnits: {
    speed: 'B',
    size: 'MB',
    time: 'секунды',
  },
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<ProcessingStoreState> = (state: ProcessingStoreState = initialState, action: Actions) => {
  switch (action.type) {
    // fetch all
    case getType(actions.fetchOverviewAction.request): {
      return { ...state, isOverviewLoading: true };
    }
    case getType(actions.fetchOverviewAction.success): {
      return {
        ...state,
        isOverviewLoading: false,
        overviews: action.payload.sort(function (a, b) {
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
    case getType(actions.fetchOverviewAction.failure): {
      return { ...state, isOverviewLoading: false };
    }
    case getType(actions.fetchTimeZonesActions.success): {
      return { ...state, timeZones: action.payload };
    }
    // fetch single
    case getType(actions.fetchFlowAction.request): {
      return { ...state, isFlowLoading: true };
    }
    case getType(actions.fetchFlowAction.success): {
      state.overview.set(action.payload.id, action.payload);
      return { ...state, isFlowLoading: false, overview: state.overview };
    }
    case getType(actions.fetchFlowAction.failure): {
      return { ...state, isFlowLoading: false };
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

    // create flow
    case getType(actions.createFlowAction.request): {
      return { ...state, createInProgress: true };
    }

    case getType(actions.createFlowAction.success): {
      state.overview.set(action.payload.id, action.payload);
      return { ...state, overview: state.overview, createInProgress: false };
    }

    case getType(actions.createFlowAction.failure): {
      return { ...state, overview: state.overview, createInProgress: false };
    }

    // delete flow
    case getType(actions.deleteFlowAction.request): {
      state.flowInProgress.add(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.deleteFlowAction.success): {
      state.overview.delete(action.payload);
      state.flowInProgress.delete(action.payload);
      return { ...state, overview: state.overview, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.deleteFlowAction.failure): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    // update flow
    case getType(actions.updateFlowAction.request): {
      state.flowInProgress.add(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.updateFlowAction.success): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.updateFlowAction.failure): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    // suspend flow
    case getType(actions.suspendFlowAction.request): {
      state.flowInProgress.add(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.suspendFlowAction.success): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.suspendFlowAction.failure): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    // resume flow
    case getType(actions.resumeFlowAction.request): {
      state.flowInProgress.add(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.resumeFlowAction.success): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.resumeFlowAction.failure): {
      state.flowInProgress.delete(action.payload);
      return { ...state, flowInProgress: new Set(state.flowInProgress) };
    }

    case getType(actions.updateQuotasActions.success): {
      let quota: FlowQuota = state.quotas[action.payload[0]];
      if (!quota) {
        quota = {
          project_id: action.payload[0],
          currentQuotaSize: 0,
          maxQuotaSize: action.payload[1],
        };
      } else {
        quota.maxQuotaSize = action.payload[1];
      }
      state.quotas[action.payload[0]] = quota;
      return { ...state, quotas: state.quotas };
    }

    case getType(actions.fetchQuotasActions.request):
      return { ...state, isQuotasLoading: true };

    case getType(actions.fetchQuotasActions.failure):
      return { ...state, isQuotasLoading: false };

    case getType(actions.fetchQuotasActions.success): {
      const quotaMap = state.quotas;
      action.payload.forEach((quota: FlowQuota) => {
        quotaMap[quota.project_id] = quota;
      });
      return { ...state, quotas: quotaMap, isQuotasLoading: false };
    }

    case getType(actions.setFlowFilterAction):
      return { ...state, filter: action.payload };

    case getType(actions.getFlowSchemaNamesActions.success): {
      return {
        ...state,
        schemaNames: action.payload,
      };
    }
    case getType(actions.getFlowSchemaNamesActions.failure): {
      return {
        ...state,
        schemaNames: [],
      };
    }

    case getType(actions.setQuotaUnitsAction):
      return { ...state, quotaUnits: action.payload };

    case getType(actions.resetUnitsAction):
      return { ...state, quotaUnits: { ...initialState.quotaUnits } };

    default:
      return state;
  }
};

export function getQuotas(state: ApplicationState): any {
  return state.processing.quotas;
}

export function getQuotaForProject(state: ApplicationState, projectId: number): FlowQuota {
  return state.processing.quotas[projectId] || { project_id: projectId, maxQuotaSize: 0, currentQuotaSize: 0 };
}

export function isQuotasLoading(state: ApplicationState): any {
  return state.processing.isQuotasLoading;
}

export function isOverviewsLoading(state: ApplicationState) {
  return state.processing.isOverviewLoading;
}

export function isFlowLoading(state: ApplicationState): boolean {
  return state.processing.isFlowLoading;
}

export function getOverviews(state: ApplicationState): Array<FlowOverview> {
  return state.processing.overviews;
}

export function getOverview(state: ApplicationState): Map<number, FlowDetails> {
  return state.processing.overview;
}

export function getFlowFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.processing.filter;
}

export function getFlowsInProgress(state: ApplicationState): Set<number> {
  return state.processing.flowInProgress;
}

export function createInProgress(state: ApplicationState): boolean {
  return state.processing.createInProgress;
}

export function getTimeZones(state: ApplicationState) {
  return state.processing.timeZones;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.processing.version;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.processing.isVersionLoading;
}

// export const getInputFormatList = (state: ApplicationState) => (
//     state.archive.inputFormatList
// );

export const getSchemaNames = (state: ApplicationState) => state.archive.schemaNames;

export function getFlowServiceConfigs(state: ApplicationState): FlowServiceConfigs {
  return state.processing.flowServiceConfigs || { defaultLateMessageRejectionPeriod: '', defaultEarlyMessageRejectionPeriod: '' };
}

export const getQuotaUnits = (state: ApplicationState): QuotaUnits => state.processing.quotaUnits;

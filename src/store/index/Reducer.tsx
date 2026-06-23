import * as moment from 'moment';
import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { TimeRange, Field, IndexQuota, FulltextTask } from './Types';

export interface IndexStoreState {
  actionInProgress: boolean;
  fields: Array<Field>;
  fulltextTasks: FulltextTask[];
  isTaskListLoading: boolean;
  allLabels: string[];
  isAllLabelsLoading: boolean;
  timeRange: TimeRange;
  quotas: any;
  result: any;
  labels: string[];
  isLabelsLoading: boolean;
  isQuotasLoading: boolean;
  isQueryLoading: boolean;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
}

const initialState: IndexStoreState = {
  actionInProgress: true,
  fields: [],
  fulltextTasks: [],
  isTaskListLoading: true,
  allLabels: [],
  isAllLabelsLoading: true,
  result: {},
  timeRange: { end: () => moment(), start: () => moment().subtract(5, 'minute') },
  isQueryLoading: false,
  quotas: {},
  labels: [],
  isLabelsLoading: true,
  isQuotasLoading: true,
  version: [],
  isVersionLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<IndexStoreState> = (state: IndexStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.reqStart):
      return { ...state, actionInProgress: true };

    case getType(actions.reqFinished):
      return { ...state, actionInProgress: false };

    case getType(actions.fetchFieldsByIndexIdAction.success): {
      const fields = Object.keys(action.payload).map((key) => {
        return { name: key };
      });
      return { ...state, fields: fields };
    }

    case getType(actions.fetchQuotaAction.success): {
      const quotaMap = state.quotas;
      quotaMap[action.payload.projectShortName] = action.payload;
      return { ...state, quotas: quotaMap, isQuotasLoading: false };
    }

    case getType(actions.fetchQuotaAction.failure): {
      return { ...state, isQuotasLoading: false };
    }

    case getType(actions.fetchQuotasActions.success): {
      const quotaMap = {};
      action.payload.forEach((quota: IndexQuota) => {
        quotaMap[quota.projectShortName] = quota;
      });
      return { ...state, quotas: quotaMap, isQuotasLoading: false };
    }

    case getType(actions.fetchQuotasActions.request):
      return { ...state, isQuotasLoading: true };

    case getType(actions.fetchQuotasActions.failure):
      return { ...state, isQuotasLoading: false };

    case getType(actions.fulltextTaskListAction.success): {
      return { ...state, isTaskListLoading: false, fulltextTasks: action.payload };
    }

    case getType(actions.fulltextTaskListAction.request):
      return { ...state, isTaskListLoading: true };

    case getType(actions.fulltextTaskListAction.failure):
      return { ...state, isTaskListLoading: false };

    case getType(actions.fulltextAllLabelsAction.success): {
      return { ...state, isAllLabelsLoading: false, allLabels: action.payload };
    }

    case getType(actions.fulltextAllLabelsAction.request):
      return { ...state, isAllLabelsLoading: true };

    case getType(actions.fulltextAllLabelsAction.failure):
      return { ...state, isAllLabelsLoading: false };

    case getType(actions.updateQuotaForProjectAction.success): {
      const quotaMap = state.quotas;
      quotaMap[action.payload.projectShortName] = action.payload;
      return { ...state, quotas: quotaMap, actionInProgress: false };
    }

    case 'setCurrentTimeRange': {
      return { ...state, timeRange: action.timeRange };
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

    case getType(actions.fetchLabelsActions.failure): {
      return { ...state, isLabelsLoading: false };
    }

    case getType(actions.fetchLabelsActions.request): {
      return { ...state, isLabelsLoading: true };
    }

    case getType(actions.fetchLabelsActions.success): {
      return { ...state, labels: action.payload, isLabelsLoading: false };
    }

    case getType(actions.queryIndexByIdAction.request): {
      return {
        ...state,
        isQueryLoading: true,
      };
    }

    case getType(actions.queryIndexByIdAction.success): {
      return {
        ...state,
        result: action.payload,
        isQueryLoading: false,
      };
    }

    case getType(actions.clearQueryIndexAction): {
      return {
        ...state,
        result: [],
        isQueryLoading: false,
      };
    }

    //clearQueryIndexAction

    case getType(actions.queryIndexByIdAction.failure): {
      return {
        ...state,
        isQueryLoading: false,
      };
    }

    default:
      return state;
  }
};

export function getQuotas(state: ApplicationState): any {
  return state.index.quotas;
}

export function getQuotaById(state: ApplicationState, projectShortName: string) {
  return state.index.quotas[projectShortName] || { projectId: 0, currentShards: 0, maxShards: 0 };
}

export function isLoading(state: ApplicationState): any {
  return state.index.actionInProgress;
}

export function getFields(state: ApplicationState): any {
  return state.index.fields;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.index.version;
}

export function isQuotasLoading(state: ApplicationState): boolean {
  return state.index.isQuotasLoading;
}

export function isQueryLoading(state: ApplicationState): boolean {
  return state.index.isQueryLoading;
}

export function getQueryResult(state: ApplicationState): any {
  return state.index.result;
}

export function getFulltextTasks(state: ApplicationState): FulltextTask[] {
  return state.index.fulltextTasks;
}

export function isFulltextTaskListLoading(state: ApplicationState): boolean {
  return state.index.isTaskListLoading;
}

export function isAllLabelsLoading(state: ApplicationState): boolean {
  return state.index.isAllLabelsLoading;
}

export function getAllLabels(state: ApplicationState): string[] {
  return state.index.allLabels;
}

export function isLabelsLoading(state: ApplicationState): boolean {
  return state.index.isLabelsLoading;
}

export function getLabels(state: ApplicationState): string[] {
  return state.index.labels;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.role.isVersionLoading;
}

export function getTimeRange(state: ApplicationState) {
  return state.index.timeRange;
}

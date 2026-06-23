import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import IndexProvider from '../../containers/index/IndexProvider';
import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { Pipeline, PipelineShort, PipelineInputFormatListEnum } from './Types';

export interface PipelineStoreState {
  currentPipeline?: Pipeline;
  pipelinesInProgress: Set<string>;
  pipelines: PipelineShort[];
  metas: any;
  statuses: Map<string, string>;
  filter: FilterMenuItem[] | undefined;
  isLoading: boolean;
  isIndexesLoading: boolean;
  isRefetch: boolean;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
  inputFormatList: PipelineInputFormatListEnum[];
  schemaNames: string[];
}

const initialState: PipelineStoreState = {
  currentPipeline: undefined,
  pipelines: [],
  pipelinesInProgress: new Set<string>(),
  metas: {},
  isRefetch: false,
  statuses: new Map<string, string>(),
  filter: undefined,
  isLoading: true,
  isIndexesLoading: true,
  version: [],
  isVersionLoading: true,
  inputFormatList: [],
  schemaNames: [],
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<PipelineStoreState> = (state: PipelineStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.reqStart): {
      return { ...state, isLoading: true };
    }

    case getType(actions.reqFinished): {
      return { ...state, isLoading: false };
    }

    case getType(actions.replaceCurrentPipelineAction): {
      return {
        ...state,
        currentPipeline: {
          name: action.payload.name,
          sources: action.payload.sources,
          projectShortName: action.payload.projectShortName,
          processing: action.payload.processing,
          schema: action.payload.schema,
          quota: action.payload.quota,
          replicationFactor: action.payload.replicationFactor,
          recoveryStrategy: action.payload.recoveryStrategy,
          deadLetterQueue: action.payload.deadLetterQueue,
          labels: action.payload.labels,
          advanced: action.payload.advanced || null,
        },
        isLoading: false,
      };
    }

    case getType(actions.getPipelineInfoAction.failure): {
      return {
        ...state,
        isLoading: false,
      };
    }
    case getType(actions.getPipelineInfoAction.success):
      return {
        ...state,
        currentPipeline: action.payload,
        isLoading: false,
      };

    // suspend pipeline
    case getType(actions.pipelinesSuspendAction.request): {
      state.pipelinesInProgress.add(action.payload);
      return {
        ...state,
        pipelinesInProgress: new Set(state.pipelinesInProgress),
      };
    }

    case getType(actions.pipelinesSuspendAction.success): {
      state.pipelinesInProgress.delete(action.payload);
      return {
        ...state,
        pipelinesInProgress: new Set(state.pipelinesInProgress),
      };
    }

    case getType(actions.pipelinesSuspendAction.failure): {
      state.pipelinesInProgress.delete(action.payload);
      return {
        ...state,
        pipelinesInProgress: new Set(state.pipelinesInProgress),
      };
    }

    // resume flow
    case getType(actions.pipelinesResumeAction.request): {
      state.pipelinesInProgress.add(action.payload);
      return {
        ...state,
        pipelinesInProgress: new Set(state.pipelinesInProgress),
      };
    }

    case getType(actions.pipelinesResumeAction.success): {
      state.pipelinesInProgress.delete(action.payload);
      return {
        ...state,
        pipelinesInProgress: new Set(state.pipelinesInProgress),
      };
    }

    case getType(actions.pipelinesMetaAction.success): {
      const statusMap = state.metas;
      statusMap[action.payload.projectShortName + action.payload.name + action.payload.zoneId] = action.payload.meta;
      return { ...state, metas: statusMap, actionInProgress: false };
    }

    case getType(actions.listPipelinesStatusAction.request): {
      return { ...state, isIndexesLoading: true };
    }

    case getType(actions.listPipelinesStatusAction.success): {
      return { ...state, statuses: action.payload, isIndexesLoading: false };
    }

    case getType(actions.listPipelinesStatusAction.failure): {
      return { ...state, isIndexesLoading: false };
    }

    case getType(actions.listPipelinesAction.request): {
      return { ...state, isIndexesLoading: true };
    }

    case getType(actions.listPipelinesAction.success): {
      return { ...state, isIndexesLoading: false, pipelines: action.payload };
    }

    case getType(actions.listPipelinesAction.failure): {
      return { ...state, isIndexesLoading: false };
    }

    case getType(actions.selectNewPipeline):
      return {
        ...state,
        currentPipeline: IndexProvider.getEmptyPipeline(),
        isLoading: false,
      };

    case getType(actions.setPipelineFilterAction):
      return {
        ...state,
        filter: action.payload.filter,
        isRefetch: action.payload.isRefetch,
      };

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

    case getType(actions.getPipelineInputFormatListActions.success): {
      return {
        ...state,
        inputFormatList: action.payload,
      };
    }
    case getType(actions.getPipelineInputFormatListActions.failure): {
      return {
        ...state,
        inputFormatList: [],
      };
    }

    case getType(actions.getPipelineSchemaNamesActions.success): {
      return {
        ...state,
        schemaNames: action.payload,
      };
    }
    case getType(actions.getPipelineSchemaNamesActions.failure): {
      return {
        ...state,
        schemaNames: [],
      };
    }
    default:
      return state;
  }
};

export function getCurrentPipeline(state: ApplicationState): Pipeline | undefined {
  return state.pipeline.currentPipeline;
}

export function isLoading(state: ApplicationState): boolean {
  return state.pipeline.isLoading;
}

export function getPipelinesInProgress(state: ApplicationState): Set<string> {
  return state.pipeline.pipelinesInProgress;
}

export function getIndexFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.pipeline.filter;
}

export function getMeta(state: ApplicationState) {
  return state.pipeline.metas;
}

export function isIndexesLoading(state: ApplicationState): boolean {
  return state.pipeline.isIndexesLoading;
}

export function getStatuses(state: ApplicationState): Map<string, string> {
  return state.pipeline.statuses;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.pipeline.version;
}

export function isRefetch(state: ApplicationState): boolean {
  return state.pipeline.isRefetch;
}

export function getPipelines(state: ApplicationState): PipelineShort[] {
  return state.pipeline.pipelines;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.role.isVersionLoading;
}

export const getArchiveInputFormatList = (state: ApplicationState) => state.pipeline.inputFormatList;

export const getArchiveSchemaNames = (state: ApplicationState) => state.pipeline.schemaNames;

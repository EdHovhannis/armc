import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { TracingSupervisorDescription } from './Types';

export interface TracingDatasourceStoreState {
  datasources: Map<number, TracingSupervisorDescription> | undefined;
  datasourcesLoading: boolean;
  datasourceLoading: boolean;
  updateInProgress: boolean;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
}

const initialState: TracingDatasourceStoreState = {
  datasources: undefined,
  datasourcesLoading: false,
  datasourceLoading: false,
  updateInProgress: false,
  version: [],
  isVersionLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<TracingDatasourceStoreState> = (state: TracingDatasourceStoreState = initialState, action: Actions) => {
  switch (action.type) {
    // fetch all
    case getType(actions.fetchDatasourcesAction.request): {
      return { ...state, datasourcesLoading: true };
    }

    case getType(actions.fetchDatasourcesAction.success): {
      const arr: Array<TracingSupervisorDescription> = action.payload;
      const map: Map<number, TracingSupervisorDescription> = new Map();
      arr.forEach((supervisor) => {
        map.set(supervisor.id, supervisor);
      });
      return { ...state, datasourcesLoading: false, datasources: map };
    }

    case getType(actions.fetchDatasourcesAction.failure): {
      return { ...state, datasourcesLoading: false };
    }

    // fetch single
    case getType(actions.fetchDatasourceAction.request): {
      return { ...state, datasourceLoading: true };
    }

    case getType(actions.fetchDatasourceAction.success): {
      let map: Map<number, TracingSupervisorDescription> | undefined = state.datasources;
      if (map === undefined) {
        map = new Map();
      }

      map.set(action.payload.id, action.payload);
      return { ...state, datasourceLoading: false, datasources: map };
    }

    case getType(actions.fetchDatasourceAction.failure): {
      return { ...state, datasourceLoading: false };
    }

    // create
    case getType(actions.createDatasourceAction.success): {
      let map: Map<number, TracingSupervisorDescription> | undefined = state.datasources;
      if (map === undefined) {
        map = new Map();
      }
      map.set(action.payload.id, action.payload);
      return { ...state, datasources: map };
    }

    // update
    case getType(actions.updateDatasourceAction.request): {
      return { ...state, updateInProgress: true };
    }

    case getType(actions.updateDatasourceAction.success): {
      let map: Map<number, TracingSupervisorDescription> | undefined = state.datasources;
      if (map === undefined) {
        map = new Map();
      }
      const payload: any = action.payload;
      const desc: TracingSupervisorDescription = map.get(payload.id)!;
      desc.name = payload.name;
      desc.traceSupervisorId = payload.traceSupervisorId;
      desc.callsSupervisorId = payload.callsSupervisorId;
      desc.treeSupervisorId = payload.treeSupervisorId;

      map.set(payload.id, desc);
      return { ...state, updateInProgress: false, datasources: map };
    }

    case getType(actions.updateDatasourceAction.failure): {
      return { ...state, updateInProgress: false };
    }

    // delete
    case getType(actions.deleteDatasourceAction.request): {
      return { ...state, updateInProgress: true };
    }

    case getType(actions.deleteDatasourceAction.success): {
      const map: Map<number, TracingSupervisorDescription> | undefined = state.datasources;
      if (map === undefined) {
        return state;
      }

      map.delete(action.payload);
      return { ...state, updateInProgress: false, datasources: map };
    }

    case getType(actions.deleteDatasourceAction.failure): {
      return { ...state, updateInProgress: false };
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

export function getDatasources(state: ApplicationState): Map<number, TracingSupervisorDescription> | undefined {
  return state.tracingDatasource.datasources;
}

export function isDatasourcesLoading(state: ApplicationState): boolean {
  return state.tracingDatasource.datasourcesLoading;
}

export function isDatasourceLoading(state: ApplicationState): boolean {
  return state.tracingDatasource.datasourceLoading;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.tracingDatasource.version;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.tracingDatasource.isVersionLoading;
}

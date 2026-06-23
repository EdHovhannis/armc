import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { Config, IHealthChecks, IHealthChecksForTable, IHealthChecksZones, IndexConfig, Versions } from './Types';

export interface ConfigStoreState extends Config {
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
  analyticalServiceConfig?: IndexConfig;
  isAnalyticalServiceConfigLoading: boolean;
  fulltextServiceConfig?: IndexConfig;
  isFulltextServiceConfigLoading: boolean;
  healthCheckConfigData: IHealthChecksForTable[];
  healthCheckConfigZones: IHealthChecksZones;
  isHealthCheckConfigsLoading: boolean;
}

const initialState: ConfigStoreState = {
  registerEnabled: false,
  pvmMode: true,
  maxCountUser: 15,
  minCountMask: 3,
  localUserEnable: false,
  basePath: '/',
  version: [],
  isVersionLoading: true,
  isAnalyticalServiceConfigLoading: true,
  isFulltextServiceConfigLoading: true,
  healthCheckConfigData: [],
  healthCheckConfigZones: [],
  isHealthCheckConfigsLoading: false,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<ConfigStoreState> = (state: ConfigStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchConfigAction.success):
      return action.payload;

    case getType(actions.fetchPvmConfigAction.success):
      return { ...state, localUserEnable: action.payload.localUserEnable };

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

    case getType(actions.fetchAnalyticalServiceConfigAction.success):
      return {
        ...state,
        isAnalyticalServiceConfigLoading: false,
        analyticalServiceConfig: action.payload,
      };

    case getType(actions.fetchAnalyticalServiceConfigAction.request):
      return {
        ...state,
        isAnalyticalServiceConfigLoading: true,
        analyticalServiceConfig: undefined,
      };

    case getType(actions.fetchAnalyticalServiceConfigAction.failure):
      return {
        ...state,
        isAnalyticalServiceConfigLoading: false,
        analyticalServiceConfig: undefined,
      };

    case getType(actions.fetchFulltextServiceConfigAction.success):
      return {
        ...state,
        isFulltextServiceConfigLoading: false,
        fulltextServiceConfig: action.payload,
      };

    case getType(actions.fetchFulltextServiceConfigAction.request):
      return {
        ...state,
        isFulltextServiceConfigLoading: true,
        fulltextServiceConfig: undefined,
      };

    case getType(actions.fetchFulltextServiceConfigAction.failure):
      return {
        ...state,
        isFulltextServiceConfigLoading: false,
        fulltextServiceConfig: undefined,
      };
    case getType(actions.fetchHealthCheckConfigAction.request):
      return { ...state, isHealthCheckConfigsLoading: true };
    case getType(actions.fetchHealthCheckConfigAction.success): {
      return { ...state, isHealthCheckConfigsLoading: false, healthCheckConfigData: action.payload };
    }
    case getType(actions.fetchHealthCheckConfigAction.failure): {
      return { ...state, isHealthCheckConfigsLoading: false, healthCheckConfigData: [] };
    }

    default:
      return state;
  }
};

export function isRegisterEnabled(state: ApplicationState): boolean {
  return state.config.registerEnabled;
}

export function isPvmModeEnabled(state: ApplicationState): boolean {
  return state.config.pvmMode;
}

export function isLocalUsersEnabled(state: ApplicationState): boolean {
  return state.config.localUserEnable;
}

export function getMinCountMask(state: ApplicationState): number {
  return state.config.minCountMask;
}

export function getMaxCountUser(state: ApplicationState): number {
  return state.config.maxCountUser;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.config.version;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.config.isVersionLoading;
}

export function getAnalyticalServiceConfig(state: ApplicationState): IndexConfig | undefined {
  return state.config.analyticalServiceConfig;
}

export function isAnalyticalServiceConfigLoading(state: ApplicationState): boolean {
  return state.config.isAnalyticalServiceConfigLoading;
}

export function getFulltextServiceConfig(state: ApplicationState): IndexConfig | undefined {
  return state.config.fulltextServiceConfig;
}

export function isFulltextServiceConfigLoading(state: ApplicationState): boolean {
  return state.config.isFulltextServiceConfigLoading;
}

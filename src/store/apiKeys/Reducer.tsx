import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { APIkeyInfo } from './Types';

export interface ApiKeyStoreState {
  currentApiKey?: string;
  isCurrentApiKeyLoading: boolean;
  apiKeyInfos: APIkeyInfo[];
  isApiKeyInfosLoading: boolean;
  userApiKeyInfo?: APIkeyInfo;
  isUserApiKeyInfoLoading: boolean;
  timeUnits: string[];
  isTimeUnitsLoading: boolean;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
}

export const initialState: ApiKeyStoreState = {
  isApiKeyInfosLoading: true,
  isCurrentApiKeyLoading: true,
  isUserApiKeyInfoLoading: true,
  apiKeyInfos: [],
  timeUnits: [],
  isTimeUnitsLoading: true,
  version: [],
  isVersionLoading: true,
};

export type NotificationActions = ActionType<typeof actions>;

export const reducer: Reducer<ApiKeyStoreState> = (state: ApiKeyStoreState = initialState, action: NotificationActions) => {
  switch (action.type) {
    case getType(actions.getApiKeyInfoAction.request): {
      return {
        ...state,
        isApiKeyInfosLoading: true,
      };
    }

    case getType(actions.getApiKeyInfoAction.success): {
      return {
        ...state,
        apiKeyInfos: action.payload,
        isApiKeyInfosLoading: false,
      };
    }

    case getType(actions.getApiKeyInfoAction.failure): {
      return {
        ...state,
        isApiKeyInfosLoading: false,
      };
    }

    case getType(actions.getTimeUnitsAction.request): {
      return {
        ...state,
        isTimeUnitsLoading: true,
      };
    }

    case getType(actions.getTimeUnitsAction.success): {
      return {
        ...state,
        timeUnits: action.payload,
        isTimeUnitsLoading: false,
      };
    }

    case getType(actions.getTimeUnitsAction.failure): {
      return {
        ...state,
        isTimeUnitsLoading: false,
      };
    }

    case getType(actions.getApiKeyInfoForUserAction.request): {
      return {
        ...state,
        isUserApiKeyInfoLoading: true,
      };
    }

    case getType(actions.getApiKeyInfoForUserAction.success): {
      return {
        ...state,
        userApiKeyInfo: action.payload,
        isUserApiKeyInfoLoading: false,
      };
    }

    case getType(actions.getApiKeyInfoForUserAction.failure): {
      return {
        ...state,
        isUserApiKeyInfoLoading: false,
      };
    }

    case getType(actions.createApiKeyAction.request): {
      return {
        ...state,
        isCurrentApiKeyLoading: true,
      };
    }

    case getType(actions.createApiKeyAction.success): {
      return {
        ...state,
        currentApiKey: action.payload,
        isCurrentApiKeyLoading: false,
      };
    }

    case getType(actions.createApiKeyAction.failure): {
      return {
        ...state,
        isCurrentApiKeyLoading: false,
      };
    }

    case getType(actions.deleteApiKeyAction.success): {
      return {
        ...state,
        apiKeyInfos: state.apiKeyInfos.filter((apiKey) => apiKey.user !== action.payload),
        isApiKeyInfosLoading: false,
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

export function isUserApiKeyInfoLoading(state: ApplicationState): boolean {
  return state.apiKey.isUserApiKeyInfoLoading;
}

export function isCurrentApiKeyLoading(state: ApplicationState): boolean {
  return state.apiKey.isCurrentApiKeyLoading;
}

export function isApiKeyInfosLoading(state: ApplicationState): boolean {
  return state.apiKey.isApiKeyInfosLoading;
}

export function isTimeUnitsLoading(state: ApplicationState): boolean {
  return state.apiKey.isTimeUnitsLoading;
}

export function getApiKeyInfos(state: ApplicationState): APIkeyInfo[] {
  return state.apiKey.apiKeyInfos;
}

export function getUserApiKeyInfo(state: ApplicationState): APIkeyInfo | undefined {
  return state.apiKey.userApiKeyInfo;
}

export function getCurrentApiKey(state: ApplicationState): string | undefined {
  return state.apiKey.currentApiKey;
}

export function getTimeUnits(state: ApplicationState): string[] {
  return state.apiKey.timeUnits;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.apiKey.version;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.apiKey.isVersionLoading;
}

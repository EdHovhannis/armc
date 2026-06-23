import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { AlmgrQuota } from './Type';

export interface AlmgrStoreState {
  quotas: AlmgrQuota;
  isQuotasLoading: boolean;
}

const initialQuota = { currentGroupRulesAmount: 0, currentRpm: 0, maxGroupRulesAmount: 0, maxRpm: 0 };

const initialState: AlmgrStoreState = {
  quotas: initialQuota,
  isQuotasLoading: false,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<AlmgrStoreState> = (state: AlmgrStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.getAlmgrProjectQuotaAction.success): {
      return { ...state, quotas: action.payload, isQuotasLoading: false };
    }

    case getType(actions.getAlmgrProjectQuotaAction.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.getAlmgrProjectQuotaAction.failure): {
      return { ...state, quotas: initialQuota, isQuotasLoading: false };
    }

    case getType(actions.setAlmgrProjectQuotaAction.success): {
      return {
        ...state,
        quotas: action.payload,
        isQuotasLoading: false,
      };
    }

    case getType(actions.setAlmgrProjectQuotaAction.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.setAlmgrProjectQuotaAction.failure): {
      return { ...state, isQuotasLoading: false };
    }

    default:
      return state;
  }
};

export function getQuotas(state: ApplicationState): AlmgrQuota {
  return state.almgr.quotas;
}

export function isQuotasLoading(state: ApplicationState): boolean {
  return state.almgr.isQuotasLoading;
}

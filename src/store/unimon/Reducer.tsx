import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { UnimonProjectQuota } from './Type';

export interface UnimonStoreState {
  currentQuota?: UnimonProjectQuota;
  isQuotaLoading: boolean;
  quotas: any;
  isQuotasLoading: boolean;
}

const initialState: UnimonStoreState = {
  isQuotaLoading: true,
  quotas: {},
  isQuotasLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<UnimonStoreState> = (state: UnimonStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.getUnimonProjectQuotaAction.success): {
      return { ...state, currentQuota: action.payload, isQuotaLoading: false };
    }

    case getType(actions.getUnimonProjectQuotaAction.request): {
      return { ...state, isQuotaLoading: true };
    }

    case getType(actions.getUnimonProjectQuotaAction.failure): {
      return { ...state, isQuotaLoading: false };
    }

    case getType(actions.getUnimonQuotasAction.success): {
      return { ...state, quotas: action.payload, isQuotasLoading: false };
    }

    case getType(actions.getUnimonQuotasAction.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.getUnimonQuotasAction.failure): {
      return { ...state, isQuotasLoading: false };
    }

    case getType(actions.setUnimonProjectQuotaAction.success): {
      return {
        ...state,
        currentQuota: {
          currentUtilization: state.currentQuota?.currentUtilization,
          overdraftPercent: action.payload.overdraftPercent,
          limitTrafficPerMin: action.payload.limitTrafficPerMin,
          overdraftMinutes: action.payload.overdraftMinutes,
        },
        isQuotaLoading: false,
      };
    }

    default:
      return state;
  }
};

export function getQuota(state: ApplicationState): UnimonProjectQuota {
  return state.unimon.currentQuota || { limitTrafficPerMin: 0, currentUtilization: 0, overdraftMinutes: 0, overdraftPercent: 0 };
}

export function isQuotaLoading(state: ApplicationState): boolean {
  return state.unimon.isQuotaLoading;
}

export function getQuotas(state: ApplicationState): any {
  return state.unimon.quotas;
}

export function isQuotasLoading(state: ApplicationState): boolean {
  return state.unimon.isQuotasLoading;
}

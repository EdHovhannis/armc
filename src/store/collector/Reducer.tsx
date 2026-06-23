import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { CollectorProjectQuota } from './Type';

export interface CollectorStoreState {
  currentQuota: CollectorProjectQuota | null;
  quotas: CollectorProjectQuota[];
  isQuotaLoading: boolean;
  isQuotasLoading: boolean;
}

const initialState: CollectorStoreState = {
  currentQuota: null,
  quotas: [],
  isQuotaLoading: true,
  isQuotasLoading: true,
};

export const EMPTY_QUOTA: CollectorProjectQuota = {
  createTs: '',
  createdUserId: '',
  limitTrafficPerMin: 0,
  limitTrafficBytesPerMin: 0,
  modifiedUserId: '',
  modifyTs: '',
  projectName: '',
  quotaId: '',
  version: 0,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<CollectorStoreState> = (state: CollectorStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.getCollectorProjectQuotaAction.success): {
      return { ...state, currentQuota: action.payload, isQuotaLoading: false };
    }

    case getType(actions.getCollectorProjectQuotaAction.request): {
      return { ...state, isQuotaLoading: true };
    }

    case getType(actions.getCollectorProjectQuotaAction.failure): {
      return { ...state, currentQuota: EMPTY_QUOTA, isQuotaLoading: false };
    }

    case getType(actions.getCollectorProjectQuotaByIdAction.success): {
      return { ...state, currentQuota: action.payload, isQuotaLoading: false };
    }

    case getType(actions.getCollectorProjectQuotaByIdAction.request): {
      return { ...state, isQuotaLoading: true };
    }

    case getType(actions.getCollectorProjectQuotaByIdAction.failure): {
      return { ...state, isQuotaLoading: false };
    }

    case getType(actions.setCollectorProjectQuotaAction.success): {
      return { ...state, currentQuota: action.payload, isQuotaLoading: false };
    }

    case getType(actions.getCollectorProjectAllQuotasAction.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.getCollectorProjectAllQuotasAction.failure): {
      return { ...state, isQuotasLoading: false };
    }

    case getType(actions.getCollectorProjectAllQuotasAction.success): {
      return { ...state, quotas: action.payload, isQuotasLoading: false };
    }

    default:
      return state;
  }
};

export function getQuota(state: ApplicationState): CollectorProjectQuota {
  return state.collector.currentQuota || EMPTY_QUOTA;
}

export function getQuotas(state: ApplicationState): CollectorProjectQuota[] {
  return state.collector.quotas;
}

export function isQuotaLoading(state: ApplicationState): boolean {
  return state.collector.isQuotaLoading;
}

export function isQuotasLoading(state: ApplicationState): boolean {
  return state.collector.isQuotasLoading;
}

import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { OsirisCheckQuotaProject, OsirisQuotaType, OsirisTrafficQuotaProject } from './Type';

export interface OsirisStoreState {
  currentCheckQuota?: OsirisCheckQuotaProject;
  currentTrafficQuota?: OsirisTrafficQuotaProject;
  trafficQuotas: any;
  checkQuotas: any;

  isQuotaLoading: boolean;
  isQuotasLoading: boolean;
}

const initialState: OsirisStoreState = {
  isQuotaLoading: true,
  isQuotasLoading: true,
  trafficQuotas: {},
  checkQuotas: {},
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<OsirisStoreState> = (state: OsirisStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.getOsirisCheckProjectQuotaAction.success): {
      return { ...state, currentCheckQuota: action.payload, isQuotaLoading: false };
    }

    case getType(actions.getOsirisTrafficProjectQuotaAction.success): {
      return { ...state, currentTrafficQuota: action.payload, isQuotaLoading: false };
    }

    case getType(actions.getOsirisCheckProjectQuotaAction.request): {
      return { ...state, isQuotaLoading: true };
    }

    case getType(actions.getOsirisCheckProjectQuotaAction.failure): {
      return { ...state, isQuotaLoading: false };
    }

    case getType(actions.listOsirisTrafficQuotasAction.success): {
      const quotaMap = {};
      action.payload.forEach((quota) => {
        const elem: OsirisTrafficQuotaProject = {
          id: quota.id,
          quotaType: quota.quotaType,
          maxSecondsInOver: quota.maxSecondsInOver,
          over: quota.over,
          max: quota.max,
          spent: quota.spent,
        };
        quotaMap[quota.project] = elem;
      });
      return { ...state, trafficQuotas: quotaMap, isQuotaLoading: false };
    }

    case getType(actions.listOsirisCheckQuotasAction.success): {
      const quotaMap = {};
      action.payload.forEach((quota) => {
        const elem: OsirisCheckQuotaProject = {
          id: quota.id,
          quotaType: quota.quotaType,
          max: quota.max,
          spent: quota.spent,
        };
        quotaMap[quota.project] = elem;
      });
      return { ...state, checkQuotas: quotaMap, isQuotasLoading: false };
    }

    case getType(actions.listOsirisCheckQuotasAction.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.listOsirisCheckQuotasAction.failure): {
      return { ...state, isQuotasLoading: false };
    }

    default:
      return state;
  }
};

export function getCheckQuota(state: ApplicationState): OsirisCheckQuotaProject | undefined {
  return state.osiris.currentCheckQuota;
}

export function getTrafficQuota(state: ApplicationState): OsirisTrafficQuotaProject | undefined {
  return state.osiris.currentTrafficQuota;
}

export function getTrafficQuotas(state: ApplicationState): any {
  return state.osiris.trafficQuotas;
}

export function getCheckQuotas(state: ApplicationState): any {
  return state.osiris.checkQuotas;
}

export function isQuotaLoading(state: ApplicationState): boolean {
  return state.osiris.isQuotaLoading;
}

export function isQuotasLoading(state: ApplicationState): boolean {
  return state.osiris.isQuotasLoading;
}

import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { Cluster, ClusterItem } from '../../components/clusters/types';
import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { QuotaListItem, QuotaRemainingItem } from './Types';

export interface ClustersStoreState {
  clusters: Cluster[];
  projectClusters: ClusterItem[];
  clustersQuota: QuotaListItem[];
  clustersRemainingQuota: QuotaRemainingItem[];
  isClustersLoading: boolean;
  isProjectClustersLoading: boolean;
  isQuotasLoading: boolean;
  isRemainingQuotasLoading: boolean;
  isQuotaUpdated: boolean;
  isAllowanceUpdated: boolean;
}

const initialState: ClustersStoreState = {
  // все существующие кластеры
  clusters: [],
  // кластеры включенные для конкретного проекта
  projectClusters: [],
  // квоты кластеров для конкретного проекта (могут не прийти в запросе, тогда считаем, что они равны 0
  clustersQuota: [],
  // квоты по всем существующим кластерм, если не пришли, то считаем, что равны нулю
  clustersRemainingQuota: [],
  isClustersLoading: false,
  isProjectClustersLoading: false,
  isQuotasLoading: false,
  isRemainingQuotasLoading: false,
  isQuotaUpdated: false,
  isAllowanceUpdated: false,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<ClustersStoreState> = (state: ClustersStoreState = initialState, action: Actions) => {
  switch (action.type) {
    // clusters
    case getType(actions.getClusters.success): {
      return { ...state, clusters: action.payload, isClustersLoading: false };
    }

    case getType(actions.getClusters.request): {
      return { ...state, isClustersLoading: true };
    }

    case getType(actions.getClusters.failure): {
      return { ...state, clusters: [], isClustersLoading: false };
    }
    // proejct clusters
    case getType(actions.getProjectClusters.success): {
      return { ...state, projectClusters: action.payload, isProjectClustersLoading: false };
    }

    case getType(actions.getProjectClusters.request): {
      return { ...state, isProjectClustersLoading: true };
    }

    case getType(actions.getProjectClusters.failure): {
      return { ...state, projectClusters: [], isProjectClustersLoading: false };
    }

    // clusters quota
    case getType(actions.getQuotas.success): {
      return { ...state, clustersQuota: action.payload, isQuotasLoading: false };
    }

    case getType(actions.getQuotas.request): {
      return { ...state, isQuotasLoading: true };
    }

    case getType(actions.getQuotas.failure): {
      return { ...state, clustersQuota: [], isQuotasLoading: false };
    }

    // clusters remaining quota
    case getType(actions.getRemainingQuotas.success): {
      return { ...state, clustersRemainingQuota: action.payload, isRemainingQuotasLoading: false };
    }

    case getType(actions.getRemainingQuotas.request): {
      return { ...state, isRemainingQuotasLoading: true };
    }

    case getType(actions.getRemainingQuotas.failure): {
      return { ...state, clustersRemainingQuota: [], isRemainingQuotasLoading: false };
    }

    // update quotas
    case getType(actions.updateQuotas.success): {
      return { ...state, isQuotaUpdated: false };
    }

    case getType(actions.updateQuotas.request): {
      return { ...state, isQuotaUpdated: true };
    }

    case getType(actions.updateQuotas.failure): {
      return { ...state, isQuotaUpdated: false };
    }

    // update allowance
    case getType(actions.updateAllowance.success): {
      return { ...state, isAllowanceUpdated: false };
    }

    case getType(actions.updateAllowance.request): {
      return { ...state, isAllowanceUpdated: true };
    }

    case getType(actions.updateAllowance.failure): {
      return { ...state, isAllowanceUpdated: false };
    }
    default:
      return state;
  }
};

export function getClusters(state: ApplicationState): Cluster[] {
  return state.clusters.clusters;
}

export function getProjectClusters(state: ApplicationState): ClusterItem[] {
  return state.clusters.projectClusters;
}

export function getClustersQuota(state: ApplicationState): QuotaListItem[] {
  return state.clusters.clustersQuota;
}

export function getClustersRemainingQ(state: ApplicationState): any[] {
  return state.clusters.clustersRemainingQuota;
}

export function isClustersLoading(state: ApplicationState): boolean {
  return state.clusters.isClustersLoading;
}

export function isProjectClustersLoading(state: ApplicationState): boolean {
  return state.clusters.isProjectClustersLoading;
}

export function isClustersQuotaLoading(state: ApplicationState): boolean {
  return state.clusters.isQuotasLoading;
}

export function isClustersRemainingQuotaLoading(state: ApplicationState): boolean {
  return state.clusters.isRemainingQuotasLoading;
}

export function isQuotaUpdated(state: ApplicationState): boolean {
  return state.clusters.isQuotaUpdated;
}

export function isAllowanceUpdated(state: ApplicationState): boolean {
  return state.clusters.isAllowanceUpdated;
}

export function isGlobalClustersLoading(state: ApplicationState): boolean {
  return (
    isQuotaUpdated(state) ||
    isProjectClustersLoading(state) ||
    isClustersQuotaLoading(state) ||
    isClustersRemainingQuotaLoading(state) ||
    isQuotaUpdated(state) ||
    isAllowanceUpdated(state) ||
    isClustersLoading(state)
  );
}

import { createAsyncAction } from 'typesafe-actions';

import ClustersService from '../../services/ClusterService';

import {
  ClusterItem,
  FetchProjectClusters,
  FetchClustersQuota,
  FetchClustersRemainingQuota,
  QuotaListItem,
  QuotaRemainingItem,
  UpdateClustersAllowance,
  UpdateClustersQuota,
  FetchClusters,
  Cluster,
} from './Types';

export const getClusters = createAsyncAction('@clusters/GET_CLUSTERS_REQ', '@clusters/GET_CLUSTERS_SUCCESS', '@clusters/GET_CLUSTERS_FAILURE')<
  void,
  Cluster[],
  string
>();

export const fetchClusters: FetchClusters<(dispatch: any, getState: any) => void> = (fetchedCallback, errorCallback) => {
  return (dispatch, getState) => {
    const errorCb = (error: string) => {
      if (errorCallback) {
        errorCallback(error);
      }
      dispatch(getClusters.failure(error));
    };

    dispatch(getClusters.request());

    ClustersService.getClusters((clusters: Cluster[]) => {
      dispatch(getClusters.success(clusters));
      if (fetchedCallback) {
        fetchedCallback(clusters);
      }
    }, errorCb);
  };
};

export const getProjectClusters = createAsyncAction(
  '@clusters/GET_PROJECT_CLUSTERS_REQ',
  '@clusters/GET_PROJECT_CLUSTERS_SUCCESS',
  '@clusters/GET_PROJECT_CLUSTERS_FAILURE',
)<void, ClusterItem[], string>();
export const fetchProjectClusters: FetchProjectClusters<(dispatch: any, getState: any) => void> = (project, fetchedCallback, errorCallback) => {
  return (dispatch, getState) => {
    const errorCb = (error: string) => {
      if (errorCallback) {
        errorCallback(error);
      }
      dispatch(getProjectClusters.failure(error));
    };

    dispatch(getProjectClusters.request());

    ClustersService.getProjectClusters(
      project.shortName,
      (clusters: ClusterItem[] = []) => {
        dispatch(getProjectClusters.success(clusters));
        if (fetchedCallback) {
          fetchedCallback(clusters);
        }
      },
      errorCb,
    );
  };
};

export const getQuotas = createAsyncAction('@clusters/GET_QUOTAS_REQ', '@clusters/GET_QUOTAS_SUCCESS', '@clusters/GET_QUOTAS_FAILURE')<
  void,
  QuotaListItem[],
  string
>();

export const fetchClustersQuota: FetchClustersQuota<(dispatch: any, getState: any) => void> = (
  project: string[],
  clustersId: number[] = [],
  fetchedCallback?: (clustersQuota: QuotaListItem[]) => void,
  errorCallback?: (error: string) => void,
) => {
  return (dispatch, getState) => {
    const errorCb = (error: string) => {
      dispatch(getQuotas.failure(error));
      if (errorCallback) {
        errorCallback(error);
      }
    };

    dispatch(getQuotas.request());

    ClustersService.getClustersQuota(
      project,
      clustersId,
      (clustersQuota: QuotaListItem[]) => {
        dispatch(getQuotas.success(clustersQuota));
        if (fetchedCallback) {
          fetchedCallback(clustersQuota);
        }
      },
      errorCb,
    );
  };
};

export const getRemainingQuotas = createAsyncAction(
  '@clusters/GET_REMAINING_QUOTAS_REQ',
  '@clusters/GET_REMAINING_SUCCESS',
  '@clusters/GET_REMAINING_FAILURE',
)<void, QuotaRemainingItem[], string>();

export const fetchClustersRemainingQuota: FetchClustersRemainingQuota<(dispatch: any, getState: any) => void> = (
  fetchedCallback?: (clustersRemainingQuota: QuotaRemainingItem[]) => void,
  errorCallback?: (error: string) => void,
) => {
  return (dispatch, getState) => {
    const errorCb = (error: string) => {
      dispatch(getRemainingQuotas.failure(error));
      if (errorCallback) {
        errorCallback(error);
      }
    };

    dispatch(getRemainingQuotas.request());

    ClustersService.getClustersRemainingQuota((clustersRemainingQuota) => {
      dispatch(getRemainingQuotas.success(clustersRemainingQuota));
      if (fetchedCallback) {
        fetchedCallback(clustersRemainingQuota);
      }
    }, errorCb);
  };
};

export const updateQuotas = createAsyncAction('@clusters/SET_QUOTAS_REQ', '@clusters/SET_QUOTAS_SUCCESS', '@clusters/SET_QUOTAS_FAILURE')<
  void,
  void,
  string
>();

export const updateClustersQuota: UpdateClustersQuota<(dispatch: any, getState: any) => void> = (
  projectId,
  quotas,
  errorCallback?: (error: string) => void,
) => {
  return (dispatch, getState) => {
    const errorCb = (error: string) => {
      dispatch(updateQuotas.failure(error));
      if (errorCallback) {
        errorCallback(error);
      }
    };

    dispatch(updateQuotas.request());

    ClustersService.setClustersQuota(
      projectId,
      quotas,
      () => {
        dispatch(updateQuotas.success());
      },
      errorCb,
    );
  };
};

export const updateAllowance = createAsyncAction('@clusters/SET_ALLOWANCE_REQ', '@clusters/SET_ALLOWANCE_SUCCESS', '@clusters/SET_ALLOWANCE_FAILURE')<
  void,
  void,
  string
>();

export const updateClustersAllowance: UpdateClustersAllowance<(dispatch: any, getState: any) => void> = (
  projectId,
  clustersId,
  errorCallback?: (error: string) => void,
) => {
  return (dispatch, getState) => {
    const errorCb = (error: string) => {
      dispatch(updateAllowance.failure(error));
      if (errorCallback) {
        errorCallback(error);
      }
    };

    dispatch(updateAllowance.request());

    ClustersService.setClustersAllowance(
      projectId,
      clustersId,
      () => {
        dispatch(updateAllowance.success());
      },
      errorCb,
    );
  };
};

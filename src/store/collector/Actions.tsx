import { createAsyncAction } from 'typesafe-actions';

import CollectorService from '../../services/CollectorService';
import * as notificationActions from '../notification/Actions';

import { CollectorProjectQuota } from './Type';

export const getCollectorProjectQuotaAction = createAsyncAction(
  '@collector/GET_QUOTA_PROJECT_REQ',
  '@collector/GET_QUOTA_PROJECT_SUCCESS',
  '@collector/GET_QUOTA_PROJECT_FAILURE',
)<void, CollectorProjectQuota | null, string>();

export const getCollectorProjectAllQuotasAction = createAsyncAction(
  '@collector/GET_ALL_QUOTAS_PROJECT_REQ',
  '@collector/GET_ALL_QUOTAS_PROJECT_SUCCESS',
  '@collector/GET_ALL_QUOTAS_PROJECT_FAILURE',
)<void, CollectorProjectQuota[], string>();

export const getCollectorProjectQuotaByIdAction = createAsyncAction(
  '@collector/GET_QUOTA_PROJECT_BY_ID_REQ',
  '@collector/GET_QUOTA_PROJECT_BY_ID_SUCCESS',
  '@collector/GET_QUOTA_PROJECT_BY_ID_FAILURE',
)<void, CollectorProjectQuota, string>();

export const setCollectorProjectQuotaAction = createAsyncAction(
  '@collector/SET_QUOTA_PROJECT_REQ',
  '@collector/SET_QUOTA_PROJECT_SUCCESS',
  '@collector/SET_QUOTA_PROJECT_FAILURE',
)<void, CollectorProjectQuota, string>();

export function fetchQuota(projectName: string, fetchedCallback?: (quota: CollectorProjectQuota) => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(getCollectorProjectQuotaAction.request());
    CollectorService.getProjectQuotaByProjectName(
      projectName,
      (quota: CollectorProjectQuota) => {
        dispatch(getCollectorProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getCollectorProjectQuotaAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function fetchQuotaSafe(
  projectName: string,
  fetchedCallback?: (quota: CollectorProjectQuota | null) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(getCollectorProjectQuotaAction.request());
    CollectorService.getProjectQuotaByProjectName(
      projectName,
      (quota: CollectorProjectQuota | null) => {
        dispatch(getCollectorProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getCollectorProjectQuotaAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function fetchQuotaByQuotaId(
  quotaId: string,
  fetchedCallback?: (quota: CollectorProjectQuota) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(getCollectorProjectQuotaByIdAction.request());
    CollectorService.getProjectQuotaById(
      quotaId,
      (quota: CollectorProjectQuota) => {
        dispatch(getCollectorProjectQuotaByIdAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getCollectorProjectQuotaByIdAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function getListQuotasForAvailableProjects(
  projectNames: string[],
  fetchedCallback?: (quota: CollectorProjectQuota[]) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(getCollectorProjectAllQuotasAction.request());
    CollectorService.getListQuotasForAvailableProjects(
      projectNames,
      (quotas: CollectorProjectQuota[]) => {
        dispatch(getCollectorProjectAllQuotasAction.success(quotas));
        if (fetchedCallback) {
          fetchedCallback(quotas);
        }
      },
      (error) => {
        dispatch(getCollectorProjectAllQuotasAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function setQuota(
  projectName: string,
  quotaValue: number,
  fetchedCallback?: (quota: CollectorProjectQuota) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(setCollectorProjectQuotaAction.request());
    CollectorService.setProjectQuota(
      projectName,
      quotaValue,
      (quota: CollectorProjectQuota) => {
        dispatch(setCollectorProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(setCollectorProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

import { createAsyncAction } from 'typesafe-actions';

import OsirisService from '../../services/OsirisService';
import * as notificationActions from '../notification/Actions';

import {
  OsirisCheckQuotaProject,
  OsirisCheckQuotaRequest,
  OsirisQuota,
  OsirisQuotaType,
  OsirisTrafficQuotaProject,
  OsirisTrafficQuotaRequest,
} from './Type';

export const getOsirisCheckProjectQuotaAction = createAsyncAction(
  '@osiris/GET_CHECK_QUOTA_PROJECT_REQ',
  '@osiris/GET_CHECK_QUOTA_PROJECT_SUCCESS',
  '@osiris/GET_CHECK_QUOTA_PROJECT_FAILURE',
)<void, OsirisCheckQuotaProject, string>();

export const getOsirisTrafficProjectQuotaAction = createAsyncAction(
  '@osiris/GET_TRAFFIC_QUOTA_PROJECT_REQ',
  '@osiris/GET_TRAFFIC_QUOTA_PROJECT_SUCCESS',
  '@osiris/GET_TRAFFIC_QUOTA_PROJECT_FAILURE',
)<void, OsirisTrafficQuotaProject, string>();

export const createOsirisCheckProjectQuotaAction = createAsyncAction(
  '@osiris/CREATE_CHECK_QUOTA_PROJECT_REQ',
  '@osiris/CREATE_CHECK_QUOTA_PROJECT_SUCCESS',
  '@osiris/CREATE_CHECK_QUOTA_PROJECT_FAILURE',
)<void, OsirisCheckQuotaRequest, string>();

export const createOsirisTrafficProjectQuotaAction = createAsyncAction(
  '@osiris/CREATE_TRAFFIC_QUOTA_PROJECT_REQ',
  '@osiris/CREATE_TRAFFIC_QUOTA_PROJECT_SUCCESS',
  '@osiris/CREATE_TRAFFIC_QUOTA_PROJECT_FAILURE',
)<void, OsirisTrafficQuotaRequest, string>();

export const updateOsirisCheckProjectQuotaAction = createAsyncAction(
  '@osiris/UPDATE_CHECK_QUOTA_PROJECT_REQ',
  '@osiris/UPDATE_CHECK_QUOTA_PROJECT_SUCCESS',
  '@osiris/UPDATE_CHECK_QUOTA_PROJECT_FAILURE',
)<void, OsirisCheckQuotaRequest, string>();

export const updateOsirisTrafficProjectQuotaAction = createAsyncAction(
  '@osiris/UPDATE_TRAFFIC_QUOTA_PROJECT_REQ',
  '@osiris/UPDATE_TRAFFIC_QUOTA_PROJECT_SUCCESS',
  '@osiris/UPDATE_TRAFFIC_QUOTA_PROJECT_FAILURE',
)<void, OsirisTrafficQuotaRequest, string>();

export const listOsirisCheckQuotasAction = createAsyncAction(
  '@osiris/GET_CHECK_QUOTAS_REQ',
  '@osiris/GET_CHECK_QUOTAS_SUCCESS',
  '@osiris/GET_CHECK_QUOTAS_FAILURE',
)<void, OsirisCheckQuotaProject[], string>();

export const listOsirisTrafficQuotasAction = createAsyncAction(
  '@osiris/GET_TRAFFIC_QUOTAS_REQ',
  '@osiris/GET_TRAFFIC_QUOTAS_SUCCESS',
  '@osiris/GET_TRAFFIC_QUOTAS_FAILURE',
)<void, OsirisTrafficQuotaProject[], string>();

export function fetchQuotaForProject(
  projectName: string,
  fetchedCallback?: (quota: OsirisTrafficQuotaProject[]) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(getOsirisCheckProjectQuotaAction.request());
    OsirisService.getProjectQuota(
      projectName,
      (quota: OsirisQuota[]) => {
        dispatch(getOsirisCheckProjectQuotaAction.success(quota.filter((quota) => quota.quotaType.name === OsirisQuotaType.CHECK_QUOTA)[0]));
        dispatch(getOsirisTrafficProjectQuotaAction.success(quota.filter((quota) => quota.quotaType.name === OsirisQuotaType.TRAFFIC_QUOTA)[0]));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getOsirisCheckProjectQuotaAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function createCheckQuota(
  projectName: string,
  quota: OsirisCheckQuotaRequest,
  fetchedCallback?: (quota: OsirisCheckQuotaRequest) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(createOsirisCheckProjectQuotaAction.request());
    OsirisService.createProjectCheckQuota(
      projectName,
      quota,
      () => {
        dispatch(createOsirisCheckProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(createOsirisCheckProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function createTrafficQuota(
  projectName: string,
  quota: OsirisTrafficQuotaRequest,
  fetchedCallback?: (quota: OsirisTrafficQuotaRequest) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(createOsirisTrafficProjectQuotaAction.request());
    OsirisService.createProjectTrafficQuota(
      projectName,
      quota,
      () => {
        dispatch(createOsirisTrafficProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(createOsirisTrafficProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function updateCheckQuota(
  projectName: string,
  quota: OsirisCheckQuotaRequest,
  fetchedCallback?: (quota: OsirisCheckQuotaRequest) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(updateOsirisCheckProjectQuotaAction.request());
    OsirisService.updateProjectCheckQuota(
      projectName,
      quota,
      () => {
        dispatch(updateOsirisCheckProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(updateOsirisCheckProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function updateTrafficQuota(
  projectName: string,
  quota: OsirisTrafficQuotaRequest,
  fetchedCallback?: (quota: OsirisTrafficQuotaRequest) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(updateOsirisTrafficProjectQuotaAction.request());
    OsirisService.updateProjectTrafficQuota(
      projectName,
      quota,
      () => {
        dispatch(updateOsirisTrafficProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(updateOsirisTrafficProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function fetchQuotas(fetchedCallback?: (quotas: OsirisTrafficQuotaProject[]) => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(listOsirisCheckQuotasAction.request());
    OsirisService.getQuotas(
      (quota: OsirisTrafficQuotaProject[]) => {
        dispatch(listOsirisCheckQuotasAction.success(quota.filter((quota) => quota.quotaType.name === OsirisQuotaType.CHECK_QUOTA)));
        dispatch(listOsirisTrafficQuotasAction.success(quota.filter((quota) => quota.quotaType.name === OsirisQuotaType.TRAFFIC_QUOTA)));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(listOsirisCheckQuotasAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

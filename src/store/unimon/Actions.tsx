import { createAsyncAction } from 'typesafe-actions';

import UnimonService from '../../services/UnimonService';
import * as notificationActions from '../notification/Actions';

import { UnimonProjectQuota, UnimonProjectRequestQuota } from './Type';

export const getUnimonProjectQuotaAction = createAsyncAction(
  '@unimon/GET_QUOTA_PROJECT_REQ',
  '@unimon/GET_QUOTA_PROJECT_SUCCESS',
  '@unimon/GET_QUOTA_PROJECT_FAILURE',
)<void, UnimonProjectQuota, string>();

export const getUnimonQuotasAction = createAsyncAction('@unimon/GET_QUOTAS_REQ', '@unimon/GET_QUOTAS_SUCCESS', '@unimon/GET_QUOTAS_FAILURE')<
  void,
  Map<string, UnimonProjectQuota>,
  string
>();

export const setUnimonProjectQuotaAction = createAsyncAction(
  '@unimon/SET_QUOTA_PROJECTa_REQ',
  '@unimon/SET_QUOTA_PROJECT_SUCCESS',
  '@unimon/SET_QUOTA_PROJECT_FAILURE',
)<void, UnimonProjectRequestQuota, string>();

export function fetchQuota(projectName: string, fetchedCallback?: (quota: UnimonProjectQuota) => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(getUnimonProjectQuotaAction.request());
    UnimonService.getProjectQuota(
      projectName,
      (quota: UnimonProjectQuota) => {
        dispatch(getUnimonProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getUnimonProjectQuotaAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function fetchQuotas(fetchedCallback?: (quotas: any) => void, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(getUnimonQuotasAction.request());
    UnimonService.getListQuota(
      (quota: any) => {
        dispatch(getUnimonQuotasAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getUnimonQuotasAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function setQuota(
  projectName: string,
  quota: UnimonProjectRequestQuota,
  fetchedCallback?: (quota: UnimonProjectRequestQuota) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(setUnimonProjectQuotaAction.request());
    UnimonService.setProjectQuota(
      projectName,
      quota,
      () => {
        dispatch(setUnimonProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(setUnimonProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

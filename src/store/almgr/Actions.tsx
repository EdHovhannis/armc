import { createAsyncAction } from 'typesafe-actions';

import AlmgrService from '../../services/AlmgrService';
import * as notificationActions from '../notification/Actions';

import { AlmgrProjectQuota, AlmgrQuota, AlmgrReducedQuota } from './Type';

export const getAlmgrProjectQuotaAction = createAsyncAction(
  '@almgr/GET_QUOTA_PROJECT_REQ',
  '@almgr/GET_QUOTA_PROJECT_SUCCESS',
  '@almgr/GET_QUOTA_PROJECT_FAILURE',
)<void, AlmgrQuota, string>();

export const setAlmgrProjectQuotaAction = createAsyncAction(
  '@almgr/SET_QUOTA_PROJECTa_REQ',
  '@almgr/SET_QUOTA_PROJECT_SUCCESS',
  '@almgr/SET_QUOTA_PROJECT_FAILURE',
)<void, AlmgrReducedQuota, string>();

export function fetchQuota(
  projectName: string,
  fetchedCallback?: (projectQuota: AlmgrProjectQuota) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(getAlmgrProjectQuotaAction.request());
    AlmgrService.getProjectQuota(
      projectName,
      (quota) => {
        dispatch(getAlmgrProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(getAlmgrProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function setQuota(
  projectName: string,
  quota: AlmgrReducedQuota,
  fetchedCallback?: (quota: AlmgrReducedQuota) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch) => {
    dispatch(setAlmgrProjectQuotaAction.request());
    AlmgrService.setProjectQuota(
      projectName,
      quota,
      () => {
        dispatch(setAlmgrProjectQuotaAction.success(quota));
        if (fetchedCallback) {
          fetchedCallback(quota);
        }
      },
      (error) => {
        dispatch(setAlmgrProjectQuotaAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

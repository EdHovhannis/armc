import { createAsyncAction } from 'typesafe-actions';

import OverdraftService from '../../services/OverdraftService';

import { OverdraftConfig } from './Types';

export const getFulltextOverdraftStateAction = createAsyncAction(
  '@overdraft/FETCH_UNIT_ROLES_REQ',
  '@overdraft/FETCH_UNIT_ROLES_SUCC',
  '@overdraft/FETCH_UNIT_ROLES_FAIL',
)<void, OverdraftConfig, string>();

export const setFulltextOverdraftStateAction = createAsyncAction(
  '@overdraft/CHECK_ROLE_REQ',
  '@overdraft/CHECK_ROLES_SUCC',
  '@overdraft/CHECK_ROLE_FAIL',
)<void, OverdraftConfig, string>();

export const getArchiveOverdraftStateAction = createAsyncAction(
  '@overdraft/CHECK_ROLE_PARENT_REQ',
  '@overdraft/CHECK_ROLES_PARENT_SUCC',
  '@overdraft/CHECK_ROLE_PARENT_FAIL',
)<void, OverdraftConfig, string>();

export const setArchiveOverdraftStateAction = createAsyncAction(
  '@overdraft/FETCH_SHARING_STATUS_REQ',
  '@overdraft/FETCH_SHARING_STATUS_SUCC',
  '@overdraft/FETCH_SHARING_STATUS_FAIL',
)<void, OverdraftConfig, string>();

export const getFulltextOverdraftConfig = (okCallback?: (overdraft: OverdraftConfig) => void, errorCallback?: (error: string) => void) => {
  return (dispatch, getState) => {
    dispatch(getFulltextOverdraftStateAction.request());
    OverdraftService.getFulltextOverdraftConfig(
      (overdraft) => {
        dispatch(getFulltextOverdraftStateAction.success(overdraft));
        if (okCallback) {
          okCallback(overdraft);
        }
      },
      (str) => {
        dispatch(getFulltextOverdraftStateAction.failure(str));
        if (errorCallback) {
          errorCallback(str);
        }
      },
    );
  };
};

export const setFulltextOverdraftConfig = (
  overdraft: OverdraftConfig,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) => {
  return (dispatch, getState) => {
    dispatch(setFulltextOverdraftStateAction.request());
    OverdraftService.setFulltextOverdraftConfig(
      overdraft,
      () => {
        dispatch(setFulltextOverdraftStateAction.success(overdraft));
        if (okCallback) {
          okCallback();
        }
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(setFulltextOverdraftStateAction.failure(errorMsg));
        if (errorCallback) {
          errorCallback(errorMsg);
        }
      },
    );
  };
};

export const getArchiveOverdraftConfig = (okCallback?: (overdraft: OverdraftConfig) => void, errorCallback?: (error: string) => void) => {
  return (dispatch, getState) => {
    dispatch(getArchiveOverdraftStateAction.request());
    OverdraftService.getArchiveOverdraftConfig(
      (overdraft) => {
        dispatch(getArchiveOverdraftStateAction.success(overdraft));
        if (okCallback) {
          okCallback(overdraft);
        }
      },
      (str) => {
        dispatch(getArchiveOverdraftStateAction.failure(str));
        if (errorCallback) {
          errorCallback(str);
        }
      },
    );
  };
};

export const setArchiveOverdraftConfig = (
  overdraft: OverdraftConfig,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) => {
  return (dispatch, getState) => {
    dispatch(setArchiveOverdraftStateAction.request());
    OverdraftService.setArchiveOverdraftConfig(
      overdraft,
      () => {
        dispatch(setArchiveOverdraftStateAction.success(overdraft));
        if (okCallback) {
          okCallback();
        }
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(setArchiveOverdraftStateAction.failure(errorMsg));
        if (errorCallback) {
          errorCallback(errorMsg);
        }
      },
    );
  };
};

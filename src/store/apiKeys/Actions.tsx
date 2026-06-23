import { createAsyncAction } from 'typesafe-actions';

import APIkeyService from '../../services/APIkeyService';
import { Versions } from '../config/Types';

import { APIkeyInfo, APIkeyParameters } from './Types';

export const createApiKeyAction = createAsyncAction('@apiKey/CREATE_REQ', '@apiKey/CREATE_SUCC', '@apiKey/CREATE_FAIL')<void, string, void>();

export const updateApiKeyAction = createAsyncAction('@apiKey/UPDATE_REQ', '@apiKey/UPDATE_SUCC', '@apiKey/UPDATE_FAIL')<void, void, void>();

export const deleteApiKeyAction = createAsyncAction('@apiKey/DELETE_REQ', '@apiKey/DELETE_SUCC', '@apiKey/DELETE_FAIL')<void, string, void>();

export const getApiKeyInfoForUserAction = createAsyncAction('@apiKey/USER_INFO_REQ', '@apiKey/USER_INFO_SUCC', '@apiKey/USER_INFO_FAIL')<
  void,
  APIkeyInfo,
  void
>();

export const getApiKeyInfoAction = createAsyncAction('@apiKey/INFO_REQ', '@apiKey/INFO_SUCC', '@apiKey/INFO_FAIL')<void, APIkeyInfo[], void>();

export const getTimeUnitsAction = createAsyncAction('@apiKey/TIME_REQ', '@apiKey/TIME_SUCC', '@apiKey/TIME_FAIL')<void, string[], void>();

export const getVersionAction = createAsyncAction('@apiKey/VERSION_REQ', '@apiKey/VERSION_SUCC', '@apiKey/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    APIkeyService.getVersion(
      (data, res) => {
        if (res) {
          dispatch(getVersionAction.success(res));
        } else {
          dispatch(getVersionAction.success(data));
        }
      },
      (str) => {
        dispatch(getVersionAction.failure());
      },
    );
  };
};

export const generateKey = (
  parameters: APIkeyParameters,
  user: string,
  okCallback?: (apiKey: string) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) => {
  return (dispatch, getState) => {
    dispatch(createApiKeyAction.request());
    APIkeyService.generateKey(
      parameters,
      user,
      (apiKey) => {
        dispatch(createApiKeyAction.success(apiKey));
        if (okCallback) {
          okCallback(apiKey);
        }
      },
      (errorMessage) => {
        dispatch(createApiKeyAction.failure());
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

export const updateKey = (
  parameters: APIkeyParameters | null,
  user: string,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) => {
  return (dispatch, getState) => {
    dispatch(updateApiKeyAction.request());
    APIkeyService.updateKey(
      parameters,
      user,
      () => {
        dispatch(updateApiKeyAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(updateApiKeyAction.failure());
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

export const deleteKey = (user: string, okCallback?: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => {
  return (dispatch, getState) => {
    dispatch(deleteApiKeyAction.request());
    APIkeyService.deleteKey(
      user,
      () => {
        dispatch(deleteApiKeyAction.success(user));
        if (okCallback) {
          okCallback();
        }
      },
      (errorMessage) => {
        dispatch(deleteApiKeyAction.failure());
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

export const getApiKeyInfo = (okCallback?: (apiKeyInfo: APIkeyInfo[]) => void, errorCallback?: (errorMessage: string) => void) => {
  return (dispatch, getState) => {
    dispatch(getApiKeyInfoAction.request());
    APIkeyService.getApiKeyInfo(
      (apiKeyInfo) => {
        dispatch(getApiKeyInfoAction.success(apiKeyInfo));
        if (okCallback) {
          okCallback(apiKeyInfo);
        }
      },
      (errorMessage) => {
        dispatch(getApiKeyInfoAction.failure());
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

export const getApiKeyInfoForUser = (user: string, okCallback?: (apiKeyInfo: APIkeyInfo) => void, errorCallback?: (errorMessage: string) => void) => {
  return (dispatch, getState) => {
    dispatch(getApiKeyInfoForUserAction.request());
    APIkeyService.getApiKeyInfoForUser(
      user,
      (apiKeyInfo) => {
        dispatch(getApiKeyInfoForUserAction.success(apiKeyInfo));
        if (okCallback) {
          okCallback(apiKeyInfo);
        }
      },
      (errorMessage) => {
        dispatch(getApiKeyInfoForUserAction.failure());
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

export const getTimeUnits = (okCallback?: (units: string[]) => void, errorCallback?: (errorMessage: string) => void) => {
  return (dispatch, getState) => {
    dispatch(getTimeUnitsAction.request());
    APIkeyService.getTimeUnits(
      (timeUnits) => {
        dispatch(getTimeUnitsAction.success(timeUnits));
        if (okCallback) {
          okCallback(timeUnits);
        }
      },
      (errorMessage) => {
        dispatch(getTimeUnitsAction.failure());
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

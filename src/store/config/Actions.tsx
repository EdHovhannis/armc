import { createAsyncAction } from 'typesafe-actions';

import ConfigService from '../../services/ConfigService';
import * as notificationActions from '../notification/Actions';

import { Config, IndexConfig, Versions } from './Types';

export const fetchConfigAction = createAsyncAction('@config/FETCH_CONFIG', '@config/FETCH_CONFIG_SUCC', '@config/FETCH_CONFIG_FAIL')<
  void,
  Config,
  string
>();

export const fetchPvmConfigAction = createAsyncAction('@config/FETCH_PVM_CONFIG', '@config/FETCH_PVM_CONFIG_SUCC', '@config/FETCH_PVM_CONFIG_FAIL')<
  void,
  Config,
  string
>();

export const fetchAnalyticalServiceConfigAction = createAsyncAction(
  '@config/FETCH_ANALYTICAL_SERVICE_CONFIG',
  '@config/FETCH_ANALYTICAL_SERVICE_CONFIG_SUCC',
  '@config/FETCH_ANALYTICAL_SERVICE_CONFIG_FAIL',
)<void, IndexConfig, string>();

export const fetchFulltextServiceConfigAction = createAsyncAction(
  '@config/FETCH_FULLTEXT_SERVICE_CONFIG',
  '@config/FETCH_FULLTEXT_SERVICE_CONFIG_SUCC',
  '@config/FETCH_FULLTEXT_SERVICE_CONFIG_FAIL',
)<void, IndexConfig, string>();

export const fetchHealthCheckConfigAction = createAsyncAction(
  '@config/FETCH_HEALTH_CHECK_CONFIG',
  '@config/FETCH_HEALTH_CHECK_CONFIG_SUCC',
  '@config/FETCH_HEALTH_CHECK_CONFIG_FAIL',
)<void, IndexConfig, string>();

export const getVersionAction = createAsyncAction('@config/VERSION_REQ', '@config/VERSION_SUCC', '@config/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    ConfigService.getVersion(
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

export function fetchConfig() {
  return (dispatch, getState) => {
    dispatch(fetchConfigAction.request());
    ConfigService.fetchConfig(
      (config: Config) => {
        dispatch(fetchConfigAction.success(config));
      },
      (error) => {
        dispatch(fetchConfigAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchPVMConfig() {
  return (dispatch, getState) => {
    dispatch(fetchPvmConfigAction.request());
    ConfigService.fetchConfigPVM(
      (config: Config) => {
        dispatch(fetchPvmConfigAction.success(config));
      },
      (error) => {
        dispatch(fetchPvmConfigAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchAnalyticalServiceConfig(okCallback?: (config: IndexConfig) => void, errorCallback?: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchAnalyticalServiceConfigAction.request());
    ConfigService.getIndexConfig(
      'analytical',
      (config: IndexConfig) => {
        dispatch(fetchAnalyticalServiceConfigAction.success(config));
        if (okCallback) {
          okCallback(config);
        }
      },
      (error) => {
        dispatch(fetchAnalyticalServiceConfigAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error));
        }
      },
    );
  };
}

export function fetchFulltextServiceConfig(okCallback?: (config: IndexConfig) => void, errorCallback?: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchFulltextServiceConfigAction.request());
    ConfigService.getIndexConfig(
      'fulltext',
      (config: IndexConfig) => {
        dispatch(fetchFulltextServiceConfigAction.success(config));
        if (okCallback) {
          okCallback(config);
        }
      },
      (error) => {
        dispatch(fetchFulltextServiceConfigAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error));
        }
      },
    );
  };
}

export function fetchHealthCheckConfig() {
  return (dispatch: any) => {
    dispatch(fetchHealthCheckConfigAction.request());
    ConfigService.getHealthCheckConfig(
      (config: any) => {
        dispatch(fetchHealthCheckConfigAction.success(config));
      },
      (error) => {
        dispatch(fetchHealthCheckConfigAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateHealthCheckConfig(serviceByZone: any, health: string | 'ON' | 'OFF') {
  return (dispatch: any) => {
    ConfigService.updateHealthCheckConfig(
      serviceByZone,
      health,
      () => dispatch(fetchHealthCheckConfig()),
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

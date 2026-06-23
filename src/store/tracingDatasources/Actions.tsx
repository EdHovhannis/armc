import { createAsyncAction } from 'typesafe-actions';

import TracingDatasourceService from '../../services/TracingDatasourceService';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';

import { TracingSupervisorDescription } from './Types';

export const fetchDatasourcesAction = createAsyncAction(
  '@TRACING_DATASOURCES/FETCH_DSS_REQ',
  '@TRACING_DATASOURCES/FETCH_DSS_SUCC',
  '@TRACING_DATASOURCES/FETCH_DSS_FAIL',
)<void, Array<TracingSupervisorDescription>, string>();

export const fetchDatasourceAction = createAsyncAction(
  '@TRACING_DATASOURCES/FETCH_DS_REQ',
  '@TRACING_DATASOURCES/FETCH_DS_SUCC',
  '@TRACING_DATASOURCES/FETCH_DS_FAIL',
)<void, TracingSupervisorDescription, string>();

export const createDatasourceAction = createAsyncAction(
  '@TRACING_DATASOURCES/CREATE_DS_REQ',
  '@TRACING_DATASOURCES/CREATE_DS_SUCC',
  '@TRACING_DATASOURCES/CREATE_DS_FAIL',
)<void, TracingSupervisorDescription, string>();

export const updateDatasourceAction = createAsyncAction(
  '@TRACING_DATASOURCES/UPDATE_DS_REQ',
  '@TRACING_DATASOURCES/UPDATE_DS_SUCC',
  '@TRACING_DATASOURCES/UPDATE_DS_FAIL',
)<void, object, string>();

export const deleteDatasourceAction = createAsyncAction(
  '@TRACING_DATASOURCES/DELETE_DS_REQ',
  '@TRACING_DATASOURCES/DELETE_DS_SUCC',
  '@TRACING_DATASOURCES/DELETE_DS_FAIL',
)<void, number, string>();

export const getVersionAction = createAsyncAction(
  '@TRACING_DATASOURCES/VERSION_REQ',
  '@TRACING_DATASOURCES/VERSION_SUCC',
  '@TRACING_DATASOURCES/VERSION_FAIL',
)<void, Versions[] | string, void>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    TracingDatasourceService.getVersion(
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

export function fetchDatasources() {
  return (dispatch, getState) => {
    dispatch(fetchDatasourcesAction.request());
    TracingDatasourceService.fetchDatasources(
      (datasources: TracingSupervisorDescription[]) => {
        dispatch(fetchDatasourcesAction.success(datasources));
      },
      (error) => {
        dispatch(fetchDatasourcesAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchDatasource(id: number) {
  return (dispatch, getState) => {
    dispatch(fetchDatasourceAction.request());
    TracingDatasourceService.fetchDatasourceById(
      id,
      (datasources: TracingSupervisorDescription) => {
        dispatch(fetchDatasourceAction.success(datasources));
      },
      (error) => {
        dispatch(fetchDatasourceAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function createDatasource(
  name: string,
  projectId: number,
  traceSupervisorId: number,
  callsSupervisorId: number | undefined,
  treeSupervisorId: number | undefined,
  okCallback: () => void,
  errorCallback?: (msg) => void,
) {
  return (dispatch, getState) => {
    dispatch(createDatasourceAction.request());
    TracingDatasourceService.createDatasource(
      name,
      projectId,
      traceSupervisorId,
      callsSupervisorId,
      treeSupervisorId,
      (supervisor: TracingSupervisorDescription) => {
        dispatch(createDatasourceAction.success(supervisor));
        okCallback();
      },
      (error) => {
        dispatch(createDatasourceAction.failure(error));
        if (errorCallback) errorCallback(error);
        else dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateDatasource(id: number, name: string, traceSupervisorId: number, callsSupervisorId?: number, treeSupervisorId?: number) {
  return (dispatch, getState) => {
    dispatch(updateDatasourceAction.request());
    TracingDatasourceService.updateDatasource(
      id,
      name,
      traceSupervisorId,
      callsSupervisorId,
      treeSupervisorId,
      () => {
        dispatch(
          updateDatasourceAction.success({
            id: id,
            name: name,
            traceSupervisorId: traceSupervisorId,
            callsSupervisorId: callsSupervisorId,
            treeSupervisorId: treeSupervisorId,
          }),
        );
        // @ts-ignore
        dispatch(notificationActions.success(`Источник трейсинга ${id} был успешно обновлён`));
      },
      (error) => {
        dispatch(updateDatasourceAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function deleteDatasource(id: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(deleteDatasourceAction.request());
    TracingDatasourceService.deleteDatasource(
      id,
      () => {
        dispatch(deleteDatasourceAction.success(id));
        if (okCallback) {
          okCallback(id);
        }
      },
      (error) => {
        dispatch(deleteDatasourceAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(notificationActions.error(error));
      },
    );
  };
}

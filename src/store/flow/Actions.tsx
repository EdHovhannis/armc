import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import FlowService from '../../services/FlowService';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';

import { BusinessTask, DlqTopic, FlowDetails, FlowInputFormatListEnum, FlowOverview, FlowQuota, FlowServiceConfigs, QuotaUnits } from './Types';

export const createDialogOpen = createStandardAction('@flow/OPEN_DIALOG')<void>();
export const createDialogClose = createStandardAction('@flow/CLOSE_DIALOG')<void>();
export const setFlowFilterAction = createStandardAction('@flow/SET_FILTER')<FilterMenuItem[] | undefined>();

export const fetchOverviewAction = createAsyncAction('@flow/FETCH_OVERVIEW_REQ', '@flow/FETCH_OVERVIEW_SUCC', '@flow/FETCH_OVERVIEW_FAIL')<
  void,
  Array<FlowOverview>,
  void
>();

export const fetchFlowAction = createAsyncAction('@flow/FETCH_FLOW_REQ', '@flow/FETCH_FLOW_SUCC', '@flow/FETCH_FLOW_FAIL')<void, FlowDetails, void>();

export const createFlowAction = createAsyncAction('@flow/CREATE_FLOW_REQ', '@flow/CREATE_FLOW_SUCC', '@flow/CREATE_FLOW_FAIL')<
  void,
  FlowDetails,
  void
>();

export const addInstanceFlowAction = createAsyncAction('@flow/INSTANCE_FLOW_REQ', '@flow/INSTANCE_FLOW_SUCC', '@flow/INSTANCE_FLOW_FAIL')<
  void,
  number,
  void
>();

export const updateInstanceFlowAction = createAsyncAction(
  '@flow/UPDATE_INSTANCE_FLOW_REQ',
  '@flow/UPDATE_INSTANCE_FLOW_SUCC',
  '@flow/UPDATE_INSTANCE_FLOW_FAIL',
)<void, void, void>();

export const deleteInstanceFlowAction = createAsyncAction(
  '@flow/DELETE_INSTANCE_FLOW_REQ',
  '@flow/DELETE_INSTANCE_FLOW_SUCC',
  '@flow/DELETE_INSTANCE_FLOW_FAIL',
)<void, void, void>();

export const updateFlowAction = createAsyncAction('@flow/UPDATE_FLOW_REQ', '@flow/UPDATE_FLOW_SUCC', '@flow/UPDATE_FLOW_FAIL')<
  number,
  number,
  number
>();

export const deleteFlowAction = createAsyncAction('@flow/DELETE_FLOW_REQ', '@flow/DELETE_FLOW_SUCC', '@flow/DELETE_FLOW_FAIL')<
  number,
  number,
  number
>();

export const suspendFlowAction = createAsyncAction('@flow/PAUSE_FLOW_REQ', '@flow/PAUSE_FLOW_SUCC', '@flow/PAUSE_FLOW_FAIL')<
  number,
  number,
  number
>();

export const resumeFlowAction = createAsyncAction('@flow/RESUME_FLOW_REQ', '@flow/RESUME_FLOW_SUCC', '@flow/RESUME_FLOW_FAIL')<
  number,
  number,
  number
>();

export const fetchQuotasActions = createAsyncAction('@flow/FETCH_QUOTAS_REQ', '@flow/FETCH_QUOTAS_SUCC', '@flow/FETCH_QUOTAS_FAIL')<
  void,
  FlowQuota[],
  void
>();

export const updateQuotasActions = createAsyncAction('@flow/UPD_QUOTAS_REQ', '@flow/UPD_QUOTAS_SUCC', '@flow/UPD_QUOTAS_FAIL')<
  void,
  [number, number],
  void
>();

export const fetchTimeZonesActions = createAsyncAction('@kafka/FETCH_TIMEZONES_REQ', '@kafka/FETCH_TIMEZONES_SUCC', '@kafka/FETCH_TIMEZONES_FAIL')<
  void,
  Array<string>,
  void
>();

export const getVersionAction = createAsyncAction('@flow/VERSION_REQ', '@flow/VERSION_SUCC', '@flow/VERSION_FAIL')<void, Versions[] | string, void>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    FlowService.getVersion(
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

export function fetchTimeZones() {
  return (dispatch, getState) => {
    dispatch(fetchTimeZonesActions.request());
    FlowService.fetchAvailableTimeZones(
      (formats) => {
        dispatch(fetchTimeZonesActions.success(formats));
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}
export function fetchOverview(buissinessTask: string) {
  return (dispatch, getState) => {
    dispatch(fetchOverviewAction.request());
    FlowService.fetchOverviews(
      buissinessTask,
      (flow: FlowOverview[]) => {
        dispatch(fetchOverviewAction.success(flow));
      },
      (error) => {
        dispatch(fetchOverviewAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchFlow(flowId: number) {
  return (dispatch, getState) => {
    dispatch(fetchFlowAction.request());
    FlowService.fetchFlowById(
      flowId,
      (flow: FlowDetails) => {
        flow.nodes = flow.jobConfiguration?.graph;
        flow.deadLetterQueue = flow.jobConfiguration?.deadLetterQueue;
        flow.useGlobalConsumerGroup = flow.jobConfiguration!.useGlobalConsumerGroup;
        dispatch(fetchFlowAction.success(flow));
      },
      (error) => {
        dispatch(fetchFlowAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function createFlow(
  name: string,
  projectId: number,
  data: string,
  businessTask: BusinessTask,
  useGlobalConsumerGroup: boolean,
  dlqTopic: DlqTopic | undefined,
  callback?: (id: number) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(createFlowAction.request());
    if (!errorCallback) dispatch(notificationActions.info('Задача запускается, это займёт некоторое время ( ~10 сек)'));
    FlowService.createFlow(
      name,
      projectId,
      data,
      businessTask,
      useGlobalConsumerGroup,
      dlqTopic,
      (flow: FlowDetails) => {
        dispatch(notificationActions.success('Задача ' + name + ' была успешно запущена'));
        if (callback) callback(flow.id);
        dispatch(createFlowAction.success(flow));
      },
      (error) => {
        if (errorCallback) errorCallback(error);
        dispatch(createFlowAction.failure());
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function addInstanceFlow(
  flowId: number,
  zoneId: string,
  startFlow?: boolean,
  callback?: (id: number) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(addInstanceFlowAction.request());
    if (!errorCallback) dispatch(notificationActions.info('Создается экземпляр, это может занять некоторое время.'));
    FlowService.addInstanceFlow(
      flowId,
      zoneId,
      startFlow,
      (id: number) => {
        dispatch(addInstanceFlowAction.success(id));
        if (!errorCallback) dispatch(notificationActions.success('Экземпляр был успешно создан'));
        if (callback) {
          callback(id);
        }
      },
      (error) => {
        if (errorCallback) errorCallback(error);
        else dispatch(notificationActions.error(error.message));
        dispatch(addInstanceFlowAction.failure());
      },
    );
  };
}

export function updateInstanceFlow(
  flowId: number,
  zoneId: string,
  callback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(updateInstanceFlowAction.request());
    FlowService.updateInstanceFlow(
      flowId,
      zoneId,
      () => {
        dispatch(updateInstanceFlowAction.success());
        if (callback) {
          callback();
        }
      },
      (error) => {
        if (errorCallback) errorCallback(error);
        dispatch(updateInstanceFlowAction.failure());
        if (!errorCallback) dispatch(notificationActions.error(error.message));
      },
    );
  };
}

export function deleteInstances(
  flowId: number,
  zoneId: string,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    FlowService.deleteInstanceFlow(
      flowId,
      zoneId,
      () => {
        if (okCallback) okCallback();
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        if (!errorCallback) dispatch(notificationActions.error(error.message));
      },
    );
  };
}

export function deleteInstanceFlow(
  flowId: number,
  zoneId: string,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(deleteInstanceFlowAction.request());
    // dispatch(notificationActions.info("Удаляется экземпляр, это может занять некоторое время."));
    FlowService.deleteInstanceFlow(
      flowId,
      zoneId,
      () => {
        dispatch(deleteInstanceFlowAction.success());
        if (okCallback) {
          okCallback();
        } else {
          dispatch(notificationActions.success('Экземпляр был успешно удален'));
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error.message));
        }
        dispatch(deleteInstanceFlowAction.failure());
      },
    );
  };
}

export function updateFlow(
  flowId: number,
  name: string,
  projectId: number,
  data: string,
  useGlobalConsumerGroup: boolean,
  dlqTopic: DlqTopic | undefined,
  callback?: (id: number) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(updateFlowAction.request(flowId));
    if (!errorCallback) dispatch(notificationActions.info('Задача обновляется, это займёт некоторое время  ( ~10 сек)'));
    FlowService.updateFlow(
      flowId,
      name,
      projectId,
      data,
      useGlobalConsumerGroup,
      dlqTopic,
      () => {
        if (callback) callback(flowId);
        if (!errorCallback) dispatch(notificationActions.success('Задача ' + flowId + ' была успешно обновлена'));
        dispatch(updateFlowAction.success(flowId));
      },
      (error) => {
        if (errorCallback) errorCallback(error);
        dispatch(updateFlowAction.failure(flowId));
        if (!errorCallback) dispatch(notificationActions.error(error.message));
      },
    );
  };
}

export function deleteFlow(flowId: number, callback?: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) {
  return (dispatch, getState) => {
    dispatch(deleteFlowAction.request(flowId));
    if (!errorCallback) dispatch(notificationActions.info('Задача удаляется, это займёт некоторое время  ( ~10 сек)'));
    FlowService.deleteFlow(
      flowId,
      () => {
        if (callback) callback();
        if (!errorCallback) dispatch(notificationActions.success('Задача ' + flowId + ' была удалена'));
        dispatch(deleteFlowAction.success(flowId));
      },
      (error) => {
        if (errorCallback) errorCallback(error);
        else dispatch(notificationActions.error(error.message));
        dispatch(deleteFlowAction.failure(flowId));
      },
    );
  };
}

export function suspendFlow(
  flowId: number,
  zoneId: string,
  callback?: () => void | undefined,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(suspendFlowAction.request(flowId));
    if (!errorCallback) dispatch(notificationActions.info('Задача останавливается, это займёт некоторое время'));
    FlowService.suspendFlow(
      flowId,
      zoneId,
      () => {
        if (callback) callback();
        if (!errorCallback) dispatch(notificationActions.success('Задача ' + flowId + ' остановлена'));
        dispatch(suspendFlowAction.success(flowId));
      },
      (error) => {
        dispatch(suspendFlowAction.failure(flowId));
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error.message));
        }
      },
    );
  };
}

export function suspendInstances(
  flowId: number,
  zoneId: string,
  okCallback?: () => void | undefined,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    FlowService.suspendFlow(
      flowId,
      zoneId,
      () => {
        if (okCallback) okCallback();
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error.message));
        }
      },
    );
  };
}

export function resumeInstances(
  flowId: number,
  zoneId: string,
  okCallback?: () => void | undefined,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    FlowService.resumeFlow(
      flowId,
      zoneId,
      () => {
        if (okCallback) okCallback();
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error.message));
        }
      },
    );
  };
}

export function resumeFlow(
  flowId: number,
  zoneId: string,
  callback?: () => void | undefined,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(resumeFlowAction.request(flowId));
    if (!errorCallback) dispatch(notificationActions.info('Задача возобновляется, это займёт некотрое время ( ~10 сек) '));
    FlowService.resumeFlow(
      flowId,
      zoneId,
      () => {
        if (callback) callback();
        if (!errorCallback) dispatch(notificationActions.success('Задача ' + flowId + ' возобновлена'));
        dispatch(resumeFlowAction.success(flowId));
      },
      (error) => {
        dispatch(resumeFlowAction.failure(flowId));
        if (errorCallback) errorCallback(error);
        else dispatch(notificationActions.error(error.message));
      },
    );
  };
}

export function fetchQuotas(projectIds: Array<number>) {
  return (dispatch, getState) => {
    dispatch(fetchQuotasActions.request());
    FlowService.fetchQuota(
      projectIds,
      (quotas: FlowQuota[]) => {
        dispatch(fetchQuotasActions.success(quotas));
      },
      (error) => {
        dispatch(fetchQuotasActions.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateQuotas(projectId: number, maxQuotaSize: number) {
  return (dispatch, getState) => {
    dispatch(updateQuotasActions.request());
    FlowService.updateQuota(
      projectId,
      maxQuotaSize,
      () => {
        dispatch(updateQuotasActions.success([projectId, maxQuotaSize]));
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function setFlowFilter(filter: FilterMenuItem[] | undefined) {
  return (dispatch, getState) => {
    dispatch(setFlowFilterAction(filter));
  };
}

export const getFlowInputFormatListActions = createAsyncAction(
  '@flow/GET_INPUT_FORMAT_LIST_REQ',
  '@flow/GET_INPUT_FORMAT_LIST_SUCC',
  '@flow/GET_INPUT_FORMAT_LIST_FAIL',
)<void, FlowInputFormatListEnum[], string>();

export const getFlowInputFormatList = () => async (dispatch, getState) => {
  dispatch(getFlowInputFormatListActions.request());
  await FlowService.getInputFormatList(
    (inputFormatList: FlowInputFormatListEnum[]) => {
      dispatch(getFlowInputFormatListActions.success(inputFormatList));
    },
    (msg) => {
      dispatch(getFlowInputFormatListActions.failure(msg));
    },
  );
};

export const getFlowSchemaNamesActions = createAsyncAction(
  '@flow/GET_SCHEMA_NAMES_REQ',
  '@flow/GET_SCHEMA_NAMES_SUCC',
  '@flow/GET_SCHEMA_NAMES_FAIL',
)<void, string[], string>();

export const getFlowSchemaNames = () => async (dispatch, getState) => {
  dispatch(getFlowSchemaNamesActions.request());
  await FlowService.getSchemaNames(
    (schemaNames: string[]) => {
      dispatch(getFlowSchemaNamesActions.success(schemaNames));
    },
    (msg) => {
      dispatch(getFlowSchemaNamesActions.failure(msg));
    },
  );
};

export const setQuotaUnitsAction = createStandardAction('@flow/SET_QUOTA_UNITS')<QuotaUnits>();
export const resetUnitsAction = createStandardAction('@flow/RESET_QUOTA_UNITS')();

import { saveAs } from 'file-saver';
import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import PipelineService from '../../services/PipelineService';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';

import { Pipeline, PipelineInputFormatListEnum, PipelineMeta, PipelineShort, PipelineStatus, PipelineTechMeta } from './Types';

export const reqStart = createStandardAction('@pipeline/REQ_START')<void>();
export const reqFinished = createStandardAction('@pipeline/REQ_FINISH')<void>();

export const replaceCurrentPipelineAction = createStandardAction('@pipeline/REPLACE_CURRENT')<Pipeline>();
export const selectNewPipeline = createStandardAction('@pipeline/SELECT_NEW')<void>();
export const setPipelineFilterAction = createStandardAction('@pipeline/SET_FILTER')<{ filter: FilterMenuItem[] | undefined; isRefetch: boolean }>();

export const createPipelineAction = createAsyncAction(
  '@pipeline/CREATE_PIPELINE_REQ',
  '@pipeline/CREATE_PIPELINE_SUCCESS',
  '@pipeline/CREATE_PIPELINE_FAILURE',
)<void, any, string>();

export const listPipelinesAction = createAsyncAction(
  '@pipeline/LIST_PIPELINES_REQ',
  '@pipeline/LIST_PIPELINES_SUCCESS',
  '@pipeline/LIST_PIPELINES_FAILURE',
)<void, PipelineShort[], string>();

export const listPipelinesStatusAction = createAsyncAction(
  '@pipeline/LIST_PIPELINES_STATUS_REQ',
  '@pipeline/LIST_PIPELINES_STATUS_SUCCESS',
  '@pipeline/LIST_PIPELINES_STATUS_FAILURE',
)<void, Map<string, string>, string>();

export const pipelinesMetaAction = createAsyncAction(
  '@pipeline/META_PIPELINES_REQ',
  '@pipeline/META_PIPELINES_SUCCESS',
  '@pipeline/META_PIPELINES_FAILURE',
)<void, PipelineTechMeta, string>();

export const deletePipelineAction = createAsyncAction(
  '@pipeline/DELETE_PIPELINE_REQ',
  '@pipeline/DELETE_PIPELINE_SUCCESS',
  '@pipeline/DELETE_PIPELINE_FAILURE',
)<void, void, string>();

export const getPipelineInfoAction = createAsyncAction(
  '@pipeline/GET_PIPELINE_INFO_REQ',
  '@pipeline/GET_PIPELINE_INFO_SUCCESS',
  '@pipeline/GET_PIPELINE_INFO_FAILURE',
)<void, Pipeline, string>();

export const pipelinesSuspendAction = createAsyncAction(
  '@pipeline/SUSPEND_PIPELINE_INFO_REQ',
  '@pipeline/SUSPEND_PIPELINE_INFO_SUCCESS',
  '@pipeline/SUSPEND_PIPELINE_INFO_FAILURE',
)<string, string, string>();

export const pipelinesResumeAction = createAsyncAction(
  '@pipeline/RESUME_PIPELINE_INFO_REQ',
  '@pipeline/RESUME_PIPELINE_INFO_SUCCESS',
  '@pipeline/RESUME_PIPELINE_INFO_FAILURE',
)<string, string, string>();

export const getVersionAction = createAsyncAction('@pipeline/VERSION_REQ', '@pipeline/VERSION_SUCC', '@pipeline/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const pipelinesRefreshAction = createAsyncAction(
  '@pipeline/REFRESH_PIPELINE_INSTANCE_REQ',
  '@pipeline/REFRESH_PIPELINE_INSTANCE_SUCCESS',
  '@pipeline/REFRESH_PIPELINE_INSTANCE_FAILURE',
)<string, string, string>();

export const pipelinesAddInstanceAction = createAsyncAction(
  '@pipeline/ADD_PIPELINE_INSTANCE_REQ',
  '@pipeline/ADD_PIPELINE_INSTANCE_SUCCESS',
  '@pipeline/ADD_PIPELINE_INSTANCE_FAILURE',
)<string, string, string>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    PipelineService.getVersion(
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

export function getListPipelinesStatus(okCallback?: (status: Map<string, string>) => void, errorCallback?: (errorMsg: string) => void) {
  return (dispatch, getState) => {
    dispatch(listPipelinesStatusAction.request());

    PipelineService.listPipelinesStatus(
      (statuses) => {
        dispatch(listPipelinesStatusAction.success(statuses));
        if (okCallback) okCallback(statuses);
      },
      (msg: string) => {
        dispatch(listPipelinesStatusAction.failure(msg));
        if (errorCallback) errorCallback(msg);
      },
    );
  };
}

export function getPipelineInfo(
  projectShortName: string,
  name: string,
  okCallback?: (pipeline: Pipeline) => void,
  errorCallback?: (errorMsg: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(reqStart());

    PipelineService.getPipelineInfo(
      projectShortName,
      name,
      (pipeline: Pipeline) => {
        dispatch(getPipelineInfoAction.success(pipeline));
        if (okCallback) okCallback(pipeline);
        dispatch(reqFinished());
      },
      (msg: any) => {
        dispatch(getPipelineInfoAction.failure(msg.message));
        if (errorCallback) errorCallback(msg.message);
        dispatch(reqFinished());
      },
    );
  };
}

export function downloadPipeline(projectShortName: string, name: string) {
  return (dispatch, getState) => {
    PipelineService.getPipelineInfo(
      projectShortName,
      name,
      (pipeline: Pipeline) => {
        const blob = new Blob([JSON.stringify(pipeline, null, '\t')], {
          type: 'application/json',
        });
        saveAs(blob, pipeline.name + '.json');
        dispatch(notificationActions.success('Конфигурация задачи полнотекстового индекса ' + pipeline.name + ' сохранена'));
      },
      (errorMessage) => {
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function replaceCurrentPipeline(pipeline: Pipeline) {
  return replaceCurrentPipelineAction(pipeline);
}

export function deletePipeline(
  projectShortName: string,
  name: string,
  zoneId?: string,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(reqStart());

    PipelineService.deletePipeline(
      projectShortName,
      name,
      zoneId,
      () => {
        dispatch(deletePipelineAction.success);
        if (okCallback) okCallback();
        dispatch(reqFinished());
      },
      (msg: string) => {
        dispatch(deletePipelineAction.failure(msg));
        if (errorCallback) errorCallback(msg);
        dispatch(reqFinished());
      },
    );
  };
}

export function listPipelines(okCallback?: (pipelines: PipelineShort[]) => void, errorCallback?: (errorMsg: string) => void) {
  return (dispatch, getState) => {
    dispatch(listPipelinesAction.request());

    PipelineService.listPipelines(
      (pipelines: PipelineShort[]) => {
        dispatch(listPipelinesAction.success(pipelines));
        if (okCallback) okCallback(pipelines);
      },
      (errorText: string) => {
        dispatch(listPipelinesAction.failure);
        if (errorCallback) errorCallback(errorText);
      },
    );
  };
}

export function getPipelineMeta(
  projectShortName: string,
  name: string,
  zoneId: string,
  okCallback: (pipelines: PipelineMeta) => void,
  errorCallback?: (errorMsg: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(reqStart());

    PipelineService.getPipelineMetaInfo(
      projectShortName,
      name,
      zoneId,
      (pipelines: PipelineMeta) => {
        dispatch(
          pipelinesMetaAction.success({
            projectShortName: projectShortName,
            name: name,
            zoneId: zoneId,
            meta: pipelines,
          }),
        );
        if (okCallback) okCallback(pipelines);
        dispatch(reqFinished());
      },
      (errorText: string) => {
        dispatch(pipelinesMetaAction.failure);
        if (errorCallback) errorCallback(errorText);
        dispatch(reqFinished());
      },
    );
  };
}

export function resumePipeline(
  projectShortName: string,
  name: string,
  zoneId: string,
  okCallback?: (msg: string) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(pipelinesResumeAction.request(projectShortName + name + zoneId));
    // dispatch(notificationActions.info("Индекс запускается, это займёт некоторое время ( ~15 сек)."));
    PipelineService.resumePipeline(
      projectShortName,
      name,
      zoneId,
      (msg) => {
        dispatch(notificationActions.success('Индекс запущен.'));
        dispatch(pipelinesResumeAction.success(projectShortName + name + zoneId));
        if (okCallback) okCallback(msg);
        dispatch(reqFinished());
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(pipelinesResumeAction.failure(projectShortName + name + zoneId));
        if (errorCallback) errorCallback(errorMsg);
        dispatch(reqFinished());
      },
    );
  };
}

export function suspendPipeline(
  projectShortName: string,
  name: string,
  zoneId: string,
  okCallback?: (msg: string) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(pipelinesSuspendAction.request(projectShortName + name + zoneId));
    dispatch(notificationActions.info('Индекс останавливается, это займёт некоторое время ( ~15 сек).'));
    PipelineService.suspendPipeline(
      projectShortName,
      name,
      zoneId,
      (msg) => {
        dispatch(pipelinesSuspendAction.success(projectShortName + name + zoneId));
        if (okCallback) okCallback(msg);
        dispatch(reqFinished());
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(pipelinesSuspendAction.failure(projectShortName + name + zoneId));
        if (errorCallback) errorCallback(errorMsg);
        dispatch(reqFinished());
      },
    );
  };
}

export function setIndexFilter(filter: FilterMenuItem[] | undefined, isRefetch: boolean) {
  return (dispatch, getState) => {
    dispatch(setPipelineFilterAction({ filter: filter, isRefetch: isRefetch }));
  };
}

export function refreshInstancePipeline(
  projectShortName: string,
  name: string,
  zoneId: string,
  okCallback?: (msg: string) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(pipelinesRefreshAction.request('request'));
    PipelineService.refreshInstancePipeline(
      projectShortName,
      name,
      zoneId,
      (msg) => {
        dispatch(pipelinesRefreshAction.success(msg));
        if (okCallback) {
          okCallback(msg);
          dispatch(notificationActions.success('Экземлпяр успешно обновлен'));
        }
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(pipelinesRefreshAction.failure(errorMsg));
        if (errorCallback) {
          errorCallback(errorMsg);
          dispatch(notificationActions.error('Ошибка обновления экземпляра: ' + errorMsg.message));
        }
      },
    );
  };
}

export function addInstancePipeline(
  projectShortName: string,
  name: string,
  zoneId: string,
  okCallback?: (msg: string) => void,
  errorCallback?: (errorMsg: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(pipelinesAddInstanceAction.request('request'));
    PipelineService.addInstancePipeline(
      projectShortName,
      name,
      zoneId,
      (msg) => {
        dispatch(pipelinesAddInstanceAction.success(msg));
        if (okCallback) {
          okCallback(msg);
          // dispatch(notificationActions.success("Экземлпяр успешно создан"));
        }
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(pipelinesAddInstanceAction.failure(errorMsg));
        if (errorCallback) {
          errorCallback(errorMsg);
          // dispatch(notificationActions.error("Ошибка создания экземпляра"));
        }
      },
    );
  };
}

export const changeInstanceOverdraftAction = createAsyncAction(
  '@overdraftFulltext/CHANGE_OVERDRAFT_INSTANCE_REQ',
  '@overdraftFulltext/CHANGE_OVERDRAFT_INSTANCE_SUCC',
  '@overdraftFulltext/CHANGE_OVERDRAFT_INSTANCE_FAIL',
)<void, void, string>();

export function changeInstanceOverdraft(
  project: string,
  name: string,
  zoneId: string,
  value: number,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(changeInstanceOverdraftAction.request());
    PipelineService.changeInstanceOverdraft(
      project,
      name,
      zoneId,
      value,
      () => {
        dispatch(changeInstanceOverdraftAction.success());
        if (okCallback) okCallback();
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(changeInstanceOverdraftAction.failure(errorMsg));
        if (errorCallback) errorCallback(errorMsg);
      },
    );
  };
}

export const resetInstanceOverdraftAction = createAsyncAction(
  '@overdraftFulltext/RESET_OVERDRAFT_INSTANCE_REQ',
  '@overdraftFulltext/RESET_OVERDRAFT_INSTANCE_SUCC',
  '@overdraftFulltext/RESET_OVERDRAFT_INSTANCE_FAIL',
)<void, void, string>();

export function resetInstanceOverdraft(
  project: string,
  name: string,
  zoneId: string,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(resetInstanceOverdraftAction.request());
    PipelineService.resetInstanceOverdraft(
      project,
      name,
      zoneId,
      () => {
        dispatch(resetInstanceOverdraftAction.success());
        if (okCallback) okCallback();
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(resetInstanceOverdraftAction.failure(errorMsg.message));
        if (errorCallback) errorCallback(errorMsg);
      },
    );
  };
}

export const resetZoneOverdraftAction = createAsyncAction(
  '@overdraftFulltext/RESET_ZONE_OVERDRAFT_REQ',
  '@overdraftFulltext/RESET_ZONE_OVERDRAFT_SUCC',
  '@overdraftFulltext/RESET_ZONE_OVERDRAFT_FAIL',
)<void, void, string>();

export function resetZoneOverdraft(
  zoneId: string,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(resetZoneOverdraftAction.request());
    PipelineService.resetZoneOverdraft(
      zoneId,
      () => {
        dispatch(resetZoneOverdraftAction.success());
        if (okCallback) {
          okCallback();
          dispatch(notificationActions.success('Овердрафт успешно сброшен'));
        }
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(resetZoneOverdraftAction.failure(errorMsg));
        if (errorCallback) {
          errorCallback(errorMsg);
          dispatch(notificationActions.error('Ошибка при сбросе овердрафта ' + errorMsg.message));
        }
      },
    );
  };
}

export const getOverdraftValueAction = createAsyncAction(
  '@overdraftFulltext/GET_OVERDRAFT_VALUE_REQ',
  '@overdraftFulltext/GET_OVERDRAFT_VALUE_SUCC',
  '@overdraftFulltext/GET_OVERDRAFT_VALUE_FAIL',
)<void, number, string>();

export function getOverdraftValue(quota, fetchedCallback?: (value: number) => void) {
  return (dispatch, getState) => {
    dispatch(getOverdraftValueAction.request());
    PipelineService.getOverdraftValue(
      quota,
      (value: number) => {
        dispatch(getOverdraftValueAction.success(value));
        if (fetchedCallback) fetchedCallback(value);
      },
      (msg: string) => {
        dispatch(getOverdraftValueAction.failure(msg));
      },
    );
  };
}

export const getPipelineInputFormatListActions = createAsyncAction(
  '@pipeline/GET_INPUT_FORMAT_LIST_REQ',
  '@pipeline/GET_INPUT_FORMAT_LIST_SUCC',
  '@pipeline/GET_INPUT_FORMAT_LIST_FAIL',
)<void, PipelineInputFormatListEnum[], string>();

export const getPipelineInputFormatList = () => async (dispatch, getState) => {
  dispatch(getPipelineInputFormatListActions.request());
  await PipelineService.getInputFormatList(
    (inputFormatList: PipelineInputFormatListEnum[]) => {
      dispatch(getPipelineInputFormatListActions.success(inputFormatList));
    },
    (msg) => {
      dispatch(getPipelineInputFormatListActions.failure(msg));
    },
  );
};

export const getPipelineSchemaNamesActions = createAsyncAction(
  '@pipeline/GET_SCHEMA_NAMES_REQ',
  '@pipeline/GET_SCHEMA_NAMES_SUCC',
  '@pipeline/GET_SCHEMA_NAMES_FAIL',
)<void, string[], string>();

export const getArchiveSchemaNames = () => async (dispatch, getState) => {
  dispatch(getPipelineSchemaNamesActions.request());
  await PipelineService.getSchemaNames(
    (schemaNames: string[]) => {
      dispatch(getPipelineSchemaNamesActions.success(schemaNames));
    },
    (msg) => {
      dispatch(getPipelineSchemaNamesActions.failure(msg));
    },
  );
};

export const updatePipelineAction = createAsyncAction('@index/UPDATE_REQ', '@index/UPDATE_SUCC', '@index/UPDATE_FAIL')<void, void, string>();

export function updatePipeline(
  projectShortName: string,
  name: string,
  pipeline: any,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(updatePipelineAction.request());
    PipelineService.updatePipeline(
      projectShortName,
      name,
      pipeline,
      () => {
        if (okCallback) okCallback();
        dispatch(notificationActions.success('Задача полнотекстового индекса успешно обновлена'));
      },
      (errorMsg) => {
        dispatch(updatePipelineAction.failure(errorMsg.message));
        if (errorCallback) errorCallback(errorMsg);
      },
    );
  };
}

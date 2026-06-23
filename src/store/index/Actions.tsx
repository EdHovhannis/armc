import { Dispatch } from 'redux';
import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FulltextFlowEstimateResponse, Source } from '../../components/shared';
import SolrQueryService from '../../services/IndexQueryService';
import IndexQueryService from '../../services/IndexQueryService';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';
import { QuotaPipeline } from '../pipeline/Types';

import { EstimatedIndexQuota, Field, FulltextTask, IndexQuota, LuceneQuery, TimeRange } from './Types';

export const reqStart = createStandardAction('@project/REQ_START')<void>();
export const reqFinished = createStandardAction('@project/REQ_FINISH')<void>();

export const fetchFieldsByIndexIdAction = createAsyncAction(
  '@index/FETCH_FIELDS_BY_INDEX_ID_REQ',
  '@index/FETCH_FIELDS_BY_INDEX_ID_SUCCESS',
  '@index/FETCH_FIELDS_BY_INDEX_ID_FAILURE',
)<void, Field[], string>();

export const queryIndexByIdAction = createAsyncAction(
  '@index/QUERY_INDEX_BY_ID_REQ',
  '@index/QUERY_INDEX_BY_ID_SUCCESS',
  '@index/QUERY_INDEX_BY_ID_FAILURE',
)<void, any[], string>();

export const clearQueryIndexAction = createStandardAction('@index/CLEAR_QUERY_INDEX')<void>();

export const fulltextTaskListAction = createAsyncAction('@index/LIST_TASK_REQ', '@index/LIST_TASK_SUCCESS', '@index/LIST_TASK_FAILURE')<
  void,
  FulltextTask[],
  string
>();

export const fulltextTaskByProjectAndNameAction = createAsyncAction('@index/GET_TASK_REQ', '@index/GET_TASK_SUCCESS', '@index/GET_TASK_FAILURE')<
  void,
  any,
  string
>();

export const fulltextAllLabelsAction = createAsyncAction(
  '@index/LIST_ALL_LABELS_REQ',
  '@index/LIST_ALL_LABELS_SUCCESS',
  '@index/LIST_ALL_LABELS_FAILURE',
)<void, string[], string>();

export const fetchQuotaAction = createAsyncAction('@index/FETCH_QUOTA', '@index/FETCH_QUOTA_SUCCESS', '@index/FETCH_INDEXES_FAILURE')<
  void,
  IndexQuota,
  string
>();

export const fetchCalculatedQuotaAction = createAsyncAction(
  '@index/FETCH_CALCULATED_QUOTA',
  '@index/FETCH_CALCULATED_QUOTA_SUCCESS',
  '@index/FETCH_CALCULATED_QUOTA_FAILURE',
)<void, EstimatedIndexQuota, string>();

export const fetchCalculateMinAllowedMaxSizeBytesAction = createAsyncAction(
  '@index/FETCH_MAX_ALLOW_SIZE_REQ',
  '@index/FETCH_MAX_ALLOW_SIZE_SUCCES',
  '@index/FETCH_MAX_ALLOW_SIZE_FAILURE',
)<void, number, string>();

export const updateQuotaForProjectAction = createAsyncAction(
  '@index/UPDATE_QUOTA_FOR_PROJECT_REQ',
  '@index/UPDATE_QUOTA_FOR_PROJECT_SUCCESS',
  '@index/UPDATE_QUOTA_FOR_PROJECT_FAILURE',
)<void, IndexQuota, string>();

export const getVersionAction = createAsyncAction('@index/VERSION_REQ', '@index/VERSION_SUCC', '@index/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const fetchQuotasActions = createAsyncAction('@index/QUOTAS_REQ', '@index/QUOTAS_SUCC', '@index/QUOTAS_FAIL')<void, IndexQuota[], void>();

export const fetchLabelsActions = createAsyncAction('@index/LABELS_REQ', '@index/LABELS_SUCC', '@index/LABELS_FAIL')<void, string[], void>();

export const addLabelsActions = createAsyncAction('@index/ADD_LABEL_REQ', '@index/ADD_LABEL_SUCC', '@index/ADD_LABEL_FAIL')<void, void, void>();

export const deleteLabelsActions = createAsyncAction('@index/DELETE_LABEL_REQ', '@index/DELETE_LABEL_SUCC', '@index/DELETE_LABEL_FAIL')<
  void,
  void,
  void
>();

export const forceRotateIndexAction = createAsyncAction('@index/FORCE_ROTATE_REQ', '@index/FORCE_ROTATE_SUCC', '@index/FORCE_ROTATE_FAIL')<
  void,
  void,
  void
>();

export const updateIndexInstanceQuotasAction = createAsyncAction(
  '@index/UPDATE_QUOTAS_REQ',
  '@index/UPDATE_QUOTAS_SUCC',
  '@index/UPDATE_QUOTAS_FAIL',
)<void, void, void>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    SolrQueryService.getVersion(
      (data, res) => {
        if (res) {
          dispatch(getVersionAction.success(res));
        } else {
          dispatch(getVersionAction.success(data));
        }
      },
      (str) => {
        dispatch(getVersionAction.failure());
        dispatch(notificationActions.error(str));
      },
    );
  };
};

export function fetchFieldsByIndexId(projectShortName: string, indexName: string, fetchedCallback?: (fields: Field[]) => void) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    SolrQueryService.asyncFetchFieldsByIndexId(
      projectShortName,
      indexName,
      (fields: Field[]) => {
        dispatch(fetchFieldsByIndexIdAction.success(fields));
        if (fetchedCallback) fetchedCallback(fields);
        dispatch(reqFinished());
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function clearQueryIndex() {
  return clearQueryIndexAction();
}

export function queryIndexById(projectShortName: string, indexName: string, query: LuceneQuery, fetchedCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(queryIndexByIdAction.request());
    SolrQueryService.asyncQueryIndexById(
      projectShortName,
      indexName,
      query,
      (resp) => {
        dispatch(queryIndexByIdAction.success(resp));
        if (fetchedCallback) fetchedCallback(resp);
      },
      (msg) => {
        if (errorCallback) errorCallback(msg);
        dispatch(queryIndexByIdAction.failure(msg));
      },
    );
  };
}

export function fetchQuota(projectShortName: string, fetchedCallback?: (quota: IndexQuota) => void, errorCallback?: (error: string) => void) {
  return (dispatch: Dispatch) => {
    dispatch(reqStart());
    SolrQueryService.asyncFetchQuota(
      projectShortName,
      (quota: IndexQuota) => {
        dispatch(fetchQuotaAction.success(quota));
        if (fetchedCallback) fetchedCallback(quota);
      },
      (error) => {
        dispatch(fetchQuotaAction.failure(error));
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(notificationActions.error(error));
      },
    );
    dispatch(reqFinished());
  };
}

export function fetchCalculatedQuota(
  projectShortName: string,
  size: number,
  rate: number,
  duration: number,
  replicationFactor: number,
  sources: Source,
  fetchedCallback?: (quota: FulltextFlowEstimateResponse) => void,
  notFetchedCallback?: (msg: string) => void,
  indexName?: string,
  maxShard?: number | null,
  collShard?: number | null,
  sourcesParallelism?: number | null,
  nodesAndSinkParallelism?: number | null,
) {
  return (dispatch: Dispatch) => {
    dispatch(reqStart());
    SolrQueryService.calculateEstimate(
      {
        projectShortName,
        indexName,
        maxDataRateBytesPerSec: rate,
        maxSizeBytes: size || null,
        maxStoreDurationSec: duration || null,
        replicationFactor: replicationFactor,
        sources: sources,
        maxShardSizeBytes: maxShard,
        collectionShards: collShard,
        sourcesParallelism: sourcesParallelism,
        nodesAndSinkParallelism: nodesAndSinkParallelism,
      },
      (quota: FulltextFlowEstimateResponse) => {
        const estimateQuota: EstimatedIndexQuota = {
          currentQuota: {
            maxRate: quota.quota.currentQuota.maxDataRateBytesPerSec,
            maxVolume: quota.quota.currentQuota.maxSizeBytes,
            currentRate: quota.quota.currentQuota.currentDataRateBytesPerSec,
            currentVolume: quota.quota.currentQuota.currentSizeBytes,
            projectShortName: quota.quota.currentQuota.projectShortName,
          },
          plannedVolume: quota.quota.plannedSizeBytes,
          plannedRate: quota.quota.plannedDataRateBytesPerSec,
          approximatedRealIndexSizeBytes: quota.quota.approximatedRealIndexSizeBytes,
          approximatedStoreTimeSec: quota.quota.approximatedStoreTimeSec,
          quotaAllowed: quota.quota.quotaAllowed,
        };
        dispatch(fetchCalculatedQuotaAction.success(estimateQuota));
        if (fetchedCallback) fetchedCallback(quota);
      },
      (msg: string) => {
        dispatch(fetchCalculatedQuotaAction.failure(msg));
        if (notFetchedCallback) {
          notFetchedCallback(msg);
        }
      },
    );
    dispatch(reqFinished());
  };
}

export function fetchMinAllowIndexSize(
  rate,
  replicationFactor,
  fetchedCallback?: (maxAllowSize: number) => void,
  notFetchedCallback?: (msg: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    SolrQueryService.calculateMinAllowedMaxSizeBytes(
      rate,
      replicationFactor,
      (maxAllowSize: number) => {
        dispatch(fetchCalculateMinAllowedMaxSizeBytesAction.success(maxAllowSize));
        if (fetchedCallback) fetchedCallback(maxAllowSize);
      },
      (msg: string) => {
        dispatch(fetchCalculateMinAllowedMaxSizeBytesAction.failure(msg));
        if (notFetchedCallback) {
          notFetchedCallback(msg);
        }
      },
    );
    dispatch(reqFinished());
  };
}

export function updateQuotaForProject(projectShortName: string, volume: number, rate: number, callback?) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    SolrQueryService.asyncUpdateQuotaForProject(
      projectShortName,
      volume,
      rate,
      (quota) => {
        dispatch(
          updateQuotaForProjectAction.success({
            projectShortName: quota.projectShortName,
            maxVolume: quota.maxVolume,
            currentVolume: quota.currentVolume,
            maxRate: quota.maxRate,
            currentRate: quota.currentRate,
          }),
        );
        if (callback) callback({ projectShortName: quota.projectShortName, maxShards: quota.numShards, currentShards: quota.currentShards });
      },
      (message: string) => {
        dispatch(updateQuotaForProjectAction.failure(message));
        dispatch(notificationActions.error(message));
      },
    );
  };
}

export function setCurrentTimeRange(timeRange: TimeRange) {
  return (dispatch, getState) => {
    dispatch({ type: 'setCurrentTimeRange', timeRange: timeRange });
  };
}

export function getFulltextTasksList(labels?: string[], okCallback?: any, errorCallback?: any) {
  return (dispatch, getState) => {
    dispatch(fulltextTaskListAction.request());
    SolrQueryService.getFulltextTasksList(
      labels,
      (tasks) => {
        dispatch(fulltextTaskListAction.success(tasks));
        if (okCallback) okCallback(tasks);
      },
      (error) => {
        dispatch(fulltextTaskListAction.failure(error));
        if (errorCallback) errorCallback(error);
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getFulltextTaskByProjectAndName(projectShortName, indexName, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fulltextTaskByProjectAndNameAction.request());
    SolrQueryService.getFulltextTaskByProjectAndName(
      projectShortName,
      indexName,
      (task) => {
        dispatch(fulltextTaskByProjectAndNameAction.success());
        if (okCallback) okCallback(task);
      },
      (error) => {
        dispatch(fulltextTaskByProjectAndNameAction.failure(error));
        if (errorCallback) errorCallback(error);
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function getAllFulltextLabelsList(okCallback?: any, errorCallback?: any) {
  return (dispatch, getState) => {
    dispatch(fulltextAllLabelsAction.request());
    SolrQueryService.getFulltextLabelsList(
      (labels) => {
        dispatch(fulltextAllLabelsAction.success(labels));
        if (okCallback) okCallback(labels);
      },
      (error) => {
        dispatch(fulltextAllLabelsAction.failure(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function fetchQuotas() {
  return (dispatch, getState) => {
    dispatch(fetchQuotasActions.request());
    SolrQueryService.asyncFetchQuotas(
      (quotas: IndexQuota[]) => {
        dispatch(fetchQuotasActions.success(quotas));
      },
      (error) => {
        dispatch(fetchQuotasActions.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchFulltextLabels(
  projectShortName: string,
  name: string,
  okCallback?: (labels: string[]) => void,
  errorCallback?: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(fetchLabelsActions.request());
    SolrQueryService.fetchFulltextLabels(
      projectShortName,
      name,
      (labels) => {
        dispatch(fetchLabelsActions.success(labels));
        if (okCallback) {
          okCallback(labels);
        }
      },
      (error) => {
        dispatch(fetchLabelsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function addFulltextLabel(projectShortName: string, name: string, label: string, okCallback?, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(addLabelsActions.request());
    SolrQueryService.addFulltextLabel(
      projectShortName,
      name,
      label,
      () => {
        dispatch(addLabelsActions.success());
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(addLabelsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function deleteFulltextLabels(projectShortName: string, name: string, label: string, okCallback?, errorCallback?: (error: string) => void) {
  return (dispatch, getState) => {
    dispatch(deleteLabelsActions.request());
    SolrQueryService.deleteFulltextLabels(
      projectShortName,
      name,
      label,
      () => {
        dispatch(deleteLabelsActions.success());
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(deleteLabelsActions.failure());
        if (errorCallback) {
          errorCallback(error);
        }
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function forceRotateIndex(
  projectShortName: string,
  name: string,
  zoneId: string,
  okCallback?: (msg: string) => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch, getState) => {
    dispatch(forceRotateIndexAction.request());
    IndexQueryService.forceRotateIndex(
      projectShortName,
      name,
      zoneId,
      (msg) => {
        dispatch(notificationActions.success('Принудительная ротация индекса запущена.'));
        dispatch(forceRotateIndexAction.success());
        if (okCallback) okCallback(msg);
        dispatch(reqFinished());
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(forceRotateIndexAction.failure());
        if (errorCallback) errorCallback(errorMsg);
        dispatch(reqFinished());
      },
    );
  };
}

export function updateIndexInstanceQuotas(
  projectShortName: string,
  name: string,
  zoneId: string,
  quota: QuotaPipeline,
  okCallback?: () => void,
  errorCallback?: (errorMsg: { message: string; details?: string }) => void,
) {
  return (dispatch: any) => {
    dispatch(updateIndexInstanceQuotasAction.request());
    IndexQueryService.updateIndexInstanceQuota(
      projectShortName,
      name,
      zoneId,
      quota,
      () => {
        if (okCallback) okCallback();
        dispatch(reqFinished());
      },
      (errorMsg: { message: string; details?: string }) => {
        dispatch(updateIndexInstanceQuotasAction.failure());
        if (errorCallback) errorCallback(errorMsg);
        dispatch(reqFinished());
      },
    );
  };
}

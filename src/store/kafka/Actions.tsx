import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import KafkaService from '../../services/KafkaService';
import { Versions } from '../config/Types';
import { KafkaLimitsProps } from '../kafkaViewer/Types';
import * as notificationActions from '../notification/Actions';

import { ACLFilter, ClientACLRecord, KafkaQuota, KafkaTopic } from './Types';

export const createDialogOpen = createStandardAction('@kafka/OPEN_DIALOG')<void>();
export const createDialogClose = createStandardAction('@kafka/CLOSE_DIALOG')<void>();

export const setKafkaFilterAction = createStandardAction('@kafka/SET_FILTER')<FilterMenuItem[] | undefined>();

export const reqStart = createStandardAction('@kafka/REQ_START')<void>();
export const reqFinished = createStandardAction('@kafka/REQ_FINISH')<void>();

export const fetchActions = createAsyncAction('@kafka/FETCH_REQ', '@kafka/FETCH_SUCC', '@kafka/FETCH_FAIL')<void, KafkaTopic[], string>();

export const fetchTopicsForProjectActions = createAsyncAction(
  '@kafka/FETCH_FOR_PROJECT_REQ',
  '@kafka/FETCH_FOR_PROJECT_SUCC',
  '@kafka/FETCH_FOR_PROJECT_FAIL',
)<void, KafkaTopic[], string>();

export const createActions = createAsyncAction('@kafka/CREATE_REQ', '@kafka/CREATE_SUCC', '@kafka/CREATE_FAIL')<void, KafkaTopic, string>();

export const getTopicByNamesAction = createAsyncAction('@kafka/GET_TOPIC_REQ', '@kafka/GET_TOPIC_SUCC', '@kafka/GET_TOPIC_FAIL')<
  void,
  KafkaTopic,
  string
>();

export const updateAction = createAsyncAction('@kafka/UPDATE_REQ', '@kafka/UPDATE_SUCC', '@kafka/UPDATE_FAIL')<void, KafkaTopic, string>();

export const deleteActions = createAsyncAction('@kafka/DELETE_REQ', '@kafka/DELETE_SUCC', '@kafka/DELETE_FAIL')<void, number, string>();

export const fetchQuotasActions = createAsyncAction('@kafka/FETCH_QUOTAS_REQ', '@kafka/FETCH_QUOTAS_SUCC', '@kafka/FETCH_QUOTAS_FAIL')<
  void,
  KafkaQuota[],
  void
>();

export const updateQuotasActions = createAsyncAction('@kafka/UPD_QUOTAS_REQ', '@kafka/UPD_QUOTAS_SUCC', '@kafka/UPD_QUOTAS_FAIL')<
  void,
  [number, number],
  void
>();

export const addRecordActions = createAsyncAction('@kafka/ADD_RECORD_REQ', '@kafka/ADD_RECORD_SUCC', '@kafka/ADD_RECORD_FAIL')<void, number, void>();

export const createSchemaActions = createAsyncAction('@kafka/CREATE_SCHEMA_REQ', '@kafka/CREATE_SCHEMA_SUCC', '@kafka/CREATE_SCHEMA_FAIL')<
  void,
  any[],
  string
>();

export const fetchDateFormatsActions = createAsyncAction(
  '@kafka/FETCH_DATEFORMATS_REQ',
  '@kafka/FETCH_DATEFORMATS_SUCC',
  '@kafka/FETCH_DATEFORMATS_FAIL',
)<void, Array<string>, void>();

export const fetchACLRecordsActions = createAsyncAction('@kafka/FETCH_ALL_ACL_REQ', '@kafka/FETCH_ALL_ACL_SUCC', '@kafka/FETCH_ALL_ACL_FAIL')<
  void,
  Array<ClientACLRecord>,
  void
>();

export const addACLAction = createAsyncAction('@kafka/ADD_ACL_REQ', '@kafka/ADD_ACL_SUCC', '@kafka/ADD_ACL_FAIL')<void, void, string>();

export const deleteACLAction = createAsyncAction('@kafka/DELETE_ACL_REQ', '@kafka/DELETE_ACL_SUCC', '@kafka/DELETE_ACL_FAIL')<void, void, string>();

export const updateACLAction = createAsyncAction('@kafka/UPDATE_ACL_REQ', '@kafka/UPDATE_ACL_SUCC', '@kafka/UPDATE_ACL_FAIL')<void, void, string>();

export const getVersionAction = createAsyncAction('@kafka/VERSION_REQ', '@kafka/VERSION_SUCC', '@kafka/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const getAclEnableAction = createAsyncAction('@kafka/ENABLE_ACL_REQ', '@kafka/ENABLE_ACL_SUCC', '@kafka/ENABLE_ACL_FAIL')<
  void,
  boolean,
  void
>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    KafkaService.getVersion(
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

export const getAclEnable = (clusterId: number, okCallback?: (aclEnable: boolean) => void, errorCallback?) => {
  return (dispatch, getState) => {
    dispatch(getAclEnableAction.request());
    KafkaService.checkAclEnable(
      clusterId,
      (aclEnable: boolean) => {
        dispatch(getAclEnableAction.success(aclEnable));
        if (okCallback) okCallback(aclEnable);
      },
      (str) => {
        dispatch(getAclEnableAction.failure());
        if (errorCallback) errorCallback(str);
      },
    );
  };
};

export function fetchDateFormats() {
  return (dispatch, getState) => {
    dispatch(fetchDateFormatsActions.request());
    KafkaService.fetchAvailableDateFormats(
      (formats) => {
        dispatch(fetchDateFormatsActions.success(formats));
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchTopics() {
  return (dispatch, getState) => {
    dispatch(fetchActions.request());
    KafkaService.fetchTopics(
      (topics: KafkaTopic[]) => {
        dispatch(fetchActions.success(topics));
      },
      (error) => {
        dispatch(fetchActions.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchTopicsForProject(projectId: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchTopicsForProjectActions.request());
    KafkaService.fetchTopicsForProject(
      projectId,
      (topics: KafkaTopic[]) => {
        dispatch(fetchTopicsForProjectActions.success(topics));
        if (okCallback) {
          okCallback(topics);
        }
      },
      (error) => {
        dispatch(fetchTopicsForProjectActions.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

interface CreateTopicParams {
  name: string;
  partitions: number;
  replication: number;
  projectId: number;
  clusterId: string;
  topicFullName?: string;
  successCallback?: () => void;
  limits: KafkaLimitsProps;
}

export function createTopic({ name, partitions, replication, projectId, clusterId, topicFullName, successCallback, limits }: CreateTopicParams) {
  return (dispatch, getState) => {
    dispatch(createActions.request());
    KafkaService.createTopic(
      { name, partitions, replication, projectId, clusterId, topicFullName, ...limits },
      (topic: KafkaTopic) => {
        dispatch(createActions.success(topic));
        dispatch(notificationActions.success('Топик создан'));
        if (successCallback) successCallback();
      },
      (error) => {
        dispatch(notificationActions.error(error));
        dispatch(createActions.failure(error));
      },
    );
  };
}

export function updateTopic(topic_id, topic: KafkaTopic, successCallback) {
  return (dispatch, getState) => {
    dispatch(updateAction.request());
    KafkaService.updateTopic(
      topic_id,
      topic,
      () => {
        dispatch(updateAction.success(topic));
        dispatch(notificationActions.success('Топик обновлён'));
        if (successCallback) successCallback();
      },
      (error) => {
        dispatch(notificationActions.error(error));
        dispatch(updateAction.failure(error));
      },
    );
  };
}

export function deleteTopic(topic_id: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(deleteActions.request());
    KafkaService.deleteTopic(
      topic_id,
      () => {
        dispatch(deleteActions.success(topic_id));
        if (okCallback) okCallback();
        // dispatch(notificationActions.success("Топик удалён"))
      },
      (error) => {
        if (errorCallback) errorCallback(error);
        dispatch(deleteActions.failure(error.message));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function fetchQuotas(projectIds: Array<number>) {
  return (dispatch, getState) => {
    dispatch(fetchQuotasActions.request());
    KafkaService.fetchQuota(
      projectIds,
      (quotas: KafkaQuota[]) => {
        dispatch(fetchQuotasActions.success(quotas));
      },
      (error) => {
        dispatch(fetchQuotasActions.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateQuotas(projectId: number, maxPartitions: number) {
  return (dispatch, getState) => {
    dispatch(updateQuotasActions.request());
    KafkaService.updateQuota(
      projectId,
      maxPartitions,
      () => {
        dispatch(updateQuotasActions.success([projectId, maxPartitions]));
        // dispatch(notificationActions.success(""))
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getTopicByNameAndProjectShortName(topicName: string, projectShortName: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    KafkaService.fetchTopicByProjectShortNamedAndName(
      projectShortName,
      topicName,
      (topic: KafkaTopic) => {
        dispatch(getTopicByNamesAction.success(topic));
        if (okCallback) okCallback(topic);
        dispatch(reqFinished());
      },
      (error) => {
        dispatch(getTopicByNamesAction.failure(error));
        if (errorCallback) errorCallback(error);
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function addRecordToTopic(topicId: number, key: string, record: string, successCallback) {
  return (dispatch, getState) => {
    dispatch(addRecordActions.request());
    KafkaService.sendRecord(
      topicId,
      key,
      record,
      () => {
        dispatch(addRecordActions.success(topicId));
        dispatch(notificationActions.success('Сообщение добавлено в топик'));
        if (successCallback) successCallback();
      },
      (error) => {
        dispatch(deleteActions.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getACLRecordsWithFilter(topicName: string, projectShortName: string, successCallback?, aclFilter?: ACLFilter) {
  return (dispatch, getState) => {
    dispatch(fetchACLRecordsActions.request());
    KafkaService.fetchACLRecordsWithFilter(
      topicName,
      projectShortName,
      aclFilter,
      (records) => {
        dispatch(fetchACLRecordsActions.success(records));
        if (successCallback) successCallback(records);
      },
      (msg) => {
        dispatch(fetchACLRecordsActions.failure());
        dispatch(notificationActions.error(msg));
      },
    );
  };
}

export function addACL(topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback) {
  return (dispatch, getState) => {
    dispatch(addACLAction.request());
    KafkaService.addACL(
      topicName,
      projectShortName,
      aclRecords,
      () => {
        dispatch(addACLAction.success());
        dispatch(notificationActions.success('ACL запись успешно добавлена.'));
        if (successCallback) successCallback();
      },
      (errorMessage) => {
        dispatch(addACLAction.failure(errorMessage));
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function deleteACL(topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback) {
  return (dispatch, getState) => {
    dispatch(deleteACLAction.request());
    KafkaService.deleteACL(
      topicName,
      projectShortName,
      aclRecords,
      () => {
        dispatch(deleteACLAction.success());
        dispatch(notificationActions.success('ACL запись успешно удалена.'));
        if (successCallback) successCallback();
      },
      (errorMessage) => {
        dispatch(deleteACLAction.failure(errorMessage));
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function updateACL(topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback, matchType?: string) {
  return (dispatch, getState) => {
    dispatch(updateACLAction.request());
    KafkaService.updateACL(
      topicName,
      projectShortName,
      aclRecords,
      () => {
        dispatch(updateACLAction.success());
        dispatch(
          notificationActions.success(
            matchType === 'some' ? 'Перезапись ACL займет некоторое время ( ~15 сек)' : 'ACL запись успешно отредактирована.',
          ),
        );
        if (successCallback) successCallback();
      },
      (errorMessage) => {
        dispatch(updateACLAction.failure(errorMessage));
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function createSchema(topicId: Array<number>, flatten: boolean, onlyFlattened: boolean, excludedFields: Array<string>, successCallback) {
  return (dispatch, getState) => {
    dispatch(createSchemaActions.request());
    KafkaService.createSchemaFromTopic(
      topicId,
      flatten,
      onlyFlattened,
      excludedFields,
      (fields) => {
        dispatch(createSchemaActions.success(fields));
        if (successCallback) successCallback(fields);
      },
      (error) => {
        dispatch(createSchemaActions.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function setKafkaFilter(filter: FilterMenuItem[] | undefined) {
  return (dispatch, getState) => {
    dispatch(setKafkaFilterAction(filter));
  };
}

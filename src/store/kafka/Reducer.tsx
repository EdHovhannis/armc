import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { ClientACLRecord, KafkaQuota, KafkaTopic } from './Types';

export interface KafkaStoreState {
  topics: Array<KafkaTopic>;
  topicsByProjects: KafkaTopic[];
  currentTopic?: KafkaTopic;
  currentACLRecords?: Array<ClientACLRecord>;
  isLoadingACL: boolean;
  quotas: any;
  filter: FilterMenuItem[] | undefined;
  isQuotasLoading: boolean;
  receiveInProgress: boolean;
  createInProgress: boolean;
  deleteInProgress: boolean;
  opened: boolean;
  isLoading: boolean;
  schemaFields: any;
  isLoadingSchema: boolean;
  dateFormats: Array<string>;
  aclEnable: boolean;
  aclEnableLoading: boolean;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
}

const initialState: KafkaStoreState = {
  topics: new Array<KafkaTopic>(),
  topicsByProjects: [],
  currentTopic: undefined,
  currentACLRecords: undefined,
  isLoadingACL: false,
  isLoading: true,
  quotas: {},
  filter: undefined,
  isQuotasLoading: false,
  receiveInProgress: true,
  createInProgress: false,
  deleteInProgress: false,
  opened: false,
  schemaFields: [],
  isLoadingSchema: false,
  dateFormats: [],
  aclEnable: false,
  aclEnableLoading: false,
  version: [],
  isVersionLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<KafkaStoreState> = (state: KafkaStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.reqStart): {
      return { ...state, isLoading: true };
    }

    case getType(actions.fetchActions.request):
      return { ...state, receiveInProgress: true };

    case getType(actions.fetchActions.success): {
      return { ...state, receiveInProgress: false, topics: action.payload || ([] as KafkaTopic[]), currentTopic: undefined };
    }

    case getType(actions.fetchTopicsForProjectActions.request):
      return { ...state, receiveInProgress: true };

    case getType(actions.fetchTopicsForProjectActions.success): {
      const topics = state.topicsByProjects;

      if (action.payload) {
        action.payload.map((topic) => {
          if (!topics.map((topic) => topic.id).includes(topic.id)) {
            topics.push(topic);
          }
        });
      }

      return { ...state, receiveInProgress: false, topics: topics as KafkaTopic[], currentTopic: undefined };
    }

    case getType(actions.fetchTopicsForProjectActions.failure):
      return { ...state, receiveInProgress: false };

    case getType(actions.getAclEnableAction.request): {
      return { ...state, aclEnableLoading: true };
    }

    case getType(actions.getAclEnableAction.success): {
      return { ...state, aclEnableLoading: false, aclEnable: action.payload };
    }

    case getType(actions.getAclEnableAction.failure): {
      return { ...state, aclEnableLoading: false };
    }

    case getType(actions.fetchActions.failure):
      return { ...state, receiveInProgress: false };

    case getType(actions.fetchACLRecordsActions.request):
      return { ...state, isLoadingACL: true };

    case getType(actions.fetchACLRecordsActions.success):
      return { ...state, isLoadingACL: false, currentACLRecords: action.payload };

    case getType(actions.fetchACLRecordsActions.failure):
      return { ...state, isLoadingACL: false };

    case getType(actions.getTopicByNamesAction.request):
      return { ...state, isLoading: true };

    case getType(actions.getTopicByNamesAction.success):
      return { ...state, isLoading: false, currentTopic: action.payload };

    case getType(actions.getTopicByNamesAction.failure):
      return { ...state, isLoading: false };

    case getType(actions.getVersionAction.request):
      return { ...state, isVersionLoading: true };

    case getType(actions.getVersionAction.success):
      return {
        ...state,
        version: action.payload,
        isVersionLoading: false,
      };

    case getType(actions.getVersionAction.failure):
      return {
        ...state,
        version: undefined,
        isVersionLoading: false,
      };

    case getType(actions.setKafkaFilterAction):
      return { ...state, filter: action.payload };

    case getType(actions.createSchemaActions.request):
      return { ...state, isLoadingSchema: true };

    case getType(actions.createSchemaActions.success):
      return { ...state, isLoadingSchema: false, schemaFields: action.payload };

    case getType(actions.createSchemaActions.failure):
      return { ...state, isLoadingSchema: false };

    case getType(actions.createActions.request):
      return { ...state, createInProgress: true };

    case getType(actions.createActions.success):
      return { ...state, createInProgress: false, topics: [...state.topics, action.payload as KafkaTopic], opened: false };

    case getType(actions.createActions.failure):
      return { ...state, createInProgress: false };

    case getType(actions.createDialogOpen):
      return { ...state, opened: true };

    case getType(actions.createDialogClose):
      return { ...state, opened: false };

    case getType(actions.updateQuotasActions.success): {
      let quota: KafkaQuota = state.quotas[action.payload[0]];
      if (!quota) {
        quota = {
          projectId: action.payload[0],
          currentPartitions: 0,
          maxPartitions: action.payload[1],
        };
      } else {
        quota.maxPartitions = action.payload[1];
      }
      state.quotas[action.payload[0]] = quota;
      return { ...state, quotas: state.quotas };
    }

    case getType(actions.fetchDateFormatsActions.success): {
      return { ...state, dateFormats: action.payload };
    }

    case getType(actions.deleteActions.success): {
      // let topics: KafkaTopic[] = state.topics.filter((topic: KafkaTopic) => topic.id !== action.payload)
      return { ...state, deleteInProgress: false };
    }

    case getType(actions.fetchQuotasActions.request):
      return { ...state, isQuotasLoading: true };

    case getType(actions.fetchQuotasActions.failure):
      return { ...state, isQuotasLoading: false };

    case getType(actions.fetchQuotasActions.success): {
      const quotaMap = {};
      action.payload.forEach((quota: KafkaQuota) => {
        quotaMap[quota.projectId] = quota;
      });
      return { ...state, quotas: quotaMap, isQuotasLoading: false };
    }

    default:
      return state;
  }
};

export function getTopics(state: ApplicationState): KafkaTopic[] {
  return state.kafka.topics;
}

export function getTopicsBuProjects(state: ApplicationState): KafkaTopic[] {
  return state.kafka.topicsByProjects;
}

export function receiveInProgress(state: ApplicationState): boolean {
  return state.kafka.receiveInProgress;
}

export function isLoading(state: ApplicationState): boolean {
  return state.kafka.isLoading;
}

export function createInProgress(state: ApplicationState): boolean {
  return state.kafka.createInProgress;
}

export function deleteInProgress(state: ApplicationState): boolean {
  return state.kafka.deleteInProgress;
}

export function isOpened(state: ApplicationState): boolean {
  return state.kafka.opened;
}

export function getQuotas(state: ApplicationState): any {
  return state.kafka.quotas;
}

export function getQuotaForProject(state: ApplicationState, projectId: number): KafkaQuota {
  return state.kafka.quotas[projectId] || { projectId: projectId, maxPartitions: 0, currentPartitions: 0 };
}

export function isQuotasLoading(state: ApplicationState): any {
  return state.kafka.isQuotasLoading;
}

export function getDateFormats(state: ApplicationState) {
  return state.kafka.dateFormats;
}

export function getCurrentTopic(state: ApplicationState) {
  return state.kafka.currentTopic;
}

export function isLoadingSchema(state: ApplicationState) {
  return state.kafka.isLoadingSchema;
}

export function getCurrentACL(state: ApplicationState) {
  return state.kafka.currentACLRecords;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.kafka.version;
}

export function getAclEnable(state: ApplicationState): boolean {
  return state.kafka.aclEnable;
}

export function getAclEnableLoading(state: ApplicationState): boolean {
  return state.kafka.aclEnableLoading;
}

export function getKafkaFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.kafka.filter;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.kafka.isVersionLoading;
}

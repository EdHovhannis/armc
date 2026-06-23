import { Versions } from '../store/config/Types';
import { ACLFilter, ClientACLRecord, KafkaQuota, KafkaTopic } from '../store/kafka/Types';
import { KafkaCreateUpdateParams, KafkaQuery, KafkaRecord } from '../store/kafkaViewer/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Kafka сервис в данный момент недоступен. Обратитесь к администратору.';

export default class KafkaService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/source/kafka/metadata/version');

    if (result.ok) {
      const data = await result.text();
      try {
        const res = JSON.parse(data);
        okCallback(data, res);
      } catch (e) {
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchTopics(okCallback: (topic: KafkaTopic[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/source/kafka/topics');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as KafkaTopic[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchTopicsForProject(projectId: number, okCallback: (topic: KafkaTopic[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/source/kafka/topics', null, { project_id: projectId });

    if (result.ok) {
      const data = await result.json();
      okCallback(data as KafkaTopic[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` c id ${projectId}`);
      errorCallback(message.message);
    }
  }

  static async createTopic(data: KafkaCreateUpdateParams, okCallback: (topic: KafkaTopic) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/source/kafka/topics', null, null, JSON.stringify(data));
    if (result.ok) {
      const data: KafkaTopic = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` c id ${data.projectId}`);
      errorCallback(message.message);
    }
  }

  static async updateTopic(topic_id: number, topic: KafkaTopic, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/source/kafka/topics/' + topic_id, null, null, JSON.stringify(topic));

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', '', ` c id ${topic_id}`);
      errorCallback(message.message);
    }
  }

  static async deleteTopic(
    topic_id: number,
    okCallback: (message: string) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('DELETE', '/internal/source/kafka/topics', null, { topic_id: topic_id.toString() });

    if (result.ok) {
      okCallback('Топик был успешно удалён');
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', '', ` c id ${topic_id}`);
      errorCallback(message);
    }
  }

  static async sendRecord(
    topicId: number,
    key: string,
    value: string,
    okCallback: (message: string) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/internal/source/kafka/topics/' + topicId + '/add',
      null,
      null,
      JSON.stringify({
        key: key,
        value: value,
      }),
    );

    if (result.ok) {
      okCallback('Сообщение успешно добавлено');
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', '', ` c id ${topicId}`);
      errorCallback(message.message);
    }
  }

  static async fetchRecords(topicId: number, query: KafkaQuery, okCallback: (records: KafkaRecord[]) => void, errorCallback: (error: any) => void) {
    const result = await BackendProvider.request('POST', '/internal/source/kafka/topics/' + topicId + '/fetch', null, null, JSON.stringify(query));

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', '', ` c id ${topicId}`);
      errorCallback(message.message);
    }
  }

  static async fetchQuota(projectIds: Array<number>, okCallback: (records: Array<KafkaQuota>) => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/source/kafka/quota', null, null, JSON.stringify(projectIds));

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateQuota(projectId: number, maxPartitions: number, okCallback: () => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/source/kafka/quota/' + projectId, null, { maxPartitions: maxPartitions });

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` c id ${projectId}`);
      errorCallback(message.message);
    }
  }

  static async createSchemaFromTopic(
    topicId: Array<number>,
    flatten: boolean,
    onlyFlattened: boolean,
    excludedFields: Array<string>,
    okCallback?,
    errorCallback?: (msg: string) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/source/kafka/topics/create_schema',
      null,
      null,
      JSON.stringify({
        kafkaQuery: {
          filter: {
            type: 'contain',
            pattern: '',
          },
          maxRowsInResult: 500,
          maxRowsToScan: 500,
          topicId: topicId,
          offset: 'LATEST',
        },
        shouldBeFlattened: flatten,
        returnOnlyFlattened: onlyFlattened,
        excludedFromFlatteningFields: excludedFields,
        topicIds: topicId,
      }),
    );

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, '', '', '', '', ` c id ${topicId}`);
      if (errorCallback) errorCallback(message.message);
    }
  }

  static async fetchAvailableDateFormats(okCallback?, errorCallback?) {
    const res = await BackendProvider.request('GET', '/internal/source/kafka/available_datetime_formats');
    const data = await res.json();
    if (res.ok) {
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  ///project/{projectShortName}/topic/{name}")
  static async fetchTopicByProjectShortNamedAndName(projectShortName: string, topicName: string, okCallback?, errorCallback?) {
    const res = await BackendProvider.request('GET', '/internal/source/kafka/project/' + projectShortName + '/topic/' + topicName);

    if (res.ok) {
      const data = await res.json();
      okCallback(data as KafkaTopic);
    } else {
      if (errorCallback) {
        const message = await ErrorHandling.handleError(
          res,
          ERROR_502_MESSAGE,
          ` ${projectShortName}`,
          '',
          '',
          '',
          ` ${projectShortName}/${topicName}`,
        );
        errorCallback(message.message);
      }
    }
  }

  static async addACL(topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], okCallback, errorCallback?) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/source/kafka/acl/project/' + projectShortName + '/topic/' + topicName,
      null,
      null,
      JSON.stringify(aclRecords),
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${projectShortName}`,
        '',
        '',
        '',
        ` ${projectShortName}/${topicName}`,
      );
      errorCallback(message.message);
    }
  }

  static async updateACL(topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], okCallback, errorCallback?) {
    const res = await BackendProvider.request(
      'PUT',
      '/internal/source/kafka/acl/project/' + projectShortName + '/topic/' + topicName,
      null,
      null,
      JSON.stringify(aclRecords),
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${projectShortName}`,
        '',
        '',
        '',
        ` ${projectShortName}/${topicName}`,
      );
      errorCallback(message.message);
    }
  }

  static async deleteACL(topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], okCallback, errorCallback?) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/source/kafka/acl/project/' + projectShortName + '/topic/' + topicName + '/remove',
      null,
      null,
      JSON.stringify(aclRecords),
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${projectShortName}`,
        '',
        '',
        '',
        ` ${projectShortName}/${topicName}`,
      );
      errorCallback(message.message);
    }
  }

  static async fetchACLRecordsWithFilter(topicName: string, projectShortName: string, aclFilter?: ACLFilter, okCallback?, errorCallback?) {
    let res: any = {};
    if (aclFilter) {
      res = await BackendProvider.request(
        'POST',
        '/internal/source/kafka/acl/project/' + projectShortName + '/topic/' + topicName + '/filter',
        null,
        null,
        JSON.stringify(aclFilter),
      );
    } else {
      res = await BackendProvider.request(
        'POST',
        '/internal/source/kafka/acl/project/' + projectShortName + '/topic/' + topicName + '/filter',
        null,
        null,
        JSON.stringify({}),
      );
    }
    if (res.ok) {
      const data = await res.json();
      okCallback(data as ClientACLRecord[]);
    } else {
      if (errorCallback) {
        const message = await ErrorHandling.handleError(
          res,
          ERROR_502_MESSAGE,
          ` ${projectShortName}`,
          '',
          '',
          '',
          ` ${projectShortName}/${topicName}`,
        );
        errorCallback(message.message);
      }
    }
  }

  static async checkAclEnable(clusterId: number, okCallback: (enableAcl: boolean) => void, errorCallback?: (msg: string) => void) {
    const res = await BackendProvider.request('GET', `/internal/source/kafka/acl/cluster/${clusterId}/check`);

    if (res.ok) {
      const data = await res.json();
      okCallback(data as boolean);
    } else {
      if (errorCallback) {
        const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
        errorCallback(message.message);
      }
    }
  }
}

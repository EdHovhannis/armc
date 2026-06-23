import { ArchiveInputFormatListEnum } from '../store/archive/Types';
import { Versions } from '../store/config/Types';
import {
  AddCurrentTimeNode,
  AvroParseNode,
  BusinessTask,
  CopyFieldProcessingNode,
  FlowDetails,
  FlowInputFormatListEnum,
  FlowOverview,
  FlowQuota,
  FlowServiceConfigs,
  GenerateUUIDNode,
  JsonFlattenNode,
  JsonParseNode,
  JsonSerializeNode,
  MultiKafkaSinkNode,
  NodeType,
  ProcessingNode,
  ProcessingNodeType,
  SourceSinkKafkaNode,
  SourceType,
  TimestampConvertNode,
  DlqTopic,
} from '../store/flow/Types';
import { CopyFieldNode } from '../store/pipeline/Types';
import { ErrorHandling } from '../utils/ErrorHandling';
import { Utils } from '../utils/Utils';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис потоковой обработки в данный момент недоступен. Обратитесь к администратору.';
const apiRoot = '';

export default class FlowService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/flow/metadata/version');

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

  static async fetchOverviews(businessTask: string, okCallback: (flow: Array<FlowOverview>) => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/internal/flow/all', null, { businessTask: businessTask });

    if (result.ok) {
      okCallback(await result.json());
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchFlowById(flowId: number, okCallback: (flow: FlowDetails) => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/internal/flow/task/' + flowId + '/config');

    if (result.ok) {
      okCallback(await result.json());
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async addInstanceFlow(
    flowId: number,
    zoneId: string,
    startFlow: boolean | undefined = undefined,
    okCallback: (id: number) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const isAutoRun = startFlow !== undefined ? `?autoRun=${startFlow}` : '';
    const result = await BackendProvider.request('POST', `${apiRoot}/internal/flow/task/${flowId}/zone/${zoneId}/instance${isAutoRun}`);

    if (result.ok) {
      okCallback(await result.json());
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async updateInstanceFlow(
    flowId: number,
    zoneId: string,
    okCallback: (id?: number) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('PUT', apiRoot + '/internal/flow/task/' + flowId + '/zone/' + zoneId + '/instance');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async deleteInstanceFlow(
    flowId: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('DELETE', apiRoot + '/internal/flow/task/' + flowId + '/zone/' + zoneId + '/instance');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async createFlow(
    flowName: string,
    projectId: number,
    data: string,
    businessTask: BusinessTask,
    useGlobalConsumerGroup: boolean,
    dlqTopic: DlqTopic | undefined,
    okCallback: (flow: FlowDetails) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      apiRoot + '/internal/flow/task/config',
      null,
      null,
      Utils.flowFormat(flowName, data, projectId, useGlobalConsumerGroup, dlqTopic, businessTask),
    );

    if (result.ok) {
      okCallback(await result.json());
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async updateFlow(
    flowId: number,
    flowName: string,
    projectId: number,
    data: string,
    useGlobalConsumerGroup: boolean,
    dlqTopic: DlqTopic | undefined,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request(
      'PUT',
      '/internal/flow/task/' + flowId + '/config',
      null,
      null,
      Utils.flowFormat(flowName, data, projectId, useGlobalConsumerGroup, dlqTopic),
    );

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async deleteFlow(flowId: number, okCallback: () => void, errorCallback: (errorMsg: { message: string; details?: string }) => void) {
    const result = await BackendProvider.request('DELETE', apiRoot + '/internal/flow/task/' + flowId + '/config');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async suspendFlow(
    flowId: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', apiRoot + '/internal/flow/task/' + flowId + '/zone/' + zoneId + '/instance/suspend');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async resumeFlow(
    flowId: number,
    zoneId: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', apiRoot + '/internal/flow/task/' + flowId + '/zone/' + zoneId + '/instance/resume');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async refreshFlowInstanceStatus(
    flowId: number,
    zoneId: string,
    okCallback: (status: string) => void,
    errorCallback: (error: string) => void,
  ) {
    const result = await BackendProvider.request('GET', apiRoot + '/internal/flow/task/' + flowId + '/zone/' + zoneId + '/instance/status');

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchQuota(projectIds: Array<number>, okCallback: (records: Array<FlowQuota>) => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/flow/quota', null, null, JSON.stringify(projectIds));

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateQuota(projectId: number, maxQuota: number, okCallback: () => void, errorCallback: (error: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/flow/quota/' + projectId, null, { maxQuotaSize: maxQuota });

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchAvailableTimeZones(okCallback?, errorCallback?) {
    const res = await BackendProvider.request('GET', '/internal/flow/available_time_zones');
    const data = await res.json();
    if (res.ok) {
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static checkConfiguration(processingNode: ProcessingNode) {
    let configFull: boolean = false;
    const node:
      | AddCurrentTimeNode
      | CopyFieldProcessingNode
      | GenerateUUIDNode
      | JsonFlattenNode
      | JsonParseNode
      | JsonSerializeNode
      | SourceSinkKafkaNode
      | TimestampConvertNode
      | AvroParseNode
      | MultiKafkaSinkNode = processingNode.node;
    switch (processingNode.element) {
      case NodeType.processing:
        switch (node.type) {
          case SourceType.multiKafka:
            if (node.topics?.length > 0) configFull = true;
            break;
          case ProcessingNodeType.addCurrentTime:
            if (node.toField !== '' && node.timeFormat !== '' && node.timezone !== '') configFull = true;
            break;
          case ProcessingNodeType.copyField:
            if (node.copyParametersList.length > 0 && this.checkCopyParametersListConfig(node.copyParametersList)) configFull = true;
            break;
          case ProcessingNodeType.generateUUID:
            if (node.toField !== '') configFull = true;
            break;
          case ProcessingNodeType.timestampConvert:
            if (
              node.field !== '' &&
              node.inputTimezone !== '' &&
              node.outputTimezone !== '' &&
              node.inputFormats.length > 0 &&
              node.outputFormat !== ''
            )
              configFull = true;
            break;
          case ProcessingNodeType.jsonSerialize:
            configFull = true;
            break;
          case ProcessingNodeType.jsonParse:
            configFull = true;
            break;
          case ProcessingNodeType.jsonFlatten:
            configFull = true;
            break;
          case ProcessingNodeType.avroParse:
            if ('schemaName' in node && node.schemaName !== '') {
              configFull = true;
            }
            break;
          default:
            break;
        }
        break;
      case NodeType.sink:
        switch (node.type) {
          case SourceType.kafka:
            if (node.projectShortName !== '' && node.topic !== '') configFull = true;
          default:
            break;
        }
        break;
      case NodeType.source:
        switch (node.type) {
          case SourceType.kafka:
            if (node.projectShortName !== '' && node.topic !== '') configFull = true;
          default:
            break;
        }
        break;
      case NodeType.multiKafka:
        if (node?.topics?.length > 0) configFull = true;
        break;
    }

    return configFull;
  }

  static checkCopyParametersListConfig(copyParametersList: CopyFieldNode[]): boolean {
    let configFull: boolean = true;
    copyParametersList.forEach((node) => {
      configFull =
        configFull &&
        node.fromField !== '' &&
        node.toFields.length > 0 &&
        !node.toFields.some((field) => {
          return field === '';
        });
    });
    return configFull;
  }

  static getResultParallelism(pipeline: ProcessingNode[]) {
    let difParallelism = false;
    if (pipeline.length === 0) {
      return null;
    }
    const parallelism = pipeline[0].parallelism;
    pipeline.forEach((node) => {
      if (node.parallelism !== parallelism) {
        difParallelism = true;
      }
    });
    return difParallelism ? null : parallelism;
  }

  static changeParalellism(pipeline: ProcessingNode[], paralellism: number) {
    const newPipeline: ProcessingNode[] = Utils.getCopyOfElement(pipeline);
    newPipeline.map((node) => {
      node.parallelism = paralellism;
    });
    return newPipeline;
  }

  /**
   * Получение наименований схем AVRO
   * @param okCallback
   * @param errorCallback
   */
  static async getSchemaNames(okCallback?: (schemaNames: string[]) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/index/archive/task/avro/schema/names');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as string[]);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  /**
   * Получение списка поддерживаемых форматов данных
   * @param okCallback
   * @param errorCallback
   */
  static async getInputFormatList(
    okCallback?: (formatData: ArchiveInputFormatListEnum[] | FlowInputFormatListEnum[]) => void,
    errorCallback?: (errorMsg: string) => void,
  ) {
    const res = await BackendProvider.request('GET', '/internal/index/archive/task/input-format/list');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as ArchiveInputFormatListEnum[]);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
  static async getFlowServiceConfigs(
    okCallback: (configs: FlowServiceConfigs) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('GET', '/internal/index/flow/config');

    okCallback({
      defaultEarlyMessageRejectionPeriod: 'P1D',
      defaultLateMessageRejectionPeriod: 'P1D',
    });

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as FlowServiceConfigs);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }
}

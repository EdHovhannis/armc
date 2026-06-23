import { Typography } from '@material-ui/core';
import * as React from 'react';

import { CopyFieldNode } from '../pipeline/Types';

export interface FlowInstance {
  zoneId: string;
  id: number;
  version: string;
  status: string;
  jobId: string;
  duration: number;
  flowName?: string;
  projectName?: string;
  flowId?: number | string;
}

export interface FlowInstanceDetailedInfo extends FlowInstance {
  canEdit: boolean;
  canManageAccess: boolean;
  useGlobalConsumerGroup: boolean;
}

export interface FlowInstanceExtended extends FlowInstance {
  flowId: number;
  flowName: string;
  projectId: number;
  projectName: string;
  versionConfig: string;
  canEdit: boolean;
  canManageAccess: boolean;
  useGlobalConsumerGroup: boolean;
}

export interface FlowDetails {
  id: number;
  name: string;
  nodes: Array<any>;
  data: any;
  taskId: string;
  projectId: number;
  canEdit: boolean;
  canManageAccess: boolean;
  state: string;
  isStartedFlow: boolean;
  useGlobalConsumerGroup: boolean;
  deadLetterQueue?: DlqTarget;
  jobConfiguration?: {
    deadLetterQueue: DlqTarget;
    graph: any;
    useGlobalConsumerGroup: boolean;
  };
}

export interface DlqTarget {
  target: {
    kafka: DlqTopic;
  };
}

export interface DlqTopic {
  projectKey: string;
  name: string;
}

export interface FlowQuota {
  project_id: number;
  currentQuotaSize: number;
  maxQuotaSize: number;
}

export interface FlowOverview {
  useGlobalConsumerGroup: boolean;
  instances: FlowInstance[];
  id: number;
  name: string;
  projectId: number;
  quotaSize: number;
  businessTask: BusinessTask;
  checkpointIntervalMillis: number;
  version: string;
  canEdit: boolean;
  canManageAccess: boolean;
}

export interface FlowRowType {
  id: number;
  name: string;
  project: string;
  countZone: number;
  zones: string[];
  canEdit: boolean;
  canManageAccess: boolean;
  checkpointIntervalMillis: number;
  version: string;
}

export enum NodeType {
  source = 'source',
  sink = 'sink',
  processing = 'processing',
  multiKafka = 'multi-kafka-round-robin',
}

export enum SourceType {
  kafka = 'kafka',
  multiKafka = 'multi-kafka-round-robin',
}

export enum ProcessingNodeType {
  addCurrentTime = 'addCurrentTime',
  copyField = 'copyField',
  generateUUID = 'generateUUID',
  jsonFlatten = 'jsonFlatten',
  jsonParse = 'jsonParse',
  jsonSerialize = 'jsonSerialize',
  timestampConvert = 'timestampConvert',
  avroParse = 'avroParse',
  rateLimiter = 'rateLimiter',
}

export interface ProcessingNode {
  id: string;
  element: NodeType;
  parents?: Array<string>;
  parallelism: number;
  node:
    | AddCurrentTimeNode
    | CopyFieldProcessingNode
    | GenerateUUIDNode
    | JsonFlattenNode
    | JsonParseNode
    | JsonSerializeNode
    | SourceSinkKafkaNode
    | TimestampConvertNode
    | AvroParseNode
    | MultiKafkaSinkNode;
}

export interface AddCurrentTimeNode {
  type: ProcessingNodeType;
  toField: string;
  timeFormat: string;
  timezone: string;
}

export interface CopyFieldProcessingNode {
  type: ProcessingNodeType;
  copyParametersList: Array<CopyFieldNode>;
}

export interface GenerateUUIDNode {
  type: ProcessingNodeType;
  toField: string;
}

export interface JsonFlattenNode {
  type: ProcessingNodeType;
  excludedFromFlatteningFields: Array<string>;
}

export interface JsonParseNode {
  type: ProcessingNodeType;
}

export interface JsonSerializeNode {
  type: ProcessingNodeType;
}

export interface TimestampConvertNode {
  type: ProcessingNodeType;
  field: string;
  inputTimezone: string;
  outputTimezone: string;
  inputFormats: Array<string>;
  outputFormat: string;
}

export interface AvroParseNode {
  type: ProcessingNodeType;
  schemaName: string;
}
export interface RateLimiterNode {
  type: ProcessingNodeType;
  messagesPerSecond: number;
  bytesPerSecond: number;
  limitBy: 'BYTES';
}

export interface MultiKafkaSinkNode {
  type: SourceType.multiKafka;
  topics: Array<{ topic: string; projectShortName: string }>;
}
export interface SourceSinkKafkaNode {
  type: SourceType;
  projectShortName: string;
  topic: string;
  consumerGroupId?: string;
}

export interface FlowServiceConfigs {
  defaultLateMessageRejectionPeriod: string;
  defaultEarlyMessageRejectionPeriod: string;
}

export const MapNames = {
  rateLimiter: 'RATELIMITER',
  addCurrentTime: 'Добавление текущего времени',
  copyField: 'Копирование поля',
  generateUUID: 'Генерация уникального id',
  jsonFlatten: 'Разложение JSON в плоский',
  jsonParse: 'Парсинг JSON сообщения',
  jsonSerialize: 'Преобразование сообщения в JSON',
  timestampConvert: 'Преобразование времени',
  kafkaSource: 'Source Kafka',
  kafkaSink: 'Sink Kafka',
  kafka: 'SinkSource Kafka node',
  avroParse: 'Парсинг AVRO сообщения',
  multiKafkaSink: 'Multi Sink Kafka',
};

export const MapNodeDescription = {
  addCurrentTime: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода добавления текущего времени.
      </Typography>
      {'Добавит в заданное поле время записи с заданном формате.'}
      <div>
        <u>{'Параметры ноды: '}</u>{' '}
      </div>
      <div>{'1) название поля, в которое нужно записать время.'}</div>
    </React.Fragment>
  ),
  copyField: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода копирования поля.
      </Typography>
      {'Скоприует значение из поля в заданное поле.'}
      <div>
        <u>{'Параметры ноды: '}</u>{' '}
      </div>
      <div>{'1) название поля, из которого нужно скопировать;'}</div>
      <div>{'2) название поля, в которое будет сохранена копия.'}</div>
    </React.Fragment>
  ),
  generateUUID: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода генерации уникального id.
      </Typography>
      {'В заданное поле запишет сгенерированный уникальный id.'}
      <div>
        <u>{'Параметры ноды: '}</u>
      </div>
      <div>{'1) название поля, в которое нужно записать id.'}</div>
    </React.Fragment>
  ),
  jsonFlatten: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода разложения вложенного JSON в плоский.
      </Typography>
      {'Если взодящий JSON вложенный, то эта нода превратит его в плоский.'}
      <div>
        <u>{'Параметры ноды: '}</u>
      </div>
      <div>{'1) список полей, который нужно оставить вложенными.'}</div>
    </React.Fragment>
  ),
  jsonParse: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода парсинга JSON-сообщений.
      </Typography>
      {'Парсит входящий поток данных в формате JSON.'}
      <div>
        <u>{'Обязательно поставьте эту ноду сразу после source-ноды, иначе сообщения в потоке не смогут быть обработанными.'}</u>{' '}
      </div>
    </React.Fragment>
  ),
  jsonSerialize: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода преобразования потока данных в JSON-сообщение.
      </Typography>
      {'Сериализует JSON-сообщения.'}
      <div>
        <u>{'Обязательно поставьте эту ноду перед sink-нодой.'}</u>{' '}
      </div>
    </React.Fragment>
  ),
  timestampConvert: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Нода преобразования времени.
      </Typography>
      {'Время в заданном поле преобразует из одного формата в другой.'}
      <div>
        <u>{'Параметры ноды: '}</u>{' '}
      </div>
      <div>{'1) название поля времени;'}</div>
      <div>{'2) исходные форматы времени;'}</div>
      <div>{'3) исходная временная зона;'}</div>
      <div>{'4) требуемый формат времени;'}</div>
      <div>{'5) требуемая временная зона.'}</div>
    </React.Fragment>
  ),
  kafkaSource: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Source-нода Kafka.
      </Typography>
      {'Забирает данные из указанного топика Kafka.'}
      <div>
        <u>{'Параметры ноды: '}</u>{' '}
      </div>
      <div>{'1) топика Kafka, откуда нужно вычитывать сообщения.'}</div>
    </React.Fragment>
  ),
  kafkaSink: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Sink-нода Kafka.
      </Typography>
      {'Отправляет данные в указанный топик Kafka.'}
      <div>
        <u>{'Параметры ноды: '}</u>{' '}
      </div>
      <div>{'1) топика Kafka, куда нужно отправлять сообщения.'}</div>
    </React.Fragment>
  ),
  kafka: '',
  avroParse: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Парсинг AVRO сообщения
      </Typography>
      {'Отправляет данные в указанный топик Kafka.'}
    </React.Fragment>
  ),
  multiKafkaSink: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Multi Sink Kafka.
      </Typography>
      {'Добавить топик Kafka'}
    </React.Fragment>
  ),
  rateLimiter: (
    <React.Fragment>
      <Typography color="inherit" variant={'body2'}>
        Конфигурация RateLimiter.
      </Typography>
      {'Установить Конфигурацию RateLimiter'}
    </React.Fragment>
  ),
};

export enum BusinessTask {
  NON = 'NON',
  ARCHIVING = 'ARCHIVING',
  INDEXING = 'INDEXING',
  MONITORING = 'MONITORING',
  TRACING = 'TRACING',
}

export enum FlowInputFormatListEnum {
  JSON = 'JSON',
  AVRO = 'AVRO',
}

export interface QuotaUnits {
  speed: string;
  size: string;
  time: string;
}

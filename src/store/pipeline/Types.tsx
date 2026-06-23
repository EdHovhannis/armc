import { ICopyAuditParamsSpecs } from '../../components/processing/FieldCopy/types';
import { ITransformArray, TransformArrayData } from '../../components/processing/TransformArray/types';

export interface Pipeline {
  name: string;
  projectShortName: string;
  sources: SourcesPipeline;
  processing?: ProcessingPipeline;
  schema: SchemaPipeline;
  quota: QuotaPipeline;
  replicationFactor: number;
  recoveryStrategy: string;
  labels: string[] | undefined;
  deadLetterQueue?: DlqTarget;
  advanced?: AdvancedPipeline | null;
  collectionCount?: number | string;
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

export interface PipelineInstances {
  zoneId: string;
}

export interface PipelineShort {
  id: number;
  name: string;
  projectShortName: string;
  sources: SourcesPipeline;
  instances?: PipelineInstances[];
}

export interface PipelineStatus {
  name: string;
  projectShortName: string;
  status: string;
  zoneId: string;
}

export interface PipelineMeta {
  storage: {
    docNum: number;
    currentSizeBytes: number;
    maxSizeBytes: number;
  };
  indexing: {
    status: string;
  };
  lastRotationTime: string;
}

export interface PipelineTechMeta {
  projectShortName: string;
  name: string;
  zoneId: string;
  meta: PipelineMeta;
}

export interface QuotaPipeline {
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStorageTimeSec: number;
}

export interface QuotaForOverdraft extends QuotaPipeline {
  replicationFactor: number;
}

export enum PipelineInputFormatListEnum {
  JSON = 'JSON',
  AVRO = 'AVRO',
}

export interface SourcesPipeline {
  kafka: Array<KafkaSource>;
  format: {
    type: PipelineInputFormatListEnum;
    schemaName?: string | null;
  };
}

export interface Field {
  name: string;
  fieldType: string;
  subType: string;
}

export interface ProcessingPipeline extends ITransformArray {
  flattenJsonParam?: FlattenJsonNode;
  convertTimestampParams?: Array<TimestampNode>;
  copyFieldParams?: Array<CopyFieldNode>;
  generateUuidParams?: Array<GenerateUUIDNode>;
  addCurrentTimeParams?: Array<AddCurrentTimeNode>;
  messageFilter?: MessageFilter;
  copyAuditParams?: {
    copyAuditParamsSpecs: ICopyAuditParamsSpecs[];
  };
}

export interface MessageFilter {
  dlqEnabled: boolean;
  condition: HighLevelCondition;
}

export interface HighLevelCondition {
  type: MessageFilterType.AND | MessageFilterType.OR;
  conditions: MessageFilterCondition[];
}

export interface MessageFilterCondition {
  type: MessageFilterType.IS_NULL | MessageFilterType.REGEX | MessageFilterType.EQUALS;
  field: string;
  value: string | null;
  inverted: boolean;
  tableData: any;
}

export enum MessageFilterType {
  AND = 'AND',
  OR = 'OR',
  EQUALS = 'EQUALS',
  REGEX = 'REGEX',
  IS_NULL = 'IS_NULL',
}

export interface KafkaSource {
  id?: string;
  partition?: number;
  projectShortName: string;
  topicName: string;
}

export interface TimestampNode {
  field: string;
  inputTimezone: string;
  outputTimezone: string;
  inputFormats: Array<string>;
  outputFormat: string;
}

export interface CopyFieldNode {
  fromField: string;
  toFields: Array<string>;
}

export interface FlattenJsonNode {
  excludedFromFlatteningFields: Array<string>;
}

export interface AddCurrentTimeNode {
  toField: string;
  timeFormat: string;
  timezone: string;
}

export interface GenerateUUIDNode {
  toField: string;
}

export interface SearchTimeInterval {
  from: string;
  to: string;
}

export interface SchemaPipeline {
  fields: Array<Field>;
  dynamicFields?: Array<Field>;
  primaryTimeField: PrimaryTimeField;
}

export enum TypePrimaryField {
  CUSTOM = 'custom',
  AUTOGENERATE = 'autogenerate',
}

export interface PrimaryTimeField {
  type: TypePrimaryField;
  customFieldName?: string;
  earlyMessageRejectionPeriod?: string;
  lateMessageRejectionPeriod?: string;
}

export enum PIPELINE_TYPES {
  STRING = 'STRING',
  TEXT = 'TEXT',
  INT = 'INT',
  DOUBLE = 'DOUBLE',
  LONG = 'LONG',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  UUID = 'UUID',
  ARRAY = 'ARRAY',
}
export interface AdvancedPipeline {
  globalReadAlias?: number | null;
  collectionNodes?: number | null;
  collectionShards?: number | null;
  sourcesParallelism?: number | null;
  nodesAndSinkParallelism?: number | null;
  maxShardSizeBytes?: number | null;
  sinkNumThreads?: number | null;
  sinkBatchSize?: number | null;
}

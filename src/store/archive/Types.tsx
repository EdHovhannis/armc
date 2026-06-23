import { ICopyAuditParamsSpecs } from '../../components/processing/FieldCopy/types';
import { ITransformArray } from '../../components/processing/TransformArray/types';

export interface ArchiveTaskInstanceStatus {
  archiveTaskProject: string;
  archiveTaskProjectTaskName: string;
  zoneId: string;
  /** идентификатор экземпляра, к которому относится **/
  archiveTaskInstanceId?: string;
  storage: {
    currentSizeBytes: number;
    maxSizeBytes: number;
  };
  indexing: {
    status: string;
  };
  errorStatusMessage?: string;
}

export interface ArchiveTaskInstance {
  /** название проекта, к которому принадлежит инстанс **/
  project: string;
  /** название индекса, к которому принадлежит инстанс **/
  name: string;
  zoneId: string;
  /** идентификатор экземпляра (но разрабы бэкенда просили на него не привязываться) **/
  id: number;
  /** внутренний идентификатор для связи с конфигурацией **/
  archiveTaskInstanceId: string;
  /** параметр взят у родительского archiveTask **/
  canView: boolean;
  /** параметр взят у родительского archiveTask **/
  canEdit: boolean;
  version: string;
  overdraftPercent: number;
  metadata: {
    maxAvailableOverdraft: number;
  };
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStorageTimeSec?: number;
  status: ArchiveMeta;
}

export interface ArchiveTaskInstanceConfigCurrent {
  metadata: {
    maxAvailableOverdraft: number;
  };
  name: string;
  /** идентификатор инстанса, к которому относится (instance.id) **/
  instanceId: string;
}

export enum ArchiveTaskDelete {
  inProcess,
  success,
  fail,
}

export const ArchiveTaskDeleteValues = [ArchiveTaskDelete.success, ArchiveTaskDelete.fail, ArchiveTaskDelete.inProcess];

export enum ArchiveTaskRequestStatus {
  inProcess = 'IN_PROCESS',
  failed = 'FAILED',
  success = 'SUCCESS',
}

export interface ShortArchiveTask {
  name: string;
  project: string;
  labels?: string[];
  instances: ArchiveTaskInstance[];
  instancesIds: string[];
  flowActions: string[];
  indexActions: string[];
}

export interface ShortArchiveTaskWithId extends ShortArchiveTask {
  id: number;
}

export interface ArchiveTask {
  name: string;
  source: ArchiveSource;
  quota: ArchiveQuota;
  schema: ArchiveSchema;
  processing: ArchiveProcessing;
  primaryTimeField?: ArchivePrimaryTimeField;
  labels?: string[];
  deadLetterQueue?: DlqTarget;
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

export enum ArchiveInputFormatListEnum {
  JSON = 'JSON',
  AVRO = 'AVRO',
}

export interface ArchiveSource {
  kafka: KafkaArchiveSource[];
  format: {
    type: ArchiveInputFormatListEnum;
    schemaName?: string | null;
  };
}

export interface KafkaArchiveSource {
  id?: string;
  partition?: number;
  project: string;
  name: string;
}

export interface ArchiveQuota {
  maxStorageTimeSec: number;
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
}

export interface ArchiveProjectQuota {
  totalDataRateBytesPerSec: number;
  totalSizeBytes: number;
}

export interface ArchivalFlattenJsonNode {
  exclude: Array<string>;
}

export interface ArchivalCopyFieldNode {
  from: string;
  to: Array<string>;
}

export interface ArchiveProcessing extends ITransformArray {
  flatten?: ArchivalFlattenJsonNode;
  copyField?: ArchivalCopyFieldNode[];
  messageFilter?: ArchiveMessageFilter;
  copyAuditParams?: {
    copyAuditParamsSpecs: ICopyAuditParamsSpecs[];
  };
}

export interface ArchiveMessageFilter {
  dlqEnabled: boolean;
  condition: ArchiveHighLevelCondition;
}

export interface ArchiveHighLevelCondition {
  type: ArchiveMessageFilterType.AND | ArchiveMessageFilterType.OR;
  conditions: ArchiveMessageFilterCondition[];
}

export interface ArchiveMessageFilterCondition {
  type: ArchiveMessageFilterType.IS_NULL | ArchiveMessageFilterType.REGEX | ArchiveMessageFilterType.EQUALS;
  field: string;
  value: string | null;
  inverted: boolean;
  tableData: any;
}

export enum ArchiveMessageFilterType {
  AND = 'AND',
  OR = 'OR',
  EQUALS = 'EQUALS',
  REGEX = 'REGEX',
  IS_NULL = 'IS_NULL',
}

export interface Field {
  name: string;
  type: string;
  subType: string;
  format?: string;
}

export interface ArchivePrimaryTimeField {
  type: ArchivalPrimaryFieldType;
  field?: string;
  lateMessageRejectionPeriod?: string;
  earlyMessageRejectionPeriod?: string;
}

export enum ArchivalPrimaryFieldType {
  CUSTOM = 'CUSTOM',
  AUTOGENERATE = 'AUTOGENERATE',
}

export interface ArchiveSchema {
  fields: Field[];
  // dynamicFields?: Field[]
}

export interface ArchivalStorageMeta {
  currentSizeBytes: number;
  maxSizeBytes: number;
}

export enum ArchivalStatus {
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
  UNDEFINED = 'UNDEFINED',
  WITHOUT_RESPONSE = 'WITHOUT_RESPONSE', // -> для кейсов когда по зоне(ам) ответ приходит пустой [] со статусом 200, и когда в ответе нет информации по экземпляру
}

export interface ArchivalIndexingMeta {
  status: ArchivalStatus;
}

export interface ArchiveMeta {
  storage: ArchivalStorageMeta;
  indexing: ArchivalIndexingMeta;
}

export interface ArchivalQuota {
  currentSizeBytes: number;
  maxSizeBytes: number;
  currentDataRateBytesPerSec: number;
  maxDataRateBytesPerSec: number;
}

export interface ArchivalQuotaWithProject {
  project: string;
  archiveProjectQuotaState: {
    totalSizeBytes: number;
    totalDataRateBytesPerSec: number;
    occupiedSizeBytes: number;
    occupiedDataRateBytesPerSec: number;
  };
}

export interface ArchiveQuotaEstimation {
  quotaAllowed: boolean;
}

export enum ARCHIVE_TYPES {
  STRING = 'STRING',
  TEXT = 'TEXT',
  INT = 'INT',
  DOUBLE = 'DOUBLE',
  LONG = 'LONG',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
}

export interface ArchivalQuotaRequestData {
  projectShortName: string;
  maxDataRateBytesPerSec: number;
  maxStoreDurationSec: number | null;
  maxSizeBytes: number | null;
  sources: { project: string; name: string }[];
  indexName?: string;
}

export interface ArchiveQuotaResponseDTO {
  // Критические несоответствия
  blockers: unknown[];
  // Критические несоответствия допустимым параметрам
  warnings: string[];
  // Средний трафик на один слот Apache Flink
  bytesPerSecOnSlot: number;
  // Соотношение партиций к слотам Apache Flink
  correctPartitionsToSlotsRatio: number;
  // Максимально возможная скорость записи в индекс
  maxDataRateBytesPerSec: number;
  // Максимальный объем индекса
  maxSizeBytes: number;
  // Максимальное время хранения
  maxStoreDurationSec: number;
  // Примерное время хранения создаваемого экземпляра при заданных параметрах
  planStoreDurationSec: number;
  // Достаточный ли объем квоты
  quotaAllowed: boolean;
  // Количество слотов Apache Flink
  slotsCount: number;
  flowEstimateConfig: {
    // Максимально допустимый процент увеличения скорости приема входящего потока данных при овердрафте
    maxOverdraftPercent: number;
    // Максимальная скорость на один слот Apache Flink
    maxThreadDataRateBytesPerSec: number;
  };
  estimateBySize?: boolean;
}

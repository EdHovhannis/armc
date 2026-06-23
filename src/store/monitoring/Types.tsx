export interface FlattenItem {
  type: string;
  name: string;
  expr: string;
}

export type DruidFilter = Record<string, any>;

export interface DimensionFiltersWithRest {
  dimensionFilters: DruidFilter[];
  restFilter?: DruidFilter;
}

export const EMPTY_ARRAY: any[] = [];

export interface TransformItem {
  type: string;
  name: string;
  expression: string;
}

export interface DimensionItem {
  name: string;
  type: string;
  subType: string;
}

export interface MetricItem {
  name: string;
  fieldName: string;
  type: string;
}

export interface GranularitySpec {
  type: string;
  segmentGranularity: string;
  queryGranularity: string;
  rollup: boolean;
}

export interface IOConfig {
  topic: string;
  taskCount: number;
  useEarliestOffset: boolean;
  lateMessageRejectionPeriod: string;
  earlyMessageRejectionPeriod: string;
  replicas: number;
}

export interface TuningConfig {
  maxRowsInMemory: number;
  maxRowsPerSegment: number;
  maxBytesInMemory: number;
}

export interface TimestampSpec {
  column: string;
  format: string;
}

export interface DimensionsSpec {
  dimensions: Array<DimensionItem>;
}

export interface FlattenSpec {
  fields: Array<FlattenItem>;
}

export interface TransformSpec {
  transforms: Array<TransformItem>;
}

export interface TaskData {
  flattenData: Array<FlattenItem>;
  filter: string;
  transformData: Array<TransformItem>;
  dimensionData: Array<DimensionItem>;
  dimensionExclusions: Array<string>;
  metricsData: Array<MetricItem>;
  granularitySpec: GranularitySpec;
  ioConfig: IOConfig;
  timestampSpec: TimestampSpec;
  tuningConfig: TuningConfig;
  overrideConfig?: AdditionalConfig;
  datasource: string;
  labels: string[];
}

export interface TaskDataPrevious {
  flattenData: Array<FlattenItem>;
  filter: string;
  transformData: Array<TransformItem>;
  dimensionData: Array<DimensionItem>;
  metricsData: Array<MetricItem>;
  queryGranularity: string;
  rollup: boolean;
  ioConfig: IOConfig;
  timestampSpec: TimestampSpec;
  tuningConfig: TuningConfig;
  datasource: string;
}

export interface DruidSupervisor {
  id: number;
  project_id: number;
  topicId: number;
  datasource: string;
  datasourceFullName: string;
  data: TaskData;
  status: string;
}

export interface DruidSupervisorPrevious {
  id: number;
  project_id: number;
  topicId: number;
  datasource: string;
  data: TaskDataPrevious;
  status: string;
}

export interface GenericSupervisorInfo {
  id: number;
  datasource: string;
  datasourceFullName: string;
  projectId: number;
  topicId: number;
  canEdit: boolean;
  canManageAccess: boolean;
  labels?: string[];
  tracing: boolean;
  version: string;
  instances?: InstanceGenericSupervisorInfo[];
}

export interface InstanceQuotaUsage {
  taskCount: number;
  replicas: number;
}

export interface ConfigQuotaUsage {
  taskCount: number;
  replicas: number;
}

export interface InstanceGenericSupervisorInfo {
  zoneId: string;
  id: number;
  version: string;
  globalConfigurationVersion: string;
  aggregatedLag: number;
  taskStats: Map<string, number>;
  supervisorStats?: DruidSupervisorStats;
  status: string;
  lastUpdateTime: string;
  configQuotaUsage?: ConfigQuotaUsage;
  instanceQuotaUsage?: InstanceQuotaUsage;
}

export interface DruidSupervisorStat {
  processed: number;
  processedWithError: number;
  thrownAway: number;
  unparseable: number;
}

export interface DruidSupervisorStats {
  fiveMinuteStats: DruidSupervisorStat;
  totalStats: DruidSupervisorStat;
}

export interface MonitoringQuota {
  projectId: number;
  currentTaskCount: number;
  maxTaskCount: number;
}

export interface DruidPeonTask {
  taskId: string;
  status: string;
  type: string;
  createdTime: string;
  duration: string;
  rank: number;
}

export interface DruidSupervisorInfo {
  info: GenericSupervisorInfo;
}

export interface DruidDatasource {
  datasource: string;
  num_segments: number;
  num_available_segments: number;
  size: number;
  num_rows: number;
}

export interface GlobalConfigs {
  zoneId: string;
  version: string;
  ioConfig: Map<string, any>;
  tuningConfig: Map<string, any>;
}

export interface GlobalConfigVersion {
  zoneId: string;
  version: string;
}

export interface AdditionalConfig {
  ioConfig: Map<string, any>;
  tuningConfig: Map<string, any>;
}

export interface SupervisorDruidConfigurationInfo {
  configurationVersion: string;
  globalConfigurationVersion: string;
  supervisorSpec: string;
  fromUserConfiguration: string[];
  fromGlobalConfiguration: string[];
}

export interface DruidConfigurationInfo {
  supervisorSpec: string;
  fromUserConfiguration: string[];
  fromGlobalConfiguration: string[];
}

export interface AnalyticalQuotaResponse {
  blockers: string[];
  warnings: string[];
  maxTaskCount: number;
  directUsage: boolean;
  projectQuota: {
    currentTaskCount: number;
    maxTaskCount: number;
    projectId: number;
  };
  quotaAllowed: boolean;
  replicaCount: number;
}

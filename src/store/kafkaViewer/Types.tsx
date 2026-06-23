export interface KafkaRecord {
  offset: number;
  partitions: number;
  timestamp: string;
  key: string;
  value: string;
}

export interface RegexpFilter {
  type: string;
  pattern: string;
}

export interface ContainFilter {
  type: string;
  pattern: string;
}

export interface TrueFilter {
  type: string;
}

export type Filter = RegexpFilter | ContainFilter | TrueFilter;

export interface KafkaQuery {
  maxRowsInResult: number;
  maxRowsToScan: number;
  offset: string;
  filter: Filter;
}

export type KafkaRetentionType = 'BY_TIME' | 'BY_SIZE' | 'BY_TIME_AND_SIZE';

export interface KafkaLimitsProps {
  plannedRate: number | null;
  plannedRetentionTime: number | null;
  plannedVolume: number | null;
  retentionType: KafkaRetentionType | null;
  partitions?: number | null;
}

export interface KafkaCreateUpdateParams extends KafkaLimitsProps {
  name: string;
  partitions: number;
  replication: number;
  projectId: number;
  clusterId: string;
  topicFullName?: string;
}

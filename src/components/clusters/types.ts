export interface ClusterPartitionItem {
  clusterId: number;
  currentPartitions: number;
  maxPartitions: number;
}

export interface QuotaListItem {
  project: string;
  clusters: ClusterPartitionItem[];
}

export interface QuotaRemainingItem {
  clusterId: number;
  remainingQuota: number;
}

export interface ClusterInfoTableItem {
  clusterId: number;
  name: string;
  currentPartitions: number;
  maxPartitions: number;
  remainingQuota: number;
  isEnable?: boolean;
}

export interface ClusterItem {
  id: string;
  clusterId: number;
  name: string;
  type: string;
  description: string;
  default: boolean;
}

export interface Cluster {
  id?: number;
  name: string | null;
  description: string | null;
  default: boolean;
  quota: Quota;
  jmxPort: number | null;
  bootstrapJmx: string | null;
  connection: Connection;
  type?: string;
  minInSyncReplicas?: string | number;
}

export interface Quota {
  partitionsNumber: number;
}

export interface Connection {
  bootstrapServers: string | null;
  tls: Tls;
}

export interface Tls {
  enabled: boolean;
  verifyHosts: boolean;
}

export interface TestConnection {
  result: 'SUCCESS' | 'FAILED';
  executor: string;
  bootstrap?: string;
  warnings?: string[];
  error?: string;
}

export enum TestConnectionResult {
  'SUCCESS' = 'Успешно',
  'FAILED' = 'Ошибка',
}

export type Order = 'asc' | 'desc';

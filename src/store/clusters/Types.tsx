import {
  ClusterPartitionItem,
  QuotaListItem,
  QuotaRemainingItem,
  ClusterInfoTableItem,
  ClusterItem,
  Cluster,
  Quota,
  Connection,
  Tls,
  TestConnection,
  TestConnectionResult,
  Order,
} from '../../components/clusters/types';
import { KafkaRetentionType } from '../kafkaViewer/Types';
import { Project } from '../project/Types';

export {
  ClusterPartitionItem,
  QuotaListItem,
  QuotaRemainingItem,
  ClusterInfoTableItem,
  ClusterItem,
  Cluster,
  Quota,
  Connection,
  Tls,
  TestConnection,
  TestConnectionResult,
  Order,
};

export interface ClusterQuotaUpdateItem {
  clusterId: number;
  maxPartitions: number;
}

export type ClusterAllowanceUpdateItem = number;

export type FetchClusters<T = void> = (fetchedCallback?: (clusters: Cluster[]) => void, errorCallback?: (msg: string) => void) => T;
export type FetchProjectClusters<T = void> = (
  project: Project,
  fetchedCallback?: (clusters: ClusterItem[]) => void,
  errorCallback?: (msg: string) => void,
) => T;
export type FetchClustersQuota<T = void> = (
  project: string[],
  clustersId: number[],
  fetchedCallback?: (clustersQuota: QuotaListItem[]) => void,
  errorCallback?: (error: string) => void,
) => T;
export type FetchClustersRemainingQuota<T = void> = (
  fetchedCallback?: (clustersRemainingQuota: QuotaRemainingItem[]) => void,
  errorCallback?: (msg: string) => void,
) => T;
export type UpdateClustersQuota<T = void> = (projectId: number, quotas: ClusterQuotaUpdateItem[], errorCallback?: (msg: string) => void) => T;
export type UpdateClustersAllowance<T = void> = (projectId: number, clustersId: number[], errorCallback?: (msg: string) => void) => T;

export type CheckClustersResponse = {
  request: {
    maxRateBytesPerSec: number;
    maxSizeBytes: number | null;
    maxRetentionTimeSec: number | null;
    retentionType: KafkaRetentionType;
    replicationFactor: number;
    partitions: number | null;
  };
  configuration: {
    brokersNumber: number | null;
    recommendedRatePerPartitionBytesPerSec: number | null;
    maxAllowableDiskSpaceBytes: number | null;
    maxPartitionsPerBroker: number | null;
    maxPartitionsPerCluster: number | null;
  };
  partitions: number | null;
  retentionBytes: number | null;
  retentionMs: number | null;
  maxSizeBytes: number | null;
  maxRetentionTimeSec: number | null;
  quota: {
    currentQuota: {
      projectShortName: string;
      clusterName: string;
      maxSizeBytes: number;
      currentSizeBytes: number;
      maxRateBytesPerSec: number;
      currentRateBytesPerSec: number;
      maxPartitions: number;
      currentPartitions: number;
    };
    plannedRateBytesPerSec: number;
    plannedSizeBytes: number;
    plannedPartitions: number;
  };
  warnings: string[];
  blockers: string[];
};

export type CheckClustersEstimateParams = {
  projectName: string;
  clusterId: number;
  topicName?: string;
  params: {
    maxRateBytesPerSec: number;
    maxSizeBytes: number | null;
    maxRetentionTimeSec: number | null;
    retentionType: KafkaRetentionType;
    replicationFactor: number;
    partitions: number | null;
  };
  okCallback: (response: CheckClustersResponse) => void;
  errorCallback: (errorMessage: string) => void;
};

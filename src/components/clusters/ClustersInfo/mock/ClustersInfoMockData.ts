import { ClusterInfoTableItem } from '../../types';

export const ClustersInfoMockData: ClusterInfoTableItem[] = [
  {
    name: 'clusterName-1',
    currentPartitions: 50,
    maxPartitions: 50,
    isEnable: true,
    clusterId: 0,
    remainingQuota: 180,
  },
  {
    name: 'cluster-long-long-long-long-name1',
    currentPartitions: 510,
    maxPartitions: 150,
    clusterId: 1,
    isEnable: true,
    remainingQuota: 230,
  },
  {
    name: 'cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1',
    currentPartitions: 150,
    maxPartitions: 150,
    isEnable: false,
    clusterId: 2,
    remainingQuota: 200,
  },
  {
    name: 'cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1',
    currentPartitions: 35,
    maxPartitions: 200,
    isEnable: false,
    clusterId: 3,
    remainingQuota: 200,
  },
  {
    name: 'cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1cluster-long-name-1',
    currentPartitions: 35,
    maxPartitions: 150,
    isEnable: false,
    clusterId: 4,
    remainingQuota: 200,
  },
];

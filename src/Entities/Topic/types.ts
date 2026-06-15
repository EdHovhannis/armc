export type TopicItem = {
  canEdit: boolean;
  canManageAccess: boolean;
  clusterId: number;
  clusterName: string;
  id: number;
  name: string;
  partitions: number;
  plannedRate: number | null;
  plannedRetentionTime: number | null;
  plannedVolume: number | null;
  projectId: number;
  replication: number;
  retentionType: string | null;
  shadow: boolean;
  topicFullName: string;
};

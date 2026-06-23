import { KafkaLimitsProps } from '@src/store/kafkaViewer/Types';

export interface KafkaTopic extends KafkaLimitsProps {
  name: string;
  clusterId: string | number;
  topicFullName: string;
  partitions: number;
  replication: number;
  canEdit: boolean;
  canManageAccess: boolean;
  replications?: number;
  projectId?: number;
  project?: string;
  projectShortName?: string;
  id?: number;
  idT?: number;
  shadow?: true;
}

export interface KafkaQuota {
  projectId: number;
  currentPartitions: number;
  maxPartitions: number;
  clusters: ClusterKafkaQuota[];
}

export interface ClusterKafkaQuota {
  clusterId: number;
  currentPartitions: number;
  maxPartitions: number;
}

export interface ClientACLRecord {
  userSslCertificate?: string;
  operations?: Array<OperationType>;
}

export interface ACLFilter {
  userSslCertificates?: Array<string>;
  operations?: Array<OperationType>;
}

//READ, WRITE, CREATE, DELETE, ALTER, DESCRIBE, DESCRIBE_CONFIGS, ALTER_CONFIGS
export enum OperationType {
  DESCRIBE = 'DESCRIBE',
  READ = 'READ',
  WRITE = 'WRITE',
  // CREATE = "CREATE",
  // DELETE = "DELETE"
}

import { KafkaRetentionType } from '@src/store/kafkaViewer/Types';

export interface KafkaLimitsProps {
  plannedRate: number | null;
  plannedRetentionTime: number | null;
  plannedVolume: number | null;
  retentionType: KafkaRetentionType | null;
  partitions?: number | null;
}

export type KafkaLimitsState = {
  retentionByTime: boolean;
  retentionBySize: boolean;
  maxRetentionTimeSec: number;
  maxSizeBytes: number;
  maxRateBytesPerSec: number;
  partitions: string;
};

export type KafkaLimitsComponentProps = {
  projectName: string;
  topicName?: string;
  clusterId: number | null;
  replication: number;
  partitions: number;
  limits?: KafkaLimitsProps;
  onValidationFields: (isValid: boolean) => void;
  onUpdateLimits: (data: KafkaLimitsProps) => void;
  displayError: (message: string) => void;
  hasPartition?: boolean;
};

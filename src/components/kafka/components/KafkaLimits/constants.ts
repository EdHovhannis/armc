import { KafkaLimitsState } from './types';

export const INIT_STATE: KafkaLimitsState = {
  retentionByTime: false,
  retentionBySize: true,
  maxRetentionTimeSec: 0,
  maxSizeBytes: 0,
  maxRateBytesPerSec: 0,
  partitions: '1',
};

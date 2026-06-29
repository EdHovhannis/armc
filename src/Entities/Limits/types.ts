export type ProjectLimitItem = {
  currentDataRateBytesPerSec: number;
  currentSizeBytes: number;
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
};

export type ProjectEstimateItem = {
  flowEstimateConfig: {
    maxOverdraftPercent: number;
    maxThreadDataRateBytesPerSec: number;
  };
  quotaAllowed: boolean;
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStoreDurationSec: number;
  planStoreDurationSec: number;
  slotsCount: number;
  bytesPerSecOnSlot: number;
  correctPartitionsToSlotsRatio: number;
  warnings: Array<string>;
  blockers: Array<string>;
};

export type ProjectEstimate = {
  maxStoreDurationSec: number;
  maxOverdraftPercent: number;
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  slotsCount: number;
  bytesPerSecOnSlot: number;
  correctPartitionsToSlotsRatio: number;
  estimateBySize: boolean;
};

export type EstimateOverdraftItem = {
  maxAvailableOverdraft: number;
};

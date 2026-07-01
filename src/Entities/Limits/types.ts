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

export type QuotaEstimateSource = {
  project: string;
  name: string;
};

export type QuotaEstimateRequestParams = {
  project: string;
  name: string | null;
  maxDataRateBytesPerSec: number;
  maxStoreDurationSec: number | null;
  maxSizeBytes: number | null;
  sources: QuotaEstimateSource[];
};

export type InstanceEstimateRequestParams = {
  project: string;
  taskName: string;
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStoreDurationSec: number;
  sources: QuotaEstimateSource[];
};

export type OverdraftEstimateRequestParams = {
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStorageTimeSec: number;
};

export type OverdraftEstimateItem = {
  maxOverdraftPercent: number;
};

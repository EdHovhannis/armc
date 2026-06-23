import { EstimatedIndexQuota } from '@src/store/index/Types';

import { FulltextFlowEstimateResponse } from '../../../shared';

type getDataReturnType = { data: EstimatedIndexQuota; maxOverdraftPercent: number; minAllowedMaxSizeBytes: number };

export const getQuota = (estimateResponse: FulltextFlowEstimateResponse): getDataReturnType => {
  const {
    quota: {
      currentQuota: { maxDataRateBytesPerSec, maxSizeBytes, currentDataRateBytesPerSec, currentSizeBytes, projectShortName },
      plannedSizeBytes,
      plannedDataRateBytesPerSec,
      approximatedRealIndexSizeBytes,
      approximatedStoreTimeSec,
      quotaAllowed,
    },
    configuration: { maxOverdraftPercent },
    minAllowedMaxSizeBytes,
  } = estimateResponse;

  const estimatedQuota: EstimatedIndexQuota = {
    currentQuota: {
      maxRate: maxDataRateBytesPerSec,
      maxVolume: maxSizeBytes,
      currentRate: currentDataRateBytesPerSec,
      currentVolume: currentSizeBytes,
      projectShortName,
    },
    plannedVolume: plannedSizeBytes,
    plannedRate: plannedDataRateBytesPerSec,
    approximatedRealIndexSizeBytes,
    approximatedStoreTimeSec,
    quotaAllowed,
  };
  return {
    data: estimatedQuota,
    maxOverdraftPercent,
    minAllowedMaxSizeBytes,
  };
};

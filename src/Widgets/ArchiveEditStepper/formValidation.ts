type KafkaSourceFormValue = {
  project: string | null;
  name: string | null;
};

type QuotaFormValue = {
  maxDataRateBytesPerSec?: number;
  maxSizeBytes?: number;
  maxStorageTimeSec?: number;
};

export const isFilledNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

export const isKafkaSourcesFilled = (sources: KafkaSourceFormValue[]) =>
  sources.length > 0 && sources.every((source) => Boolean(source.project) && Boolean(source.name));

export const isQuotaFilled = (quota: QuotaFormValue) =>
  isFilledNumber(quota.maxDataRateBytesPerSec) && isFilledNumber(quota.maxSizeBytes) && isFilledNumber(quota.maxStorageTimeSec);

export const isQuotaEstimateReady = (quota: QuotaFormValue) =>
  isFilledNumber(quota.maxDataRateBytesPerSec) &&
  (isFilledNumber(quota.maxSizeBytes) || isFilledNumber(quota.maxStorageTimeSec));

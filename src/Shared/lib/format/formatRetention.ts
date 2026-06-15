import { RETENTION_UNIT_OPTIONS } from '@src/Shared/constants/options';

const SECONDS_UNIT = RETENTION_UNIT_OPTIONS[RETENTION_UNIT_OPTIONS.length - 1];

export const formatRetention = (seconds: number | null): string => {
  if (seconds === null) {
    return '—';
  }

  const unit = RETENTION_UNIT_OPTIONS.find(({ limit }) => seconds >= limit) ?? SECONDS_UNIT;

  return `${Math.round(seconds / unit.limit)} ${unit.label}`;
};

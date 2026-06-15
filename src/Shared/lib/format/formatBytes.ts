import { SIZE_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';

const BYTE_UNITS = SIZE_LIMITS_UNIT_OPTIONS.map((unit) => unit.value);

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < 1024 ** 2) {
    return '0 MB';
  }
  const exponent = Math.min(Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024)) - 2), BYTE_UNITS.length - 1);
  return `${Math.round(bytes / 1024 ** (exponent + 2))} ${BYTE_UNITS[exponent]}`;
};

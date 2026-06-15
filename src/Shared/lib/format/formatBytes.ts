import { SIZE_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { SizeUnitValue } from '@src/Shared/types/filter';

const BYTES_IN_KB = 1024;
const MB_EXPONENT = 2;

const BYTE_UNITS: readonly SizeUnitValue[] = SIZE_LIMITS_UNIT_OPTIONS.map((unit) => unit.value);

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < BYTES_IN_KB ** MB_EXPONENT) {
    return `0 ${BYTE_UNITS[0]}`;
  }

  const exponent = Math.min(
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(BYTES_IN_KB)) - MB_EXPONENT),
    BYTE_UNITS.length - 1,
  );

  return `${Math.round(bytes / BYTES_IN_KB ** (exponent + MB_EXPONENT))} ${BYTE_UNITS[exponent]}`;
};

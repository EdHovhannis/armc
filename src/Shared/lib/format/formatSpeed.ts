import { SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';

const SPEED_UNITS = SPEED_LIMITS_UNIT_OPTIONS.map((unit) => unit.value);

export const formatSpeed = (bytesPerSec: number): string => {
  if (!bytesPerSec) {
    return '0 B/s';
  }

  const exponent = Math.min(Math.floor(Math.log(bytesPerSec) / Math.log(1024)), SPEED_UNITS.length - 1);

  return `${Math.round(bytesPerSec / 1024 ** exponent)} ${SPEED_UNITS[exponent]}`;
};

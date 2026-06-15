import { SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { SpeedUnitValue } from '@src/Shared/types/filter';

const BYTES_IN_KB = 1024;

const SPEED_UNITS: readonly SpeedUnitValue[] = SPEED_LIMITS_UNIT_OPTIONS.map((unit) => unit.value);

export const formatSpeed = (bytesPerSec: number): string => {
  if (!bytesPerSec) {
    return `0 ${SPEED_UNITS[0]}`;
  }

  const exponent = Math.min(Math.floor(Math.log(bytesPerSec) / Math.log(BYTES_IN_KB)), SPEED_UNITS.length - 1);

  return `${Math.round(bytesPerSec / BYTES_IN_KB ** exponent)} ${SPEED_UNITS[exponent]}`;
};

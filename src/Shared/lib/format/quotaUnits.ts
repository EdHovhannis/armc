import { DateUnitValue, SizeUnitValue, SpeedUnitValue } from '@src/Shared/types/filter';

const BYTES_IN_KB = 1024;

const SPEED_MULTIPLIERS: Record<SpeedUnitValue, number> = {
  'B/s': 1,
  'KB/s': BYTES_IN_KB,
  'MB/s': BYTES_IN_KB ** 2,
};

const SIZE_MULTIPLIERS: Record<SizeUnitValue, number> = {
  MB: BYTES_IN_KB ** 2,
  GB: BYTES_IN_KB ** 3,
  TB: BYTES_IN_KB ** 4,
};

const DATE_UNIT_SECONDS: Record<DateUnitValue, number> = {
  SEC: 1,
  MIN: 60,
  HOURS: 3600,
  DAYS: 86_400,
  WEEKS: 604_800,
  MONTH: 2_592_000,
};

const DATE_UNITS_DESC: DateUnitValue[] = ['MONTH', 'WEEKS', 'DAYS', 'HOURS', 'MIN', 'SEC'];

export const speedUnitToBytesPerSec = (value: number, unit: SpeedUnitValue) => value * SPEED_MULTIPLIERS[unit];

export const sizeUnitToBytes = (value: number, unit: SizeUnitValue) => value * SIZE_MULTIPLIERS[unit];

export const dateUnitToSeconds = (value: number, unit: DateUnitValue) => value * DATE_UNIT_SECONDS[unit];

export const secondsToDateUnit = (seconds: number): { value: number; unit: DateUnitValue } => {
  const unit = DATE_UNITS_DESC.find((item) => seconds > 0 && seconds % DATE_UNIT_SECONDS[item] === 0) ?? 'SEC';
  return { value: seconds / DATE_UNIT_SECONDS[unit], unit };
};

import { RestrictionUnit } from '@src/Shared/types/restriction';

// бэк хранит ограничение в секундах (maxSearchTimeIntervalSec), unit - чисто фронтовой,
// нужен только чтобы ввести/показать значение в удобных единицах. мес/год условные (30/365 дней)
const UNIT_SECONDS: Record<RestrictionUnit, number> = {
  SECONDS: 1,
  MINUTES: 60,
  HOURS: 3600,
  DAYS: 86_400,
  WEEKS: 604_800,
  MONTHS: 2_592_000,
  YEARS: 31_536_000,
};

// по убыванию - для выбора наибольшей единицы, делящей секунды нацело
const UNITS_DESC: RestrictionUnit[] = ['YEARS', 'MONTHS', 'WEEKS', 'DAYS', 'HOURS', 'MINUTES', 'SECONDS'];

export const valueUnitToSeconds = (value: number, unit: RestrictionUnit): number => value * UNIT_SECONDS[unit];

// секунды -> {value, unit}: наибольшая единица, на которую делится нацело (как показывает abyss: 518400 -> 6 дней, 1209600 -> 2 недели)
export const secondsToValueUnit = (seconds: number): { value: number; unit: RestrictionUnit } => {
  const unit = UNITS_DESC.find((item) => seconds > 0 && seconds % UNIT_SECONDS[item] === 0) ?? 'SECONDS';
  return { value: seconds / UNIT_SECONDS[unit], unit };
};

import { RestrictionUnit } from './types';

// Опции единиц измерения временного интервала (для Select).
export const RESTRICTION_UNIT_OPTIONS: Array<{ value: RestrictionUnit; label: string }> = [
  { value: 'SECONDS', label: 'секунды' },
  { value: 'MINUTES', label: 'минуты' },
  { value: 'HOURS', label: 'часы' },
  { value: 'DAYS', label: 'дни' },
  { value: 'WEEKS', label: 'недели' },
  { value: 'MONTHS', label: 'месяцы' },
  { value: 'YEARS', label: 'годы' },
];

// Единица измерения по умолчанию для новой строки ограничения.
export const DEFAULT_RESTRICTION_UNIT: RestrictionUnit = 'YEARS';

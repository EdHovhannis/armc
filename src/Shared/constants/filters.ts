import { OptionItemType } from '@src/Shared/types/filter';

export const IN_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: 'IN', label: 'IN' },
  { value: 'NOT_IN', label: 'NOT IN' },
  { value: 'IS', label: 'IS' },
  { value: 'IS NOT', label: 'IS NOT' },
];

// только IN / NOT IN - для Меток (остальные мультиселекты допускают ещё IS / IS NOT)
export const IN_NOT_IN_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: 'IN', label: 'IN' },
  { value: 'NOT_IN', label: 'NOT IN' },
];

export const IS_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: 'IS', label: 'IS' },
  { value: 'IS_NOT', label: 'IS NOT' },
];

export const COMPARE_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: '>=', label: '≥' },
  { value: '<=', label: '≤' },
  { value: '=', label: '=' },
];

export const STATUS_OPTIONS: OptionItemType[] = [
  { value: 'RUNNING', label: 'RUNNING' },
  { value: 'STOPPED', label: 'STOPPED' },
  { value: 'FAILED', label: 'FAILED' },
  { value: 'UNDEFINED', label: 'UNDEFINED' },
  { value: 'WITHOUT_RESPONSE', label: 'WITHOUT_RESPONSE' },
];

export const ZONE_OPTIONS: OptionItemType[] = [
  { value: 'PRIMARY', label: 'PRIMARY' },
  { value: 'SECONDARY', label: 'SECONDARY' },
];

export const WRITE_SPEED_UNIT_OPTIONS: OptionItemType[] = [
  { value: 'B/s', label: 'B/s' },
  { value: 'KB/s', label: 'KB/s' },
  { value: 'MB/s', label: 'MB/s' },
  { value: 'GB/s', label: 'GB/s' },
];

export const INDEX_SIZE_UNIT_OPTIONS: OptionItemType[] = [
  { value: 'B', label: 'B' },
  { value: 'KB', label: 'KB' },
  { value: 'MB', label: 'MB' },
  { value: 'GB', label: 'GB' },
];

export const RETENTION_UNIT_OPTIONS: OptionItemType[] = [
  { value: 'сек', label: 'сек' },
  { value: 'мин', label: 'мин' },
  { value: 'ч', label: 'ч' },
  { value: 'дн', label: 'дн' },
];

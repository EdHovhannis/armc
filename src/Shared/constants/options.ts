import {
  DateUnitOption,
  SchemaFieldOption,
  SchemaSubFieldOption,
  SchemaTypeFieldOption,
  SizeUnitOption,
  SpeedUnitOption,
  SchemaDLQFieldOption,
  SchemaConditionFieldOption,
  SchemaAuditFieldOption,
  RetentionUnitOption,
} from '../types/filter';

export const SPEED_LIMITS_UNIT_OPTIONS = [
  { value: 'B/s', label: 'B/s' },
  { value: 'KB/s', label: 'KB/s' },
  { value: 'MB/s', label: 'MB/s' },
] as const satisfies SpeedUnitOption[];

export const SIZE_LIMITS_UNIT_OPTIONS = [
  { value: 'MB', label: 'MB' },
  { value: 'GB', label: 'GB' },
  { value: 'TB', label: 'TB' },
] as const satisfies SizeUnitOption[];

export const DATE_LIMITS_UNIT_OPTIONS = [
  { value: 'MONTH', label: 'месяцы' },
  { value: 'WEEKS', label: 'недели' },
  { value: 'DAYS', label: 'дни' },
  { value: 'HOURS', label: 'часы' },
  { value: 'MIN', label: 'минуты' },
  { value: 'SEC', label: 'секунды' },
] as const satisfies DateUnitOption[];

export const RETENTION_UNIT_OPTIONS = [
  { limit: 86_400, label: 'дн.' },
  { limit: 3_600, label: 'ч' },
  { limit: 60, label: 'мин' },
  { limit: 1, label: 'сек' },
] as const satisfies RetentionUnitOption[];

export const SCHEMA_FIELDS = [
  { value: 'STRING', label: 'STRING' },
  { value: 'TEXT', label: 'TEXT' },
  { value: 'INT', label: 'INT' },
  { value: 'DOUBLE', label: 'DOUBLE' },
  { value: 'LONG', label: 'LONG' },
  { value: 'DATE', label: 'DATE' },
  { value: 'BOOLEAN', label: 'BOOLEAN' },
  { value: 'ARRAY', label: 'ARRAY' },
] as const satisfies SchemaFieldOption[];

export const SCHEMA_SUB_FIELDS = [
  { value: 'STRING', label: 'STRING' },
  { value: 'INT', label: 'INT' },
  { value: 'DOUBLE', label: 'DOUBLE' },
  { value: 'LONG', label: 'LONG' },
  { value: 'DATE', label: 'DATE' },
  { value: 'BOOLEAN', label: 'BOOLEAN' },
] as const satisfies SchemaSubFieldOption[];

export const SCHEMA_TYPE_FIELDS = [
  { value: 'EQUALS', label: 'EQUALS' },
  { value: 'REGEX', label: 'REGEX' },
  { value: 'IS_NULL', label: 'IS_NULL' },
] as const satisfies SchemaTypeFieldOption[];

export const SCHEMA_CONDITION_FIELDS = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
] as const satisfies SchemaConditionFieldOption[];

export const SCHEMA_DLQ_FIELDS = [
  { value: true, label: 'Отправлять в DLQ' },
  { value: false, label: 'Игнорировать' },
] as const satisfies SchemaDLQFieldOption[];

export const SCHEMA_AUDIT_FIELDS = [
  { value: 'TEXT', label: 'TEXT' },
  { value: 'STRING', label: 'STRING' },
  { value: 'INT', label: 'INT' },
  { value: 'DOUBLE', label: 'DOUBLE' },
  { value: 'LONG', label: 'LONG' },
  { value: 'BOOLEAN', label: 'BOOLEAN' },
] as const satisfies SchemaAuditFieldOption[];

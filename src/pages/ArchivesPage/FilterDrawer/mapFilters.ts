import { ArchiveFilter } from '@src/Entities/Archives/api';

import { FilterFormValues } from './types';

// TODO(archives-filter-api): формат filters=[{field, op, values}] подтверждён реальными запросами со стенда.
// select-операторы по полю name: IS = eq, IS NOT = isNot, IN = in, NOT IN = notIn (вербальные camelCase, не ne/nin).
// операторы сравнения (Скорость обработки -> field maxOverdraftPercent): >= = ge, <= = le, = = eq (короткие ge/le, не gte/lte).
// подтверждённые field: name, maxOverdraftPercent, label (ед.ч., не labels).
// Остальные field (project/status/zone/version/диапазонные размеры) и единицы - предположение, уточнить у бэка.

// оператор из формы -> op в запросе
const OPERATOR_TO_OP: Record<string, string> = {
  IS: 'eq',
  'IS NOT': 'isNot',
  IS_NOT: 'isNot',
  IN: 'in',
  NOT_IN: 'notIn',
  '>=': 'ge',
  '<=': 'le',
  '=': 'eq',
};

const toOp = (operator: string): string => OPERATOR_TO_OP[operator] ?? 'eq';

// поле формы -> field в запросе
const FIELD_CONFIGURATION = 'name';
const FIELD_PROJECT = 'project';
const FIELD_STATUS = 'status';
const FIELD_LABELS = 'label';
const FIELD_ZONE = 'zone';
const FIELD_VERSION = 'version';
const FIELD_PROCESSING_SPEED = 'maxOverdraftPercent';
const FIELD_MAX_WRITE_SPEED = 'maxDataRateBytesPerSec';
const FIELD_MAX_INDEX_SIZE = 'maxSizeBytes';
const FIELD_MAX_RETENTION = 'maxStorageTimeSec';

// from/to задают ge/le независимо от оператора в дропдауне (вокабуляр ge/le подтверждён стендом).
// TODO(archives-filter-api): единицы измерения (unit) пока не конвертируются и не отправляются
const rangeFilters = (field: string, from: string, to: string): ArchiveFilter[] => {
  const result: ArchiveFilter[] = [];
  if (from.trim()) {
    result.push({ field, op: 'ge', values: [from.trim()] });
  }
  if (to.trim()) {
    result.push({ field, op: 'le', values: [to.trim()] });
  }
  return result;
};

// собирает применённый фильтр уровня 1 в формат запроса. пустые поля пропускаются
export const mapFormToArchiveFilters = (values: FilterFormValues): ArchiveFilter[] => {
  const filters: ArchiveFilter[] = [];

  if (values.configuration.values.length) {
    filters.push({ field: FIELD_CONFIGURATION, op: toOp(values.configuration.operator), values: values.configuration.values });
  }
  if (values.projectKey.values.length) {
    filters.push({ field: FIELD_PROJECT, op: toOp(values.projectKey.operator), values: values.projectKey.values });
  }
  if (values.status.values.length) {
    filters.push({ field: FIELD_STATUS, op: toOp(values.status.operator), values: values.status.values });
  }
  if (values.labels.values.length) {
    filters.push({ field: FIELD_LABELS, op: toOp(values.labels.operator), values: values.labels.values });
  }
  if (values.zone.value) {
    filters.push({ field: FIELD_ZONE, op: toOp(values.zone.operator), values: [values.zone.value] });
  }
  if (values.configVersion.value.trim()) {
    filters.push({ field: FIELD_VERSION, op: toOp(values.configVersion.operator), values: [values.configVersion.value.trim()] });
  }
  if (values.processingSpeed.value.trim()) {
    filters.push({ field: FIELD_PROCESSING_SPEED, op: toOp(values.processingSpeed.operator), values: [values.processingSpeed.value.trim()] });
  }

  filters.push(...rangeFilters(FIELD_MAX_WRITE_SPEED, values.maxWriteSpeed.from, values.maxWriteSpeed.to));
  filters.push(...rangeFilters(FIELD_MAX_INDEX_SIZE, values.maxIndexSize.from, values.maxIndexSize.to));
  filters.push(...rangeFilters(FIELD_MAX_RETENTION, values.maxRetention.from, values.maxRetention.to));

  return filters;
};

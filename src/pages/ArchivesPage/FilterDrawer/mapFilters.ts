import { ArchiveFilter } from '@src/Entities/Archives/api';

import { FilterFormValues } from './types';

// TODO(archives-filter-api): формат filters=[{field, op, values}] и пара name/eq подтверждены
// реальным запросом из соседнего стенда. Остальные field/op - предположение по полям
// ArchiveConfiguration, уточнить у бэка при интеграции (особенно операторы in/nin/ne и диапазоны).

// оператор из формы -> op в запросе
const OPERATOR_TO_OP: Record<string, string> = {
  IS: 'eq',
  'IS NOT': 'ne',
  IS_NOT: 'ne',
  IN: 'in',
  NOT_IN: 'nin',
  '>=': 'gte',
  '<=': 'lte',
  '=': 'eq',
};

const toOp = (operator: string): string => OPERATOR_TO_OP[operator] ?? 'eq';

// поле формы -> field в запросе
const FIELD_CONFIGURATION = 'name';
const FIELD_PROJECT = 'project';
const FIELD_STATUS = 'status';
const FIELD_LABELS = 'labels';
const FIELD_ZONE = 'zone';
const FIELD_VERSION = 'version';
const FIELD_PROCESSING_SPEED = 'processingRate';
const FIELD_MAX_WRITE_SPEED = 'maxDataRateBytesPerSec';
const FIELD_MAX_INDEX_SIZE = 'maxSizeBytes';
const FIELD_MAX_RETENTION = 'maxStorageTimeSec';

// from/to задают gte/lte независимо от оператора в дропдауне.
// TODO(archives-filter-api): единицы измерения (unit) пока не конвертируются и не отправляются
const rangeFilters = (field: string, from: string, to: string): ArchiveFilter[] => {
  const result: ArchiveFilter[] = [];
  if (from.trim()) {
    result.push({ field, op: 'gte', values: [from.trim()] });
  }
  if (to.trim()) {
    result.push({ field, op: 'lte', values: [to.trim()] });
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

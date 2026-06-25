import { CompareOperator, IsOperator, SelectOperator } from '@src/Shared/types/filter';

import { ArchiveFilter } from '@src/Entities/Archives/api';

import { FilterFormValues } from './types';

export const DEFAULT_FILTER_FORM_VALUES: FilterFormValues = {
  configuration: { operator: 'IN', values: [] },
  projectKey: { operator: 'IN', values: [] },
  status: { operator: 'IN', values: [] },
  labels: { operator: 'IN', values: [] },
  zone: { operator: 'IS', value: '' },
  configVersion: { operator: 'IS', value: '' },
  processingSpeed: { operator: '>=', value: '' },
  maxWriteSpeed: { operator: 'IN', from: '', to: '', unit: 'B/s' },
  maxIndexSize: { operator: 'IN', from: '', to: '', unit: 'B' },
  maxRetention: { operator: 'IN', from: '', to: '', unit: 'сек' },
};

const createDefaultFilterFormValues = (): FilterFormValues => ({
  configuration: { operator: 'IN', values: [] },
  projectKey: { operator: 'IN', values: [] },
  status: { operator: 'IN', values: [] },
  labels: { operator: 'IN', values: [] },
  zone: { operator: 'IS', value: '' },
  configVersion: { operator: 'IS', value: '' },
  processingSpeed: { operator: '>=', value: '' },
  maxWriteSpeed: { operator: 'IN', from: '', to: '', unit: 'B/s' },
  maxIndexSize: { operator: 'IN', from: '', to: '', unit: 'B' },
  maxRetention: { operator: 'IN', from: '', to: '', unit: 'сек' },
});

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

const OP_TO_SELECT_OPERATOR: Record<string, SelectOperator | 'IS' | 'IS NOT'> = {
  in: 'IN',
  notIn: 'NOT_IN',
  eq: 'IS',
  isNot: 'IS NOT',
};

const OP_TO_LABELS_OPERATOR: Record<string, SelectOperator> = {
  in: 'IN',
  notIn: 'NOT_IN',
};

const OP_TO_IS_OPERATOR: Record<string, IsOperator> = {
  eq: 'IS',
  isNot: 'IS_NOT',
};

const OP_TO_COMPARE_OPERATOR: Record<string, CompareOperator> = {
  ge: '>=',
  le: '<=',
  eq: '=',
};

const toSelectOperator = (op: string): SelectOperator | 'IS' | 'IS NOT' => OP_TO_SELECT_OPERATOR[op] ?? 'IN';
const toLabelsOperator = (op: string): SelectOperator => OP_TO_LABELS_OPERATOR[op] ?? 'IN';
const toIsOperator = (op: string): IsOperator => OP_TO_IS_OPERATOR[op] ?? 'IS';
const toCompareOperator = (op: string): CompareOperator => OP_TO_COMPARE_OPERATOR[op] ?? '>=';

export const mapArchiveFiltersToForm = (filters: ArchiveFilter[]): FilterFormValues => {
  const result = createDefaultFilterFormValues();

  for (const filter of filters) {
    switch (filter.field) {
      case FIELD_CONFIGURATION:
        result.configuration = {
          operator: toSelectOperator(filter.op) as FilterFormValues['configuration']['operator'],
          values: [...filter.values],
        };
        break;
      case FIELD_PROJECT:
        result.projectKey = {
          operator: toSelectOperator(filter.op) as FilterFormValues['projectKey']['operator'],
          values: [...filter.values],
        };
        break;
      case FIELD_STATUS:
        result.status = {
          operator: toSelectOperator(filter.op) as FilterFormValues['status']['operator'],
          values: [...filter.values] as FilterFormValues['status']['values'],
        };
        break;
      case FIELD_LABELS:
        result.labels = { operator: toLabelsOperator(filter.op), values: [...filter.values] };
        break;
      case FIELD_ZONE:
        result.zone = {
          operator: toIsOperator(filter.op),
          value: (filter.values[0] ?? '') as FilterFormValues['zone']['value'],
        };
        break;
      case FIELD_VERSION:
        result.configVersion = { operator: toIsOperator(filter.op), value: filter.values[0] ?? '' };
        break;
      case FIELD_PROCESSING_SPEED:
        result.processingSpeed = { operator: toCompareOperator(filter.op), value: filter.values[0] ?? '' };
        break;
      case FIELD_MAX_WRITE_SPEED:
        if (filter.op === 'ge') result.maxWriteSpeed.from = filter.values[0] ?? '';
        if (filter.op === 'le') result.maxWriteSpeed.to = filter.values[0] ?? '';
        break;
      case FIELD_MAX_INDEX_SIZE:
        if (filter.op === 'ge') result.maxIndexSize.from = filter.values[0] ?? '';
        if (filter.op === 'le') result.maxIndexSize.to = filter.values[0] ?? '';
        break;
      case FIELD_MAX_RETENTION:
        if (filter.op === 'ge') result.maxRetention.from = filter.values[0] ?? '';
        if (filter.op === 'le') result.maxRetention.to = filter.values[0] ?? '';
        break;
      default:
        break;
    }
  }

  return result;
};

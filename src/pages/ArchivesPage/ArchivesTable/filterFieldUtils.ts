import { STATUS_OPTIONS } from '@src/Shared/constants/filters';
import { OptionItemType } from '@src/Shared/types/filter';

import { ArchiveFilter } from '@src/Entities/Archives/api';

export const MULTI_SELECT_FILTER_FIELDS = new Set(['name', 'project', 'status', 'label']);

export const FIELD_LABELS: Record<string, string> = {
  name: 'Конфигурация',
  project: 'Ключ проекта',
  status: 'Статус',
  label: 'Метки',
  zone: 'Зона',
  version: 'Версия',
  maxOverdraftPercent: 'Скорость обработки',
  maxDataRateBytesPerSec: 'Макс. скорость записи',
  maxSizeBytes: 'Макс. размер индекса',
  maxStorageTimeSec: 'Макс. время хранения',
};

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map(({ value, label }) => [value, label])) as Record<string, string>;

export const getValueLabel = (field: string, value: string) => {
  if (field === 'status') {
    return STATUS_LABELS[value] ?? value;
  }
  return value;
};

export const getOptionsForField = (
  field: string,
  archiveFilterValues: { names: string[]; projects: string[]; labels: string[] },
): OptionItemType[] => {
  const toOptions = (items: string[]) => items.map((item) => ({ value: item, label: item }));

  switch (field) {
    case 'name':
      return toOptions(archiveFilterValues.names);
    case 'project':
      return toOptions(archiveFilterValues.projects);
    case 'status':
      return STATUS_OPTIONS;
    case 'label':
      return toOptions(archiveFilterValues.labels);
    default:
      return [];
  }
};

export const getFieldFilterValues = (filters: ArchiveFilter[], field: string): string[] =>
  filters.find((filter) => filter.field === field)?.values ?? [];

export const removeFieldFromFilters = (filters: ArchiveFilter[], field: string): ArchiveFilter[] =>
  filters.filter((filter) => filter.field !== field);

export const upsertFieldFilter = (filters: ArchiveFilter[], field: string, values: string[], op = 'in'): ArchiveFilter[] => {
  const nextFilters = removeFieldFromFilters(filters, field);
  if (!values.length) {
    return nextFilters;
  }
  return [...nextFilters, { field, op, values }];
};

import { BACKUP_FILTER, CORRUPTED_FILTER, IS_HOT_FILTER } from '@src/components/backups/LegacyFilter/FilterExtended';
import {
  createCollectionFilterDefinition,
  createDateFilterDefinition,
  createFilterParser,
  createIndexFilterDefinition,
  createProjectFilterDefinition,
  createSingleValueParser,
  serializeListToUrl,
  serializeStringToUrl,
} from '@src/components/backups/commonFilterDefinition';
import { FilterDefinition } from '@src/components/backups/types';
import { useMemo } from 'react';

const parseBackupFilterListFromUrl = createFilterParser('backupFilter', BACKUP_FILTER);
const parseIsHotFilterFromUrl = createSingleValueParser('isHotFilter', IS_HOT_FILTER);
const parseCorruptedFilterFromUrl = createSingleValueParser('corrupted', CORRUPTED_FILTER);

const createBackupStatusFilterDefinition = (): FilterDefinition => {
  return {
    key: 'backupFilter',
    label: 'Статус снятия бэкапа',
    type: 'checkboxgroup',
    options: Object.entries(BACKUP_FILTER).map(([value, label]) => ({
      value,
      label,
    })),
    extractValueFromUrl: parseBackupFilterListFromUrl,
    serializeToUrlParam: serializeListToUrl,
  };
};

const createIsHotFilterDefinition = (): FilterDefinition => {
  return {
    key: 'isHotFilter',
    label: 'Горячая',
    type: 'segmentgroup',
    options: Object.entries(IS_HOT_FILTER).map(([value, label]) => ({
      value,
      label,
    })),
    extractValueFromUrl: parseIsHotFilterFromUrl,
    serializeToUrlParam: serializeStringToUrl,
  };
};

const createCorruptedFilterDefinition = (): FilterDefinition => {
  return {
    key: 'corrupted',
    label: 'Аварийные',
    type: 'segmentgroup',
    options: Object.entries(CORRUPTED_FILTER).map(([value, label]) => ({
      value,
      label,
    })),
    extractValueFromUrl: parseCorruptedFilterFromUrl,
    serializeToUrlParam: serializeStringToUrl,
  };
};

const buildBackupControlFilterModel = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
): FilterDefinition[] => {
  return [
    createProjectFilterDefinition(filterProjects),
    createIndexFilterDefinition(filterIndexes),
    createCollectionFilterDefinition(selectedZone, backendErrorCallback),
    createBackupStatusFilterDefinition(),
    createIsHotFilterDefinition(),
    createCorruptedFilterDefinition(),
    createDateFilterDefinition('Дата последней резервной копии'),
  ];
};

export const useBackupControlFilterDefinitions = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
) => {
  return useMemo(
    () => buildBackupControlFilterModel(filterProjects, filterIndexes, selectedZone, backendErrorCallback),
    [filterProjects, filterIndexes, selectedZone],
  );
};

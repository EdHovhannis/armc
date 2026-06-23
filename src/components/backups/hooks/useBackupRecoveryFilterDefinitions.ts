import {
  createCollectionFilterDefinition,
  createDateFilterDefinition,
  createIndexFilterDefinition,
  createProjectFilterDefinition,
  createStatusFilterDefinition,
} from '@src/components/backups/commonFilterDefinition';
import { FilterDefinition } from '@src/components/backups/types';
import { useMemo } from 'react';

const buildBackupRecoveryFilterModel = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
): FilterDefinition[] => {
  return [
    createProjectFilterDefinition(filterProjects),
    createIndexFilterDefinition(filterIndexes),
    createCollectionFilterDefinition(selectedZone, backendErrorCallback),
    createStatusFilterDefinition(),
    createDateFilterDefinition('Дата запуска восстановления'),
  ];
};

export const useBackupRecoveryFilterDefinitions = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
) => {
  return useMemo(
    () => buildBackupRecoveryFilterModel(filterProjects, filterIndexes, selectedZone, backendErrorCallback),
    [filterProjects, filterIndexes, selectedZone],
  );
};

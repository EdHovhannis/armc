import {
  createCollectionFilterDefinition,
  createDateFilterDefinition,
  createIndexFilterDefinition,
  createProjectFilterDefinition,
  createStatusFilterDefinition,
  extractSelectedItems,
  parseValueListFromUrl,
  MAX_FETCH_OPTIONS,
  serializeListToUrl,
} from '@src/components/backups/commonFilterDefinition';
import { FilterDefinition, FilterSelections } from '@src/components/backups/types';
import BackupsService from '@src/services/BackupsService';
import { useMemo } from 'react';

const createBackupNameFilterDefinition = (selectedZone: string | null, backendErrorCallback: (message: string) => void): FilterDefinition => {
  return {
    key: 'namesFilter',
    label: 'Имя копии',
    type: 'multiselect',
    isSearchable: true,
    autocompleteConfig: {
      fetchOptions: async (inputValue: string, context: FilterSelections) => {
        const projectSelection = extractSelectedItems('projectFilter', context);
        const indexSelection = extractSelectedItems('indexFilter', context);
        const selectedCollections = extractSelectedItems('collectionsFilter', context);
        if (selectedZone) {
          return BackupsService.fetchBackupNamesAutocomplete(
            selectedZone,
            MAX_FETCH_OPTIONS,
            backendErrorCallback,
            projectSelection,
            indexSelection,
            selectedCollections,
            inputValue,
          ).then((result) => result?.map((e) => ({ value: e, label: e })) ?? []);
        }
        return [];
      },
      debounceTime: 400,
    },
    extractValueFromUrl: (searchParams) => parseValueListFromUrl('namesFilter', searchParams),
    serializeToUrlParam: serializeListToUrl,
  };
};

const buildBackupListFilterModel = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
): FilterDefinition[] => {
  return [
    createProjectFilterDefinition(filterProjects),
    createIndexFilterDefinition(filterIndexes),
    createCollectionFilterDefinition(selectedZone, backendErrorCallback),
    createDateFilterDefinition('Дата снятия резервной копии'),
    createStatusFilterDefinition(),
    createBackupNameFilterDefinition(selectedZone, backendErrorCallback),
  ];
};

export const useBackupListFilterDefinitions = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
) => {
  return useMemo(
    () => buildBackupListFilterModel(filterProjects, filterIndexes, selectedZone, backendErrorCallback),
    [filterProjects, filterIndexes, selectedZone],
  );
};

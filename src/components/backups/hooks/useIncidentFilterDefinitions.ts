import { FINISH_FILTER } from '@src/components/backups/LegacyFilter/FilterExtended';
import {
  createCollectionFilterDefinition,
  createDateFilterDefinition,
  createIndexFilterDefinition,
  createProjectFilterDefinition,
  createSingleValueParser,
  createStringArrayParser,
  serializeListToUrl,
  serializeStringToUrl,
} from '@src/components/backups/commonFilterDefinition';
import { ErrorClass, FilterDefinition, IErrorClass, IObjectType, ITaskStatus, ObjectType } from '@src/components/backups/types';
import { useMemo } from 'react';

const parseErrorClassListFromUrl = createStringArrayParser(
  'errorClassFilter',
  (value): value is ITaskStatus => ErrorClass.includes(value as IErrorClass),
  (value) => value,
);

const parseObjectTypeListFromUrl = createStringArrayParser(
  'objectTypeFilter',
  (value): value is ITaskStatus => ObjectType.includes(value as IObjectType),
  (value) => value,
);

const parseFinishFilterFromUrl = createSingleValueParser('finishFilter', FINISH_FILTER);

const createFinishFilterDefinition = (): FilterDefinition => {
  return {
    key: 'finishFilter',
    label: 'Статус инцидента',
    type: 'segmentgroup',
    options: Object.entries(FINISH_FILTER).map(([value, label]) => ({
      value,
      label,
    })),
    extractValueFromUrl: parseFinishFilterFromUrl,
    serializeToUrlParam: serializeStringToUrl,
  };
};

const createErrorClassFilterDefinition = (): FilterDefinition => {
  return {
    key: 'errorClassFilter',
    label: 'Тип ошибки',
    type: 'multiselect',
    isSearchable: true,
    options: ErrorClass.map((status) => ({ value: status, label: status })),
    extractValueFromUrl: parseErrorClassListFromUrl,
    serializeToUrlParam: serializeListToUrl,
  };
};

const createObjectFilterDefinition = (): FilterDefinition => {
  return {
    key: 'objectTypeFilter',
    label: 'Тип объекта',
    type: 'multiselect',
    isSearchable: true,
    options: ObjectType.map((status) => ({ value: status, label: status })),
    extractValueFromUrl: parseObjectTypeListFromUrl,
    serializeToUrlParam: serializeListToUrl,
  };
};
const buildIncidentsFilterModel = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
): FilterDefinition[] => {
  return [
    createProjectFilterDefinition(filterProjects),
    createIndexFilterDefinition(filterIndexes),
    createCollectionFilterDefinition(selectedZone, backendErrorCallback),
    createFinishFilterDefinition(),
    createErrorClassFilterDefinition(),
    createObjectFilterDefinition(),
    createDateFilterDefinition('Дата начала инцидента'),
  ];
};

export const useIncidentFilterDefinitions = (
  filterProjects: string[],
  filterIndexes: Record<string, string[]>,
  selectedZone: string | null,
  backendErrorCallback: (message: string) => void,
) => {
  return useMemo(
    () => buildIncidentsFilterModel(filterProjects, filterIndexes, selectedZone, backendErrorCallback),
    [filterProjects, filterIndexes, selectedZone],
  );
};

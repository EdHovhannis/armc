import {
  DateRangeSerialized,
  FilterDefinition,
  FilterSelection,
  FilterSelections,
  FilterValue,
  ITaskStatus,
  TaskStatus,
} from '@src/components/backups/types';
import BackupsService from '@src/services/BackupsService';

export const MAX_FETCH_OPTIONS = 10;

export const parseValueListFromUrl = (key: string, searchParams: URLSearchParams, validValues?: string[]): FilterSelection | undefined => {
  const projectParam = searchParams.get(key);
  if (!projectParam) return undefined;
  const selectedValues = projectParam.split(',');
  if (!!validValues && validValues.length > 0) {
    const filteredValues = selectedValues.filter((value) => validValues.includes(value));
    if (filteredValues.length === 0) return undefined;
    return {
      key: key,
      value: filteredValues.map((v) => ({ value: v, label: v })),
    };
  } else if (selectedValues.length === 0) {
    return undefined;
  } else {
    return {
      key: key,
      value: selectedValues.map((v) => ({ value: v, label: v })),
    };
  }
};

export const createStringArrayParser = <T extends string>(
  key: string,
  isValidValue: (value: string) => value is T,
  mapToLabel: (value: T) => string = (value) => value,
): ((params: URLSearchParams) => FilterSelection | undefined) => {
  return (searchParams: URLSearchParams): FilterSelection | undefined => {
    const param = searchParams.get(key);
    if (!param) return undefined;

    const validValues = param
      .split(',')
      .map((v) => v.trim())
      .filter(isValidValue);

    if (validValues.length === 0) {
      return undefined;
    }

    return {
      key,
      value: validValues.map((value) => ({
        value,
        label: mapToLabel(value),
      })),
    };
  };
};

const parseTaskStatusListFromUrl = createStringArrayParser(
  'statusFilter',
  (value): value is ITaskStatus => TaskStatus.includes(value as ITaskStatus),
  (value) => value,
);

export const createFilterParser = <T extends Record<string, string>>(
  key: string,
  filterMap: T,
): ((params: URLSearchParams) => FilterSelection | undefined) => {
  return (searchParams: URLSearchParams): FilterSelection | undefined => {
    const param = searchParams.get(key);
    if (!param) return undefined;

    const validValues = param
      .split(',')
      .map((v) => v.trim())
      .filter((v): v is keyof T & string => v in filterMap);

    if (validValues.length === 0) {
      return undefined;
    }

    return {
      key,
      value: validValues.map((value) => ({
        value,
        label: filterMap[value] as string,
      })),
    };
  };
};

export const createSingleValueParser = <T extends Record<string, string>>(
  key: string,
  filterMap: T,
): ((params: URLSearchParams) => FilterSelection | undefined) => {
  return (searchParams: URLSearchParams): FilterSelection | undefined => {
    const param = searchParams.get(key);
    if (!param) return undefined;

    const trimmedValue = param.trim();
    if (!(trimmedValue in filterMap)) return undefined;

    return {
      key,
      value: {
        value: trimmedValue,
        label: filterMap[trimmedValue] as string,
      },
    };
  };
};

export const serializeListToUrl = (filterSelection: FilterSelection) => {
  return (filterSelection.value as FilterValue[] | undefined)?.map((v) => v.value).join(',');
};

export const serializeStringToUrl = (filterSelection: FilterSelection) => {
  return (filterSelection.value as FilterValue | undefined | null)?.value || undefined;
};

const extractDateRangeFromUrl = (searchParams: URLSearchParams): FilterSelection | undefined => {
  const from = searchParams.get('fromFilter');
  const to = searchParams.get('toFilter');
  if (!from && !to) return undefined;
  return {
    key: 'date',
    fromValue: from || undefined,
    toValue: to || undefined,
  };
};

const serializeDateRangeToUrl = (value: FilterSelection): DateRangeSerialized | undefined => {
  const result: DateRangeSerialized = {};
  if (value.fromValue) result.fromFilter = value.fromValue;
  if (value.toValue) result.toFilter = value.toValue;
  return Object.keys(result).length > 0 ? result : undefined;
};

export const extractSelectedItems = (key: string, context: FilterSelection[]): string[] | undefined => {
  const projectSelection = context.find((s) => s.key === key)?.value as
    | {
        value: string;
        label: string;
      }[]
    | undefined;
  return projectSelection?.map((p) => p.value);
};

export const createProjectFilterDefinition = (filterProjects: string[]): FilterDefinition => {
  return {
    key: 'projectFilter',
    label: 'Проект',
    type: 'multiselect',
    isSearchable: true,
    options: filterProjects.map((v) => ({ value: v, label: String(v) })),
    extractValueFromUrl: (searchParams) => parseValueListFromUrl('projectFilter', searchParams, filterProjects),
    serializeToUrlParam: serializeListToUrl,
  };
};
export const createIndexFilterDefinition = (filterIndexes: Record<string, string[]>): FilterDefinition => {
  return {
    key: 'indexFilter',
    label: 'Индекс',
    type: 'multiselect',
    isSearchable: true,
    autocompleteConfig: {
      fetchOptions: async (inputValue: string, context: FilterSelections): Promise<FilterValue[]> => {
        const selectedProjects = extractSelectedItems('projectFilter', context);
        const filteredIndexesMap = selectedProjects?.length
          ? Object.fromEntries(Object.entries(filterIndexes).filter(([key]) => selectedProjects.includes(key)))
          : filterIndexes;
        const allIndexes = Object.values(filteredIndexesMap).flat();
        const filtered = inputValue ? allIndexes.filter((task) => task.toLowerCase().includes(inputValue.toLowerCase())) : allIndexes;
        return filtered.slice(0, 15).map((idx) => ({ value: idx, label: idx }));
      },
      debounceTime: 100,
    },
    extractValueFromUrl: (searchParams) => parseValueListFromUrl('indexFilter', searchParams, Object.values(filterIndexes).flat()),
    serializeToUrlParam: serializeListToUrl,
  };
};

export const createCollectionFilterDefinition = (selectedZone: string | null, backnedErrorCallback: (message: string) => void): FilterDefinition => {
  return {
    key: 'collectionsFilter',
    label: 'Коллекция',
    type: 'multiselect',
    isSearchable: true,
    autocompleteConfig: {
      fetchOptions: async (inputValue: string, context: FilterSelections): Promise<FilterValue[]> => {
        const selectedProjects = extractSelectedItems('projectFilter', context);
        const selectedIndexes = extractSelectedItems('indexFilter', context);
        if (!selectedZone) {
          return [];
        }
        const resp = await BackupsService.fetchCollectionsAutocomplete(
          selectedZone,
          MAX_FETCH_OPTIONS,
          backnedErrorCallback,
          selectedProjects,
          selectedIndexes,
          inputValue,
        );
        const readCollections = resp?.readCollections || [];
        const writeCollections = resp?.writeCollections || [];
        const collections: string[] = [...readCollections, ...writeCollections];
        return collections.map((col) => ({ value: col, label: col }));
      },
      debounceTime: 400,
    },
    extractValueFromUrl: (searchParams) => parseValueListFromUrl('collectionsFilter', searchParams),
    serializeToUrlParam: serializeListToUrl,
  };
};

export const createStatusFilterDefinition = (): FilterDefinition => {
  return {
    key: 'statusFilter',
    label: 'Статус',
    type: 'multiselect',
    isSearchable: true,
    options: TaskStatus.map((status) => ({ value: status, label: status })),
    extractValueFromUrl: parseTaskStatusListFromUrl,
    serializeToUrlParam: serializeListToUrl,
  };
};

export const createDateFilterDefinition = (label: string): FilterDefinition => {
  return {
    key: 'date',
    label: label,
    type: 'daterange',
    extractValueFromUrl: extractDateRangeFromUrl,
    serializeToUrlParam: serializeDateRangeToUrl,
  };
};

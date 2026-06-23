import { useState, useCallback } from 'react';

import { FilterDefinition, FilterSelections, FilterValue } from '../types';

type OptionsMap = Record<string, FilterValue[]>;
type LoadingMap = Record<string, boolean>;

export const useFilterOptions = () => {
  const [options, setOptions] = useState<OptionsMap>({});
  const [loading, setLoading] = useState<LoadingMap>({});

  const loadOptions = useCallback((def: FilterDefinition, inputValue: string, currentSelections: FilterSelections) => {
    if (!def.autocompleteConfig) return;

    const { fetchOptions, debounceTime = 300 } = def.autocompleteConfig;
    setLoading((prev) => ({ ...prev, [def.key]: true }));

    const timer = setTimeout(async () => {
      try {
        const fetched = await fetchOptions(inputValue, currentSelections);
        setOptions((prev) => ({ ...prev, [def.key]: fetched }));
      } catch (err) {
        console.error(`Failed to load options for ${def.key}`, err);
        setOptions((prev) => ({ ...prev, [def.key]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [def.key]: false }));
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, []);

  return { options, loading, loadOptions };
};

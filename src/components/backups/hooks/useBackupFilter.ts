import { FilterDefinition, FilterSelection, FilterSelections } from '@src/components/backups/types';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export const useBackupsFilter = (definitions: FilterDefinition[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterSelectedValues = useMemo(() => {
    const seenKeys = new Set<string>();
    return definitions
      .map((def) => def.extractValueFromUrl?.(searchParams))
      .filter((value): value is FilterSelection => value !== undefined)
      .filter((selection) => {
        if (seenKeys.has(selection.key)) {
          console.warn(`Duplicate filter key detected and removed: ${selection.key}`);
          return false;
        }
        seenKeys.add(selection.key);
        return true;
      });
  }, [definitions, searchParams]);

  const setFilterSelectedValues = useCallback(
    (newFilter: FilterSelections, options?: { replace?: boolean; resetPage?: boolean }) => {
      const { replace = true, resetPage = true } = options || {};
      const nextParams = new URLSearchParams(searchParams);

      if (resetPage) {
        nextParams.delete('page');
      }

      definitions.forEach((def) => {
        if (def.key) {
          nextParams.delete(def.key);
        }
        if (def.type === 'daterange') {
          nextParams.delete('fromFilter');
          nextParams.delete('toFilter');
        }
      });
      newFilter.forEach((selection) => {
        const definition = definitions.find((d) => d.key === selection.key);
        if (!definition || !definition.serializeToUrlParam) return;

        const serialized = definition.serializeToUrlParam(selection);
        if (!serialized) return;

        if (typeof serialized === 'string') {
          nextParams.set(definition.key, serialized);
        } else {
          if (serialized.fromFilter) {
            nextParams.set('fromFilter', serialized.fromFilter);
          }
          if (serialized.toFilter) {
            nextParams.set('toFilter', serialized.toFilter);
          }
        }
      });

      setSearchParams(nextParams, { replace });
    },
    [definitions, searchParams, setSearchParams],
  );

  return { filterSelectedValues, setFilterSelectedValues };
};

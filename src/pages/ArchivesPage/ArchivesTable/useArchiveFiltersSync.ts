import { useUnit } from 'effector-react';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { ArchiveFilter } from '@src/Entities/Archives/api';

import { $appliedArchiveFilters, onApplyArchiveFilters } from '../FilterDrawer/model';

const FILTERS_PARAM = 'filters';

const parseFilters = (raw: string | null): ArchiveFilter[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ArchiveFilter[]) : null;
  } catch {
    return null;
  }
};

export const useArchiveFiltersSync = () => {
  const setSearchParams = useSearchParams()[1];
  const [appliedFilters, applyFilters] = useUnit([$appliedArchiveFilters, onApplyArchiveFilters]);
  const isFirstSyncRef = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
<<<<<<< HEAD
    const restored = parseFilters(params.get(FILTERS_PARAM));
    if (restored?.length) {
      applyFilters(restored);
=======
    const filters = parseFilters(params.get(FILTERS_PARAM));
    if (filters?.length) {
      applyFilters(filters);
>>>>>>> 117d8ff6dfc12b87e25bb941f934836f8cc78cc2
    }
  }, [applyFilters]);

  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }

    const serialized = appliedFilters.length ? JSON.stringify(appliedFilters) : '';

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (serialized) {
          next.set(FILTERS_PARAM, serialized);
        } else {
          next.delete(FILTERS_PARAM);
        }
        return next;
      },
      { replace: true },
    );
  }, [appliedFilters, setSearchParams]);
};

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
    const restored = parseFilters(params.get(FILTERS_PARAM)) ?? parseFilters(localStorage.getItem(STORAGE_KEY));
    if (restored?.length) {
      applyFilters(restored);
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

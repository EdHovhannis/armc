import { useUnit } from 'effector-react';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { ArchiveFilter } from '@src/Entities/Archives/api';

import { $appliedArchiveFilters, onApplyArchiveFilters } from '../FilterDrawer/model';

const FILTERS_PARAM = 'filters';
const STORAGE_KEY = 'armc:archiveFilters';

const parseFilters = (raw: string | null): ArchiveFilter[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ArchiveFilter[]) : null;
  } catch {
    return null;
  }
};

// URL - источник истины для фильтра уровня 1: ссылку с ?filters= можно расшарить.
// localStorage дублирует на случай, если страницу открыли без query-параметров.
// Стор $appliedArchiveFilters остаётся применённым состоянием, URL/localStorage - слой персистентности поверх него.
export const useArchiveFiltersSync = () => {
  const setSearchParams = useSearchParams()[1];
  const [appliedFilters, applyFilters] = useUnit([$appliedArchiveFilters, onApplyArchiveFilters]);
  // первый прогон sync-эффекта совпадает с маунтом, когда стор ещё пуст до восстановления - его пропускаем
  const isFirstSyncRef = useRef(true);

  // восстановление один раз: сначала из URL, иначе из localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restored = parseFilters(params.get(FILTERS_PARAM)) ?? parseFilters(localStorage.getItem(STORAGE_KEY));
    if (restored?.length) {
      applyFilters(restored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // стор -> URL + localStorage
  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }

    const serialized = appliedFilters.length ? JSON.stringify(appliedFilters) : '';

    if (serialized) {
      localStorage.setItem(STORAGE_KEY, serialized);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

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

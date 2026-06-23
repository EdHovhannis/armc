import { Box, Button } from '@sds-eng/base';
import FilterControl from '@src/components/backups/FilterControls/FilterControl';
import { SetFiltersFn } from '@src/components/backups/GenericBackupsTable';
import { FilterDefinition, FilterSelection, FilterSelections, FilterValue } from '@src/components/backups/types';
import React, { useEffect, useMemo, useState } from 'react';

interface IColumnMenuFilter {
  lastBackupDef: FilterDefinition;
  dateDef: FilterDefinition;
  selections: FilterSelections;
  updateSelection: (updates: FilterSelections) => void;
  closeFilterPopover?: () => void;
}
const findFilterSelection = (filterSelections: FilterSelections, key: string): FilterSelection | undefined => {
  return filterSelections.filter((def) => def.key === key)[0];
};

const LastBackupColumnMenuFilter = ({ lastBackupDef, dateDef, selections, updateSelection, closeFilterPopover }: IColumnMenuFilter) => {
  const [localSelections, setLocalSelections] = useState<FilterSelections | undefined>(selections);

  useEffect(() => setLocalSelections(selections), [selections]);

  const updateHandler = (key: string, updates: Partial<FilterSelection>) => {
    setLocalSelections((prev) => {
      if (!prev) return [{ ...updates, key: key } as FilterSelection];

      const filtered = prev.filter((s) => s.key !== key);
      const updated: FilterSelection = { ...findFilterSelection(prev, key), ...updates, key: key };

      return [...filtered, updated];
    });
  };

  const applyHandler = () => {
    if (localSelections) {
      updateSelection(localSelections);
      closeFilterPopover?.();
    } else {
      setLocalSelections([]);
      updateSelection([]);
      closeFilterPopover?.();
    }
  };

  const resetFilters = () => {
    updateSelection([]);
    setLocalSelections([]);
    closeFilterPopover?.();
  };

  const isContainsSuccessStatuses = useMemo(() => {
    const lastBackupFilterSelection = findFilterSelection(localSelections ?? [], lastBackupDef.key);
    if (lastBackupFilterSelection) {
      if (Array.isArray(lastBackupFilterSelection.value)) {
        const selectedValues = ((lastBackupFilterSelection.value || []) as FilterValue[]).map((v) => v.value);
        return selectedValues.includes('OK');
      }
    }
    return false;
  }, [localSelections]);

  useEffect(() => {
    if (!isContainsSuccessStatuses) {
      setLocalSelections((prev) => {
        if (prev) {
          return prev?.filter((f) => f.key !== dateDef.key);
        }
        return prev;
      });
    }
  }, [isContainsSuccessStatuses]);

  return (
    <div>
      {/*Фильтр выбора статуса последнего бэкапа*/}
      <Box style={{ marginBottom: '16px' }}>
        <FilterControl
          mode={'grid'}
          updateSelection={(updates) => updateHandler(lastBackupDef.key, updates)}
          def={lastBackupDef}
          selection={localSelections?.filter((s) => s.key === lastBackupDef.key)[0]}
          options={lastBackupDef.options}
        />
      </Box>

      {/*Фильтр выбора даты последнего бэкапа, если первый фильтр предполагает наличие таких элементов*/}
      {isContainsSuccessStatuses && (
        <FilterControl
          mode={'grid'}
          updateSelection={(updates) => updateHandler(dateDef.key, updates)}
          def={dateDef}
          selection={localSelections?.filter((s) => s.key === dateDef.key)[0]}
        />
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button size="sm" onClick={applyHandler}>
          Применить
        </Button>
        <Button size="sm" view="secondary" onClick={resetFilters}>
          Сбросить
        </Button>
      </div>
    </div>
  );
};

export const createLastBackupColumnMenuFilter = (
  lastBackupDef: FilterDefinition | undefined,
  dateDef: FilterDefinition | undefined,
  filterSelectedValues: FilterSelections,
  setFilterSelectedValues: SetFiltersFn,
  closeFilterPopover?: () => void,
) => {
  if (!!lastBackupDef && !!dateDef) {
    return (
      <LastBackupColumnMenuFilter
        lastBackupDef={lastBackupDef}
        dateDef={dateDef}
        closeFilterPopover={closeFilterPopover}
        selections={filterSelectedValues}
        updateSelection={(updates) => {
          setFilterSelectedValues(updates);
        }}
      />
    );
  }
  return undefined;
};

export default LastBackupColumnMenuFilter;

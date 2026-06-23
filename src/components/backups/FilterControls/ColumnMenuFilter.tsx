import { Button } from '@sds-eng/base';
import FilterControl from '@src/components/backups/FilterControls/FilterControl';
import { SetFiltersFn } from '@src/components/backups/GenericBackupsTable';
import { FilterDefinition, FilterSelection, FilterSelections, FilterValue } from '@src/components/backups/types';
import { findFilterSelection } from '@src/components/backups/utils';
import React, { useEffect, useState } from 'react';

interface IColumnMenuFilter {
  def: FilterDefinition;
  selections: FilterSelections;
  updateSelection: (updates: FilterSelections) => void;
  closeFilterPopover?: () => void;
}

const ColumnMenuFilter = ({ def, selections, updateSelection, closeFilterPopover }: IColumnMenuFilter) => {
  const [localSelections, setLocalSelections] = useState<FilterSelections | undefined>(selections);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<FilterValue[]>(def.options ?? []);

  useEffect(() => setLocalSelections(selections), [selections]);

  const updateHandler = (updates: Partial<FilterSelection>) => {
    setLocalSelections((prev) => {
      if (!prev) return [{ ...updates, key: def.key } as FilterSelection];

      const filtered = prev.filter((s) => s.key !== def.key);
      const updated: FilterSelection = { ...findFilterSelection(prev, def.key), ...updates, key: def.key };

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

  const loadOptionsHandler = (inputValue: string) => {
    if (def.autocompleteConfig) {
      setLoading(true);
      def.autocompleteConfig
        .fetchOptions(inputValue, selections)
        .then((fetched) => setOptions(fetched))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div>
      <FilterControl
        mode={'grid'}
        updateSelection={updateHandler}
        def={def}
        selection={localSelections?.filter((s) => s.key === def.key)[0]}
        options={options ?? def.options}
        loading={loading}
        loadOptions={loadOptionsHandler}
      />
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

export const createDataGridColumnMenuFilter = (
  def: FilterDefinition | undefined,
  filterSelectedValues: FilterSelections,
  setFilterSelectedValues: SetFiltersFn,
  closeFilterPopover?: () => void,
) => {
  if (def) {
    return (
      <ColumnMenuFilter
        closeFilterPopover={closeFilterPopover}
        def={def}
        selections={filterSelectedValues}
        updateSelection={(updates) => {
          setFilterSelectedValues(updates);
        }}
      />
    );
  }
  return undefined;
};

export default ColumnMenuFilter;

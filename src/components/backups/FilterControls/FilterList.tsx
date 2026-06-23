import { ListItem, Typography } from '@material-ui/core';
import { useFilterOptions } from '@src/components/backups/hooks/useFilterOptions';
import React, { useMemo } from 'react';

import { FilterDefinition, FilterSelection, FilterSelections } from '../types';

import FilterControl from './FilterControl';

interface FilterListProps {
  definitions: FilterDefinition[];
  updateSelection: (key: string, updates: Partial<FilterSelection>) => void;
  currentSelections: FilterSelections;
}

export const FilterList: React.FC<FilterListProps> = ({ definitions, updateSelection, currentSelections }) => {
  const currentSelectionsMap = useMemo(() => {
    return (currentSelections ?? []).reduce<Record<string, FilterSelection>>((acc, selection) => {
      if (selection?.key != null) {
        acc[selection.key] = selection;
      }
      return acc;
    }, {});
  }, [currentSelections]);

  const { options, loading, loadOptions } = useFilterOptions();
  if (definitions.length === 0) {
    return (
      <ListItem>
        <Typography align="center">Нет доступных фильтров</Typography>
      </ListItem>
    );
  }

  return (
    <>
      {definitions.map((def) => (
        <React.Fragment key={def.key}>
          <ListItem style={{ flexDirection: 'column', alignItems: 'stretch', paddingBottom: '8px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', paddingBottom: '4px' }}>
              {def.label}
            </Typography>
            <FilterControl
              mode={'sidebar'}
              def={def}
              selection={currentSelectionsMap[def.key]}
              updateSelection={(updates: Partial<FilterSelection>) => updateSelection(def.key, updates)}
              options={options[def.key]}
              loading={loading[def.key]}
              loadOptions={(inputValue: string) => loadOptions(def, inputValue, currentSelections)}
            />
          </ListItem>
          {/*<Divider />*/}
        </React.Fragment>
      ))}
    </>
  );
};

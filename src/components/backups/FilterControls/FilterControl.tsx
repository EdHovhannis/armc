import CheckboxGroupFilter from '@src/components/backups/FilterControls/CheckboxGroupFilter';
import SegmentGroupFilter from '@src/components/backups/FilterControls/SegmentGroupFilter';
import React from 'react';

import { FilterDefinition, FilterSelection, FilterValue } from '../types';

import DateRangeFilter from './DateRangeFilter';
import MultiselectFilter from './MultiselectFilter';

type UpdateFn = (updates: Partial<FilterSelection>) => void;

interface FilterControlProps {
  mode: 'sidebar' | 'grid';
  def: FilterDefinition;
  selection?: FilterSelection;
  updateSelection: UpdateFn;
  options?: FilterValue[];
  loading?: boolean;
  loadOptions?: (inputValue: string) => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({ mode, def, selection, updateSelection, options, loading, loadOptions }) => {
  const handleChange = (value: any) => {
    updateSelection({ value });
  };

  const handleDateChange = (values: { fromValue?: string; toValue?: string }) => {
    updateSelection(values);
  };

  const handleInputChange = (inputValue: string) => {
    if (loadOptions) {
      loadOptions(inputValue);
    }
  };

  const handleMenuOpen = () => {
    if (loadOptions) {
      loadOptions('');
    }
  };

  if (def.autocompleteConfig) {
    switch (def.type) {
      case 'multiselect':
        return (
          <MultiselectFilter
            key={`autocomplete-${def.key}`}
            definition={def}
            value={(selection?.value as any[]) || []}
            onChange={handleChange}
            isLoading={loading ?? false}
            onInputChange={handleInputChange}
            onMenuOpen={handleMenuOpen}
            options={options}
          />
        );
    }
  }

  switch (def.type) {
    case 'multiselect':
      return <MultiselectFilter key={`multiselect-${def.key}`} definition={def} value={(selection?.value as any[]) || []} onChange={handleChange} />;

    case 'checkboxgroup':
      return (
        <CheckboxGroupFilter
          mode={mode}
          key={`checkboxgroup-${def.key}`}
          definition={def}
          value={(selection?.value as any[]) || []}
          onChange={handleChange}
        />
      );
    case 'segmentgroup':
      return (
        <SegmentGroupFilter
          mode={mode}
          key={`segmentgroup-${def.key}`}
          definition={def}
          value={selection?.value as any | null}
          onChange={handleChange}
        />
      );

    case 'daterange':
      return (
        <DateRangeFilter
          key={`daterange-${def.key}`}
          fromValue={selection?.fromValue || null}
          toValue={selection?.toValue || null}
          onChange={handleDateChange}
        />
      );
    default:
      return <div style={{ color: 'red', fontSize: '0.875rem' }}>Неизвестный тип фильтра: {def.type}</div>;
  }
};

export default FilterControl;

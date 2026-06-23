import { ComboBox, ComboboxEvent } from '@sds-eng/base';
import { CustomOptionListProps, CustomOptionList } from '@src/components/backups/FilterControls/CustomOptionList';
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';

import { FilterDefinition, FilterValue } from '../types';

interface MultiselectFilterProps {
  definition: FilterDefinition;
  value: FilterValue[];
  onChange: (value: FilterValue[]) => void;
  onMenuOpen?: () => void;
  options?: FilterValue[];
  onInputChange?: (value: string) => void;
  isLoading?: boolean;
}

const MultiselectFilter: React.FC<MultiselectFilterProps> = ({ definition, value, onChange, onMenuOpen, options, onInputChange, isLoading }) => {
  const combinedOptions = useMemo(() => {
    const availableOptions = options ?? definition.options ?? [];
    const availableValues = new Set(availableOptions.map((opt) => opt.value));
    const missingOptions = value.filter((v) => !availableValues.has(v.value));
    return [...availableOptions, ...missingOptions];
  }, [options, definition.options, value]);

  const [searchValue, setSearchValue] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) return combinedOptions;
    const term = searchValue.trim().toLowerCase();
    return combinedOptions.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [combinedOptions, searchValue]);

  const buttonEnabled = useMemo(() => {
    return !isLoading && filteredOptions.length > 0;
  }, [isLoading, filteredOptions]);

  const handleSelectChange = (selectedValues: FilterValue[] | undefined) => {
    if (!selectedValues) {
      onChange([]);
      return;
    }
    const selectedValues0 = selectedValues.map((v) => v.value);
    const selectedOptions = combinedOptions.filter((opt) => selectedValues0.includes(opt.value)) || [];
    onChange(selectedOptions);
  };

  const handleReset = () => {
    onChange([]);
  };

  const handleInputChange = debounce((inputValue: string) => {
    onInputChange?.(inputValue);
    setSearchValue(inputValue);
  }, 500);

  const handleSelectAll = useCallback(() => {
    const selectedValuesSet = new Set(value.map((v) => v.value));
    const newOptions = filteredOptions.filter((opt) => !selectedValuesSet.has(opt.value));
    onChange([...value, ...newOptions]);
  }, [filteredOptions, searchValue, value, onChange]);

  const OptionListComponent = useCallback(
    (props: CustomOptionListProps) => <CustomOptionList {...props} onSelectAll={handleSelectAll} buttonEnabled={buttonEnabled} />,
    [buttonEnabled, handleSelectAll],
  );

  return (
    <ComboBox
      multiple
      canClear
      options={combinedOptions}
      value={value}
      placeholder={'Введите значение'}
      isSearchable={definition.isSearchable}
      loading={isLoading ?? false}
      disableCloseOnSelect
      disableClearInputOnChange
      components={{
        OptionList: OptionListComponent,
      }}
      onMenuOpen={onMenuOpen}
      onChange={(_v: string[], _e: ComboboxEvent, fullValue?: FilterValue[]) => {
        handleSelectChange(fullValue);
      }}
      onInputChange={handleInputChange}
      onReset={handleReset}
      withTags
      noOptionsText={'Нет доступных вариантов'}
    />
  );
};

export default MultiselectFilter;

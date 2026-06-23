import { Select } from '@sds-eng/base';
import * as React from 'react';

interface Option {
  value: string;
  label: string;
}

interface IFilterSelect {
  label: string;
  value: string | string[] | null;
  values: string[] | Record<string, string>;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  allowEmpty?: boolean;
  loading?: boolean;
  searchable?: boolean;
  placeholder?: string;
  onChange: (value: string | string[] | null) => void;
}

export const FilterSelect: React.FC<IFilterSelect> = ({
  value,
  values,
  required,
  multiple,
  disabled,
  allowEmpty,
  loading,
  searchable,
  placeholder,
  onChange,
  label,
}: IFilterSelect) => {
  const options: Option[] = React.useMemo(() => {
    if (Array.isArray(values)) {
      return values.map((v) => ({ value: v, label: String(v) }));
    } else if (typeof values === 'object' && values !== null) {
      return Object.entries(values).map(([value, label]) => ({ value, label: String(label) }));
    }
    return [];
  }, [values]);

  const selectedOption = React.useMemo(() => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) {
      return options.filter((opt) => value.includes(opt.value));
    } else {
      return options.find((opt) => opt.value === value) || null;
    }
  }, [options, value]);

  return (
    <Select
      options={options}
      value={selectedOption}
      label={label}
      required={required ?? false}
      multiple={multiple ?? false}
      disabled={disabled ?? false}
      canClear={allowEmpty ?? false}
      loading={loading ?? false}
      isSearchable={searchable ?? false}
      placeholder={placeholder ?? ''}
      style={{ width: '100%' }}
      onChange={(v: string[]) => onChange(v)}
    />
  );
};

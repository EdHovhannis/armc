import Grid from '@material-ui/core/Grid';
import { Checkbox, LabelControl } from '@sds-eng/base';
import { FilterDefinition, FilterValue } from '@src/components/backups/types';
import React from 'react';

interface ICheckboxGroupFilter {
  mode: 'sidebar' | 'grid';
  definition: FilterDefinition;
  value: FilterValue[];
  onChange: (value: FilterValue[]) => void;
}

const CheckboxGroupFilter = ({ mode, definition, value, onChange }: ICheckboxGroupFilter) => {
  const handleCheckboxChange = (option: FilterValue) => (checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter((v) => v.value !== option.value));
    }
  };
  return (
    <Grid container wrap="nowrap" direction={mode === 'grid' ? 'column' : undefined} spacing={1}>
      {definition.options?.map((option, index) => {
        const isChecked = value.some((v) => v.value === option.value);
        return (
          <Grid
            key={option.value}
            item
            xs
            style={{
              marginRight: mode === 'sidebar' && index === (definition?.options?.length ?? 0) - 1 ? 0 : '8px',
              marginBottom: mode === 'grid' && index === (definition?.options?.length ?? 0) - 1 ? 0 : '8px',
              border: '1px solid',
              borderColor: isChecked ? 'rgb(21, 73, 171)' : 'rgba(6, 10, 12, 0.12)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LabelControl
              key={option.value}
              label={option.label}
              style={{ fontSize: '16px', padding: '8px' }}
              checked={isChecked}
              onChange={(e) => handleCheckboxChange(option)(e.target.checked)}
              control={<Checkbox />}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CheckboxGroupFilter;

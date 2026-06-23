import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

export interface ICustomAutocomplete {
  id: string;
  options: Array<string>;
  value?: string;
  onChange: (value: string | null | undefined) => void;
  label: string;
  style?: React.CSSProperties;
}

export const CustomAutocomplete: React.FC<ICustomAutocomplete> = ({ id, options, value, onChange, label, style }: ICustomAutocomplete) => {
  const selectDefaultStyle = { marginTop: 16, width: 'calc(95% - 120px)' };
  return (
    <Autocomplete
      fullWidth
      id={id}
      options={options}
      value={value}
      style={style ? style : selectDefaultStyle}
      onChange={(_, value: string) => onChange(value)}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
    />
  );
};

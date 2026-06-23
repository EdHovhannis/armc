import { TextField, TextFieldProps } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type ControllerTextFieldProps = Pick<TextFieldProps, 'size' | 'placeholder'> & {
  // путь до поля формы со строковым значением
  name: string;
};

const ControllerTextField: FC<ControllerTextFieldProps> = ({ name, size = 'md', placeholder }) => {
  const { control } = useFormContext();

  return <Controller name={name} control={control} render={({ field }) => <TextField size={size} placeholder={placeholder} {...field} />} />;
};

export default ControllerTextField;

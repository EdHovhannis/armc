import { InputNumber, InputNumberProps } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';

type ControllerInputNumberProps = Pick<InputNumberProps, 'size' | 'placeholder' | 'precision'> & {
  // путь до числового поля формы
  name: string;
  rules?: RegisterOptions;
};

const ControllerInputNumber: FC<ControllerInputNumberProps> = ({ name, rules, size = 'sm', ...inputProps }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => <InputNumber size={size} {...inputProps} {...field} error={!!fieldState.error} />}
    />
  );
};

export default ControllerInputNumber;

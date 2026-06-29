import { Select, SelectNextProps } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { OptionItemType } from '@src/Shared/types/filter';

type ControllerSelectSingleProps = Pick<SelectNextProps<OptionItemType>, 'size' | 'placeholder' | 'canClear' | 'formatOptionLabel'> & {
  name: string;
  options: OptionItemType[];
};

const ControllerSelectSingle: FC<ControllerSelectSingleProps> = ({ name, options, size = 'md', ...selectProps }) => {
  // без generic, компонент общий и имена полей приходят строками
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = options.find((option) => option.value === field.value) ?? null;
        return <Select size={size} options={options} {...selectProps} {...field} value={value} />;
      }}
    />
  );
};

export default ControllerSelectSingle;

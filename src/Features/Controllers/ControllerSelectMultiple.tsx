import { Select, SelectNextProps } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { OptionItemType } from '@src/Shared/types/filter';

type ControllerSelectMultipleProps = Pick<
  SelectNextProps<OptionItemType>,
  'size' | 'placeholder' | 'isSearchable' | 'disableCloseOnSelect' | 'formatOptionLabel'
> & {
  // путь до поля формы, в форме лежит массив строк-значений опций
  name: string;
  options: OptionItemType[];
};

// onChange селекта может отдать и строки, и опции, приводим к строкам
const toMultiValues = (selected: unknown): string[] => {
  if (!Array.isArray(selected)) return [];
  return selected.map((item) => (typeof item === 'string' ? item : (item as OptionItemType).value));
};

const ControllerSelectMultiple: FC<ControllerSelectMultipleProps> = ({ name, options, size = 'md', ...selectProps }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const values = options.filter((option) => (field.value as string[]).includes(option.value));
        // спредим весь field (onBlur, ref и т.д.), поверх свои value/onChange
        return (
          <Select
            multiple
            size={size}
            options={options}
            {...selectProps}
            {...field}
            value={values}
            onChange={(selected) => field.onChange(toMultiValues(selected))}
          />
        );
      }}
    />
  );
};

export default ControllerSelectMultiple;

import { Select, SelectNextProps } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { OptionItemType } from '@src/Shared/types/filter';
import { components as virtualizedComponents } from '@src/Shared/ui/VirtualizedList';

type ControllerSelectMultipleProps = Pick<
  SelectNextProps<OptionItemType>,
  'size' | 'placeholder' | 'isSearchable' | 'disableCloseOnSelect' | 'formatOptionLabel'
> & {
  // путь до поля формы, в форме лежит массив строк-значений опций
  name: string;
  options: OptionItemType[];
  // виртуализация выпадашки
  virtualized?: boolean;
};

// onChange селекта может отдать и строки, и опции, приводим к строкам
const toMultiValues = (selected: unknown): string[] => {
  if (!Array.isArray(selected)) return [];
  return selected.map((item) => (typeof item === 'string' ? item : (item as OptionItemType).value));
};

const ControllerSelectMultiple: FC<ControllerSelectMultipleProps> = ({ name, options, size = 'md', virtualized, ...selectProps }) => {
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
            // выпадашка не закрывается при выборе, чтобы выбрать несколько значений
            disableCloseOnSelect
            components={virtualized ? (virtualizedComponents as SelectNextProps<OptionItemType>['components']) : undefined}
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

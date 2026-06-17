import { Select } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { RESTRICTION_UNIT_OPTIONS } from '@src/Shared/constants/restrictions';
import { components } from '@src/Shared/ui/VirtualizedList';

import ControllerInputNumber from '@src/Features/Controllers/ControllerInputNumber';
import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';

import * as styles from './styles.module.css';
import { RestrictionEntityRow, RestrictionListName } from './types';

type Option = { value: string; label: string };

type EntitySelectCellProps = {
  name: RestrictionListName;
  index: number;
  placeholder: string;
  options: Option[];
  loading: boolean;
};

// Select сущности (индекс/проект) с исключением уже выбранных в других строках значений.
// Оставлен инлайн: виртуализированный components не ложится на типы общего ControllerSelectSingle
export const EntitySelectCell: FC<EntitySelectCellProps> = ({ name, index, placeholder, options, loading }) => {
  const { control } = useFormContext();
  const rows: RestrictionEntityRow[] = useWatch({ control, name, defaultValue: [] });
  const selectedElsewhere = new Set(
    rows
      .filter((_, rowIndex) => rowIndex !== index)
      .map((row) => row.entity)
      .filter(Boolean),
  );
  const availableOptions = options.filter((option) => !selectedElsewhere.has(option.value));

  return (
    <Controller
      name={`${name}.${index}.entity`}
      control={control}
      rules={{ required: true }}
      render={({ field, fieldState }) => {
        const currentValue = options.find((option) => option.value === field.value) || null;
        return (
          <Select
            placeholder={placeholder}
            options={availableOptions}
            value={currentValue}
            onChange={field.onChange}
            isSearchable
            limitByWidth
            loading={loading}
            components={components}
            error={!!fieldState.error}
            size="md"
          />
        );
      }}
    />
  );
};

type IntervalCellProps = {
  name: RestrictionListName;
  index: number;
};

// ячейка "Макс. временной интервал поиска": целое значение + единица измерения
export const IntervalCell: FC<IntervalCellProps> = ({ name, index }) => (
  <>
    <div className={styles.drawerRestrictionIntervalValue}>
      <ControllerInputNumber
        name={`${name}.${index}.value`}
        placeholder="Введите значение"
        precision={0}
        rules={{ required: true, validate: (value) => Number.isInteger(value) && (value ?? 0) > 0 }}
      />
    </div>
    <div className={styles.drawerRestrictionIntervalUnit}>
      <ControllerSelectSingle name={`${name}.${index}.unit`} options={RESTRICTION_UNIT_OPTIONS} />
    </div>
  </>
);

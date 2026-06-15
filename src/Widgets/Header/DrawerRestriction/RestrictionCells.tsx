import { InputNumber, Select } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { components } from '@src/Shared/ui/VirtualizedList';

import { RESTRICTION_UNIT_OPTIONS } from '@src/Entities/Restriction/constants';

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
export const EntitySelectCell: FC<EntitySelectCellProps> = ({ name, index, placeholder, options, loading }) => {
  const { control } = useFormContext();
  const rows = (useWatch({ control, name }) ?? []) as RestrictionEntityRow[];
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
            size="sm"
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

// Ячейка «Макс. временной интервал поиска»: целое значение + единица измерения.
export const IntervalCell: FC<IntervalCellProps> = ({ name, index }) => {
  const { control } = useFormContext();

  return (
    <>
      <div className={styles.drawerRestrictionIntervalValue}>
        <Controller
          name={`${name}.${index}.value`}
          control={control}
          rules={{ required: true, validate: (value) => Number.isInteger(value) && (value ?? 0) > 0 }}
          render={({ field, fieldState }) => (
            <InputNumber
              placeholder="Введите значение"
              valueType="number"
              precision={0}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              size="sm"
            />
          )}
        />
      </div>
      <div className={styles.drawerRestrictionIntervalUnit}>
        <Controller
          name={`${name}.${index}.unit`}
          control={control}
          render={({ field }) => {
            const currentValue = RESTRICTION_UNIT_OPTIONS.find((option) => option.value === field.value) || null;
            return <Select options={RESTRICTION_UNIT_OPTIONS} value={currentValue} onChange={field.onChange} size="sm" />;
          }}
        />
      </div>
    </>
  );
};

import { Button, Icon, Select } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { RESTRICTION_UNIT_OPTIONS } from '@src/Shared/constants/restrictions';
import { secondsToValueUnit } from '@src/Shared/lib/format/restrictionSeconds';
import { components } from '@src/Shared/ui/VirtualizedList';

import { fetchObjectRestrictionFx } from '@src/Entities/Restriction/api';

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
  loadedIds: Set<string>;
};

// Select сущности (индекс/проект) с исключением уже выбранных в других строках значений.
// Оставлен инлайн: виртуализированный components не ложится на типы общего ControllerSelectSingle
export const EntitySelectCell: FC<EntitySelectCellProps> = ({ name, index, placeholder, options, loading, loadedIds }) => {
  const { control, setValue } = useFormContext();
  const fetchObjectRestriction = useUnit(fetchObjectRestrictionFx);
  const rows: RestrictionEntityRow[] = useWatch({ control, name, defaultValue: [] });
  const selectedElsewhere = new Set(
    rows
      .filter((_, rowIndex) => rowIndex !== index)
      .map((row) => row.entity)
      .filter(Boolean),
  );
  const availableOptions = options.filter((option) => !selectedElsewhere.has(option.value));

  // при выборе сущности подтягиваем её текущее ограничение (merged) и заполняем интервал.
  // загруженные из overview значения уже есть - их пропускаем, чтобы не дёргать лишние запросы.
  // null (нет своего ограничения или dev-бэк недоступен) - значение не трогаем, вводят вручную
  const entityValue = rows[index]?.entity ?? '';
  useEffect(() => {
    if (!entityValue || loadedIds.has(entityValue)) return undefined;
    let cancelled = false;
    fetchObjectRestriction({ type: name === 'byIndex' ? 'INDEX' : 'PROJECT', id: entityValue }).then((seconds) => {
      if (cancelled || seconds === null) return;
      const { value, unit } = secondsToValueUnit(seconds);
      setValue(`${name}.${index}.value`, value);
      setValue(`${name}.${index}.unit`, unit);
    });
    return () => {
      cancelled = true;
    };
  }, [name, index, entityValue, loadedIds, fetchObjectRestriction, setValue]);

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

type DeleteRestrictionCellProps = {
  name: RestrictionListName;
  index: number;
  loadedIds: Set<string>;
  onDelete: (index: number) => void;
};

// удаление строки. у единственной пустой строки скрываем - удалять нечего.
// сохранённая строка (есть в overview) - корзина, грид покажет подтверждение и пошлёт DELETE.
// несохранённая (добавили руками или из kebab) - крестик, удаляется сразу без подтверждения
export const DeleteRestrictionCell: FC<DeleteRestrictionCellProps> = ({ name, index, loadedIds, onDelete }) => {
  const { control } = useFormContext();
  const rows: RestrictionEntityRow[] = useWatch({ control, name, defaultValue: [] });
  const row = rows[index];
  const isOnlyEmptyRow = rows.length === 1 && !row?.entity && row?.value === null;

  if (isOnlyEmptyRow) return null;

  const entity = row?.entity ?? '';
  const persisted = Boolean(entity) && loadedIds.has(entity);
  const icon = persisted ? <Icon.Delete /> : <Icon.Close />;
  const label = persisted ? 'Удалить ограничение' : 'Убрать строку';

  return <Button.Icon icon={icon} view="secondary" size="sm" aria-label={label} onClick={() => onDelete(index)} />;
};

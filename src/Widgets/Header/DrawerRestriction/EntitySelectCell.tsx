import { Select } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { secondsToValueUnit } from '@src/Shared/lib/format/restrictionSeconds';
import { components } from '@src/Shared/ui/VirtualizedList';

import { fetchObjectRestrictionFx } from '@src/Entities/Restriction/api';

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
  preselectIndexId: string | null;
};

const EntitySelectCell: FC<EntitySelectCellProps> = ({ name, index, placeholder, options, loading, loadedIds, preselectIndexId }) => {
  const { control, setValue, getValues } = useFormContext();
  const fetchObjectRestriction = useUnit(fetchObjectRestrictionFx);
  const rows: RestrictionEntityRow[] = useWatch({ control, name, defaultValue: [] });
  const selectedElsewhere = new Set(
    rows
      .filter((_, rowIndex) => rowIndex !== index)
      .map((row) => row.entity)
      .filter(Boolean),
  );
  const availableOptions = options.filter((option) => !selectedElsewhere.has(option.value));

  const entityValue = rows[index]?.entity ?? '';
  const locked = Boolean(entityValue) && (loadedIds.has(entityValue) || (name === 'byIndex' && entityValue === preselectIndexId));
  useEffect(() => {
    if (!entityValue || loadedIds.has(entityValue)) return;
    fetchObjectRestriction({ type: name === 'byIndex' ? 'INDEX' : 'PROJECT', id: entityValue }).then((seconds) => {
      if (seconds === null) return;
      if (getValues(`${name}.${index}.entity`) !== entityValue) return;
      const { value, unit } = secondsToValueUnit(seconds);
      setValue(`${name}.${index}.value`, value);
      setValue(`${name}.${index}.unit`, unit);
    });
  }, [name, index, entityValue, loadedIds, fetchObjectRestriction, setValue, getValues]);

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
            className={locked ? styles.drawerRestrictionLockedSelect : undefined}
            isSearchable
            limitByWidth
            disabled={locked}
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

export default EntitySelectCell;

import { Checkbox, Divider, DropdownMenu, DropdownMenuItem, Icon, Tag, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, KeyboardEvent, MouseEvent, useCallback, useMemo } from 'react';

import { STATUS_OPTIONS } from '@src/Shared/constants/filters';
import { OptionItemType } from '@src/Shared/types/filter';

import { ArchiveFilter, fetchArchivesFiltersFx } from '@src/Entities/Archives/api';
import { $archiveFilterValues } from '@src/Entities/Archives/model';

import * as styles from './styles.module.css';

const MULTI_SELECT_FIELDS = new Set(['name', 'project', 'status', 'label']);

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map(({ value, label }) => [value, label])) as Record<string, string>;

const getValueLabel = (field: string, value: string) => {
  if (field === 'status') {
    return STATUS_LABELS[value] ?? value;
  }
  return value;
};

const getOptionsForField = (field: string, archiveFilterValues: { names: string[]; projects: string[]; labels: string[] }): OptionItemType[] => {
  const toOptions = (items: string[]) => items.map((item) => ({ value: item, label: item }));

  switch (field) {
    case 'name':
      return toOptions(archiveFilterValues.names);
    case 'project':
      return toOptions(archiveFilterValues.projects);
    case 'status':
      return STATUS_OPTIONS;
    case 'label':
      return toOptions(archiveFilterValues.labels);
    default:
      return [];
  }
};

interface ArchiveFilterChipProps {
  filter: ArchiveFilter;
  filterIndex: number;
  fieldLabel: string;
  onUpdateValues: (filterIndex: number, values: string[]) => void;
  onRemoveFilter: (filterIndex: number) => void;
}

const ArchiveFilterChip: FC<ArchiveFilterChipProps> = ({ filter, filterIndex, fieldLabel, onUpdateValues, onRemoveFilter }) => {
  const [archiveFilterValues, fetchArchivesFilters] = useUnit([$archiveFilterValues, fetchArchivesFiltersFx]);

  const chipValueText = filter.values.length === 1 ? getValueLabel(filter.field, filter.values[0] ?? '') : `Выбрано ${filter.values.length}`;

  const menuOptions = useMemo(() => {
    if (!MULTI_SELECT_FIELDS.has(filter.field)) {
      return filter.values.map((value) => ({ value, label: getValueLabel(filter.field, value) }));
    }

    const fieldOptions = getOptionsForField(filter.field, archiveFilterValues);
    return fieldOptions.length ? fieldOptions : filter.values.map((value) => ({ value, label: getValueLabel(filter.field, value) }));
  }, [archiveFilterValues, filter.field, filter.values]);

  const handleRemoveFilter = useCallback(
    (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      onRemoveFilter(filterIndex);
    },
    [filterIndex, onRemoveFilter],
  );

  const handleToggleValue = useCallback(
    (value: string) => {
      const nextValues = filter.values.includes(value) ? filter.values.filter((item) => item !== value) : [...filter.values, value];
      onUpdateValues(filterIndex, nextValues);
    },
    [filter.values, filterIndex, onUpdateValues],
  );

  const handleOpenMenu = useCallback(() => {
    if (MULTI_SELECT_FIELDS.has(filter.field)) {
      fetchArchivesFilters();
    }
  }, [fetchArchivesFilters, filter.field]);

  const chipContent = (
    <>
      <Text kind="bodyS" className={styles.filterChipField}>
        {fieldLabel}
      </Text>
      &nbsp;
      <Text kind="textSb">{chipValueText}</Text>
    </>
  );

  return (
    <DropdownMenu
      action="click"
      placement="bottom-start"
      content={
        <div className={styles.filterChipMenu}>
          <Text kind="textSb" className={styles.filterChipMenuTitle}>
            {fieldLabel}
          </Text>
          {menuOptions.map((option) => {
            const isSelected = filter.values.includes(option.value);

            return (
              <DropdownMenuItem
                key={option.value}
                closeMenuOnClick={false}
                onClick={() => handleToggleValue(option.value)}
                prefix={<Checkbox checked={isSelected} tabIndex={-1} />}
              >
                {option.label}
              </DropdownMenuItem>
            );
          })}
          <Divider className={styles.filterChipMenuDivider} />
          <DropdownMenuItem closeMenuOnClick prefix={<Icon.Delete />} onClick={() => onRemoveFilter(filterIndex)}>
            Удалить фильтр
          </DropdownMenuItem>
        </div>
      }
    >
      <Tag className={styles.filterChipInteractive} onDelete={handleRemoveFilter} onClick={handleOpenMenu}>
        {chipContent}
      </Tag>
    </DropdownMenu>
  );
};

export default ArchiveFilterChip;

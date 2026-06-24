import { Checkbox, Divider, DropdownMenu, DropdownMenuItem, Icon, Tag, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, KeyboardEvent, MouseEvent, useCallback, useMemo } from 'react';

import { ArchiveFilter, fetchArchivesFiltersFx } from '@src/Entities/Archives/api';
import { $archiveFilterValues } from '@src/Entities/Archives/model';

import {
  getOptionsForField,
  getValueLabel,
  MULTI_SELECT_FILTER_FIELDS,
} from './filterFieldUtils';
import * as styles from './styles.module.css';

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
    if (!MULTI_SELECT_FILTER_FIELDS.has(filter.field)) {
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
    if (MULTI_SELECT_FILTER_FIELDS.has(filter.field)) {
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

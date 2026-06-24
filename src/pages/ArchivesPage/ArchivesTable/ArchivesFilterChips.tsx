import { Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useCallback } from 'react';

import { $appliedArchiveFilters, onApplyArchiveFilters, onResetArchiveFilters } from '../FilterDrawer/model';

import ArchiveFilterChip from './ArchiveFilterChip';
import * as styles from './styles.module.css';

const FIELD_LABELS: Record<string, string> = {
  name: 'Конфигурация',
  project: 'Проект',
  status: 'Статус',
  label: 'Метки',
  zone: 'Зона',
  version: 'Версия',
  maxOverdraftPercent: 'Скорость обработки',
  maxDataRateBytesPerSec: 'Макс. скорость записи',
  maxSizeBytes: 'Макс. размер индекса',
  maxStorageTimeSec: 'Макс. время хранения',
};

const getChipKey = (filter: { field: string; op: string }, index: number) => `${filter.field}-${filter.op}-${index}`;

const ArchivesFilterChips: FC = () => {
  const [appliedFilters, applyFilters, resetFilters] = useUnit([$appliedArchiveFilters, onApplyArchiveFilters, onResetArchiveFilters]);

  const removeFilter = useCallback(
    (index: number) => applyFilters(appliedFilters.filter((_, itemIndex) => itemIndex !== index)),
    [appliedFilters, applyFilters],
  );

  const updateFilterValues = useCallback(
    (index: number, values: string[]) => {
      if (!values.length) {
        removeFilter(index);
        return;
      }

      applyFilters(appliedFilters.map((filter, itemIndex) => (itemIndex === index ? { ...filter, values } : filter)));
    },
    [appliedFilters, applyFilters, removeFilter],
  );

  if (!appliedFilters.length) return null;

  return (
    <div className={styles.filterChips}>
      {appliedFilters.map((filter, index) => {
        const fieldLabel = FIELD_LABELS[filter.field] ?? filter.field;

        return (
          <ArchiveFilterChip
            key={getChipKey(filter, index)}
            filter={filter}
            filterIndex={index}
            fieldLabel={fieldLabel}
            onUpdateValues={updateFilterValues}
            onRemoveFilter={removeFilter}
          />
        );
      })}
        <Text as="span" kind="bodyS" className={styles.filterChipsReset} onClick={() => resetFilters()}>
          Сбросить все
        </Text> 
    </div>
  );
};

export default ArchivesFilterChips;

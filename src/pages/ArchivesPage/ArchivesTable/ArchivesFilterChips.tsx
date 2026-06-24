import { Tag, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { ArchiveFilter } from '@src/Entities/Archives/api';

import { $appliedArchiveFilters, onApplyArchiveFilters, onResetArchiveFilters } from '../FilterDrawer/model';

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

const getChipKey = (filter: ArchiveFilter, index: number) => `${filter.field}-${filter.op}-${index}`;

const ArchivesFilterChips: FC = () => {
  const [appliedFilters, applyFilters, resetFilters] = useUnit([$appliedArchiveFilters, onApplyArchiveFilters, onResetArchiveFilters]);

  if (!appliedFilters.length) return null;

  const removeFilter = (index: number) => applyFilters(appliedFilters.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className={styles.filterChips}>
      {appliedFilters.map((filter, index) => {
        const fieldLabel = FIELD_LABELS[filter.field] ?? filter.field;

        return (
          <Tag key={getChipKey(filter, index)} onDelete={() => removeFilter(index)}>
            <Text kind="bodyS" className={styles.filterChipField}>
              {fieldLabel}
            </Text>
            &nbsp;
            <Text kind="textSb">{filter.values.length === 1 ? filter.values : `Выбрано ${filter.values.length}`}</Text>
          </Tag>
        );
      })}
        <Text as="span" kind="bodyS" className={styles.filterChipsReset} onClick={() => resetFilters()}>
          Сбросить все
        </Text> 
    </div>
  );
};

export default ArchivesFilterChips;

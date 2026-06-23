import { Tag, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { ArchiveFilter } from '@src/Entities/Archives/api';

import { $appliedArchiveFilters, onApplyArchiveFilters, onResetArchiveFilters } from '../FilterDrawer/model';

import * as styles from './styles.module.css';

// человекочитаемые подписи для field/op из формата запроса (см. FilterDrawer/mapFilters.ts)
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

const OP_LABELS: Record<string, string> = {
  eq: '',
  isNot: 'не',
  in: 'из',
  notIn: 'не из',
  ge: '≥',
  le: '≤',
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
        const opLabel = OP_LABELS[filter.op] ?? filter.op;

        return (
          <Tag key={getChipKey(filter, index)} onDelete={() => removeFilter(index)}>
            <Text kind="bodyS" className={styles.filterChipField}>
              {opLabel ? `${fieldLabel} ${opLabel}` : fieldLabel}
            </Text>
            &nbsp;
            <Text kind="textSb">{filter.values.join(', ')}</Text>
          </Tag>
        );
      })}
      <span className={styles.filterChipsReset} onClick={() => resetFilters()}>
        <Text as="span" kind="bodyS">
          Сбросить все
        </Text>
      </span>
    </div>
  );
};

export default ArchivesFilterChips;

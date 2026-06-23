import { Grid } from '@material-ui/core';
import * as React from 'react';

import { FilterPeriod, IPeriodValue } from './FilterPeriod';
import { FilterSelect } from './FilterSelect';

interface IFilterExtendedProps {
  backup: string[];
  setBackup: (value: string[]) => void;
  corrupted: string | null;
  setCorrupted: (value: string) => void;
  period: IPeriodValue;
  setPeriod: (value: IPeriodValue) => void;
  finish: string | null;
  setFinish: (value: string | null) => void;
  visibleFields: string[];
}

export const BACKUP_FILTER = {
  NONE: 'Отсутствует',
  OK: 'Есть',
  IN_PROGRESS: 'Снимается',
};

export const IS_HOT_FILTER = {
  true: 'Да',
  false: 'Нет',
};

export const FINISH_FILTER = {
  FINISHED: 'Решенные',
  ACTIVE: 'Не решенные',
};

export const CORRUPTED_FILTER = {
  OK: 'Ок',
  FAIL: 'Ошибка',
  MAINTENANCE: 'Обслуживание',
};

export const FilterExtended: React.FC<IFilterExtendedProps> = ({
  backup,
  setBackup,
  corrupted,
  setCorrupted,
  period,
  setPeriod,
  finish,
  setFinish,
  visibleFields = [],
}) => (
  <>
    {visibleFields.includes('backup') && (
      <Grid item xs={3}>
        <FilterSelect
          multiple
          label={'Резервные копии'}
          value={backup}
          values={BACKUP_FILTER}
          onChange={(value) => {
            setBackup(value);
          }}
        />
      </Grid>
    )}
    {visibleFields.includes('finish') && (
      <Grid item xs={3}>
        <FilterSelect label={'Статус'} value={finish} values={FINISH_FILTER} onChange={(value) => setFinish(value)} />
      </Grid>
    )}
    {visibleFields.includes('period') && (
      <Grid item xs={3}>
        <FilterPeriod value={period} onChange={setPeriod} />
      </Grid>
    )}
    {visibleFields.includes('corrupted') && (
      <Grid item xs={3}>
        <FilterSelect allowEmpty label={'Аварийные'} value={corrupted} values={CORRUPTED_FILTER} onChange={(value) => setCorrupted(value)} />
      </Grid>
    )}
  </>
);

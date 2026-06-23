import { FC } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';
import ControllerTextField from '@src/Features/Controllers/ControllerTextField';

import * as styles from './styles.module.css';

type FilterDrawerRangeProps = {
  name: 'maxWriteSpeed' | 'maxIndexSize' | 'maxRetention';
  unitOptions: OptionItemType[];
};

// диапазон "от - до" , плюс единица измерения
const FilterDrawerRange: FC<FilterDrawerRangeProps> = ({ name, unitOptions }) => (
  <div className={styles.filterDrawerRangeRow}>
    <div className={styles.filterDrawerRangeInput}>
      <ControllerTextField name={`${name}.from`} placeholder="от" />
    </div>
    <span className={styles.filterDrawerRangeDash}>—</span>
    <div className={styles.filterDrawerRangeInput}>
      <ControllerTextField name={`${name}.to`} placeholder="до" />
    </div>
    <div className={styles.filterDrawerUnitSelect}>
      <ControllerSelectSingle name={`${name}.unit`} options={unitOptions} />
    </div>
  </div>
);

export default FilterDrawerRange;

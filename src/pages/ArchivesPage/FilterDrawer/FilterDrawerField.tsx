import { Text } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import { OptionItemType } from '@src/Shared/types/filter';

import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';

import * as styles from './styles.module.css';

type FilterDrawerFieldProps = {
  title: string;
  operatorName: string;
  operatorOptions: OptionItemType[];
  children: ReactNode;
};

// строка фильтра: заголовок + селект оператора + контрол значения
const FilterDrawerField: FC<FilterDrawerFieldProps> = ({ title, operatorName, operatorOptions, children }) => (
  <div className={styles.filterDrawerField}>
    <Text kind="h5b">{title}</Text>
    <div className={styles.filterDrawerControls}>
      <div className={styles.filterDrawerOperatorSelect}>
        <ControllerSelectSingle name={operatorName} options={operatorOptions} />
      </div>
      {children}
    </div>
  </div>
);

export default FilterDrawerField;

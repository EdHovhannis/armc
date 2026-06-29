import { FC } from 'react';

import { RESTRICTION_UNIT_OPTIONS } from '@src/Shared/constants/restrictions';

import ControllerInputNumber from '@src/Features/Controllers/ControllerInputNumber';
import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';

import * as styles from './styles.module.css';
import { RestrictionListName } from './types';

type IntervalCellProps = {
  name: RestrictionListName;
  index: number;
};

const IntervalCell: FC<IntervalCellProps> = ({ name, index }) => (
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

export default IntervalCell;

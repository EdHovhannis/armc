import { Text } from '@sds-eng/base';
import { FC } from 'react';

import { RESTRICTION_UNIT_OPTIONS } from '@src/Shared/constants/restrictions';

import ControllerInputNumber from '@src/Features/Controllers/ControllerInputNumber';
import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';

import * as styles from './styles.module.css';

const AllIndexesTab: FC = () => (
  <div className={styles.drawerRestrictionAllTab}>
    <Text kind="textSn" className={styles.drawerRestrictionAllLabel}>
      Максимальный временной интервал поиска
    </Text>
    <div className={styles.drawerRestrictionAllInterval}>
      <div className={styles.drawerRestrictionIntervalValue}>
        <ControllerInputNumber
          name="all.value"
          placeholder="Введите значение"
          precision={0}
          rules={{ required: true, validate: (value) => Number.isInteger(value) && (value ?? 0) > 0 }}
        />
      </div>
      <div className={styles.drawerRestrictionIntervalUnit}>
        <ControllerSelectSingle name="all.unit" options={RESTRICTION_UNIT_OPTIONS} />
      </div>
    </div>
  </div>
);

export default AllIndexesTab;

import { Button } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { onChangeHeaderOpenRestrictionDrawer } from './model';
import * as styles from './styles.module.css';

const HeaderWidget: FC = () => {
  const [onChangeHeaderOpenRestrictionDrawerFn] = useUnit([onChangeHeaderOpenRestrictionDrawer]);
  return (
    <div className={styles.headerWidgetWrapper}>
      <Button
        kind="contained"
        size="md"
        view="secondary"
        onClick={() => onChangeHeaderOpenRestrictionDrawerFn(true)}
        classes={{ button: styles.headerButton, text: styles.headerButtonText }}
      >
        Ограничения
      </Button>
    </div>
  );
};

export default HeaderWidget;

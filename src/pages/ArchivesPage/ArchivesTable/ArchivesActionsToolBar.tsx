import { Button, Icon, Text } from '@sds-eng/base';
import { FC } from 'react';

import { SpeedIcon } from '@src/Shared/assets/icons/SpeedIcon';

import * as styles from './styles.module.css';

interface ArchivesActionsToolBarProps {
  rowSelectionCount: number;
}

export const ArchivesActionsToolBar: FC<ArchivesActionsToolBarProps> = ({ rowSelectionCount }) => {
  return (
    <div className={styles.actionsToolBar}>
      <div className={styles.actionsToolBarText}>
        <Text as="span">Выбрано:</Text>
        <Text as="span">{rowSelectionCount}</Text>
      </div>
      <div className={styles.actionsToolBarActions}>
        <Button icon={<Icon.Play />} contentType="Icon" />
        <Button icon={<SpeedIcon />} contentType="Icon" />
        <Button icon={<Icon.Delete />} contentType="Icon" />
      </div>
    </div>
  );
};

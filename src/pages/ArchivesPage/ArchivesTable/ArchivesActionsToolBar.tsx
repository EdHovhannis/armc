import { Button, Icon, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { SpeedIcon } from '@src/Shared/assets/icons/SpeedIcon';

import { SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import * as styles from './styles.module.css';

interface ArchivesActionsToolBarProps {
  rowSelectionCount: number;
}

export const ArchivesActionsToolBar: FC<ArchivesActionsToolBarProps> = ({ rowSelectionCount }) => {
  const [tableView] = useUnit([$tableView]);
  const isInstancePage = tableView === SEGMENT_INSTANCES;
  return (
    <div className={styles.actionsToolBar}>
      <div className={styles.actionsToolBarText}>
        <Text as="span">Выбрано:</Text>
        <Text as="span">{rowSelectionCount}</Text>
      </div>
      <div className={styles.actionsToolBarActions}>
        {isInstancePage && <Button icon={<Icon.Play />} contentType="Icon" />}
        {isInstancePage && <Button icon={<SpeedIcon />} contentType="Icon" />}
        <Button icon={<Icon.Delete />} contentType="Icon" />
      </div>
    </div>
  );
};

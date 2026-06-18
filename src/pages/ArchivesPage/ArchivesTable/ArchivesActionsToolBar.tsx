import { Button, Icon, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { SpeedIcon } from '@src/Shared/assets/icons/SpeedIcon';

import { deleteArchivesFx, deleteArchivesInstancesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $selectedRowIds, $tableView, setRowSelection } from '@src/Features/TableView/model';

import * as styles from './styles.module.css';

interface ArchivesActionsToolBarProps {
  rowSelectionCount: number;
  onDeleteSuccess: () => void;
}

export const ArchivesActionsToolBar: FC<ArchivesActionsToolBarProps> = ({ rowSelectionCount, onDeleteSuccess }) => {
  const [
    tableView,
    selectedRowIds,
    archiveInstances,
    archiveConfigs,
    deleteArchives,
    isDeleteArchivesPending,
    setRowSelectionFn,
    deleteArchivesInstances,
    isDeleteInstancesPending,
  ] = useUnit([
    $tableView,
    $selectedRowIds,
    $archiveInstances,
    $archiveConfigs,
    deleteArchivesFx,
    deleteArchivesFx.pending,
    setRowSelection,
    deleteArchivesInstancesFx,
    deleteArchivesFx.pending,
  ]);
  const isInstancePage = tableView === SEGMENT_INSTANCES;
  const handleDeleteArchive = async () => {
    switch (tableView) {
      case SEGMENT_CONFIGURATIONS:
        {
          const urlsFordelete = archiveConfigs
            .filter((item) => selectedRowIds[item.id])
            .map(({ projectKey, configuration }) => {
              return `/v1/internal/index/archive/task/project/${projectKey}/name/${configuration}/config`;
            });

          try {
            await deleteArchives(urlsFordelete);
            setRowSelectionFn({});
            onDeleteSuccess();
          } catch {
            // Ошибка уже обрабатывается через deleteArchivesFx.failData.
          }
        }
        break;
      case SEGMENT_INSTANCES: {
        const urlsFordelete = archiveInstances
          .filter((item) => selectedRowIds[item.id])
          .map(({ projectName, configName, zoneId }) => {
            return `/internal/index/archive/task/project/${projectName}/name/${configName}/zone/${zoneId}/instance`;
          });
        try {
          await deleteArchivesInstances(urlsFordelete);
          setRowSelectionFn({});
          onDeleteSuccess();
        } catch {
          // Ошибка уже обрабатывается через deleteArchivesFx.failData.
        }
      }
    }

    //
  };
  return (
    <div className={styles.actionsToolBar}>
      <div className={styles.actionsToolBarText}>
        <Text as="span">Выбрано:</Text>
        <Text as="span">{rowSelectionCount}</Text>
      </div>
      <div className={styles.actionsToolBarActions}>
        {isInstancePage && <Button icon={<Icon.Play />} contentType="Icon" onClick={() => console.log('selectedRowIds', selectedRowIds)} />}
        {isInstancePage && <Button icon={<SpeedIcon />} contentType="Icon" />}
        <Button
          icon={<Icon.Delete />}
          contentType="Icon"
          onClick={handleDeleteArchive}
          disabled={isDeleteArchivesPending || isDeleteInstancesPending}
        />
      </div>
    </div>
  );
};

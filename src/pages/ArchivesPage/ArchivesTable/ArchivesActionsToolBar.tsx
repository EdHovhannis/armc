import { Button, Icon, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useState } from 'react';

import { SpeedIcon } from '@src/Shared/assets/icons/SpeedIcon';

import { deleteArchivesFx, deleteArchivesInstancesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $selectedRowIds, $tableView, setRowSelection } from '@src/Features/TableView/model';

import { DeleteArchiveConfirmModal } from '../DeleteConfigModal';
import { onOpenOverDraftModal } from '../OverDraftModal/model';

import * as styles from './styles.module.css';

interface ArchivesActionsToolBarProps {
  rowSelectionCount: number;
  onDeleteSuccess: () => void;
}

export const ArchivesActionsToolBar: FC<ArchivesActionsToolBarProps> = ({ rowSelectionCount, onDeleteSuccess }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    onOpenOverDraft,
  ] = useUnit([
    $tableView,
    $selectedRowIds,
    $archiveInstances,
    $archiveConfigs,
    deleteArchivesFx,
    deleteArchivesFx.pending,
    setRowSelection,
    deleteArchivesInstancesFx,
    deleteArchivesInstancesFx.pending,
    onOpenOverDraftModal,
  ]);
  const isInstancePage = tableView === SEGMENT_INSTANCES;
  const deleteEntityName = isInstancePage ? 'экземпляр' : 'архив';
  const deleteEntityNamePlural = isInstancePage ? 'экземпляры' : 'архивы';
  const deleteEntityNameGenitive = isInstancePage ? 'экземпляра' : 'архива';
  const deleteEntityNameGenitivePlural = isInstancePage ? 'экземпляров' : 'архивов';
  const deleteEntityText = rowSelectionCount === 1 ? deleteEntityName : deleteEntityNamePlural;
  const deleteEntityRestoreText = rowSelectionCount === 1 ? 'Его' : 'Их';
  const deleteEntityTitleText = rowSelectionCount === 1 ? deleteEntityNameGenitive : deleteEntityNameGenitivePlural;

  const deleteSelectedArchives = async (deleteAction: (urls: string[]) => Promise<unknown>, urls: string[]) => {
    const isDeleted = await deleteAction(urls).then(
      () => true,
      () => false,
    );

    if (!isDeleted) return;

    setRowSelectionFn({});
    setIsDeleteModalOpen(false);
    onDeleteSuccess();
  };

  const handleDeleteArchive = async () => {
    switch (tableView) {
      case SEGMENT_CONFIGURATIONS:
        {
          const urlsFordelete = archiveConfigs
            .filter((item) => selectedRowIds[item.id])
            .map(({ projectKey, configuration }) => {
              return `/v1/internal/index/archive/task/project/${projectKey}/name/${configuration}/config`;
            });

          await deleteSelectedArchives(deleteArchives, urlsFordelete);
        }
        break;
      case SEGMENT_INSTANCES: {
        const urlsFordelete = archiveInstances
          .filter((item) => selectedRowIds[item.id])
          .map(({ projectName, configName, zoneId }) => {
            return `/internal/index/archive/task/project/${projectName}/name/${configName}/zone/${zoneId}/instance`;
          });
        await deleteSelectedArchives(deleteArchivesInstances, urlsFordelete);
      }
    }
  };

  const handleOpenOverDraftModal = () => {
    const selectedInstances = archiveInstances.filter((item) => selectedRowIds[item.id]);
    onOpenOverDraft(selectedInstances);
  };

  return (
    <div className={styles.actionsToolBar}>
      <div className={styles.actionsToolBarText}>
        <Text as="span">Выбрано:</Text>
        <Text as="span">{rowSelectionCount}</Text>
      </div>
      <div className={styles.actionsToolBarActions}>
        {isInstancePage && <Button icon={<Icon.Play />} contentType="Icon" onClick={() => console.log('selectedRowIds', selectedRowIds)} />}
        {isInstancePage && <Button icon={<SpeedIcon />} contentType="Icon" onClick={handleOpenOverDraftModal} />}
        <Button
          icon={<Icon.Delete />}
          contentType="Icon"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isDeleteArchivesPending || isDeleteInstancesPending}
        />
      </div>
      <DeleteArchiveConfirmModal
        open={isDeleteModalOpen}
        title={`Удаление ${deleteEntityTitleText}`}
        description={`Вы уверены что, хотите удалить ${deleteEntityText} (${rowSelectionCount})? ${deleteEntityRestoreText} будет невозможно восстановить.`}
        isLoading={isDeleteArchivesPending || isDeleteInstancesPending}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteArchive}
      />
    </div>
  );
};

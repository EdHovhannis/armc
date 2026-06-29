import { Button, Icon, Text, Tooltip, notification } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useState } from 'react';

import { SpeedIcon } from '@src/Shared/assets/icons/SpeedIcon';
import ConfirmDeleteModal from '@src/Shared/ui/ConfirmDeleteModal';
import ConfirmModal from '@src/Shared/ui/ConfirmModal';

import { deleteArchivesFx, deleteArchivesInstancesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances } from '@src/Entities/Archives/model';
import { resumeInstancesFx, suspendInstancesFx } from '@src/Entities/Instance/api';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $selectedRowIds, $tableView, setRowSelection } from '@src/Features/TableView/model';

import { onOpenOverDraftModal } from '../OverDraftModal/model';

import * as styles from './styles.module.css';

type StartStopAction = 'resume' | 'suspend' | null;

interface ArchivesActionsToolBarProps {
  rowSelectionCount: number;
  onDeleteSuccess: () => void;
}

export const ArchivesActionsToolBar: FC<ArchivesActionsToolBarProps> = ({ rowSelectionCount, onDeleteSuccess }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [startStopAction, setStartStopAction] = useState<StartStopAction>(null);
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
    resumeInstances,
    suspendInstances,
    isResumePending,
    isSuspendPending,
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
    resumeInstancesFx,
    suspendInstancesFx,
    resumeInstancesFx.pending,
    suspendInstancesFx.pending,
  ]);
  const isInstancePage = tableView === SEGMENT_INSTANCES;

  const selectedInstances = archiveInstances.filter((item) => selectedRowIds[item.id]);
  // Старт резьюмит всё, что не RUNNING; Стоп гасит только RUNNING; статус WITHOUT_RESPONSE исключаем (неизвестен)
  const startableInstances = selectedInstances.filter((item) => item.instanceStatus !== 'RUNNING' && item.instanceStatus !== 'WITHOUT_RESPONSE');
  const stoppableInstances = selectedInstances.filter((item) => item.instanceStatus === 'RUNNING');
  const startStopInstances = startStopAction === 'resume' ? startableInstances : stoppableInstances;
  const toInstanceParams = (rows: typeof selectedInstances) =>
    rows.map(({ projectName, configName, zoneId, id }) => ({ project: projectName, taskName: configName, zoneId, instanceId: id }));
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
            return `/v1/internal/index/archive/task/project/${projectName}/name/${configName}/zone/${zoneId}/instance`;
          });
        await deleteSelectedArchives(deleteArchivesInstances, urlsFordelete);
      }
    }
  };

  const handleOpenOverDraftModal = () => {
    onOpenOverDraft(selectedInstances);
  };

  const handleConfirmStartStop = async () => {
    if (!startStopAction) return;
    const action = startStopAction;
    const params = toInstanceParams(startStopInstances);
    const effect = action === 'resume' ? resumeInstances : suspendInstances;
    const results = await effect(params).then(
      (data) => data,
      () => null,
    );

    if (!results) return;

    setRowSelectionFn({});
    setStartStopAction(null);

    const failed = results.filter((item) => !item.reachedTarget);
    if (!failed.length) {
      notification({ title: action === 'resume' ? 'Экземпляры запущены' : 'Экземпляры остановлены', status: 'success' });
      return;
    }

    const failedList = failed.map(({ project, taskName, zoneId }) => `${project}/${taskName}/${zoneId}`).join(', ');
    notification({
      title: `${action === 'resume' ? 'Запущено' : 'Остановлено'} ${results.length - failed.length} из ${results.length}`,
      description: `Не удалось: ${failedList}`,
      status: 'warning',
    });
  };

  return (
    <div className={styles.actionsToolBar}>
      <div className={styles.actionsToolBarText}>
        <Text as="span">Выбрано:</Text>
        <Text as="span">{rowSelectionCount}</Text>
      </div>
      <div className={styles.actionsToolBarActions}>
        {isInstancePage && (
          <Tooltip title="Запустить выбранные экземпляры">
            <Button
              className={styles.actionsToolBarToggle}
              icon={<Icon.Play />}
              contentType="Icon"
              disabled={!startableInstances.length}
              onClick={() => setStartStopAction('resume')}
            />
          </Tooltip>
        )}
        {isInstancePage && (
          <Tooltip title="Остановить выбранные экземпляры">
            <Button
              className={styles.actionsToolBarToggle}
              icon={<Icon.Pause />}
              contentType="Icon"
              disabled={!stoppableInstances.length}
              onClick={() => setStartStopAction('suspend')}
            />
          </Tooltip>
        )}
        {isInstancePage && <Button icon={<SpeedIcon />} contentType="Icon" onClick={handleOpenOverDraftModal} />}
        <Button
          icon={<Icon.Delete />}
          contentType="Icon"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isDeleteArchivesPending || isDeleteInstancesPending}
        />
      </div>
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        title={`Удаление ${deleteEntityTitleText}`}
        description={`Вы уверены что, хотите удалить ${deleteEntityText} (${rowSelectionCount})? ${deleteEntityRestoreText} будет невозможно восстановить.`}
        loading={isDeleteArchivesPending || isDeleteInstancesPending}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteArchive}
      />
      <ConfirmModal
        open={startStopAction !== null}
        title={startStopAction === 'resume' ? 'Запуск экземпляров' : 'Остановка экземпляров'}
        description={`Вы уверены что, хотите ${startStopAction === 'resume' ? 'запустить' : 'остановить'} выбранные экземпляры (${startStopInstances.length})?`}
        loading={isResumePending || isSuspendPending}
        onClose={() => setStartStopAction(null)}
        onConfirm={handleConfirmStartStop}
        cancelLabel="Отмена"
      />
    </div>
  );
};

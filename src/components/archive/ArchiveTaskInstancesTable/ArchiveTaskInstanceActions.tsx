import { IconButton } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles, WithStyles, createStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';
import SpeedIcon from '@material-ui/icons/Speed';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import * as React from 'react';

import ProjectService from '../../../services/ProjectService';
import RoleService from '../../../services/RoleService';
import { ShortArchiveTaskWithRole } from '../../../store/archive/Actions';
import { ArchiveTaskInstance, ArchiveTaskInstanceStatus, ArchiveTaskInstanceConfigCurrent } from '../../../store/archive/Types';
import { User } from '../../../store/auth/Types';
import { OverdraftConfig } from '../../../store/overdraft/Types';
import { Resource, Role } from '../../../store/role/Types';
import ConfirmDialog, { DEFAULT_DECISION } from '../../ConfirmDialog';
import { LoaderInString } from '../../loader/LoaderInString';
import { ArchiveInstanceQuotasDialog } from '../ArchiveInstanceQuotasDialog';
import { ArchiveOffsetDialog } from '../ArchiveOffsetDialog';

export interface Props {
  archiveTaskInstanceId: string;
  project: string;
  taskName: string;
  user: User;
  refetchStatus: () => void;
  suspendArchiveInstance: () => void;
  resumeArchiveInstance: () => void;
  resetArchiveTaskInstance: () => void;
  deleteArchiveTaskInstance: () => void;
  updateArchiveTaskInstance: () => void;
  displayError: (error: string) => void;
  instanceStatus?: ArchiveTaskInstanceStatus;
  instance?: ArchiveTaskInstance;
  archiveOverdraftConfig: OverdraftConfig;
  archiveTask: ShortArchiveTaskWithRole;
  isMaxAvailableOverdraftsReached: boolean;
  archiveTaskInstanceConfig?: ArchiveTaskInstanceConfigCurrent;
  setEditArchiveTaskInstanceOverdraft: () => void;
  isLoadingStatusesPagination: boolean;
  isZone?: boolean;
  isLimitFeatureSettingEnabled: boolean;
}

enum CONFIRM_DIALOG {
  resumeInstance,
  suspendInstance,
  resetInstance,
  deleteInstance,
  updateInstance,
  dialogOverdraft,
}

const styles = (theme) =>
  createStyles({
    outdatedInstance: {
      fill: theme.palette.warning.main,
    },
  });

const ArchiveTaskInstanceActions: React.FC<Props & WithStyles<typeof styles>> = (cellProps) => {
  const {
    instance,
    archiveTask,
    user,
    instanceStatus,
    archiveOverdraftConfig,
    refetchStatus,
    suspendArchiveInstance,
    resumeArchiveInstance,
    resetArchiveTaskInstance,
    deleteArchiveTaskInstance,
    updateArchiveTaskInstance,
    displayError,
    isMaxAvailableOverdraftsReached,
    setEditArchiveTaskInstanceOverdraft,
    isLoadingStatusesPagination,
    isZone,
    isLimitFeatureSettingEnabled,
  } = cellProps;

  const instanceMaxAvailableOverdraft = instance?.metadata?.maxAvailableOverdraft;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [canEdit, setCanEdit] = React.useState(false);
  const [canView, setCanView] = React.useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [isOffsetDialog, setOffsetDialog] = React.useState(false);
  const [isPermissionsLoaded, setisPermissionsLoaded] = React.useState(false);
  const isAdmin = user.admin;

  const handleArchiveActionWithRoles = (user, isZone: boolean | 'click' = false) => {
    if (user.admin) {
      setCanEdit(user.admin);
      setCanView(user.admin);
      return;
    }
    if (isZone !== 'click') {
      return;
    }
    setisPermissionsLoaded(true);
    const isRole = archiveTask.indexActions.includes('EDIT');
    const isEditFlow = archiveTask.flowActions.includes('EDIT');
    const canEditAction = isRole && isEditFlow;
    const canViewAction = archiveTask.flowActions.includes('VIEW');

    setCanEdit(canEditAction);
    setCanView(canViewAction);
    setisPermissionsLoaded(false);
    if (!canEditAction && !user.admin) {
      return displayError('У Вас нет доступа к данному функционалу.');
    }
  };

  React.useEffect(() => {
    handleArchiveActionWithRoles(user, isZone);
  }, []);

  const handleMenuClick = React.useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );
  const handleRefetchClick = React.useCallback(refetchStatus, [refetchStatus]);
  const handleMenuClose = React.useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<CONFIRM_DIALOG | null>(null);
  const closeConfirmDialog = (dialog: CONFIRM_DIALOG) => (decision: string) => {
    setConfirmDialogOpen(null);
    if (decision !== DEFAULT_DECISION.OK) {
      return;
    }
    switch (dialog) {
      case CONFIRM_DIALOG.suspendInstance:
        return suspendArchiveInstance();
      case CONFIRM_DIALOG.resumeInstance:
        return resumeArchiveInstance();
      case CONFIRM_DIALOG.resetInstance:
        return resetArchiveTaskInstance();
      case CONFIRM_DIALOG.deleteInstance:
        return deleteArchiveTaskInstance();
      case CONFIRM_DIALOG.updateInstance:
        return updateArchiveTaskInstance();
    }
  };
  const startButtonClick = React.useCallback(() => {
    setConfirmDialogOpen(CONFIRM_DIALOG.resumeInstance);
    handleMenuClose();
  }, [setConfirmDialogOpen, handleMenuClose]);
  const stopButtonClick = React.useCallback(() => {
    setConfirmDialogOpen(CONFIRM_DIALOG.suspendInstance);
    handleMenuClose();
  }, [setConfirmDialogOpen, handleMenuClose]);
  const resetButtonClick = React.useCallback(() => {
    setConfirmDialogOpen(CONFIRM_DIALOG.resetInstance);
    handleMenuClose();
  }, [setConfirmDialogOpen, handleMenuClose]);
  const deleteButtonClick = React.useCallback(() => {
    setConfirmDialogOpen(CONFIRM_DIALOG.deleteInstance);
    handleMenuClose();
  }, [setConfirmDialogOpen, handleMenuClose]);
  const updateInstanceClick = React.useCallback(() => {
    setConfirmDialogOpen(CONFIRM_DIALOG.updateInstance);
    handleMenuClose();
  }, [setConfirmDialogOpen, handleMenuClose]);

  const openDialogOverdraftClick = React.useCallback(() => {
    setEditArchiveTaskInstanceOverdraft();
    handleMenuClose();
  }, [setConfirmDialogOpen, handleMenuClose]);

  if (!instance) {
    return null;
  }
  if (!archiveTask) {
    return null;
  }
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }}
    >
      {archiveTask.version !== instance?.version && (
        <Tooltip
          title={
            <>
              <span>{`Версия конфигурации: ${archiveTask.version}`}</span>
              <br />
              <span>{`Версия экземпляра: ${instance?.version}`}</span>
            </>
          }
        >
          <IconButton disabled={!canEdit} onClick={updateInstanceClick} size={'small'} style={{ color: '#FFA500' }}>
            <SyncProblemIcon color={canEdit ? 'inherit' : 'disabled'} />
          </IconButton>
        </Tooltip>
      )}

      {instance.overdraftPercent ||
      (instanceMaxAvailableOverdraft && instanceMaxAvailableOverdraft === 0) ||
      (instanceMaxAvailableOverdraft && archiveOverdraftConfig.maxOverdraftPercent > instanceMaxAvailableOverdraft) ? (
        <Tooltip
          title={
            instance.overdraftPercent > 0
              ? `Скорость обработки увеличена на ${instance.overdraftPercent}%`
              : instanceMaxAvailableOverdraft === 0
                ? 'Овердрафт скорости невозможен. Измените конфигурацию экземпляра.'
                : `Овердрафт скорости ограничен. Максимальный процент увеличения в настройках: ${archiveOverdraftConfig?.maxOverdraftPercent || 0}.`
          }
        >
          <IconButton
            onClick={
              instanceMaxAvailableOverdraft === 0
                ? () => {
                    if (isAdmin) {
                      displayError('Овердрафт скорости невозможен. Измените конфигурацию экземпляра.');
                    }
                  }
                : openDialogOverdraftClick
            }
            size={'small'}
          >
            <SpeedIcon
              style={
                instance.overdraftPercent > 0
                  ? { color: '#4CAF50' }
                  : instanceMaxAvailableOverdraft === 0
                    ? { color: '#FF0000' }
                    : { color: '#FFA500' }
              }
            />
          </IconButton>
        </Tooltip>
      ) : null}

      <IconButton
        onClick={() => {
          if (isZone) {
            handleArchiveActionWithRoles(user, 'click');
          }
          return handleRefetchClick();
        }}
        aria-controls={'simple-menu'}
        disabled={isZone ? false : !canView}
        size={'small'}
        color={'primary'}
      >
        <RefreshIcon />
      </IconButton>
      <IconButton
        onClick={(e) => {
          if (isZone) {
            handleArchiveActionWithRoles(user, 'click');
          }
          return handleMenuClick(e);
        }}
        aria-controls={'simple-menu'}
        id={`id-${instance.archiveTaskInstanceId}`}
        size={'small'}
        color={'primary'}
      >
        {isLoadingStatusesPagination || isPermissionsLoaded ? <LoaderInString showText={false} /> : <MenuIcon />}
      </IconButton>
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(instanceStatus) && Boolean(anchorEl)} onClose={handleMenuClose}>
        {(isAdmin || canEdit) && instanceStatus?.indexing.status !== 'RUNNING' && (
          <MenuItem disabled={!canEdit} onClick={startButtonClick}>
            Старт
          </MenuItem>
        )}
        {(isAdmin || canEdit) && instanceStatus?.indexing.status === 'RUNNING' && (
          <MenuItem disabled={!canEdit} onClick={stopButtonClick}>
            Стоп
          </MenuItem>
        )}
        <MenuItem disabled={!canEdit} onClick={() => setOffsetDialog(true)}>
          Установить offset
        </MenuItem>
        {(isAdmin || canEdit) && (
          <MenuItem disabled={!canEdit} onClick={resetButtonClick}>
            Сбросить offset
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={openDialogOverdraftClick} disabled={!(instanceMaxAvailableOverdraft !== 0 && !isMaxAvailableOverdraftsReached)}>
            Овердрафт скорости
          </MenuItem>
        )}
        {(isAdmin || canEdit) && (
          <MenuItem onClick={deleteButtonClick}>
            <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
          </MenuItem>
        )}
        {(isAdmin || canEdit) && isLimitFeatureSettingEnabled && (
          <MenuItem onClick={() => setUpdateDialogOpen(true)}>Переопределить квоты экземпляра</MenuItem>
        )}
      </Menu>
      <ConfirmDialog
        warningText={`Вы уверены что, хотите запустить экземпляр архива ${instance.project}/${instance.name}/${instance.zoneId}?`}
        open={confirmDialogOpen === CONFIRM_DIALOG.resumeInstance}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={closeConfirmDialog(CONFIRM_DIALOG.resumeInstance)}
      />
      <ConfirmDialog
        warningText={`Вы уверены что, хотите остановить экземпляр архива ${instance.project}/${instance.name}/${instance.zoneId}?`}
        open={confirmDialogOpen === CONFIRM_DIALOG.suspendInstance}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={closeConfirmDialog(CONFIRM_DIALOG.suspendInstance)}
      />
      <ConfirmDialog
        warningText={`Вы уверены что, хотите сбросить офсет для архива ${instance.project}/${instance.name}/${instance.zoneId}?`}
        open={confirmDialogOpen === CONFIRM_DIALOG.resetInstance}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={closeConfirmDialog(CONFIRM_DIALOG.resetInstance)}
      />
      <ConfirmDialog
        warningText={`Вы уверены что, хотите удалить архив ${instance.project}/${instance.name}/${instance.zoneId}? Его будет невозможно восстановить.`}
        open={confirmDialogOpen === CONFIRM_DIALOG.deleteInstance}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={closeConfirmDialog(CONFIRM_DIALOG.deleteInstance)}
      />
      <ConfirmDialog
        warningText={`Вы хотите обновить экземпляр ${instance.project}/${instance.name}/${instance.zoneId}?`}
        open={confirmDialogOpen === CONFIRM_DIALOG.updateInstance}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={closeConfirmDialog(CONFIRM_DIALOG.updateInstance)}
      />
      {isOffsetDialog && (
        <ArchiveOffsetDialog handleClose={() => setOffsetDialog(false)} rowData={cellProps.instance} handleMenuClose={handleMenuClose} />
      )}
      {updateDialogOpen && !!cellProps.instance && (
        <ArchiveInstanceQuotasDialog handleClose={() => setUpdateDialogOpen(false)} rowData={cellProps.instance} handleMenuClose={handleMenuClose} />
      )}
    </div>
  );
};

export default withStyles(styles)(ArchiveTaskInstanceActions);

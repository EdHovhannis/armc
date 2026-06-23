import { Chip, CircularProgress, Grid, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { green } from '@material-ui/core/colors';
import { withStyles, WithStyles, createStyles } from '@material-ui/core/styles';
import { difference } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import ArchiveTaskInstanceAddPopup from '../../containers/archive/ArchiveTaskInstanceAddPopup';
import ArchiveTaskInstancesTable from '../../containers/archive/ArchiveTaskInstancesTable';
import { ShortArchiveTaskWithRole } from '../../store/archive/Actions';
import * as archiveActions from '../../store/archive/Actions';
import * as authSelectors from '../../store/auth/Reducer';
import { User } from '../../store/auth/Types';
import { getEnableFeatureSettingLimits } from '../../store/featureSettings/Reducer';
import * as notificationActions from '../../store/notification/Actions';
import ConfirmDialog from '../ConfirmDialog';

import PermissionsArchiveDialog from './PermissionsArchiveDialog';

enum EButtonAction {
  Tags = 'Tags',
  Edit = 'Edit',
  AddAnInstance = 'AddAnInstance',
  Blockages = 'Blockages',
  Export = 'Export',
  Delete = 'Delete',
  IndexLessFive = 'IndexLessFive',
  IndexEqFive = 'IndexEqFive',
}

export interface ArchiveCardProps {
  user: User;
  authType: AuthType;
  archive: ShortArchiveTaskWithRole;
  canEdit: boolean;
  projectName: string;
  isShow: boolean;
  availableZones: string[];
  isCurrentArchivePermissionsLoaded: boolean;
  currentArchiveWithPermissions?: ShortArchiveTaskWithRole;

  onDelete(projectShortName: string, name: string);

  onUpdate(projectShortName: string, name: string);

  onDownload(projectShortName: string, name: string);

  onLabels: (projectName: string, name: string, canEdit: boolean) => void;

  setConstraints(archive: ShortArchiveTaskWithRole);

  onBlock(archive: ShortArchiveTaskWithRole);

  fetchUserProjects();

  getCurrentArchivePermissions: (archive: any, user: any) => void;

  displayError: (error) => void;

  listArchiveTasksWithRoles: (
    okCallback?: (tasks: ShortArchiveTaskWithRole[]) => void,
    errorCallback?: (errorMsg: string) => void,
    page?: number,
    nameLike?: string,
  ) => void;

  isLimitFeatureSettingEnabled: boolean;
  page?: number;
  nameFilter?: string;
}

export interface ArchiveCardState {
  id?: number;
  confirmDialogDeleteOpen: boolean;
  permissionDialogOpen: boolean;
  archiveTaskInstanceAddPopupOpen: boolean;
  isInstancesTableOpened: boolean;
  isArchiveRolesLoadedKey: EButtonAction | string;
}

const styles = (theme) =>
  createStyles({
    taskHaveNoZone: {
      color: theme.palette.warning.main,
    },
  });

class ArchiveCard extends React.Component<ArchiveCardProps & WithStyles<typeof styles>, ArchiveCardState> {
  isLegacyMode: boolean;
  constructor(props) {
    super(props);
    this.isLegacyMode = this.props.authType === 'legacy';

    this.state = {
      confirmDialogDeleteOpen: false,
      permissionDialogOpen: false,
      archiveTaskInstanceAddPopupOpen: false,
      isInstancesTableOpened: false,
      isArchiveRolesLoadedKey: '',
    };

    this.handleConfirmDialogDeleteOpen = this.handleConfirmDialogDeleteOpen.bind(this);
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
    this.handleToggleInstancesTable = this.handleToggleInstancesTable.bind(this);
    this.closeInstancesTable = this.closeInstancesTable.bind(this);
    this.getInstancesTableOpened = this.getInstancesTableOpened.bind(this);
  }
  private listUpdateTimeout: NodeJS.Timeout | null = null;

  componentDidUpdate(prevProps: any, prevState: any) {
    const isArchivePopupClosed = prevState.archiveTaskInstanceAddPopupOpen && !this.state.archiveTaskInstanceAddPopupOpen;
    const isDeleteDialogClosed = prevState.confirmDialogDeleteOpen && !this.state.confirmDialogDeleteOpen;

    if (isArchivePopupClosed || isDeleteDialogClosed) {
      if (this.listUpdateTimeout) {
        clearTimeout(this.listUpdateTimeout);
      }

      this.listUpdateTimeout = setTimeout(() => {
        this.props.listArchiveTasksWithRoles(
          () => {},
          () => {},
          this.props.page + 1,
          this.props.nameFilter,
        );
      }, 300);
    }
  }

  componentWillUnmount() {
    if (this.listUpdateTimeout) {
      clearTimeout(this.listUpdateTimeout);
    }
  }

  handleConfirmDialogDeleteOpen() {
    this.setState({ confirmDialogDeleteOpen: true });
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDialogDeleteOpen: false });
    if (value === 'Ok') {
      this.props.onDelete(this.props.archive.project, this.props.archive.name);
    }
  }

  getInstancesTableOpened() {
    return this.state.isInstancesTableOpened;
  }

  closeInstancesTable() {
    this.setState({
      isInstancesTableOpened: false,
    });
  }

  handleToggleInstancesTable() {
    this.setState({
      isInstancesTableOpened: !this.state.isInstancesTableOpened,
    });
  }

  handleArchiveActionWithRoles(buttonAction: EButtonAction) {
    const { archive, user, displayError } = this.props;
    this.setState({ isArchiveRolesLoadedKey: buttonAction });
    const isRole = archive.indexActions.includes('EDIT');
    const isEditFlow = archive.flowActions.includes('EDIT');
    const canEdit = isRole && isEditFlow;
    if (!canEdit && !user.admin) return displayError('У Вас нет доступа к данному функционалу.');

    switch (buttonAction) {
      case EButtonAction.Tags:
        return this.props.onLabels(this.props.archive.project, this.props.archive.name, canEdit);
      case EButtonAction.AddAnInstance:
        return this.setState({
          archiveTaskInstanceAddPopupOpen: true,
        });
      case EButtonAction.Export:
        return this.props.onDownload(this.props.archive.project, this.props.archive.name);
      case EButtonAction.Delete:
        return this.handleConfirmDialogDeleteOpen();
      case EButtonAction.IndexLessFive:
        return this.props.onLabels(archive.project, archive.name, canEdit);
      case EButtonAction.IndexEqFive:
        return this.props.onLabels(this.props.archive.project, this.props.archive.name, canEdit);
      default:
        return () => {};
    }
  }

  getEndIcon(buttonAction: EButtonAction) {
    return this.state.isArchiveRolesLoadedKey === buttonAction ? <CircularProgress size={'0.75rem'} /> : null;
  }

  render() {
    const { archive, user } = this.props;
    const { maxStorageTimeSec, maxDataRateBytesPerSec, maxSizeBytes } = archive;

    const hasArchiveRule = archive.indexActions.includes('EDIT') || archive.indexActions.includes('VIEW');
    const hasFlowRule = archive.flowActions.includes('EDIT') || archive.flowActions.includes('VIEW');
    const canShow = hasArchiveRule && hasFlowRule;

    const isAdmin = user.admin;

    const chips: Array<any> = [];
    archive.labels?.map((label, ind) => {
      if (ind < 5) {
        chips.push(
          <Chip
            id={'label' + ind}
            label={label}
            onClick={() => {
              if (user.admin) {
                return this.props.onLabels(archive.project, archive.name, user.admin);
              }
              this.handleArchiveActionWithRoles(EButtonAction.IndexLessFive);
            }}
            style={{
              backgroundColor: green[50],
              color: green[800],
              marginRight: 4,
              marginBottom: 4,
              maxWidth: '100%',
            }}
            size={'small'}
          />,
        );
      } else if (ind === 5) {
        chips.push(
          <Chip
            id={'label' + ind}
            label={'...'}
            onClick={() => {
              if (user.admin) {
                return this.props.onLabels(this.props.archive.project, this.props.archive.name, user.admin);
              }
              this.handleArchiveActionWithRoles(EButtonAction.IndexEqFive);
            }}
            style={{
              backgroundColor: 'white',
              color: green[800],
              marginRight: 4,
              marginBottom: 4,
              maxWidth: '100%',
            }}
            size={'small'}
          />,
        );
      }
    });

    return (
      <React.Fragment>
        {this.props.isShow && (
          <Grid item key={this.props.archive.name} style={{ width: '90%' }}>
            <Paper elevation={1}>
              <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center" style={{ padding: 16 }}>
                <Grid item />
                <Grid item xs>
                  <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
                    <Grid item>
                      <Typography variant="h6" color="primary">
                        {this.props.archive.name}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2">Ключ проекта: {this.props.projectName}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body2"
                        className={this.props.archive.instances.length === 0 ? this.props.classes.taskHaveNoZone : undefined}
                      >
                        Зоны: {this.props.archive.instances.length}
                      </Typography>
                    </Grid>
                    {this.props.isLimitFeatureSettingEnabled && (
                      <>
                        <Grid item>
                          <Typography variant="body2">Макс.скорость записи: {maxDataRateBytesPerSec} B/s</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body2">Макс. размер индекса: {maxSizeBytes} B</Typography>
                        </Grid>
                        {!!maxStorageTimeSec && (
                          <Grid item>
                            <Typography variant="body2">Макс.время хранения данных: {maxStorageTimeSec} сек</Typography>
                          </Grid>
                        )}
                      </>
                    )}
                    <Grid item>{chips}</Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center" style={{ paddingLeft: 16 }}>
                <React.Fragment>
                  <Grid item>
                    <Button
                      endIcon={this.getEndIcon(EButtonAction.Tags)}
                      aria-label="Метки"
                      color="primary"
                      onClick={(e) => {
                        if (user.admin) {
                          return this.props.onLabels(this.props.archive.project, this.props.archive.name, user.admin);
                        }
                        this.handleArchiveActionWithRoles(EButtonAction.Tags);
                      }}
                    >
                      Метки
                    </Button>
                  </Grid>
                </React.Fragment>
                {(isAdmin || canShow) && (
                  <Grid item>
                    <Button
                      aria-label="Редактировать"
                      color="primary"
                      onClick={() => this.props.onUpdate(this.props.archive.project, this.props.archive.name)}
                    >
                      {isAdmin ? 'Редактировать' : 'Просмотр / Редактирование'}
                    </Button>
                  </Grid>
                )}
                {isAdmin && this.isLegacyMode && (
                  <Grid item>
                    <Button
                      aria-label="Приватность"
                      color="primary"
                      onClick={(e) => {
                        this.setState({
                          id: this.props.archive.id,
                          permissionDialogOpen: true,
                        });
                      }}
                    >
                      Приватность
                    </Button>
                  </Grid>
                )}
                {isAdmin && (
                  <Grid item>
                    <Button
                      aria-label="Ограничения"
                      color="primary"
                      onClick={(e) => {
                        this.props.setConstraints(this.props.archive);
                      }}
                    >
                      Ограничения
                    </Button>
                  </Grid>
                )}
                <Grid item>
                  <Button
                    endIcon={this.getEndIcon(EButtonAction.AddAnInstance)}
                    aria-label="Добавить экземпляр"
                    color="primary"
                    onClick={(e) => {
                      if (user.admin) {
                        return this.setState({
                          archiveTaskInstanceAddPopupOpen: true,
                        });
                      }
                      this.handleArchiveActionWithRoles(EButtonAction.AddAnInstance);
                    }}
                    disabled={
                      this.props.availableZones.length > 0 &&
                      difference(
                        this.props.availableZones,
                        this.props.archive.instances.map((instance) => instance.zoneId),
                      ).length === 0
                    }
                  >
                    Добавить экземпляр
                  </Button>
                </Grid>
                {isAdmin && this.isLegacyMode && (
                  <Grid item>
                    <Button
                      aria-label="Заблокировать"
                      color="primary"
                      onClick={(e) => {
                        this.props.onBlock(this.props.archive);
                      }}
                    >
                      Блокировки
                    </Button>
                  </Grid>
                )}

                <Grid item>
                  <Button
                    endIcon={this.getEndIcon(EButtonAction.Export)}
                    aria-label="Загрузка"
                    color="primary"
                    onClick={(e) => {
                      if (user.admin) {
                        return this.props.onDownload(this.props.archive.project, this.props.archive.name);
                      }
                      this.handleArchiveActionWithRoles(EButtonAction.Export);
                    }}
                  >
                    Экспорт
                  </Button>
                </Grid>
                <React.Fragment>
                  <Grid item>
                    <Button
                      endIcon={this.getEndIcon(EButtonAction.Delete)}
                      aria-label="Удалить"
                      color="primary"
                      disabled={this.props.archive.instances.length !== 0}
                      onClick={() => {
                        if (user.admin) {
                          return this.handleConfirmDialogDeleteOpen();
                        }
                        this.handleArchiveActionWithRoles(EButtonAction.Delete);
                      }}
                    >
                      Удалить
                    </Button>
                  </Grid>
                </React.Fragment>

                <Grid item>
                  <Button
                    aria-label={this.getInstancesTableOpened() ? 'Скрыть экземпляры' : 'Показать экземпляры'}
                    color="primary"
                    onClick={this.handleToggleInstancesTable}
                    disabled={this.props.archive.instances && this.props.archive.instances.length === 0}
                  >
                    {this.getInstancesTableOpened() ? 'Скрыть экземпляры' : 'Показать экземпляры'}
                  </Button>
                </Grid>
              </Grid>
              {this.getInstancesTableOpened() && this.props.archive.instances && this.props.archive.instances.length !== 0 && (
                <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center" style={{ padding: 16 }}>
                  <Grid item xs={12}>
                    <div style={{ overflow: 'auto', width: '100%' }}>
                      <ArchiveTaskInstancesTable archiveTaskInstancesIds={this.props.archive.instancesIds} archive={this.props.archive} />
                    </div>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        )}
        <ConfirmDialog
          warningText={
            'Вы уверены что, хотите удалить архив ' +
            this.props.archive.project +
            '/' +
            this.props.archive.name +
            '? Его будет невозможно восстановить.'
          }
          open={this.state.confirmDialogDeleteOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />
        {this.state.permissionDialogOpen && (
          <PermissionsArchiveDialog
            close={() => {
              this.setState({ permissionDialogOpen: false });
            }}
            id={Number(this.state.id)}
            isAdmin={isAdmin}
          />
        )}
        {this.state.archiveTaskInstanceAddPopupOpen && (
          <ArchiveTaskInstanceAddPopup
            archiveTask={this.props.archive}
            onClose={() => {
              this.setState({ archiveTaskInstanceAddPopupOpen: false });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    listArchiveTasksWithRoles: (
      okCallback?: (tasks: ShortArchiveTaskWithRole[]) => void,
      errorCallback?: (errorMsg: string) => void,
      page?: number,
      nameLike?: string,
    ): void => {
      dispatch(archiveActions.fetchListArchivesWithRoles(okCallback, errorCallback, page, nameLike));
    },
  };
};

const mapStateToProps = (state) => {
  return {
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
    authType: authSelectors.authType(state),
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ArchiveCard));

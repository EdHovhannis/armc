import * as React from 'react';
import { Chip, createTheme, Grid, ThemeProvider, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';

import 'react-table/react-table.css';
import { green } from '@material-ui/core/colors';
import { string } from 'prop-types';

import SpecInfoView from '../../containers/monitoring/SpecInfoView';
import SpecInfoWithDiffDialogContainer from '../../containers/monitoring/SpecInfoWithDiffDialogContainer';
import { AuthType } from '../../store/auth/Types';
import { DruidSupervisorInfo, GlobalConfigVersion } from '../../store/monitoring/Types';
import { AnalyticIndexUtils } from '../../utils/AnalyticIndexUtils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';

import AddSupervisorInstanceDialog from './AddSupervisorInstanceDialog';
import { SupervisorInstanceTable } from './SupervisorInstanceTable';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#ea9313',
    },
  },
});

export interface IndexCardProps {
  index_task: DruidSupervisorInfo;
  globalConfigurationVersion: Map<string, string>;
  zones: string[];
  topic: string;
  project: string;
  isAdmin: boolean;
  authType: AuthType;
  onBlock: (projectShortName: string, name: string, blockedObject: DruidSupervisorInfo) => void;
  addSupervisorInstanceById: (taskId: number, zoneId: string) => void;
  deleteSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  updateSupervisorInstanceById: (taskId: number, zoneId: string) => void;
  stopSupervisorInstance: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetSupervisorInstance: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  startSupervisorInstance: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  downloadSupervisorConfig: () => void;
  deleteConfig: () => void;
  openSupervisor: () => void;
  onLabels: (taskId: number, projectName: string, name: string, projectId: number) => void;
  canEdit: boolean;
  displayError: (error: string) => void;
  refreshSupervisor?: (id: number) => void;
}

export interface IndexCardState {
  isInstanceInfoOpen: boolean;
  selectedZone?: string;
  versionInstance?: string;
  globalConfigurationVersionInstance?: string;
  confirmDialogResetInstanceOpen: boolean;
  confirmDialogUpdateInstanceOpen: boolean;
  confirmDialogDeleteInstanceOpen: boolean;
  confirmDialogStartInstanceOpen: boolean;
  confirmDialogStopInstanceOpen: boolean;
  confirmDeleteConfigOpen: boolean;
  addInstance: boolean;
  errorMessage: string;
  detailMessage?: string;

  waitForInstanceDeletion: boolean;
  completeInstanceDeletion: boolean;
  successInstanceDeletion: boolean;

  waitForInstanceStart: boolean;
  completeInstanceStart: boolean;
  successInstanceStart: boolean;

  waitForInstanceStop: boolean;
  completeInstanceStop: boolean;
  successInstanceStop: boolean;

  waitForInstanceReset: boolean;
  completeInstanceReset: boolean;
  successInstanceReset: boolean;

  infoOpen: boolean;
}

export default class SupervisorCard extends React.Component<IndexCardProps, IndexCardState> {
  isLegacyMode: boolean;
  constructor(props) {
    super(props);
    this.isLegacyMode = this.props.authType === 'legacy';
    this.state = {
      isInstanceInfoOpen: false,
      confirmDialogResetInstanceOpen: false,
      confirmDialogUpdateInstanceOpen: false,
      confirmDialogDeleteInstanceOpen: false,
      confirmDialogStopInstanceOpen: false,
      confirmDialogStartInstanceOpen: false,
      confirmDeleteConfigOpen: false,
      addInstance: false,
      completeInstanceDeletion: false,
      completeInstanceReset: false,
      completeInstanceStart: false,
      completeInstanceStop: false,
      waitForInstanceDeletion: false,
      waitForInstanceReset: false,
      waitForInstanceStart: false,
      waitForInstanceStop: false,
      successInstanceDeletion: false,
      successInstanceReset: false,
      successInstanceStart: false,
      successInstanceStop: false,
      errorMessage: '',
      infoOpen: false,
    };
    this.handleConfirmDialogResetInstanceClose = this.handleConfirmDialogResetInstanceClose.bind(this);
    this.handleConfirmDialogDeleteInstanceClose = this.handleConfirmDialogDeleteInstanceClose.bind(this);
    this.handleConfirmDialogStartInstanceClose = this.handleConfirmDialogStartInstanceClose.bind(this);
    this.handleConfirmDialogStopInstanceClose = this.handleConfirmDialogStopInstanceClose.bind(this);
    this.handleConfirmDialogUpdateInstanceClose = this.handleConfirmDialogUpdateInstanceClose.bind(this);
    this.handleConfirmDialogDeleteConfigClose = this.handleConfirmDialogDeleteConfigClose.bind(this);
    this.createConfirmTitleForConfigUpdate = this.createConfirmTitleForConfigUpdate.bind(this);
  }

  handleConfirmDialogDeleteConfigClose(value) {
    this.setState({ confirmDeleteConfigOpen: false });
    if (value === 'Ok') {
      this.props.deleteConfig();
    }
  }

  handleConfirmDialogResetInstanceClose(value) {
    this.setState({ confirmDialogResetInstanceOpen: false });
    if (value === 'Ok' && this.state.selectedZone) {
      this.setState({
        waitForInstanceReset: true,
        completeInstanceReset: false,
        successInstanceReset: false,
      });
      this.props.resetSupervisorInstance(
        this.props.index_task.info.id,
        this.state.selectedZone,
        () => {
          this.setState({
            completeInstanceReset: true,
            successInstanceReset: true,
            selectedZone: undefined,
          });
        },
        (message) => {
          this.setState({
            completeInstanceReset: true,
            successInstanceReset: false,
            selectedZone: undefined,
            errorMessage: 'При остановке экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
    }
  }

  handleConfirmDialogDeleteInstanceClose(value) {
    this.setState({ confirmDialogDeleteInstanceOpen: false });
    if (value === 'Ok' && this.state.selectedZone) {
      this.setState({
        waitForInstanceDeletion: true,
        completeInstanceDeletion: false,
        successInstanceDeletion: false,
      });
      this.props.deleteSupervisorInstanceById(
        this.props.index_task.info.id,
        this.state.selectedZone,
        () => {
          this.setState({
            completeInstanceDeletion: true,
            successInstanceDeletion: true,
            selectedZone: undefined,
          });
        },
        (message) => {
          this.setState({
            completeInstanceDeletion: true,
            successInstanceDeletion: false,
            selectedZone: undefined,
            errorMessage: 'При удалении экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
    }
  }

  handleConfirmDialogStartInstanceClose(value) {
    this.setState({ confirmDialogStartInstanceOpen: false });
    if (value === 'Ok' && this.state.selectedZone) {
      this.setState({
        waitForInstanceStart: true,
        completeInstanceStart: false,
        successInstanceStart: false,
      });
      this.props.startSupervisorInstance(
        this.props.index_task.info.id,
        this.state.selectedZone,
        () => {
          this.setState({
            completeInstanceStart: true,
            successInstanceStart: true,
            selectedZone: undefined,
          });
        },
        (message) => {
          this.setState({
            completeInstanceStart: true,
            successInstanceStart: false,
            selectedZone: undefined,
            errorMessage: 'При старте экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
    }
  }

  handleConfirmDialogStopInstanceClose(value) {
    this.setState({ confirmDialogStopInstanceOpen: false });
    if (value === 'Ok' && this.state.selectedZone) {
      this.setState({
        waitForInstanceStop: true,
        completeInstanceStop: false,
        successInstanceStop: false,
      });
      this.props.stopSupervisorInstance(
        this.props.index_task.info.id,
        this.state.selectedZone,
        () => {
          this.setState({
            completeInstanceStop: true,
            successInstanceStop: true,
            selectedZone: undefined,
          });
        },
        (message) => {
          this.setState({
            completeInstanceStop: true,
            successInstanceStop: false,
            selectedZone: undefined,
            errorMessage: 'При остановке экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
    }
  }

  handleConfirmDialogUpdateInstanceClose(value) {
    this.setState({ confirmDialogUpdateInstanceOpen: false });
    if (value === 'Ok' && this.state.selectedZone) {
      this.props.updateSupervisorInstanceById(this.props.index_task.info.id, this.state.selectedZone);
      this.setState({ selectedZone: undefined, versionInstance: undefined, globalConfigurationVersionInstance: undefined });
    }
  }

  createConfirmTitleForConfigUpdate(): string {
    if (this.props.isAdmin) {
      if (this.state.versionInstance != null && this.state.globalConfigurationVersionInstance != null) {
        return (
          `Вы уверены, что хотите обновить версию экземпляра ${this.props.project}/${this.props.index_task.info.datasource}(${this.state.selectedZone})` +
          ` от ${this.state.versionInstance} до версии конфигурации ${this.props.index_task.info.version}, a также версию глобальной конфигурации ` +
          ` от ${this.state.globalConfigurationVersionInstance || '(глобальной конфигурации нет)'} до версии ${this.props.globalConfigurationVersion.get(this.state.selectedZone)}?`
        );
      } else if (this.state.versionInstance != null && this.state.globalConfigurationVersionInstance == null) {
        return (
          `Вы уверены, что хотите обновить версию экземпляра ${this.props.project}/${this.props.index_task.info.datasource}(${this.state.selectedZone})` +
          ` от ${this.state.versionInstance} до версии конфигурации ${this.props.index_task.info.version}?`
        );
      } else {
        return (
          `Вы уверены, что хотите обновить версию глобальной конфигурации экземпляра ${this.props.project}/${this.props.index_task.info.datasource}(${this.state.selectedZone})` +
          ` от ${this.state.globalConfigurationVersionInstance || '(глобальной конфигурации нет)'} до версии глобальной конфигурации ${this.props.globalConfigurationVersion.get(this.state.selectedZone)}?`
        );
      }
    } else {
      return (
        `Вы уверены, что хотите обновить версию экземпляра ${this.props.project}/${this.props.index_task.info.datasource}(${this.state.selectedZone})` +
        ` от ${this.state.versionInstance} до версии конфигурации ${this.props.index_task.info.version}?`
      );
    }
  }

  render() {
    const chips: Array<any> = [];
    this.props.index_task.info.labels?.map((label, ind) => {
      if (ind < 3) {
        chips.push(
          <Chip
            id={'label' + ind}
            label={label}
            onClick={() => {
              this.props.onLabels(
                this.props.index_task.info.id,
                this.props.project,
                this.props.index_task.info.datasource,
                this.props.index_task.info.projectId,
              );
            }}
            style={{ backgroundColor: green[50], color: green[800], marginRight: 4, marginBottom: 4, maxWidth: '100%' }}
            size={'small'}
          />,
        );
      } else if (ind === 3) {
        chips.push(
          <Chip
            id={'label' + ind}
            label={'...'}
            onClick={() => {
              this.props.onLabels(
                this.props.index_task.info.id,
                this.props.project,
                this.props.index_task.info.datasource,
                this.props.index_task.info.projectId,
              );
            }}
            style={{ backgroundColor: 'white', color: green[800], marginRight: 4, marginBottom: 4, maxWidth: '100%' }}
            size={'small'}
          />,
        );
      }
    });

    return (
      <React.Fragment>
        <ThemeProvider theme={theme}>
          <Paper elevation={1}>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              style={{ paddingLeft: 16, paddingTop: 16, paddingRight: 16, paddingBottom: 8 }}
            >
              <Grid item xs>
                <Grid container spacing={1} direction="row" justifyContent="flex-start" alignItems="center">
                  <Grid item style={{ paddingLeft: 10 }}>
                    <Typography variant="h6" color="primary">
                      {this.props.index_task.info.datasource}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">Ключ проекта: {this.props.project}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">Источник данных: {this.props.topic}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      color={this.props.index_task.info.instances && this.props.index_task.info.instances.length > 0 ? 'inherit' : 'secondary'}
                    >
                      Зоны: {this.props.index_task.info.instances?.length || 0}
                    </Typography>
                  </Grid>
                  <Grid item>{chips}</Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid container spacing={1} direction="row" justifyContent="flex-start" alignItems="center" style={{ paddingLeft: 16 }}>
              <Grid item>
                <Button
                  aria-label="Метки"
                  color="primary"
                  onClick={(e) => {
                    this.props.onLabels(
                      this.props.index_task.info.id,
                      this.props.project,
                      this.props.index_task.info.datasource,
                      this.props.index_task.info.projectId,
                    );
                  }}
                >
                  Метки
                </Button>
              </Grid>
              <Grid item>
                <Button
                  aria-label="Настройки"
                  color="primary"
                  onClick={(e) => {
                    this.props.openSupervisor();
                  }}
                >
                  {this.props.canEdit ? 'Редактировать' : 'Просмотреть конфигурацию'}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  aria-label="Загрузка"
                  color="primary"
                  onClick={(e) => {
                    this.props.downloadSupervisorConfig();
                  }}
                >
                  Экспорт
                </Button>
              </Grid>
              {this.props.isAdmin && this.isLegacyMode && (
                <React.Fragment>
                  {/*todo временно невозможно выставлять ограничения на индекс, только на проект*/}
                  {/*<Grid item>*/}
                  {/*  <Button aria-label="Ограничения" color="primary" onClick={e => {*/}
                  {/*    this.props.setConstraints(this.props.index_task.info.projectId, this.props.index_task.info.id,*/}
                  {/*        this.props.project, this.props.index_task.info.datasource)*/}
                  {/*  }}>*/}
                  {/*    Ограничения*/}
                  {/*  </Button>*/}
                  {/*</Grid>*/}
                  <Grid item>
                    <Button
                      aria-label="Заблокировать"
                      color="primary"
                      onClick={(e) => {
                        this.props.onBlock(this.props.project, this.props.index_task.info.datasource, this.props.index_task);
                      }}
                    >
                      Блокировки
                    </Button>
                  </Grid>
                </React.Fragment>
              )}
              {!AnalyticIndexUtils.isAllZonesHasImplements(this.props.index_task.info, this.props.zones) && this.props.canEdit && (
                <Grid item>
                  <Button
                    aria-label="Добавить экземпляр"
                    color="primary"
                    onClick={(e) => {
                      this.setState({ addInstance: true });
                    }}
                  >
                    Добавить экземпляр
                  </Button>
                </Grid>
              )}
              {this.props.canEdit && (
                <Grid item>
                  <Button
                    disabled={this.props.index_task.info.instances ? this.props.index_task.info.instances.length > 0 : false}
                    aria-label="Удалить"
                    color="primary"
                    onClick={(e) => {
                      this.setState({ confirmDeleteConfigOpen: true });
                    }}
                  >
                    Удалить
                  </Button>
                </Grid>
              )}
              {this.props.index_task.info.instances && this.props.index_task.info.instances.length > 0 && (
                <React.Fragment>
                  {!this.state.isInstanceInfoOpen ? (
                    <Grid item>
                      <Button
                        aria-label="Show instance"
                        color="primary"
                        onClick={(e) => {
                          this.setState({ isInstanceInfoOpen: true });
                        }}
                      >
                        Показать экземпляры
                      </Button>
                    </Grid>
                  ) : (
                    <Grid item>
                      <Button
                        aria-label="Hide instance"
                        color="primary"
                        onClick={(e) => {
                          this.setState({ isInstanceInfoOpen: false });
                        }}
                      >
                        Скрыть экземпляры
                      </Button>
                    </Grid>
                  )}
                </React.Fragment>
              )}
            </Grid>
            {this.state.isInstanceInfoOpen && AnalyticIndexUtils.getTablePageSize(this.props.index_task.info.instances) > 0 && <Divider />}
            {this.state.isInstanceInfoOpen && AnalyticIndexUtils.getTablePageSize(this.props.index_task.info.instances) > 0 && (
              <SupervisorInstanceTable
                supervisorName={this.props.index_task.info.datasource}
                supervisorProject={this.props.project}
                supervisorId={this.props.index_task.info.id}
                instances={this.props.index_task.info.instances}
                supervisorVersion={this.props.index_task.info.version}
                globalConfigurationVersion={this.props.globalConfigurationVersion}
                canEdit={this.props.canEdit}
                isAdmin={this.props.isAdmin}
                deleteSupervisorInstanceById={(id, zone) => {
                  this.setState({ confirmDialogDeleteInstanceOpen: true, selectedZone: zone });
                }}
                resetSupervisorInstance={(id, zone) => {
                  this.setState({ confirmDialogResetInstanceOpen: true, selectedZone: zone });
                }}
                startSupervisorInstance={(id, zone) => {
                  this.setState({ confirmDialogStartInstanceOpen: true, selectedZone: zone });
                }}
                stopSupervisorInstance={(id, zone) => {
                  this.setState({ confirmDialogStopInstanceOpen: true, selectedZone: zone });
                }}
                updateSupervisorInstanceById={(id, zone, version, globalConfigurationVersion) => {
                  this.setState({
                    confirmDialogUpdateInstanceOpen: true,
                    selectedZone: zone,
                    versionInstance: version,
                    globalConfigurationVersionInstance: globalConfigurationVersion,
                  });
                }}
                refreshSupervisor={this.props.refreshSupervisor}
              />
            )}
          </Paper>
          <ConfirmDialog
            warningText={
              'Вы уверены, что хотите сбросить экземпляр ' +
              this.props.project +
              '/' +
              this.props.index_task.info.datasource +
              ' (' +
              this.state.selectedZone +
              ')? ' +
              'Это может привести к дублированию информации.'
            }
            open={this.state.confirmDialogResetInstanceOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogResetInstanceClose}
          />
          <ConfirmDialog
            warningText={
              'Вы уверены, что хотите удалить экземпляр ' +
              this.props.project +
              '/' +
              this.props.index_task.info.datasource +
              ' (' +
              this.state.selectedZone +
              ')? ' +
              'Его будет невозможно восстановить.'
            }
            open={this.state.confirmDialogDeleteInstanceOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogDeleteInstanceClose}
          />
          <ConfirmDialog
            warningText={
              'Вы уверены, что хотите удалить конфигурацию ' +
              this.props.project +
              '/' +
              this.props.index_task.info.datasource +
              '? ' +
              'Его будет невозможно восстановить.'
            }
            open={this.state.confirmDeleteConfigOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogDeleteConfigClose}
          />
          <ConfirmDialog
            warningText={
              'Вы уверены, что хотите запустить экземпляр ' +
              this.props.project +
              '/' +
              this.props.index_task.info.datasource +
              ' (' +
              this.state.selectedZone +
              ')?'
            }
            open={this.state.confirmDialogStartInstanceOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogStartInstanceClose}
          />
          <ConfirmDialog
            warningText={
              'Вы уверены, что хотите остановить экземпляр ' +
              this.props.project +
              '/' +
              this.props.index_task.info.datasource +
              ' (' +
              this.state.selectedZone +
              ')?'
            }
            open={this.state.confirmDialogStopInstanceOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogStopInstanceClose}
          />
          <ConfirmDialog
            warningText={this.createConfirmTitleForConfigUpdate()}
            open={this.state.confirmDialogUpdateInstanceOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogUpdateInstanceClose}
            needCustomButton={this.props.isAdmin}
            customButtonText={'Просмотреть спецификацию'}
            buttonEffect={() => {
              this.setState({ infoOpen: true });
            }}
          />

          <WaitingDialog
            customFormat={true}
            title={'Сброс экземпляра'}
            open={this.state.waitForInstanceReset}
            onClose={() => {
              this.setState({ waitForInstanceReset: false, errorMessage: '' });
            }}
            complete={this.state.completeInstanceReset}
            success={this.state.successInstanceReset}
            successMessage={'Экземпляр успешно сброшен'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />

          <WaitingDialog
            customFormat={true}
            title={'Удаление экземпляра'}
            open={this.state.waitForInstanceDeletion}
            onClose={() => {
              this.setState({ waitForInstanceDeletion: false, errorMessage: '' });
            }}
            complete={this.state.completeInstanceDeletion}
            success={this.state.successInstanceDeletion}
            successMessage={'Экземпляр успешно удален'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />

          <WaitingDialog
            customFormat={true}
            title={'Остановка экземпляра'}
            open={this.state.waitForInstanceStop}
            onClose={() => {
              this.setState({ waitForInstanceStop: false, errorMessage: '' });
            }}
            complete={this.state.completeInstanceStop}
            success={this.state.successInstanceStop}
            successMessage={'Экземпляр успешно остановлен'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />

          <WaitingDialog
            customFormat={true}
            title={'Старт экземпляра'}
            open={this.state.waitForInstanceStart}
            onClose={() => {
              this.setState({ waitForInstanceStart: false, errorMessage: '' });
            }}
            complete={this.state.completeInstanceStart}
            success={this.state.successInstanceStart}
            successMessage={'Экземпляр успешно стартовал'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />

          {this.state.addInstance && (
            <AddSupervisorInstanceDialog
              isAdmin={this.props.isAdmin}
              close={() => {
                this.setState({ addInstance: false });
              }}
              datasourceId={this.props.index_task.info.id}
              datasourceFullName={this.props.index_task.info.datasourceFullName}
              zones={this.props.zones}
              instances={this.props.index_task.info.instances}
              displayError={this.props.displayError}
              onAddZone={(zone) => {
                this.props.addSupervisorInstanceById(this.props.index_task.info.id, zone);
              }}
            />
          )}

          {this.state.infoOpen && (
            <SpecInfoWithDiffDialogContainer
              zoneId={this.state.selectedZone}
              supervisorId={this.props.index_task.info.id}
              instanceName={`${this.props.project}/${this.props.index_task.info.datasource}(${this.state.selectedZone})`}
              close={() => {
                this.setState({
                  infoOpen: false,
                });
              }}
            />
          )}
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

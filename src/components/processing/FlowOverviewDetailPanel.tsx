import MaterialTable from '@material-table/core';
import { createTheme, IconButton, ThemeProvider, Tooltip } from '@material-ui/core';
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt';
import DeleteButton from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import PauseButton from '@material-ui/icons/Pause';
import ResumeButton from '@material-ui/icons/PlayArrow';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import * as React from 'react';

import { FlowInstance, FlowInstanceDetailedInfo, FlowRowType } from '../../store/flow/Types';
import { FlowUtils } from '../../utils/FlowUtils';
import { tableIcons } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';

import FlowInstancesStatus from './FlowInstancesStatus';
import { ProcessingOffsetDialog } from './ProcessingOffsetDialog';

const themeActions = createTheme({
  palette: {
    secondary: {
      main: '#FFA500',
    },
  },
});

export interface FlowOverviewDetailPanelProps {
  data: FlowInstanceDetailedInfo[];
  rowData: FlowRowType;
  refetch: () => void;
  updateVersionInstanceFlow: (
    flowId: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteInstanceFlow: (
    flowId: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  suspendClicked: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resumeClicked: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

export interface FlowOverviewDetailPanelState {
  isConfirmUpdateInstanceVersionDialogOpen: boolean;
  isConfirmDeleteInstanceDialogOpen: boolean;
  isConfirmStartInstanceDialogOpen: boolean;
  isConfirmStopInstanceDialogOpen: boolean;
  isRejectStartInstanceDialogOpen: boolean;

  startedZoneId: string[] | [];
  waitForUpdateInstance?: boolean;
  successUpdateInstance?: boolean;
  completeUpdateInstance?: boolean;

  waitForTaskDeletion?: boolean;
  successTaskDeletion?: boolean;
  taskDeletionComplete?: boolean;

  waitForStart?: boolean;
  successStart?: boolean;
  completeStart?: boolean;

  waitForStop?: boolean;
  successStop?: boolean;
  completeStop?: boolean;

  errorMessage?: string;
  detailMessage?: string;

  flowId: number;
  zoneId: string;
  flowName: string;
  flowProject: string;
  versionConfig: string;
  versionInstance: string;
  isOffsetDialogOpen: boolean;
  instanceStatuses: { [key: string]: string };
  rowData: FlowInstance;
}

export class FlowOverviewDetailPanel extends React.Component<FlowOverviewDetailPanelProps, FlowOverviewDetailPanelState> {
  constructor(props) {
    super(props);
    this.state = {
      isConfirmUpdateInstanceVersionDialogOpen: false,
      isConfirmDeleteInstanceDialogOpen: false,
      isConfirmStartInstanceDialogOpen: false,
      isConfirmStopInstanceDialogOpen: false,
      isRejectStartInstanceDialogOpen: false,
      startedZoneId: [],
      flowId: 0,
      zoneId: '',
      flowName: '',
      flowProject: '',
      versionConfig: '',
      versionInstance: '',
      isOffsetDialogOpen: false,
      instanceStatuses: {},
    };
    this.handleConfirmUpdateClose = this.handleConfirmUpdateClose.bind(this);
    this.handleConfirmDeleteClose = this.handleConfirmDeleteClose.bind(this);
    this.handleConfirmStartClose = this.handleConfirmStartClose.bind(this);
    this.handleConfirmStopClose = this.handleConfirmStopClose.bind(this);
    this.handleRejectStartClose = this.handleRejectStartClose.bind(this);
  }

  handleConfirmUpdateClose(value: string) {
    this.setState({
      isConfirmUpdateInstanceVersionDialogOpen: false,
    });
    if (value === 'Ok') {
      this.setState({
        waitForUpdateInstance: true,
        successTaskDeletion: false,
        completeUpdateInstance: false,
      });
      this.props.updateVersionInstanceFlow(
        this.state.flowId,
        this.state.zoneId,
        () => {
          this.setState({
            successUpdateInstance: true,
            completeUpdateInstance: true,
            flowId: 0,
            zoneId: '',
            flowName: '',
            flowProject: '',
            versionConfig: '',
            versionInstance: '',
          });
        },
        (error) => {
          this.setState({
            successUpdateInstance: false,
            completeUpdateInstance: true,
            errorMessage: 'При обновлении экземпляра произошла ошибка: ' + error.message,
            detailMessage: error.details,
          });
        },
      );
    }
  }

  handleConfirmDeleteClose(value: string) {
    this.setState({
      isConfirmDeleteInstanceDialogOpen: false,
    });
    if (value === 'Ok') {
      this.setState({
        waitForTaskDeletion: true,
        successTaskDeletion: false,
        taskDeletionComplete: false,
      });
      this.props.deleteInstanceFlow(
        this.state.flowId,
        this.state.zoneId,
        () => {
          this.setState({
            taskDeletionComplete: true,
            successTaskDeletion: true,
            flowId: 0,
            zoneId: '',
            flowName: '',
            flowProject: '',
          });
        },
        (error) => {
          this.setState({
            taskDeletionComplete: true,
            successTaskDeletion: false,
            errorMessage: 'При удалении экземпляра произошла ошибка: ' + error.message,
            detailMessage: error.details,
          });
        },
      );
    }
  }

  handleRejectStartClose(value) {
    return this.setState({
      isRejectStartInstanceDialogOpen: false,
    });
  }
  handleConfirmStartClose(value: string) {
    this.setState({
      isConfirmStartInstanceDialogOpen: false,
    });
    if (value === 'Ok') {
      this.setState({
        waitForStart: true,
        successStart: false,
        completeStart: false,
      });
      this.props.resumeClicked(
        this.state.flowId,
        this.state.zoneId,
        () => {
          this.setState({
            successStart: true,
            completeStart: true,
            flowId: 0,
            zoneId: '',
            flowName: '',
            flowProject: '',
          });
        },
        (error) => {
          this.setState({
            successStart: false,
            completeStart: true,
            errorMessage: 'При старте экземпляра произошла ошибка: ' + error.message,
            detailMessage: error.details,
          });
        },
      );
    }
  }

  handleConfirmStopClose(value: string) {
    this.setState({
      isConfirmStopInstanceDialogOpen: false,
    });
    if (value === 'Ok') {
      this.setState({
        waitForStop: true,
        successStop: false,
        completeStop: false,
      });
      this.props.suspendClicked(
        this.state.flowId,
        this.state.zoneId,
        () => {
          this.setState({
            completeStop: true,
            successStop: true,
            flowId: 0,
            zoneId: '',
            flowName: '',
            flowProject: '',
          });
        },
        (error) => {
          this.setState({
            completeStop: true,
            successStart: false,
            errorMessage: 'При остановке экземпляра произошла ошибка: ' + error.message,
            detailMessage: error.details,
          });
        },
      );
    }
  }

  render() {
    const { rowData: flowRowData } = this.props;
    const { isOffsetDialogOpen } = this.state;

    return (
      <React.Fragment>
        <MaterialTable
          icons={tableIcons}
          style={{ marginLeft: '40px' }}
          data={this.props.data}
          columns={[
            {
              title: 'id',
              field: 'id',
              hidden: true,
            },
            { title: 'Зона', field: 'zoneId' },
            { title: 'Идентификатор потока', field: 'jobId' },
            {
              title: 'Длительность',
              field: 'duration',
              render: (rowData) => <>{FlowUtils.formatTime(rowData.duration)}</>,
            },
            {
              title: 'Статус',
              field: 'status',
              render: (rowData) => {
                return (
                  <FlowInstancesStatus
                    flowId={flowRowData.id}
                    zoneId={rowData.zoneId}
                    status={this.state.instanceStatuses[`${rowData.id}`] ?? rowData.status}
                    onStatusChange={(newStatus) => {
                      this.setState((prevState) => ({
                        instanceStatuses: {
                          ...prevState.instanceStatuses,
                          [rowData.id]: newStatus,
                        },
                      }));
                    }}
                  />
                );
              },
            },
            { field: 'canEdit', hidden: true },
            { field: 'canManageAccess', hidden: true },
            {
              title: 'Версия',
              field: 'version',
              render: (rowData) => {
                if (rowData.version !== flowRowData.version) {
                  return (
                    <ThemeProvider theme={themeActions}>
                      <Tooltip
                        title={
                          <React.Fragment>
                            <div>Версия конфигурации: {flowRowData.version}</div>
                            <div>Версия экземпляра: {rowData.version}</div>
                          </React.Fragment>
                        }
                      >
                        <IconButton
                          size={'small'}
                          disabled={!rowData.canEdit}
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.setState({
                              isConfirmUpdateInstanceVersionDialogOpen: true,
                              flowId: flowRowData.id,
                              zoneId: rowData.zoneId,
                              flowName: flowRowData.name,
                              flowProject: flowRowData.project,
                              versionConfig: flowRowData.version,
                              versionInstance: rowData.version,
                            });
                          }}
                        >
                          <SyncProblemIcon color={rowData.canEdit ? 'secondary' : 'disabled'} />
                        </IconButton>
                      </Tooltip>
                    </ThemeProvider>
                  );
                }
                if (rowData.version === flowRowData.version) {
                  return (
                    <ThemeProvider theme={themeActions}>
                      <Tooltip
                        title={
                          <React.Fragment>
                            <div>Версия конфигурации: {flowRowData.version}</div>
                            <div>Версия экземпляра: {rowData.version}</div>
                          </React.Fragment>
                        }
                      >
                        <InfoIcon htmlColor="rgb(76 175 80)" fontSize={'small'} />
                      </Tooltip>
                    </ThemeProvider>
                  );
                }
                return <></>;
              },
            },
            {
              title: 'Пауза',
              field: 'action',
              render: (rowData) => {
                const currentStatus = this.state.instanceStatuses[`${rowData.id}`] ?? rowData.status;
                return (
                  <IconButton
                    disabled={!rowData.canEdit}
                    size={'small'}
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      if (rowData.status === 'RUNNING') {
                        this.setState({
                          isConfirmStopInstanceDialogOpen: true,
                          flowId: flowRowData.id,
                          zoneId: rowData.zoneId,
                          flowName: flowRowData.name,
                          flowProject: flowRowData.project,
                        });
                        // this.props.suspendClicked(flowRowData.id, rowData.zoneId);
                      }
                      if (rowData.status !== 'RUNNING' && rowData.useGlobalConsumerGroup === false) {
                        this.setState({
                          isConfirmStartInstanceDialogOpen: true,
                          flowId: flowRowData.id,
                          zoneId: rowData.zoneId,
                          flowName: flowRowData.name,
                          flowProject: flowRowData.project,
                        });
                      }
                      if (rowData.useGlobalConsumerGroup && rowData.status !== 'RUNNING') {
                        const listOfZones: string[] = [];
                        const startedFlowListZone = this.props.data.filter((el) => {
                          if (el.useGlobalConsumerGroup && el.status === 'RUNNING') {
                            listOfZones.push(el.zoneId);
                            return el.zoneId;
                          }
                        });

                        if (startedFlowListZone.length) {
                          this.setState({
                            isRejectStartInstanceDialogOpen: true,
                            flowId: flowRowData.id,
                            zoneId: rowData.zoneId,
                            startedZoneId: listOfZones,
                            flowName: flowRowData.name,
                            flowProject: flowRowData.project,
                          });
                        }
                        if (startedFlowListZone.length === 0) {
                          this.setState({
                            isConfirmStartInstanceDialogOpen: true,
                            flowId: flowRowData.id,
                            zoneId: rowData.zoneId,
                            flowName: flowRowData.name,
                            flowProject: flowRowData.project,
                          });
                        }
                        // this.props.resumeClicked(flowRowData.id, rowData.zoneId);
                      }
                    }}
                  >
                    {currentStatus === 'RUNNING' ? <PauseButton /> : <ResumeButton />}
                  </IconButton>
                );
              },
            },
            {
              title: 'Удалить',
              field: 'delete',
              render: (rowData) => {
                return (
                  <IconButton
                    disabled={!rowData.canEdit}
                    size={'small'}
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      this.setState({
                        isConfirmDeleteInstanceDialogOpen: true,
                        flowId: flowRowData.id,
                        zoneId: rowData.zoneId,
                        flowName: flowRowData.name,
                        flowProject: flowRowData.project,
                      });
                    }}
                  >
                    <DeleteButton />
                  </IconButton>
                );
              },
            },
            {
              title: 'Установить offset',
              field: 'setOffset',
              render: (rowData) => {
                const { rowData: rowDataFromProps } = this.props;
                return (
                  <IconButton
                    disabled={!rowData.canEdit}
                    size={'small'}
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      this.setState({
                        isOffsetDialogOpen: true,
                        rowData: { ...rowData, flowId: rowDataFromProps.id, projectName: rowDataFromProps.project, flowName: rowDataFromProps.name },
                      });
                    }}
                  >
                    <ArrowRightAlt />
                  </IconButton>
                );
              },
            },
          ]}
          options={{
            search: false,
            paging: false,
            showTitle: false,
            header: true,
            toolbar: false,
            actionsColumnIndex: -1,
            padding: 'dense',
          }}
        />

        {this.state.waitForUpdateInstance && (
          <WaitingDialog
            title={'Обновление экземпляра потока обработки'}
            open={this.state.waitForUpdateInstance}
            onClose={() => {
              this.setState({ waitForUpdateInstance: false });
              if (this.state.successUpdateInstance) {
                this.props.refetch();
              }
            }}
            complete={this.state.completeUpdateInstance || false}
            success={this.state.successUpdateInstance || false}
            successMessage={'Экземпляр успешно обновлен'}
            errorMessage={this.state.errorMessage || ''}
            customFormat={true}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {isOffsetDialogOpen && (
          <ProcessingOffsetDialog
            handleClose={() =>
              this.setState({
                isOffsetDialogOpen: false,
              })
            }
            rowData={this.state.rowData}
          />
        )}

        {this.state.waitForTaskDeletion && (
          <WaitingDialog
            title={'Удаление экземпляра потока обработки'}
            open={this.state.waitForTaskDeletion}
            onClose={() => {
              this.setState({ waitForTaskDeletion: false });
              if (this.state.successTaskDeletion) {
                this.props.refetch();
              }
            }}
            complete={this.state.taskDeletionComplete || false}
            success={this.state.successTaskDeletion || false}
            successMessage={'Экземпляр успешно удален'}
            errorMessage={this.state.errorMessage || ''}
            customFormat={true}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.waitForStart && (
          <WaitingDialog
            title={'Старт экземпляра потока обработки'}
            open={this.state.waitForStart}
            onClose={() => {
              this.setState({ waitForStart: false });
              if (this.state.successStart) {
                this.props.refetch();
              }
            }}
            complete={this.state.completeStart || false}
            success={this.state.successStart || false}
            successMessage={'Экземпляр успешно стартовал'}
            errorMessage={this.state.errorMessage || ''}
            customFormat={true}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.waitForStop && (
          <WaitingDialog
            title={'Остановка экземпляра потока обработки'}
            open={this.state.waitForStop}
            onClose={() => {
              this.setState({ waitForStop: false });
              if (this.state.successStop) {
                this.props.refetch();
              }
            }}
            complete={this.state.completeStop || false}
            success={this.state.successStop || false}
            successMessage={'Экземпляр успешно остановлен'}
            errorMessage={this.state.errorMessage || ''}
            customFormat={true}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.isConfirmUpdateInstanceVersionDialogOpen && (
          <ConfirmDialog
            warningText={
              `Вы уверены, что хотите обновить версию экземпляра ${this.state.flowProject}/${this.state.flowName}(${this.state.zoneId})` +
              ` от ${this.state.versionInstance} до версии конфигурации ${this.state.versionConfig}?`
            }
            open={this.state.isConfirmUpdateInstanceVersionDialogOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmUpdateClose}
          />
        )}

        {this.state.isConfirmDeleteInstanceDialogOpen && (
          <ConfirmDialog
            warningText={
              `Вы уверены, что хотите удалить экземпляр ${this.state.zoneId}/${this.state.flowProject}/${this.state.flowName}?` +
              ` Его будет невозможно восстановить.`
            }
            open={this.state.isConfirmDeleteInstanceDialogOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDeleteClose}
          />
        )}

        {this.state.isConfirmStartInstanceDialogOpen && (
          <ConfirmDialog
            warningText={`Вы уверены, что хотите запустить экземпляр ${this.state.flowProject}/${this.state.flowName}(${this.state.zoneId})?`}
            open={this.state.isConfirmStartInstanceDialogOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmStartClose}
          />
        )}
        {this.state.isRejectStartInstanceDialogOpen && (
          <ConfirmDialog
            warningText={`Для конфигурации потока используется единая consumer group. Одномоментно экземпляр потока может быть запущен только в 1 зоне. Экземпляр потока уже запущен в зоне ${this.state.startedZoneId.join(', ')}.`}
            open={this.state.isRejectStartInstanceDialogOpen}
            cancelString={'Ок'}
            okString={undefined}
            onClose={this.handleRejectStartClose}
          />
        )}

        {this.state.isConfirmStopInstanceDialogOpen && (
          <ConfirmDialog
            warningText={`Вы уверены, что хотите остановить экземпляр ${this.state.zoneId}/${this.state.flowProject}/${this.state.flowName}?`}
            open={this.state.isConfirmStopInstanceDialogOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmStopClose}
          />
        )}
      </React.Fragment>
    );
  }
}

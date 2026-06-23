import MaterialTable, { MTableAction, MTableGroupbar, MTableBodyRow, MTableGroupRow, MTableHeader } from '@material-table/core';
import { createTheme, IconButton, ThemeProvider, Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { ArrowRightAlt } from '@material-ui/icons';
import DeleteButton from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import PauseButton from '@material-ui/icons/Pause';
import ResumeButton from '@material-ui/icons/PlayArrow';
import StopButton from '@material-ui/icons/Stop';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import * as React from 'react';

import { FlowInstance, FlowInstanceExtended } from '../../store/flow/Types';
import { FlowUtils } from '../../utils/FlowUtils';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';

import FlowInstancesStatus from './FlowInstancesStatus';
import { ProcessingOffsetDialog } from './ProcessingOffsetDialog';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#4CAF50',
    },
  },
});

const themeActions = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FFA500',
    },
  },
});

const themeHeader = createTheme({
  palette: {
    background: {
      paper: 'rgb(76, 175, 80, 0.25)',
    },
  },
});

export interface FlowOverviewZoneListProps {
  data: FlowInstanceExtended[];
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
  suspendInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resumeInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  refetchOverview: () => void;
}

export interface FlowOverviewZoneListState {
  isConfirmUpdateInstanceVersionDialogOpen: boolean;
  isConfirmDeleteInstanceDialogOpen: boolean;
  isConfirmStartInstanceDialogOpen: boolean;
  isConfirmStopInstanceDialogOpen: boolean;
  isRejectStartInstanceDialogOpen: boolean;

  startedZoneId: string[] | [];
  confirmFewStart: boolean;
  confirmFewStop: boolean;
  confirmFewDelete: boolean;

  selectedRows: FlowInstanceExtended[];

  isSingleStart: boolean;
  waitForTaskStart: boolean;
  completeTaskStart: boolean;
  successTaskStart: boolean;

  isSingleStop: boolean;
  waitForTaskStop: boolean;
  completeTaskStop: boolean;
  successTaskStop: boolean;

  isSingleDeletion: boolean;
  waitForTaskDeletion: boolean;
  completeTaskDeletion: boolean;
  successTaskDeletion: boolean;

  waitForUpdateInstance?: boolean;
  successUpdateInstance?: boolean;
  completeUpdateInstance?: boolean;

  errorMessage: string;
  detailMessage?: string;

  flowId: number;
  zoneId: string;
  flowName: string;
  flowProject: string;
  versionConfig: string;
  versionInstance: string;
  instanceStatuses: { [key: string]: string };
  isOffsetDialogOpen: boolean;
  rowData: FlowInstance;
}

export class FlowOverviewZoneList extends React.Component<FlowOverviewZoneListProps, FlowOverviewZoneListState> {
  constructor(props) {
    super(props);
    this.state = {
      isConfirmUpdateInstanceVersionDialogOpen: false,
      isConfirmDeleteInstanceDialogOpen: false,
      isConfirmStartInstanceDialogOpen: false,
      isConfirmStopInstanceDialogOpen: false,
      confirmFewStart: false,
      confirmFewStop: false,
      confirmFewDelete: false,
      selectedRows: [],
      isRejectStartInstanceDialogOpen: false,
      startedZoneId: [],
      flowId: 0,
      zoneId: '',
      flowName: '',
      flowProject: '',
      versionConfig: '',
      versionInstance: '',
      isSingleStart: false,
      waitForTaskStart: false,
      completeTaskStart: false,
      successTaskStart: false,
      isSingleStop: false,
      waitForTaskStop: false,
      completeTaskStop: false,
      successTaskStop: false,
      isSingleDeletion: false,
      waitForTaskDeletion: false,
      completeTaskDeletion: false,
      successTaskDeletion: false,
      errorMessage: '',
      instanceStatuses: {},
    };
    this.handleConfirmUpdateClose = this.handleConfirmUpdateClose.bind(this);
    this.handleConfirmDeleteClose = this.handleConfirmDeleteClose.bind(this);
    this.handleConfirmFewStartClose = this.handleConfirmFewStartClose.bind(this);
    this.handleConfirmFewStopClose = this.handleConfirmFewStopClose.bind(this);
    this.handleConfirmStartClose = this.handleConfirmStartClose.bind(this);
    this.handleConfirmStopClose = this.handleConfirmStopClose.bind(this);
    this.handleConfirmFewDeleteClose = this.handleConfirmFewDeleteClose.bind(this);
    this.handleRejectStartClose = this.handleRejectStartClose.bind(this);
  }
  handleRejectStartClose(value) {
    return this.setState({
      isRejectStartInstanceDialogOpen: false,
    });
  }
  handleConfirmFewDeleteClose(value) {
    this.setState({ confirmFewDelete: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: false,
        waitForTaskDeletion: true,
        completeTaskDeletion: false,
        successTaskDeletion: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        FlowUtils.recursiveFunctionWithZoneIdAndFlowId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при удалении экземпляра(-ов) ',
          this.props.deleteInstances,
          (endData) => {
            if (endData.success) {
              this.setState({
                completeTaskDeletion: true,
                successTaskDeletion: true,
              });
            } else {
              this.setState({
                completeTaskDeletion: true,
                successTaskDeletion: false,
                errorMessage: endData.error,
                detailMessage: endData.details,
              });
            }
          },
        );
        this.setState({ selectedRows: [] });
      }
    }
  }

  handleConfirmFewStopClose(value) {
    this.setState({ confirmFewStop: false });
    if (value === 'Ok') {
      this.setState({
        isSingleStop: false,
        waitForTaskStop: true,
        completeTaskStop: false,
        successTaskStop: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        FlowUtils.recursiveFunctionWithZoneIdAndFlowId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при остановке экземпляра(-ов) ',
          this.props.suspendInstances,
          (endData) => {
            if (endData.success) {
              this.setState({
                completeTaskStop: true,
                successTaskStop: true,
              });
            } else {
              this.setState({
                completeTaskStop: true,
                successTaskStop: false,
                errorMessage: endData.error,
                detailMessage: endData.details,
              });
            }
          },
        );
        this.setState({ selectedRows: [] });
      }
    }
  }

  handleConfirmFewStartClose(value) {
    this.setState({ confirmFewStart: false });
    if (value === 'Ok') {
      this.setState({
        isSingleStart: false,
        waitForTaskStart: true,
        completeTaskStart: false,
        successTaskStart: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        FlowUtils.recursiveFunctionWithZoneIdAndFlowId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при старте экземпляра(-ов) ',
          this.props.resumeInstances,
          (endData) => {
            if (endData.success) {
              this.setState({
                completeTaskStart: true,
                successTaskStart: true,
              });
            } else {
              this.setState({
                completeTaskStart: true,
                successTaskStart: false,
                errorMessage: endData.error,
                detailMessage: endData.details,
              });
            }
          },
        );
        this.setState({ selectedRows: [] });
      }
    }
  }

  handleConfirmStopClose(value) {
    this.setState({ isConfirmStopInstanceDialogOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleStop: true,
        waitForTaskStop: true,
        completeTaskStop: false,
        successTaskStop: false,
      });
    }
    this.props.suspendClicked(
      this.state.flowId,
      this.state.zoneId,
      () => {
        this.setState({
          completeTaskStop: true,
          successTaskStop: true,
          flowId: 0,
          zoneId: '',
          flowName: '',
          flowProject: '',
        });
      },
      (error) => {
        this.setState({
          completeTaskStop: true,
          successTaskStop: false,
          errorMessage: 'При остановке экземпляра произошла ошибка: ' + error.message,
          detailMessage: error.details,
        });
      },
    );
  }

  handleConfirmStartClose(value) {
    this.setState({ isConfirmStartInstanceDialogOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleStart: true,
        waitForTaskStart: true,
        completeTaskStart: false,
        successTaskStart: false,
      });
    }
    this.props.resumeClicked(
      this.state.flowId,
      this.state.zoneId,
      () => {
        this.setState({
          completeTaskStart: true,
          successTaskStart: true,
          flowId: 0,
          zoneId: '',
          flowName: '',
          flowProject: '',
        });
      },
      (error) => {
        this.setState({
          completeTaskStart: true,
          successTaskStart: false,
          errorMessage: 'При старте экземпляра произошла ошибка: ' + error.message,
          detailMessage: error.details,
        });
      },
    );
  }

  handleConfirmUpdateClose(value: string) {
    this.setState({
      isConfirmUpdateInstanceVersionDialogOpen: false,
    });
    if (value === 'Ok') {
      this.setState({
        waitForUpdateInstance: true,
        successUpdateInstance: false,
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
        isSingleDeletion: true,
        waitForTaskDeletion: true,
        successTaskDeletion: false,
        completeTaskDeletion: false,
      });
      this.props.deleteInstanceFlow(
        this.state.flowId,
        this.state.zoneId,
        () => {
          this.setState({
            completeTaskDeletion: true,
            successTaskDeletion: true,
            flowId: 0,
            zoneId: '',
            flowName: '',
            flowProject: '',
          });
        },
        (error) => {
          this.setState({
            completeTaskDeletion: true,
            successTaskDeletion: false,
            errorMessage: 'При удалении экземпляра произошла ошибка: ' + error.message,
            detailMessage: error.details,
          });
        },
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        <Paper style={{ width: '100%' }}>
          <ThemeProvider theme={theme}>
            {/*@ts-ignore*/}
            <MaterialTable
              icons={tableIcons}
              title="Список экземпляров задач потоков обработки по зонам"
              data={this.props.data}
              columns={Utils.getColumns(
                [
                  {
                    title: 'id',
                    field: 'id',
                    hidden: true,
                  },
                  { title: 'flowId', field: 'flowId', hidden: true },
                  { title: 'Название конфигурации', field: 'flowName' },
                  {
                    title: 'versionConfig',
                    field: 'versionConfig',
                    hidden: true,
                  },
                  { title: 'projectId', field: 'projectId', hidden: true },
                  { title: 'Ключ проекта', field: 'projectName' },
                  { title: 'Зона', field: 'zoneId', defaultGroupOrder: 0 },
                  { title: 'Идентификатор задачи', field: 'jobId' },
                  { field: 'canEdit', hidden: true },
                  { field: 'canManageAccess', hidden: true },
                  {
                    title: 'Длительность',
                    field: 'duration',
                    render: (rowData) => <>{FlowUtils.formatTime(rowData.duration)}</>,
                  },
                  {
                    title: 'Установить offset',
                    field: 'setOffset',
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
                              isOffsetDialogOpen: true,
                              rowData,
                            });
                          }}
                        >
                          <ArrowRightAlt />
                        </IconButton>
                      );
                    },
                  },
                  {
                    title: 'Статус',
                    field: 'status',
                    render: (rowData) => {
                      return (
                        <FlowInstancesStatus
                          flowId={rowData.flowId}
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
                  {
                    title: 'Версия',
                    field: 'version',
                    render: (rowData) => {
                      if (rowData.version !== rowData.versionConfig) {
                        return (
                          <ThemeProvider theme={themeActions}>
                            <Tooltip
                              title={
                                <React.Fragment>
                                  <div>Версия конфигурации: {rowData.versionConfig}</div>
                                  <div>Версия экземпляра: {rowData.version}</div>
                                </React.Fragment>
                              }
                            >
                              <IconButton
                                disabled={!rowData.canEdit}
                                size={'small'}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  this.setState({
                                    isConfirmUpdateInstanceVersionDialogOpen: true,
                                    flowId: rowData.flowId,
                                    zoneId: rowData.zoneId,
                                    flowName: rowData.flowName,
                                    flowProject: rowData.projectName,
                                    versionConfig: rowData.versionConfig,
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
                      if (rowData.version === rowData.versionConfig) {
                        return (
                          <ThemeProvider theme={themeActions}>
                            <Tooltip
                              title={
                                <React.Fragment>
                                  <div>Версия конфигурации: {rowData.versionConfig}</div>
                                  <div>Версия экземпляра: {rowData.version}</div>
                                </React.Fragment>
                              }
                            >
                              <InfoIcon htmlColor="rgb(76 175 80)" fontSize={'small'} style={{ marginLeft: '5px' }} />
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
                          color="primary"
                          disabled={!rowData.canEdit}
                          size={'small'}
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            if (currentStatus === 'RUNNING') {
                              this.setState({
                                isConfirmStopInstanceDialogOpen: true,
                                flowId: rowData.flowId,
                                zoneId: rowData.zoneId,
                                flowName: rowData.flowName,
                                flowProject: rowData.projectName,
                              });
                              // this.props.suspendClicked(rowData.flowId, rowData.zoneId);
                            }
                            if (rowData.status !== 'RUNNING' && rowData.useGlobalConsumerGroup === false) {
                              this.setState({
                                isConfirmStartInstanceDialogOpen: true,
                                flowId: rowData.flowId,
                                zoneId: rowData.zoneId,
                                flowName: rowData.name,
                                flowProject: rowData.project,
                              });
                            }
                            if (rowData.useGlobalConsumerGroup === false && rowData.status !== 'RUNNING') {
                              const listOfZones: string[] = [];
                              const startedFlowListZone = this.props.data.filter((el) => {
                                if (el.useGlobalConsumerGroup && el.status === 'RUNNING' && el.flowName === rowData.flowName) {
                                  listOfZones.push(el.zoneId);
                                  return el.zoneId;
                                }
                              });
                              if (startedFlowListZone.length) {
                                this.setState({
                                  isRejectStartInstanceDialogOpen: true,
                                  flowId: rowData.flowId,
                                  zoneId: rowData.zoneId,
                                  startedZoneId: listOfZones,
                                  flowName: rowData.name,
                                  flowProject: rowData.project,
                                });
                              }
                              if (startedFlowListZone.length === 0) {
                                this.setState({
                                  isConfirmStartInstanceDialogOpen: true,
                                  flowId: rowData.flowId,
                                  zoneId: rowData.zoneId,
                                  flowName: rowData.name,
                                  flowProject: rowData.project,
                                });
                              }
                              // this.props.resumeClicked(rowData.flowId, rowData.zoneId);
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
                          color="primary"
                          disabled={!rowData.canEdit}
                          size={'small'}
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            this.setState({
                              isConfirmDeleteInstanceDialogOpen: true,
                              flowId: rowData.flowId,
                              zoneId: rowData.zoneId,
                              flowName: rowData.flowName,
                              flowProject: rowData.projectName,
                            });
                          }}
                        >
                          <DeleteButton />
                        </IconButton>
                      );
                    },
                  },
                ],
                [],
              )}
              localization={{
                toolbar: {
                  searchTooltip: 'Поиск',
                  searchPlaceholder: 'Поиск',
                  nRowsSelected: '{0} экземпляр(-ов) выбрано',
                },
                grouping: {
                  placeholder: 'Перетащите сюда заголовок столбца, по которому хотите сгруппировать данные',
                  groupedBy: 'Сгруппировано по ',
                },
                body: {
                  emptyDataSourceMessage: 'Список экземпляров потоков обработки пуст',
                },
                header: {
                  actions: '',
                },
              }}
              options={{
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                emptyRowsWhenPaging: false,
                padding: 'dense',
                search: true,
                paging: true,
                showTitle: true,
                header: true,
                actionsColumnIndex: -1,
                grouping: true,
              }}
              components={{
                Groupbar: (props) => {
                  return <MTableGroupbar {...props} />;
                },
                Row: (props) => (
                  <MTableBodyRow
                    {...{
                      ...props,
                      options: {
                        ...props.options,
                        selection: true,
                        selectionProps: (rowData) => ({
                          disabled: !rowData.canEdit,
                        }),
                      },
                    }}
                  />
                ),
                Action: (props) => {
                  if (
                    props.action.tooltip === 'Старт выбранных экземпляров' ||
                    props.action.tooltip === 'Остановить выбранные экземпляры' ||
                    props.action.tooltip === 'Удалить выбранные экземпляры'
                  ) {
                    const flag = props.data.some((item) => !item.canEdit);
                    return (
                      <div style={{ color: flag ? 'disabled' : '#4CAF50' }}>
                        <MTableAction
                          {...{
                            ...props,
                            disabled: flag,
                          }}
                        />
                      </div>
                    );
                  } else {
                    return <MTableAction {...props} />;
                  }
                },
                GroupRow: (props) => (
                  <MTableGroupRow
                    {...{
                      ...props,
                      options: {
                        ...props.options,
                        selection: true,
                        showSelectGroupCheckbox: true,
                      },
                    }}
                  />
                ),
                Header: (props) => (
                  <ThemeProvider theme={themeHeader}>
                    <MTableHeader
                      {...{
                        ...props,
                        hasSelection: true,
                      }}
                    />
                  </ThemeProvider>
                ),
              }}
              actions={[
                {
                  icon: () => <ResumeButton />,
                  tooltip: 'Старт выбранных экземпляров',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmFewStart: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <StopButton />,
                  tooltip: 'Остановить выбранные экземпляры',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmFewStop: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <DeleteButton />,
                  tooltip: 'Удалить выбранные экземпляры',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmFewDelete: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
              ]}
            />
          </ThemeProvider>
        </Paper>

        {this.state.waitForTaskStart && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleStart ? 'Старт экземпляра' : 'Старт нескольких экземпляров'}
            open={this.state.waitForTaskStart}
            onClose={() => {
              this.setState({
                waitForTaskStart: false,
                errorMessage: '',
                detailMessage: undefined,
              });
              if (this.state.successTaskStart) {
                this.props.refetchOverview();
              }
            }}
            complete={this.state.completeTaskStart}
            success={this.state.successTaskStart}
            successMessage={this.state.isSingleStart ? 'Экземпляр успешно стартовал' : 'Экземпляры успешно стартовали'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.isOffsetDialogOpen && (
          <ProcessingOffsetDialog
            handleClose={() =>
              this.setState({
                isOffsetDialogOpen: false,
              })
            }
            rowData={this.state.rowData}
          />
        )}

        {this.state.waitForTaskStop && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleStop ? 'Остановка экземпляра' : 'Остановка нескольких экземпляров'}
            open={this.state.waitForTaskStop}
            onClose={() => {
              this.setState({
                waitForTaskStop: false,
                errorMessage: '',
                detailMessage: undefined,
              });
              if (this.state.successTaskStop) {
                this.props.refetchOverview();
              }
            }}
            complete={this.state.completeTaskStop}
            success={this.state.successTaskStop}
            successMessage={this.state.isSingleStop ? 'Экземпляр успешно остановлен' : 'Экземпляры успешно остановлены'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.waitForTaskDeletion && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleDeletion ? 'Удаление экземпляра' : 'Удаление нескольких экземпляров'}
            open={this.state.waitForTaskDeletion}
            onClose={() => {
              this.setState({
                waitForTaskDeletion: false,
                errorMessage: '',
                detailMessage: undefined,
              });
              if (this.state.successTaskDeletion) {
                this.props.refetchOverview();
              }
            }}
            complete={this.state.completeTaskDeletion}
            success={this.state.successTaskDeletion}
            successMessage={this.state.isSingleDeletion ? 'Экземпляр успешно удален' : 'Экземпляры успешно удалены'}
            errorMessage={this.state.errorMessage}
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

        {this.state.waitForUpdateInstance && (
          <WaitingDialog
            title={'Обновление экземпляра потока обработки'}
            open={this.state.waitForUpdateInstance}
            onClose={() => {
              this.setState({ waitForUpdateInstance: false });
              if (this.state.successUpdateInstance) {
                this.props.refetchOverview();
              }
            }}
            needDetailedInfo={true}
            details={this.state.detailMessage}
            complete={this.state.completeUpdateInstance || false}
            success={this.state.successUpdateInstance || false}
            successMessage={'Экземпляр успешно обновлен'}
            errorMessage={this.state.errorMessage}
            customFormat={true}
          />
        )}

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите запустить экземпляры ' +
            this.state.selectedRows?.map((row) => row.projectName + '/' + row.flowName + '(' + row.zoneId + ')').join(', ') +
            '?'
          }
          open={this.state.confirmFewStart}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewStartClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите остановить экземпляры ' +
            this.state.selectedRows?.map((row) => row.projectName + '/' + row.flowName + '(' + row.zoneId + ')').join(', ') +
            '?'
          }
          open={this.state.confirmFewStop}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewStopClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить экземпляры ' +
            this.state.selectedRows?.map((row) => row.projectName + '/' + row.flowName + '(' + row.zoneId + ')').join(', ') +
            '?'
          }
          open={this.state.confirmFewDelete}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewDeleteClose}
        />

        {this.state.isConfirmStartInstanceDialogOpen && (
          <ConfirmDialog
            warningText={`Вы уверены, что хотите запустить экземпляр ${this.state.flowProject}/${this.state.flowName}(${this.state.zoneId})?`}
            open={this.state.isConfirmStartInstanceDialogOpen}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmStartClose}
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
        {this.state.isRejectStartInstanceDialogOpen && (
          <ConfirmDialog
            warningText={`Для конфигурации потока используется единая consumer group. Одномоментно экземпляр потока может быть запущен только в 1 зоне. Экземпляр потока уже запущен в зоне ${this.state.startedZoneId.join(
              ', ',
            )}.`}
            open={this.state.isRejectStartInstanceDialogOpen}
            cancelString={'Ок'}
            okString={undefined}
            onClose={this.handleRejectStartClose}
          />
        )}
      </React.Fragment>
    );
  }
}

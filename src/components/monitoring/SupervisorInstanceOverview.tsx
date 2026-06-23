//TODO для работы с селектом сгруппированных полей используется форкнутая material-table
import MaterialTable, { MTableAction, MTableBodyRow, MTableGroupRow, MTableHeader, MTableGroupbar } from '@material-table/core';
import { createTheme, IconButton, ThemeProvider, Tooltip } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { Delete, PlayArrow, Stop } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import UpdateIcon from '@material-ui/icons/Update';
import * as React from 'react';
import { createRef } from 'react';

import SpecInfoWithDiffDialogContainer from '../../containers/monitoring/SpecInfoWithDiffDialogContainer';
import { User } from '../../store/auth/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import { DruidSupervisorInfo, InstanceQuotaUsage, ConfigQuotaUsage } from '../../store/monitoring/Types';
import { Project } from '../../store/project/Types';
import { AnalyticIndexUtils, DruidSupervisorInstanceInfo } from '../../utils/AnalyticIndexUtils';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';

import { InstanceQuotaOverride } from './InstanceQuotaOverride';

enum MENU_TYPE {
  delete,
  start,
  stop,
  reset,
  overrideQuota,
}

interface ShortInfo {
  name: string;
  projectKey: string;
  zoneId: string;
  id: number;
  versionConfig?: string;
  versionInstance?: string;
  globalVersionInstance?: string;
  instanceQuotaUsage?: InstanceQuotaUsage;
  configQuotaUsage?: ConfigQuotaUsage;
}

const themeHeader = createTheme({
  palette: {
    background: {
      paper: 'rgb(76, 175, 80, 0.25)',
    },
  },
});

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
      main: '#1e88e5',
    },
    secondary: {
      main: '#ea9313',
    },
    error: {
      main: '#ff0000',
    },
  },
});

export interface SupervisorInstanceOverviewProps {
  supervisors: DruidSupervisorInfo[];
  projects: Project[];
  topics: KafkaTopic[];
  user: User;
  isAdmin: boolean;
  globalConfigurationVersion: Map<string, string>;

  deleteSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  startSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  stopSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  updateSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  displayError: (error) => void;
  displayInfo: (info) => void;
  displaySuccess: (success) => void;
  refetch: () => void;
  refreshSupervisor?: (id: number) => void;
}

export interface SupervisorInstanceOverviewStat {
  confirmFewUpdate: boolean;
  confirmFewDelete: boolean;
  confirmFewStart: boolean;
  confirmFewStop: boolean;
  confirmStop: boolean;
  confirmStart: boolean;
  confirmDelete: boolean;
  confirmReset: boolean;
  selectedRow?: DruidSupervisorInstanceInfo;
  selectedRows?: DruidSupervisorInstanceInfo[];
  startIndex?: ShortInfo;
  stopIndex?: ShortInfo;
  deleteIndex?: ShortInfo;
  resetIndex?: ShortInfo;
  updateIndex?: ShortInfo;
  overrideQuotaIndex?: ShortInfo;
  isSingleDeletion: boolean;
  waitForTaskDeletion: boolean;
  completeTaskDeletion: boolean;
  successTaskDeletion: boolean;
  errorMessage: string;
  detailMessage?: string;
  isSingleStart: boolean;
  isSingleStop: boolean;
  isSingleUpdate: boolean;
  waitForTaskStart: boolean;
  completeTaskStart: boolean;
  successTaskStart: boolean;
  waitForTaskStop: boolean;
  completeTaskStop: boolean;
  successTaskStop: boolean;
  waitForTaskReset: boolean;
  completeTaskReset: boolean;
  successTaskReset: boolean;
  waitForInstanceUpdate: boolean;
  completeInstanceUpdate: boolean;
  successInstanceUpdate: boolean;
  confirmDialogUpdateInstanceOpen: boolean;
  infoOpen: boolean;
  overrideQuotaDialogOpen: boolean;
}

const ButtonMenu = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} aria-controls={'simple-menu'} id={'id' + props.data.id} size={'small'} color={'primary'}>
        <MenuIcon />
      </IconButton>
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          disabled={props.data.status === 'ACTIVE' || !(props.data.canEdit || props.isAdmin)}
          onClick={(e) => {
            props.onClose(MENU_TYPE.start, props.data.name, props.data.project, props.data.id, props.data.zone);
            handleClose();
          }}
        >
          Старт
        </MenuItem>
        <MenuItem
          disabled={props.data.status === 'DISABLED' || !(props.data.canEdit || props.isAdmin)}
          onClick={(e) => {
            props.onClose(MENU_TYPE.stop, props.data.name, props.data.project, props.data.id, props.data.zone);
            handleClose();
          }}
        >
          Стоп
        </MenuItem>
        <MenuItem
          disabled={props.data.status === 'DISABLED' || !(props.data.canEdit || props.isAdmin)}
          onClick={(e) => {
            props.onClose(MENU_TYPE.reset, props.data.name, props.data.project, props.data.id, props.data.zone);
            handleClose();
          }}
        >
          Сброс
        </MenuItem>
        <MenuItem
          disabled={!(props.data.canEdit || props.isAdmin)}
          onClick={(e) => {
            props.onClose(
              MENU_TYPE.overrideQuota,
              props.data.name,
              props.data.project,
              props.data.id,
              props.data.zone,
              props.data.instanceQuotaUsage,
              props.data.configQuotaUsage,
            );
            handleClose();
          }}
        >
          Переопределить квоты экземпляра
        </MenuItem>
        <MenuItem
          disabled={!(props.data.canEdit || props.isAdmin)}
          onClick={(e) => {
            props.onClose(MENU_TYPE.delete, props.data.name, props.data.project, props.data.id, props.data.zone);
            handleClose();
          }}
        >
          <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
        </MenuItem>
      </Menu>
    </>
  );
};

export class SupervisorInstanceOverview extends React.Component<SupervisorInstanceOverviewProps, SupervisorInstanceOverviewStat> {
  constructor(props) {
    super(props);
    this.state = {
      confirmFewUpdate: false,
      confirmDelete: false,
      confirmFewDelete: false,
      confirmFewStart: false,
      confirmFewStop: false,
      confirmStart: false,
      confirmStop: false,
      confirmReset: false,
      isSingleDeletion: true,
      waitForTaskDeletion: false,
      completeTaskDeletion: false,
      successTaskDeletion: false,
      errorMessage: '',
      isSingleStart: true,
      isSingleStop: true,
      isSingleUpdate: true,
      completeTaskReset: false,
      completeTaskStart: false,
      completeTaskStop: false,
      successTaskStart: false,
      successTaskStop: false,
      successTaskReset: false,
      waitForTaskReset: false,
      waitForTaskStart: false,
      waitForTaskStop: false,
      confirmDialogUpdateInstanceOpen: false,
      waitForInstanceUpdate: false,
      successInstanceUpdate: false,
      completeInstanceUpdate: false,
      infoOpen: false,
      overrideQuotaDialogOpen: false,
    };
    this.onCloseMenu = this.onCloseMenu.bind(this);
    this.handleConfirmDeleteClose = this.handleConfirmDeleteClose.bind(this);
    this.handleConfirmFewUpdateClose = this.handleConfirmFewUpdateClose.bind(this);
    this.handleConfirmFewDeleteClose = this.handleConfirmFewDeleteClose.bind(this);
    this.handleConfirmStartClose = this.handleConfirmStartClose.bind(this);
    this.handleConfirmFewStartClose = this.handleConfirmFewStartClose.bind(this);
    this.handleConfirmStopClose = this.handleConfirmStopClose.bind(this);
    this.handleConfirmFewStopClose = this.handleConfirmFewStopClose.bind(this);
    this.handleConfirmResetClose = this.handleConfirmResetClose.bind(this);
    this.handleConfirmUpdateClose = this.handleConfirmUpdateClose.bind(this);
    this.createConfirmTitleForConfigUpdate = this.createConfirmTitleForConfigUpdate.bind(this);
  }

  createConfirmTitleForConfigUpdate(): string {
    if (this.props.isAdmin) {
      if (this.state.updateIndex?.versionInstance != null && this.state.updateIndex?.globalVersionInstance != null) {
        return (
          `Вы уверены, что хотите обновить версию экземпляра ${this.state.updateIndex?.projectKey}/${this.state.updateIndex?.name}(${this.state.updateIndex?.zoneId})` +
          ` от ${this.state.updateIndex?.versionInstance} до версии конфигурации ${this.state.updateIndex?.versionConfig}, a также версию глобальной конфигурации ` +
          ` от ${this.state.updateIndex?.globalVersionInstance || '(глобальной конфигурации нет)'} до версии ${this.props.globalConfigurationVersion.get(this.state.updateIndex?.zoneId)}?`
        );
      } else if (this.state.updateIndex?.versionInstance != null && this.state.updateIndex?.globalVersionInstance == null) {
        return (
          `Вы уверены, что хотите обновить версию экземпляра ${this.state.updateIndex?.projectKey}/${this.state.updateIndex?.name}(${this.state.updateIndex?.zoneId})` +
          ` от ${this.state.updateIndex?.versionInstance} до версии конфигурации ${this.state.updateIndex?.versionConfig}?`
        );
      } else {
        return (
          `Вы уверены, что хотите обновить версию глобальной конфигурации экземпляра ${this.state.updateIndex?.projectKey}/${this.state.updateIndex?.name}(${this.state.updateIndex?.zoneId})` +
          ` от ${this.state.updateIndex?.globalVersionInstance || '(глобальной конфигурации нет)'} до версии глобальной конфигурации ${this.props.globalConfigurationVersion.get(this.state.updateIndex?.zoneId)}?`
        );
      }
    } else {
      return (
        `Вы уверены, что хотите обновить версию экземпляра ${this.state.updateIndex?.projectKey}/${this.state.updateIndex?.name}(${this.state.updateIndex?.zoneId})` +
        ` от ${this.state.updateIndex?.versionInstance} до версии конфигурации ${this.state.updateIndex?.versionConfig}?`
      );
    }
  }

  tableRef = createRef();

  clearSelection = () => {
    if (this.tableRef.current) {
      this.tableRef.current.onAllSelected(false);
    }
  };

  onCloseMenu(
    type: MENU_TYPE,
    name: string,
    projectShortName: string,
    id: number,
    zone: string,
    instanceQuotaUsage?: InstanceQuotaUsage,
    configQuotaUsage?: ConfigQuotaUsage,
  ) {
    switch (type) {
      case MENU_TYPE.start:
        this.setState({ confirmStart: true, startIndex: { name: name, projectKey: projectShortName, id: id, zoneId: zone } });
        break;
      case MENU_TYPE.stop:
        this.setState({ confirmStop: true, stopIndex: { name: name, projectKey: projectShortName, id: id, zoneId: zone } });
        break;
      case MENU_TYPE.delete:
        this.setState({ confirmDelete: true, deleteIndex: { name: name, projectKey: projectShortName, id: id, zoneId: zone } });
        break;
      case MENU_TYPE.reset:
        this.setState({ confirmReset: true, resetIndex: { name: name, projectKey: projectShortName, id: id, zoneId: zone } });
        break;
      case MENU_TYPE.overrideQuota:
        this.setState({
          overrideQuotaDialogOpen: true,
          overrideQuotaIndex: { name: name, projectKey: projectShortName, id: id, zoneId: zone, instanceQuotaUsage, configQuotaUsage },
        });
        break;
    }
  }

  handleConfirmUpdateClose(value) {
    this.setState({ confirmDialogUpdateInstanceOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleUpdate: true,
        waitForInstanceUpdate: true,
        completeInstanceUpdate: false,
        successInstanceUpdate: false,
      });
      this.props.updateSupervisorInstanceById(
        this.state.updateIndex?.id,
        this.state.updateIndex?.zoneId,
        () => {
          this.setState({
            completeInstanceUpdate: true,
            successInstanceUpdate: true,
            updateIndex: undefined,
          });
        },
        (message: string) => {
          this.setState({
            completeInstanceUpdate: true,
            successInstanceUpdate: false,
            updateIndex: undefined,
            errorMessage: 'При обновлении экземпляра произошла ошибка: ' + message,
          });
        },
      );
    }
  }

  handleConfirmDeleteClose(value) {
    this.setState({ confirmDelete: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: true,
        waitForTaskDeletion: true,
        completeTaskDeletion: false,
        successTaskDeletion: false,
      });
      this.props.deleteSupervisorInstanceById(
        this.state.deleteIndex?.id,
        this.state.deleteIndex?.zoneId,
        () => {
          this.setState({
            completeTaskDeletion: true,
            successTaskDeletion: true,
            deleteIndex: undefined,
          });
        },
        (message) => {
          this.setState({
            completeTaskDeletion: true,
            successTaskDeletion: false,
            deleteIndex: undefined,
            errorMessage: 'При удалении экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
    }
  }

  handleConfirmFewUpdateClose(value) {
    this.setState({ confirmFewUpdate: false });
    if (value === 'Ok') {
      this.setState({
        isSingleUpdate: false,
        waitForInstanceUpdate: true,
        completeInstanceUpdate: false,
        successInstanceUpdate: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        AnalyticIndexUtils.recursiveFunctionWithZoneIdAndId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при обновлении экземпляра(-ов) ',
          this.props.updateSupervisorInstanceById,
          (endData) => {
            if (endData.success) {
              this.setState({
                completeInstanceUpdate: true,
                successInstanceUpdate: true,
              });
            } else {
              this.setState({
                completeInstanceUpdate: true,
                successInstanceUpdate: false,
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
        AnalyticIndexUtils.recursiveFunctionWithZoneIdAndId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при удалении экземпляра(-ов) ',
          this.props.deleteSupervisorInstanceById,
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

  handleConfirmStartClose(value) {
    this.setState({ confirmStart: false });
    if (value === 'Ok') {
      this.setState({
        isSingleStart: true,
        waitForTaskStart: true,
        completeTaskStart: false,
        successTaskStart: false,
      });
      this.props.startSupervisorInstanceById(
        this.state.startIndex?.id,
        this.state.startIndex?.zoneId,
        () => {
          this.setState({
            completeTaskStart: true,
            successTaskStart: true,
            startIndex: undefined,
          });
        },
        (message) => {
          this.setState({
            completeTaskStart: true,
            successTaskStart: false,
            startIndex: undefined,
            errorMessage: 'При старте экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
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
        AnalyticIndexUtils.recursiveFunctionWithZoneIdAndId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при старте экземпляра(-ов) ',
          this.props.startSupervisorInstanceById,
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
    this.setState({ confirmStop: false });
    if (value === 'Ok') {
      this.setState({
        isSingleStop: true,
        waitForTaskStop: true,
        completeTaskStop: false,
        successTaskStop: false,
      });
      this.props.stopSupervisorInstanceById(
        this.state.stopIndex?.id,
        this.state.stopIndex?.zoneId,
        () => {
          this.setState({
            completeTaskStop: true,
            successTaskStop: true,
            stopIndex: undefined,
          });
        },
        (message) => {
          this.setState({
            completeTaskStop: true,
            successTaskStop: false,
            stopIndex: undefined,
            errorMessage: 'При остановке экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
          });
        },
      );
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
        AnalyticIndexUtils.recursiveFunctionWithZoneIdAndId(
          this.state.selectedRows,
          result,
          'Произошла ошибка при остановке экземпляра(-ов) ',
          this.props.stopSupervisorInstanceById,
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

  handleConfirmResetClose(value) {
    this.setState({ confirmReset: false });
    if (value === 'Ok') {
      this.setState({
        waitForTaskReset: true,
        completeTaskReset: false,
        successTaskReset: false,
      });
      this.props.resetSupervisorInstanceById(
        this.state.resetIndex?.id,
        this.state.resetIndex?.zoneId,
        () => {
          this.setState({
            completeTaskReset: true,
            successTaskReset: true,
            resetIndex: undefined,
          });
        },
        (message) => {
          this.setState({
            completeTaskReset: true,
            successTaskReset: false,
            resetIndex: undefined,
            errorMessage: 'При остановке экземпляра произошла ошибка: ' + message.message,
            detailMessage: message.details,
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
              tableRef={this.tableRef}
              icons={tableIcons}
              columns={Utils.getColumns(
                [
                  {
                    title: 'Название',
                    field: 'name',
                    cellStyle: {
                      paddingTop: '10px',
                    },
                    grouping: false,
                  },
                  {
                    title: 'Зона',
                    field: 'zone',
                    defaultGroupOrder: 0,
                  },
                  {
                    title: 'Ключ проекта',
                    field: 'project',
                    grouping: true,
                  },
                  {
                    title: 'Источник данных',
                    field: 'topic',
                    grouping: true,
                  },
                  {
                    title: 'Статус',
                    field: 'status',
                    grouping: true,
                  },
                  {
                    field: 'id',
                    hidden: true,
                  },
                  {
                    field: 'isOutdated',
                    hidden: true,
                  },
                  {
                    field: 'isGlobalOutdated',
                    hidden: true,
                  },
                  {
                    field: 'canEdit',
                    hidden: true,
                  },
                  {
                    field: 'versionConfig',
                    hidden: true,
                  },
                  {
                    field: 'versionInstance',
                    hidden: true,
                  },
                  {
                    field: 'globalVersionInstance',
                    hidden: true,
                  },
                  {
                    field: 'projectId',
                    hidden: true,
                  },
                  {
                    field: 'configQuotaUsage',
                    hidden: true,
                  },
                  {
                    field: 'instanceQuotaUsage',
                    hidden: true,
                  },
                  {
                    title: 'Отставание',
                    field: 'aggregatedLag',
                    grouping: false,
                  },
                  {
                    title: '5 минут',
                    field: 'fiveMinuteStats',
                    grouping: false,
                  },
                  {
                    title: 'Общая статистика',
                    field: 'totalStats',
                    grouping: false,
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
                  emptyDataSourceMessage: 'Список экземпляров аналитического индекса пуст',
                },
                header: {
                  actions: '',
                },
              }}
              data={AnalyticIndexUtils.createDruidSupervisorInstanceInfoArray(
                this.props.supervisors,
                this.props.projects,
                this.props.topics,
                this.props.globalConfigurationVersion,
              )}
              title="Экземпляры задач аналитического индекса"
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
              actions={[
                (rowData) => {
                  const hasOverrideQuotas = !!rowData.instanceQuotaUsage;
                  const configTaskCount = rowData.configQuotaUsage?.taskCount ?? '-';
                  const instanceTaskCount = rowData.instanceQuotaUsage?.taskCount ?? '-';

                  const tooltipContent = hasOverrideQuotas
                    ? `Квоты по количеству задач мониторинга конфигурации и экземпляра отличаются. Квота конфигурации ${configTaskCount}. Квота экземпляра ${instanceTaskCount}`
                    : '';

                  return {
                    icon: () => {
                      if (!hasOverrideQuotas) return null;

                      return (
                        <Tooltip title={tooltipContent}>
                          <div
                            style={{
                              marginTop: 4,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: '2px solid #ea9313',
                              boxSizing: 'border-box',
                            }}
                          />
                        </Tooltip>
                      );
                    },
                    tooltip: tooltipContent,
                    disabled: true,
                    position: 'row',
                  };
                },
                (rowData) => {
                  const { isAdmin, globalConfigurationVersion } = this.props;
                  const { isOutdated, isGlobalOutdated, versionInstance, versionConfig, globalVersionInstance, zone } = rowData;

                  // 1. Определяем, нужно ли вообще показывать иконку
                  const showIcon = (isAdmin && (isOutdated || isGlobalOutdated)) || (!isAdmin && isOutdated);

                  // 2. Логика определения цвета иконки
                  const getIconColor = () => {
                    if (!isAdmin && isOutdated) return 'primary';
                    if (isAdmin && isOutdated && isGlobalOutdated) return 'error';
                    if (isAdmin && isOutdated && !isGlobalOutdated) return 'secondary';
                    return 'primary';
                  };

                  // 3. Формируем содержимое тултипа
                  const renderTooltip = () => {
                    const configChanged = isOutdated;
                    const globalChanged = isAdmin && isGlobalOutdated;

                    return (
                      <React.Fragment>
                        {configChanged && (
                          <>
                            <div style={{ color: 'lemonchiffon' }}>
                              <b>Версия конфигурации была изменена</b>
                            </div>
                            <div>Текущая версия экземпляра: {versionInstance}</div>
                            <div>Актуальная версия конфигурации: {versionConfig}</div>
                          </>
                        )}
                        {globalChanged && (
                          <>
                            <div style={{ color: 'lightskyblue', marginTop: configChanged ? 8 : 0 }}>
                              <b>Версия глобальной конфигурации была изменена</b>
                            </div>
                            <div>Текущая версия глобальной конфигурации экземпляра: {globalVersionInstance}</div>
                            <div>Актуальная версия глобальной конфигурации: {globalConfigurationVersion.get(zone)}</div>
                          </>
                        )}
                      </React.Fragment>
                    );
                  };
                  return {
                    icon: () => {
                      if (!showIcon) return <div style={{ marginLeft: 24 }} />;

                      return (
                        <ThemeProvider theme={!isAdmin ? theme : themeActions}>
                          <SyncProblemIcon color={getIconColor()} />
                        </ThemeProvider>
                      );
                    },
                    tooltip: showIcon ? renderTooltip() : '',
                    disabled: !(isOutdated || (isAdmin && isGlobalOutdated)),
                    onClick: (event, rowData) => {
                      event.preventDefault();
                      event.stopPropagation();
                      this.setState({
                        confirmDialogUpdateInstanceOpen: true,
                        updateIndex: {
                          id: rowData.id,
                          zoneId: rowData.zone,
                          name: rowData.name,
                          projectKey: rowData.project,
                          versionConfig: rowData.versionConfig,
                          versionInstance: isOutdated ? versionInstance : undefined,
                          globalVersionInstance: isGlobalOutdated ? globalVersionInstance : undefined,
                        },
                      });
                    },
                    position: 'row',
                  };
                },
                {
                  icon: () => <MenuIcon color={'primary'} />,
                  tooltip: 'Действия',
                  isFreeAction: false,
                  onClick: (event, row) => {},
                  position: 'row',
                },
                {
                  icon: () => <UpdateIcon />,
                  tooltip: 'Обновление выбранных экземпляров',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({ selectedRows: rowData, confirmFewUpdate: true });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <PlayArrow />,
                  tooltip: 'Старт выбранных экземпляров',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({ selectedRows: rowData, confirmFewStart: true });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <Stop />,
                  tooltip: 'Остановить выбранные экземпляры',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({ selectedRows: rowData, confirmFewStop: true });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <Delete />,
                  tooltip: 'Удалить выбранные экземпляры',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({ selectedRows: rowData, confirmFewDelete: true });
                  },
                  position: 'toolbarOnSelect',
                },
              ]}
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
                Action: (props) => {
                  if (props.action.tooltip === 'Действия') {
                    return (
                      <div>
                        <ButtonMenu {...props} isAdmin={this.props.user.admin} onClose={this.onCloseMenu} displayError={this.props.displayError} />
                      </div>
                    );
                  } else if (
                    props.action.tooltip === 'Старт выбранных экземпляров' ||
                    props.action.tooltip === 'Остановить выбранные экземпляры' ||
                    props.action.tooltip === 'Удалить выбранные экземпляры' ||
                    props.action.tooltip === 'Обновление выбранных экземпляров'
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
            />
          </ThemeProvider>
        </Paper>

        {this.state.waitForTaskDeletion && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleDeletion ? 'Удаление экземпляра' : 'Удаление нескольких экземпляров'}
            open={this.state.waitForTaskDeletion}
            onClose={() => {
              this.setState({ waitForTaskDeletion: false, errorMessage: '', selectedRow: undefined });
              this.clearSelection();
            }}
            complete={this.state.completeTaskDeletion}
            success={this.state.successTaskDeletion}
            successMessage={this.state.isSingleDeletion ? 'Экземпляр успешно удален' : 'Экземпляры успешно удалены'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.waitForTaskStart && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleStart ? 'Старт экземпляра' : 'Старт нескольких экземпляров'}
            open={this.state.waitForTaskStart}
            onClose={() => {
              this.setState({ waitForTaskStart: false, errorMessage: '', selectedRow: undefined });
              this.clearSelection();
            }}
            complete={this.state.completeTaskStart}
            success={this.state.successTaskStart}
            successMessage={this.state.isSingleStart ? 'Экземпляр успешно стартовал' : 'Экземпляры успешно стартовали'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        <WaitingDialog
          customFormat={true}
          title={'Сброс экземпляра'}
          open={this.state.waitForTaskReset}
          onClose={() => {
            this.setState({ waitForTaskReset: false, errorMessage: '' });
          }}
          complete={this.state.completeTaskReset}
          success={this.state.successTaskReset}
          successMessage={'Экземпляр успешно сброшен'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />

        {this.state.waitForInstanceUpdate && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleUpdate ? 'Обновление экземпляра' : 'Обновление экземпляров'}
            open={this.state.waitForInstanceUpdate}
            onClose={() => {
              this.setState({ waitForInstanceUpdate: false, errorMessage: '' });
              if (this.state.successInstanceUpdate) {
                this.props.refetch();
              }
            }}
            complete={this.state.completeInstanceUpdate}
            success={this.state.successInstanceUpdate}
            successMessage={this.state.isSingleUpdate ? 'Экземпляр успешно обновлен' : 'Экземпляры успешно обновлены'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        {this.state.waitForTaskStop && (
          <WaitingDialog
            customFormat={true}
            title={this.state.isSingleStop ? 'Остановка экземпляра' : 'Остановка нескольких экземпляров'}
            open={this.state.waitForTaskStop}
            onClose={() => {
              this.setState({ waitForTaskStop: false, errorMessage: '', selectedRows: undefined });
              this.clearSelection();
            }}
            complete={this.state.completeTaskStop}
            success={this.state.successTaskStop}
            successMessage={this.state.isSingleStop ? 'Экземпляр успешно остановлен' : 'Экземпляры успешно остановлены'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailMessage}
          />
        )}

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить экземпляр ' +
            this.state.deleteIndex?.projectKey +
            '/' +
            this.state.deleteIndex?.name +
            '(' +
            this.state.deleteIndex?.zoneId +
            ')' +
            '?' +
            ' Его будет невозможно восстановить.'
          }
          open={this.state.confirmDelete}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDeleteClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите запустить экземпляр ' +
            this.state.startIndex?.projectKey +
            '/' +
            this.state.startIndex?.name +
            '(' +
            this.state.startIndex?.zoneId +
            ')?'
          }
          open={this.state.confirmStart}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmStartClose}
        />

        <ConfirmDialog
          warningText={this.createConfirmTitleForConfigUpdate()}
          open={this.state.confirmDialogUpdateInstanceOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmUpdateClose}
          needCustomButton={this.props.isAdmin}
          customButtonText={'Просмотреть спецификацию'}
          buttonEffect={() => {
            this.setState({ infoOpen: true });
          }}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите остановить экземпляр ' +
            this.state.stopIndex?.projectKey +
            '/' +
            this.state.stopIndex?.name +
            '(' +
            this.state.stopIndex?.zoneId +
            ')?'
          }
          open={this.state.confirmStop}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmStopClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите сбросить экземпляр ' +
            this.state.resetIndex?.projectKey +
            '/' +
            this.state.resetIndex?.name +
            +'(' +
            this.state.resetIndex?.zoneId +
            ')?'
          }
          open={this.state.confirmReset}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmResetClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите обновить экземпляры ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(' + row.zone + ')').join(', ') +
            '?'
          }
          open={this.state.confirmFewUpdate}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewUpdateClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить экземпляры ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(' + row.zone + ')').join(', ') +
            '? Их будет невозможно восстановить.'
          }
          open={this.state.confirmFewDelete}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewDeleteClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите запустить экземпляры ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(' + row.zone + ')').join(', ') +
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
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(' + row.zone + ')').join(', ') +
            '?'
          }
          open={this.state.confirmFewStop}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewStopClose}
        />

        {this.state.overrideQuotaDialogOpen && (
          <InstanceQuotaOverride
            open={this.state.overrideQuotaDialogOpen}
            handleClose={() => this.setState({ overrideQuotaDialogOpen: false })}
            supervisorId={this.state.overrideQuotaIndex?.id}
            supervisorName={this.state.overrideQuotaIndex?.name}
            projectName={this.state.overrideQuotaIndex?.projectKey}
            zone={this.state.overrideQuotaIndex?.zoneId || ''}
            instanceQuotaUsage={this.state.overrideQuotaIndex?.instanceQuotaUsage}
            configQuotaUsage={this.state.overrideQuotaIndex?.configQuotaUsage}
            onUpdate={() => {
              if (this.state.overrideQuotaIndex?.id && this.props.refreshSupervisor) {
                this.props.refreshSupervisor(this.state.overrideQuotaIndex.id);
              }
            }}
          />
        )}

        {this.state.infoOpen && (
          <SpecInfoWithDiffDialogContainer
            zoneId={this.state.updateIndex?.zoneId}
            supervisorId={this.state.updateIndex?.id}
            instanceName={`${this.state.updateIndex?.projectKey}/${this.state.updateIndex?.name}(${this.state.updateIndex?.zoneId})`}
            close={() => {
              this.setState({
                infoOpen: false,
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

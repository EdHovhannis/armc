import MaterialTable, { MTableAction, MTableBodyRow, MTableGroupbar, MTableGroupRow, MTableHeader } from '@material-table/core';
import { Chip, ThemeProvider, createTheme, IconButton, Avatar, Tooltip, Typography, Link } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { green } from '@material-ui/core/colors';
import { Delete, PlayArrow, Stop } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import SpeedIcon from '@material-ui/icons/Speed';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import { computeSizeDisplayValue } from '@src/utils/sizeUnits';
import { computeSpeedDisplayValue } from '@src/utils/speedUnits';
import { computeTimeDisplayValue } from '@src/utils/timeUnits';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router';

import AddFulltextLabelContainer from '../../containers/index/AddFulltextLabelContainer';
import ConfigService from '../../services/ConfigService';
import ProjectService from '../../services/ProjectService';
import RoleService from '../../services/RoleService';
import { ApplicationState } from '../../store/Store';
import { User } from '../../store/auth/Types';
import { AnalyticConstraint, ArchiveConstraint, FulltextConstraint } from '../../store/constraint/Types';
import { getEnableFeatureSettingLimits } from '../../store/featureSettings/Reducer';
import { FulltextTask } from '../../store/index/Types';
import { OverdraftConfig } from '../../store/overdraft/Types';
import { Pipeline, PipelineShort, PipelineStatus } from '../../store/pipeline/Types';
import { Resource, Role, Unit } from '../../store/role/Types';
import { IndexUtils, IndexOverviewDataNew, DetailPanelData, IndexOverviewDataTableConfig } from '../../utils/IndexUtils';
import { tableIcons, Utils, speedIcon } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { BACKUPS_PAGE } from '../backups/utils';
import { CellText } from '../shared';
import { LIMIT_FEATURE_SETTING_COLUMNS } from '../shared/constants';
import { FilterMenuItem } from '../utils/FilterMenu';
import { Loader } from '../utils/Loader';

import { FullTextOffsetDialog } from './FullTextOffsetDialog';
import { IndexInstanceQuotasDialog } from './IndexInstanceQuotasDialog';
import OverdraftDialog from './OverdraftDialog';

enum MENU_TYPE {
  delete,
  start,
  stop,
  overdraft,
  rotation,
  offset,
  redefine,
}

export interface IndexOverviewInstancesTableProps {
  data: IndexOverviewDataNew[];
  user: User;
  isAdmin: boolean;
  isLoading: boolean;
  filter?: FilterMenuItem[];
  fulltextTasks: FulltextTask[];
  fulltextOverdraftConfig?: OverdraftConfig;
  displayError: (error) => void;
  listFulltextTasks: (labels?: string[], okCallback?, errorCallback?) => void;
  getAllFulltextLabelsList: (okCallback?, errorCallback?) => void;
  refetchPipelines: () => void;
  getPipelineInfo: (
    projectShortName: string,
    name: string,
    okCallback?: (pipeline: Pipeline) => void,
    errorCallback?: (errorMsg: string) => void,
  ) => void;
  deletePipelineById: (projectShortName: string, name: string, zoneId?: string, okCallback?, errorCallback?) => void;
  refreshInstanceFulltext: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  resumeTask: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  suspendTask: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  forceRotate: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  displayInfo: (info) => void;
  changeInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  onSearch: (searchText: string) => void;
  searchText?: string;
  isLimitFeatureSettingEnabled: boolean;
}

interface IndexOverviewInstancesState {
  labelDialogOpen: boolean;
  labelName?: string;
  labelProjectName?: string;
  canEditLabel: boolean;
  labelRefetch: boolean;
  overviewIsOpen: boolean;
  pipeline?: Pipeline;

  pipelines: PipelineShort[];
  statuses: Map<string, PipelineStatus>;
  filter?: FilterMenuItem[];
  statisticIsOpen: boolean;
  statisticIsLoading: boolean;
  pipelineName?: string;
  shortNameProject?: string;
  zoneId?: string;
  deleteIndexName?: string;
  deleteZoneId?: string;
  deleteProjectName?: string;
  meta?: any;
  confirmDialogDeleteOpen: boolean;
  confirmAllDeleteDialogOpen: boolean;
  confirmDialogStartOpen: boolean;
  confirmDialogStopOpen: boolean;
  blockedObject?: PipelineShort;
  createIndexTaskModalInfoOpen?: boolean;
  selectedRows?: any[];
  errorMessage: string;
  detailMessage?: string;
  isSingleDeletion: boolean;
  isStart: boolean;
  waitForTaskDeletion?: boolean;
  successTaskDeletion?: boolean;
  taskDeletionComplete?: boolean;
  waitForTaskStart?: boolean;
  successTaskStart?: boolean;
  completeTaskStart?: boolean;
  waitForTaskStop?: boolean;
  successTaskStop?: boolean;
  completeTaskStop?: boolean;
  constraintDialogOpen: boolean;
  currentConstraint?: ArchiveConstraint | AnalyticConstraint | FulltextConstraint;
  constraintTitle?: any;
  constraintEditTask?: any;
  isBlockUserDialogOpen: boolean;
  blockIndexProjectName?: string;
  blockIndexName?: string;
  blockTitle?: any;
  confirmStart: boolean;
  startIndexName?: string;
  startZoneId?: string;
  startProjectShortName?: string;
  confirmStop: boolean;
  stopIndexName?: string;
  stopZoneId?: string;
  stopProjectShortName?: string;
  confirmRotate: boolean;
  rotateIndexName?: string;
  rotateZoneId?: string;
  rotateProjectShortName?: string;
  roleEditOpen: boolean;
  roleIndexName?: string;
  roleProjectShortName?: string;
  roleIndexId?: number;
  confirmRefreshInstance: boolean;
  refreshInstanceVersion?: string;
  refreshConfigVersion?: string;
  refreshName?: string;
  refreshProject?: string;
  refreshZoneId?: string;
  confirmAddInstance: boolean;
  addInstanceIndexName?: string;
  addInstanceProjectShortName?: string;
  confirmOverdraft: boolean;
  overdraftProject?: string;
  overdraftName?: string;
  overdraftZoneId?: string;
  overdraftValue?: number;
  overdraftMaxAvailable?: number;
  confirmDialogMultiResetOverdraft: boolean;
  waitForMultiResetOverdraft: boolean;
  completeMultiResetOverdraft: boolean;
  successMultiResetOverdraft: boolean;
  isOffsetDialogOpen: boolean;
  rowData?: IndexOverviewDataNew;
  redefineQuotasDialogOpen: boolean;
}

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

const themeHeader = createTheme({
  palette: {
    background: {
      paper: 'rgb(76, 175, 80, 0.25)',
    },
  },
});

const ButtonMenu = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const canRun = (props.data.flowActions.includes('EDIT') && props.data.indexActions.includes('EDIT')) || props.isAdmin;
  const { isLimitFeatureSettingEnabled } = props;
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
        {canRun && (
          <MenuItem
            disabled={props.data.status === 'RUNNING'}
            onClick={(e) => {
              props.onClose(MENU_TYPE.start, props.data.name, props.data.project, null, null, props.data.zoneId);
              handleClose();
            }}
          >
            Старт
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            disabled={props.data.status === 'STOPPED'}
            onClick={(e) => {
              props.onClose(MENU_TYPE.stop, props.data.name, props.data.project, null, null, props.data.zoneId);
              handleClose();
            }}
          >
            Стоп
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.offset, props.data.name, props.data.project, null, null, null, null, null, props.data);
              handleClose();
            }}
          >
            Установить offset
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            disabled={props.data.countInstance >= props.fulltextOverdraftConfig?.maxOverdraftedTasks || props.data.maxAvailableOverdraft == 0}
            onClick={(e) => {
              props.onClose(
                MENU_TYPE.overdraft,
                props.data.name,
                props.data.project,
                null,
                null,
                props.data.zoneId,
                props.data.overdraftPercent,
                props.data.maxAvailableOverdraft,
              );
              handleClose();
            }}
          >
            Овердрафт скорости
          </MenuItem>
        )}
        {props.isAdmin && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.rotation, props.data.name, props.data.project, null, null, props.data.zoneId);
              handleClose();
            }}
          >
            Запуск ротации
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.delete, props.data.name, props.data.project, null, null, props.data.zoneId);
              handleClose();
            }}
          >
            <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
          </MenuItem>
        )}
        {canRun && isLimitFeatureSettingEnabled && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.redefine, props.data.name, props.data.project, null, null, null, null, null, props.data);
              handleClose();
            }}
          >
            Переопределить квоты экземпляра
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export class IndexOverviewInstancesTable extends React.Component<IndexOverviewInstancesTableProps, IndexOverviewInstancesState> {
  constructor(props) {
    super(props);
    this.state = {
      labelDialogOpen: false,
      canEditLabel: false,
      labelRefetch: false,
      overviewIsOpen: false,
      pipelines: [],
      statisticIsLoading: false,
      statisticIsOpen: false,
      confirmDialogDeleteOpen: false,
      confirmAllDeleteDialogOpen: false,
      confirmDialogStartOpen: false,
      confirmDialogStopOpen: false,
      isSingleDeletion: true,
      isBlockUserDialogOpen: false,
      constraintDialogOpen: false,
      createIndexTaskModalInfoOpen: false,
      isStart: true,
      errorMessage: '',
      statuses: new Map<string, PipelineStatus>(),
      filter: this.props.filter,
      confirmStart: false,
      confirmStop: false,
      roleEditOpen: false,
      confirmRefreshInstance: false,
      confirmAddInstance: false,
      confirmOverdraft: false,
      confirmRotate: false,
      confirmDialogMultiResetOverdraft: false,
      waitForMultiResetOverdraft: false,
      completeMultiResetOverdraft: false,
      successMultiResetOverdraft: false,
      isOffsetDialogOpen: false,
      redefineQuotasDialogOpen: false,
    };
  }

  handleConfirmDialogDeleteOpen = () => {
    this.setState({ confirmDialogDeleteOpen: true });
  };

  handleConfirmDialogDeleteClose = (value) => {
    this.setState({ confirmDialogDeleteOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: true,
        waitForTaskDeletion: true,
        taskDeletionComplete: false,
      });
      this.props.deletePipelineById(
        this.state.deleteProjectName,
        this.state.deleteIndexName,
        this.state.deleteZoneId,
        () => {
          if (this.state.deleteZoneId) {
            this.setState({
              taskDeletionComplete: true,
              successTaskDeletion: true,
              deleteProjectName: undefined,
              deleteIndexName: undefined,
              deleteZoneId: undefined,
            });
            this.props.getAllFulltextLabelsList();
            this.props.refetchPipelines();
          } else {
            this.setState({
              taskDeletionComplete: true,
              successTaskDeletion: true,
              pipelines: this.state.pipelines.filter(
                (pipeline) => !(pipeline.name === this.state.deleteIndexName && pipeline.projectShortName === this.state.deleteProjectName),
              ),
              deleteProjectName: undefined,
              deleteIndexName: undefined,
            });
            this.props.refetchPipelines();
          }
        },
        (errorMsg: { message: string; details?: string }) => {
          this.setState({
            errorMessage: 'Произошла ошибка при удалении задачи индексации ' + errorMsg.message,
            detailMessage: errorMsg.details,
            taskDeletionComplete: true,
            successTaskDeletion: false,
            deleteProjectName: undefined,
            deleteIndexName: undefined,
            deleteZoneId: undefined,
          });
        },
      );
    }
  };

  handleConfirmAllDeleteDialogClose = (value) => {
    this.setState({ confirmAllDeleteDialogOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: false,
        waitForTaskDeletion: true,
        taskDeletionComplete: false,
        successTaskDeletion: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        IndexUtils.recursiveFunction(
          this.state.selectedRows,
          result,
          'Произошла ошибка при удалении индекса(-ов) ',
          this.props.deletePipelineById,
          (endData) => {
            if (endData.success) {
              this.setState({
                taskDeletionComplete: true,
                successTaskDeletion: true,
              });
            } else {
              this.setState({
                taskDeletionComplete: true,
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
  };

  handleConfirmDialogRefreshOpen = (data: any) => {
    this.setState({
      confirmRefreshInstance: true,
      refreshInstanceVersion: data.instanceVersion,
      refreshConfigVersion: data.configVersion,
      refreshName: data.name,
      refreshProject: data.project,
      refreshZoneId: data.zoneId,
    });
  };

  handleConfirmRefreshInstanceClose = (value) => {
    this.setState({ confirmRefreshInstance: false });
    if (value === 'Ok' && this.state.refreshProject && this.state.refreshName && this.state.refreshZoneId) {
      this.props.refreshInstanceFulltext(
        this.state.refreshProject,
        this.state.refreshName,
        this.state.refreshZoneId,
        () => {
          this.props.refetchPipelines();
        },
        (errorMsg: { message: string; details?: string }) => {
          this.props.displayError(errorMsg.message);
        },
      );
    }
  };

  handleConfirmStartClose = (value) => {
    this.setState({ confirmStart: false });
    if (value === 'Ok') {
      this.props.displayInfo('Индекс запускается, это займёт некоторое время ( ~15 сек).');
      this.props.resumeTask(
        this.state.startProjectShortName,
        this.state.startIndexName,
        this.state.startZoneId,
        () => {
          this.props.refetchPipelines();
        },
        (errorMsg: { message: string; details?: string }) => {
          this.props.displayError(errorMsg.message);
        },
      );
    }
  };

  handleConfirmStopClose = (value) => {
    this.setState({ confirmStop: false });
    if (value === 'Ok') {
      this.props.suspendTask(
        this.state.stopProjectShortName,
        this.state.stopIndexName,
        this.state.stopZoneId,
        () => {
          this.props.refetchPipelines();
        },
        (errorMsg: { message: string; details?: string }) => {
          this.props.displayError(errorMsg.message);
        },
      );
    }
  };

  handleConfirmRotateClose = (value) => {
    this.setState({ confirmRotate: false });
    if (value === 'Ok' && this.state.rotateProjectShortName && this.state.rotateIndexName && this.state.rotateZoneId) {
      this.props.displayInfo('Индекс запускается, это займёт некоторое время ( ~15 сек).');
      this.props.forceRotate(
        this.state.rotateProjectShortName,
        this.state.rotateIndexName,
        this.state.rotateZoneId,
        () => {
          this.props.refetchPipelines();
        },
        (errorMsg: { message: string; details?: string }) => {
          this.props.displayError(errorMsg.message);
        },
      );
    }
  };

  handleConfirmStartDialogClose = (value) => {
    this.setState({ confirmDialogStartOpen: false });
    if (value === 'Ok') {
      this.setState({
        isStart: true,
        waitForTaskStart: true,
        completeTaskStart: false,
        successTaskStart: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        IndexUtils.recursiveFunction(
          this.state.selectedRows,
          result,
          'Произошла ошибка при старте индекса(-ов) ',
          this.props.resumeTask,
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
  };

  dialogMultiResetOverdraftClose = (value) => {
    this.setState({ confirmDialogMultiResetOverdraft: false });
    if (value === 'Ok') {
      this.setState({
        waitForMultiResetOverdraft: true,
        completeMultiResetOverdraft: false,
        successMultiResetOverdraft: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        IndexUtils.recursiveFunction(
          this.state.selectedRows,
          result,
          'Произошла ошибка при сбросе овердрафта ',
          this.props.resetInstanceOverdraft,
          (endData) => {
            if (endData.success) {
              this.setState({
                completeMultiResetOverdraft: true,
                successMultiResetOverdraft: true,
              });
            } else {
              this.setState({
                completeMultiResetOverdraft: true,
                successMultiResetOverdraft: false,
                errorMessage: endData.error,
                detailMessage: endData.details,
              });
            }
          },
        );
        this.setState({ selectedRows: [] });
      }
    }
  };

  handleConfirmStopDialogClose = (value) => {
    this.setState({ confirmDialogStopOpen: false });
    if (value === 'Ok') {
      this.setState({
        isStart: false,
        waitForTaskStop: true,
        completeTaskStop: false,
        successTaskStop: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        IndexUtils.recursiveFunction(
          this.state.selectedRows,
          result,
          'Произошла ошибка при остановке индекса(-ов) ',
          this.props.suspendTask,
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
  };

  onCloseMenu = (
    type: MENU_TYPE,
    name: string,
    projectShortName: string,
    id?: number,
    canEditLabel?: boolean,
    zoneId?: string,
    overdraftPercent?: number,
    maxAvailableOverdraft?: number,
    rowData?: IndexOverviewDataNew,
  ) => {
    switch (type) {
      case MENU_TYPE.overdraft:
        this.setState({
          confirmOverdraft: true,
          overdraftProject: projectShortName,
          overdraftName: name,
          overdraftZoneId: zoneId,
          overdraftValue: overdraftPercent,
          overdraftMaxAvailable: maxAvailableOverdraft,
        });
        break;
      case MENU_TYPE.start:
        this.setState({
          confirmStart: true,
          startIndexName: name,
          startProjectShortName: projectShortName,
          startZoneId: zoneId,
        });
        break;
      case MENU_TYPE.stop:
        this.setState({
          confirmStop: true,
          stopIndexName: name,
          stopProjectShortName: projectShortName,
          stopZoneId: zoneId,
        });
        break;
      case MENU_TYPE.rotation:
        this.setState({
          confirmRotate: true,
          rotateIndexName: name,
          rotateProjectShortName: projectShortName,
          rotateZoneId: zoneId,
        });
        break;
      case MENU_TYPE.offset:
        this.setState({
          isOffsetDialogOpen: true,
          rowData: rowData,
        });
        break;
      case MENU_TYPE.delete:
        this.setState({
          deleteIndexName: name,
          deleteProjectName: projectShortName,
          deleteZoneId: zoneId,
        });
        this.handleConfirmDialogDeleteOpen();
        break;
      case MENU_TYPE.redefine:
        this.setState({
          redefineQuotasDialogOpen: true,
          rowData: rowData,
        });
    }
  };

  labelsRerender = (data) => {
    if (data.labels) {
      const chips: Array<any> = [];
      data.labels.map((label, ind) => {
        if (ind < 1) {
          chips.push(
            <Chip
              id={'label' + ind}
              label={label}
              onClick={() => {
                ProjectService.fetchProjectByName(
                  data.project,
                  () => {
                    this.setState({
                      labelDialogOpen: true,
                      labelName: data.name,
                      labelProjectName: data.project,
                      canEditLabel: data.indexActions.includes('EDIT') || this.props.isAdmin,
                    });
                  },
                  (error) => {
                    this.props.displayError(error);
                  },
                );
              }}
              style={{
                backgroundColor: green[50],
                color: green[800],
                marginRight: 4,
                maxWidth: '100%',
              }}
              size={'small'}
            />,
          );
        } else if (ind === 1) {
          chips.push(
            <Chip
              id={'label' + ind}
              label={'...'}
              onClick={() => {
                ProjectService.fetchProjectByName(
                  data.project,
                  () => {
                    this.setState({
                      labelDialogOpen: true,
                      labelName: data.name,
                      labelProjectName: data.project,
                      canEditLabel: data.indexActions.includes('EDIT') || this.props.isAdmin,
                    });
                  },
                  (error) => {
                    this.props.displayError(error);
                  },
                );
              }}
              style={{
                backgroundColor: 'white',
                color: green[800],
                marginRight: 4,
                maxWidth: '100%',
              }}
              size={'small'}
            />,
          );
        }
      });
      return <React.Fragment>{chips}</React.Fragment>;
    } else return <React.Fragment />;
  };

  sourcesRender = (data) => {
    const topics = Array.isArray(data.topic) ? data.topic : data.topic.split(',');
    const topic = topics[0];
    const otherTopics = topics.slice(1);
    const lengthOtherTopics = otherTopics.length;

    return lengthOtherTopics > 1 ? (
      <>
        {topic}
        <Tooltip title={IndexUtils.sourcesTooltip(otherTopics)} placement="top">
          <Typography
            color="primary"
            style={{ display: 'inline-block', marginLeft: 8, cursor: 'pointer' }}
            onClick={() => this.indexInfoHandler(data)}
          >
            и еще {lengthOtherTopics}
          </Typography>
        </Tooltip>
      </>
    ) : (
      topic
    );
  };
  private columnsCache: any[] | null = null;

  private getColumns() {
    const { isLimitFeatureSettingEnabled } = this.props;

    if (!this.columnsCache) {
      const COLUMNS = [
        {
          title: 'Название',
          field: 'name',
          cellStyle: {
            paddingTop: '10px',
          },
          render: (rowData: IndexOverviewDataNew) => <CellText title={rowData.name} />,
          grouping: false,
        },
        {
          field: 'id',
          hidden: true,
        },
        {
          field: 'instanceId',
          hidden: true,
        },
        {
          title: 'Ключ проекта',
          field: 'project',
          render: (rowData: IndexOverviewDataNew) => <CellText title={rowData.project} />,
          grouping: true,
        },
        {
          title: 'Источник данных',
          field: 'topic',
          render: this.sourcesRender,
        },
        {
          title: 'Зона',
          field: 'zoneId',
          defaultGroupOrder: 0,
        },
        {
          title: 'Статус',
          field: 'status',
          grouping: false,
        },
        {
          title: 'overdraftPercent',
          field: 'overdraftPercent',
          hidden: true,
        },
        {
          title: 'Метки',
          field: 'labels',
          grouping: false,
          render: this.labelsRerender,
        },
        {
          title: 'Макс. скорость записи',
          field: 'maxDataRateBytesPerSec',
          grouping: false,
          width: 200,
          minWidth: 200,
          render: (rowData: IndexOverviewDataNew) => (
            <CellText title={rowData.maxDataRateBytesPerSec ? `${rowData.maxDataRateBytesPerSec} B/s` : ''} />
          ),
        },
        {
          title: 'Макс. размер индекса',
          field: 'maxSizeBytes',
          grouping: false,
          width: 200,
          minWidth: 200,
          render: (rowData: IndexOverviewDataNew) => <CellText title={rowData.maxSizeBytes ? `${rowData.maxSizeBytes} B` : ''} />,
        },
        {
          title: 'Макс. время хранения данных',
          field: 'maxStorageTimeSec',
          grouping: false,
          width: 200,
          minWidth: 200,
          render: (rowData: IndexOverviewDataNew) => <CellText title={rowData.maxStorageTimeSec ? `${rowData.maxStorageTimeSec} сек` : ''} />,
        },
        {
          title: 'Бэкапы',
          field: 'backupCount',
          render: (data: { name: any; project: any; backupCount: any }) => {
            return (
              <RouterLink to={`${BACKUPS_PAGE.list}?indexFilter=${data.name}&projectFilter=${data.project}`} component={Link}>
                {data.backupCount}
              </RouterLink>
            );
          },
        },
      ];
      this.columnsCache = isLimitFeatureSettingEnabled ? COLUMNS : COLUMNS.filter((c) => !LIMIT_FEATURE_SETTING_COLUMNS.includes(c.field));
    }

    return this.columnsCache;
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    const { isLimitFeatureSettingEnabled } = this.props;

    const columns = this.getColumns();
    return (
      <React.Fragment>
        <Paper style={{ width: '100%' }}>
          <ThemeProvider theme={theme}>
            {/*@ts-ignore*/}
            <MaterialTable
              icons={tableIcons}
              columns={Utils.getColumns(columns, [])}
              localization={{
                toolbar: {
                  searchTooltip: 'Поиск',
                  searchPlaceholder: 'Поиск',
                },
                grouping: {
                  placeholder: 'Перетащите сюда заголовок столбца, по которому хотите сгруппировать данные',
                  groupedBy: 'Сгруппировано по ',
                },
                body: {
                  emptyDataSourceMessage: 'Список индексов пуст',
                },
                header: {
                  actions: '',
                },
              }}
              data={this.props.data.filter((instance) => instance.zoneId)}
              title="Список полнотекстовых индексов"
              options={{
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                emptyRowsWhenPaging: false,
                padding: 'dense',
                search: true,
                searchText: this.props?.searchText,
                paging: true,
                showTitle: true,
                header: true,
                actionsColumnIndex: -1,
                grouping: true,
              }}
              actions={[
                (rowData: DetailPanelData) => ({
                  icon: () => {
                    return !rowData.matchingVersions &&
                      (!(rowData.overdraftPercent === 0) ||
                        !(rowData.maxAvailableOverdraft > 0) ||
                        !(
                          rowData.maxAvailableOverdraft &&
                          this.props.fulltextOverdraftConfig &&
                          this.props.fulltextOverdraftConfig.maxOverdraftPercent === rowData.maxAvailableOverdraft
                        )) ? (
                      <SyncProblemIcon style={{ color: '#ffa532' }} />
                    ) : (
                      <div style={{ marginLeft: 24 }} />
                    );
                  },
                  tooltip:
                    !rowData.matchingVersions &&
                    (!(rowData.overdraftPercent === 0) ||
                      !(rowData.maxAvailableOverdraft > 0) ||
                      !(
                        rowData.maxAvailableOverdraft &&
                        this.props.fulltextOverdraftConfig &&
                        this.props.fulltextOverdraftConfig.maxOverdraftPercent === rowData.maxAvailableOverdraft
                      ))
                      ? `Версия конфигурации: ${rowData.configVersion}
                 Версия экземпляра: ${rowData.instanceVersion}`
                      : '',
                  disabled: !(
                    !rowData.matchingVersions &&
                    (!(rowData.overdraftPercent === 0) ||
                      !(rowData.maxAvailableOverdraft > 0) ||
                      !(
                        rowData.maxAvailableOverdraft &&
                        this.props.fulltextOverdraftConfig &&
                        this.props.fulltextOverdraftConfig.maxOverdraftPercent === rowData.maxAvailableOverdraft
                      ))
                  ),
                  onClick: (event, rowData: DetailPanelData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.handleConfirmDialogRefreshOpen({
                      instanceVersion: rowData.instanceVersion,
                      configVersion: rowData.configVersion,
                      name: rowData.name,
                      project: rowData.project,
                      zoneId: rowData.zoneId,
                    });
                  },
                  position: 'row',
                }),
                (rowData: DetailPanelData) => ({
                  icon: () => {
                    if (rowData.overdraftPercent) {
                      return <SpeedIcon style={{ color: '#4CAF50' }} />;
                    } else if (rowData.maxAvailableOverdraft == 0) {
                      return <SpeedIcon style={{ color: '#FF0000' }} />;
                    } else if (
                      rowData.maxAvailableOverdraft &&
                      this.props.fulltextOverdraftConfig &&
                      this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft &&
                      rowData.maxAvailableOverdraft > 0
                    ) {
                      return <SpeedIcon style={{ color: '#FFA500' }} />;
                    } else if (!rowData.matchingVersions) {
                      return <SyncProblemIcon style={{ color: '#ffa532' }} />;
                    } else {
                      return <div style={{ marginLeft: 24 }} />;
                    }
                  },
                  tooltip:
                    rowData.overdraftPercent > 0
                      ? `Скорость обработки увеличена на ${rowData.overdraftPercent}%`
                      : rowData.maxAvailableOverdraft == 0
                        ? 'Овердрафт скорости невозможен. Измените конфигурацию экземпляра.'
                        : rowData.maxAvailableOverdraft &&
                            this.props.fulltextOverdraftConfig &&
                            this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft &&
                            rowData.maxAvailableOverdraft > 0
                          ? `Овердрафт скорости ограничен. Максимальный процент увеличения в настройках: ${this.props.fulltextOverdraftConfig.maxOverdraftPercent}%`
                          : !rowData.matchingVersions
                            ? `Версия конфигурации: ${rowData.configVersion}
                 Версия экземпляра: ${rowData.instanceVersion}`
                            : '',
                  disabled:
                    rowData.overdraftPercent > 0
                      ? false
                      : rowData.maxAvailableOverdraft === 0
                        ? true
                        : rowData.maxAvailableOverdraft &&
                            this.props.fulltextOverdraftConfig &&
                            this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft
                          ? false
                          : rowData.matchingVersions,
                  onClick: (event, rowData: DetailPanelData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (rowData.maxAvailableOverdraft == 0) {
                      this.props.displayError('Овердрафт скорости невозможен. Измените конфигурацию экземпляра.');
                    } else if (
                      rowData.maxAvailableOverdraft &&
                      this.props.fulltextOverdraftConfig &&
                      this.props.fulltextOverdraftConfig.maxOverdraftPercent > rowData.maxAvailableOverdraft &&
                      rowData.maxAvailableOverdraft > 0
                    ) {
                      this.onCloseMenu(
                        MENU_TYPE.overdraft,
                        rowData.name,
                        rowData.project,
                        null,
                        null,
                        rowData.zoneId,
                        rowData.overdraftPercent,
                        rowData.maxAvailableOverdraft,
                      );
                    } else if (rowData.overdraftPercent > 0) {
                      this.onCloseMenu(
                        MENU_TYPE.overdraft,
                        rowData.name,
                        rowData.project,
                        null,
                        null,
                        rowData.zoneId,
                        rowData.overdraftPercent,
                        rowData.maxAvailableOverdraft,
                      );
                    } else if (!rowData.matchingVersions) {
                      this.handleConfirmDialogRefreshOpen({
                        instanceVersion: rowData.instanceVersion,
                        configVersion: rowData.configVersion,
                        name: rowData.name,
                        project: rowData.project,
                        zoneId: rowData.zoneId,
                      });
                    }
                  },
                  position: 'row',
                }),
                {
                  icon: () => <MenuIcon color={'primary'} />,
                  tooltip: 'Действия',
                  isFreeAction: false,
                  onClick: () => {},
                  position: 'row',
                },
                {
                  icon: () => <PlayArrow color={'primary'} />,
                  tooltip: 'Старт выбранных экземпляров',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmDialogStartOpen: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <Stop color={'primary'} />,
                  tooltip: 'Остановить выбранные экземпляры',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmDialogStopOpen: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <Avatar src={speedIcon} style={{ width: 24, height: 24 }} alt="Сбросить овердрафт" />,
                  tooltip: 'Сбросить овердрафт',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmDialogMultiResetOverdraft: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
                {
                  icon: () => <Delete color={'primary'} />,
                  tooltip: 'Удалить выбранные строки',
                  onClick: (event, rowData) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setState({
                      selectedRows: rowData,
                      confirmAllDeleteDialogOpen: true,
                    });
                  },
                  position: 'toolbarOnSelect',
                },
              ]}
              components={{
                Groupbar: (props) => {
                  return <MTableGroupbar {...props} />;
                },
                Row: (props) => {
                  return (
                    <MTableBodyRow
                      {...{
                        ...props,
                        options: {
                          ...props.options,
                          selection: true,
                        },
                      }}
                    />
                  );
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
                Action: (props) => {
                  if (props.action.tooltip === 'Действия') {
                    return (
                      <div>
                        <ButtonMenu
                          {...props}
                          user={this.props.user}
                          isAdmin={this.props.isAdmin}
                          onClose={this.onCloseMenu}
                          displayError={this.props.displayError}
                          fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
                          isLimitFeatureSettingEnabled={isLimitFeatureSettingEnabled}
                        />
                      </div>
                    );
                  } else if (props.action.tooltip === 'Сбросить овердрафт') {
                    if (this.props.isAdmin) {
                      return <MTableAction {...props} />;
                    } else {
                      return <div />;
                    }
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
              onSearchChange={this.props.onSearch}
            />
          </ThemeProvider>
        </Paper>
        {this.state.labelDialogOpen && (
          <AddFulltextLabelContainer
            close={() => {
              this.setState({
                labelDialogOpen: false,
                labelProjectName: undefined,
                labelName: undefined,
              });
              if (this.state.labelRefetch) {
                const labels = Utils.createLabelsFilter(this.props.filter ? this.props.filter : []);
                if (labels.length > 0) {
                  this.props.listFulltextTasks(labels);
                } else {
                  this.props.refetchPipelines();
                }
                this.props.getAllFulltextLabelsList();
                this.setState({ labelRefetch: false });
              }
            }}
            refetchPipelines={() => {
              this.setState({ labelRefetch: true });
            }}
            canEdit={this.state.canEditLabel}
            // @ts-ignore
            projectShortName={this.state.labelProjectName}
            // @ts-ignore
            name={this.state.labelName}
          />
        )}
        {this.state.isOffsetDialogOpen && (
          <FullTextOffsetDialog handleClose={() => this.setState({ isOffsetDialogOpen: false })} rowData={this.state.rowData} />
        )}
        <IndexInstanceQuotasDialog
          open={this.state.redefineQuotasDialogOpen}
          handleClose={() => this.setState({ redefineQuotasDialogOpen: false })}
          rowData={this.state.rowData}
          isAdmin={this.props.isAdmin}
          fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
        />

        <ConfirmDialog
          warningText={
            this.state.deleteZoneId
              ? 'Вы уверены, что хотите удалить экземпляр ' +
                this.state.deleteZoneId +
                '/' +
                this.state.deleteProjectName +
                '/' +
                this.state.deleteIndexName +
                '? Его будет невозможно восстановить.'
              : 'Вы уверены, что хотите удалить индекс ' +
                this.state.deleteProjectName +
                '/' +
                this.state.deleteIndexName +
                '? Его будет невозможно восстановить.'
          }
          open={this.state.confirmDialogDeleteOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />
        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить экземпляры ' +
            this.state.selectedRows?.map((row) => row.zoneId + '/' + row.project + '/' + row.name).join(', ') +
            '? Их будет невозможно восстановить.'
          }
          open={this.state.confirmAllDeleteDialogOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmAllDeleteDialogClose}
        />
        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите запустить ротацию индекса ' +
            this.state.rotateProjectShortName +
            '/' +
            this.state.rotateIndexName +
            ' Зона: ' +
            this.state.rotateZoneId +
            '?'
          }
          open={this.state.confirmRotate}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmRotateClose}
        />
        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите обновить версию экземпляра от ' +
            this.state.refreshInstanceVersion +
            ' до версии конфигурации от ' +
            this.state.refreshConfigVersion +
            '?'
          }
          open={this.state.confirmRefreshInstance}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmRefreshInstanceClose}
        />
        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите запустить индекс ' +
            this.state.startProjectShortName +
            '/' +
            this.state.startIndexName +
            ' Зона: ' +
            this.state.startZoneId +
            '?'
          }
          open={this.state.confirmStart}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmStartClose}
        />
        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите остановить индекс ' +
            this.state.stopProjectShortName +
            '/' +
            this.state.stopIndexName +
            ' Зона: ' +
            this.state.stopZoneId +
            '?'
          }
          open={this.state.confirmStop}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmStopClose}
        />
        <WaitingDialog
          customFormat={true}
          title={this.state.isSingleDeletion ? 'Удаление задачи индексации' : 'Удаление нескольких задач индексации'}
          open={this.state.waitForTaskDeletion}
          onClose={() => {
            this.setState({
              waitForTaskDeletion: false,
            });
            if (this.state.successTaskDeletion) {
              this.props.refetchPipelines();
              this.props.getAllFulltextLabelsList();
            }
          }}
          complete={this.state.taskDeletionComplete}
          success={this.state.successTaskDeletion}
          successMessage={this.state.isSingleDeletion ? 'Задача успешно удалена' : 'Задачи успешно удалены'}
          details={this.state.detailMessage}
          needDetailedInfo={true}
          errorMessage={this.state.errorMessage}
        />
        <WaitingDialog
          title="Остановка задач"
          open={this.state.waitForTaskStop || false}
          onClose={() => {
            this.setState({
              waitForTaskStop: false,
            });
            this.props.refetchPipelines();
          }}
          complete={this.state.completeTaskStop || false}
          success={this.state.successTaskStop || false}
          successMessage="Задачи успешно остановлены"
          errorMessage={this.state.errorMessage}
          customFormat={true}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />
        <WaitingDialog
          title="Запуск задач"
          open={this.state.waitForTaskStart || false}
          onClose={() => {
            this.setState({
              waitForTaskStart: false,
            });
            this.props.refetchPipelines();
          }}
          complete={this.state.completeTaskStart || false}
          success={this.state.successTaskStart || false}
          successMessage="Задачи успешно запущены"
          errorMessage={this.state.errorMessage}
          customFormat={true}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />

        <WaitingDialog
          title={'Сброс овердрафта'}
          open={this.state.waitForMultiResetOverdraft}
          onClose={() => {
            this.setState({
              waitForMultiResetOverdraft: false,
              errorMessage: '',
            });
            this.props.refetchPipelines();
          }}
          needDetailedInfo={true}
          details={this.state.detailMessage}
          complete={this.state.completeMultiResetOverdraft}
          success={this.state.successMultiResetOverdraft}
          successMessage={'Овердрафт успешно сброшен'}
          errorMessage={this.state.errorMessage}
          customFormat={true}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите запустить экземпляры ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(Зона: ' + row.zoneId + ')').join(', ') +
            '?'
          }
          open={this.state.confirmDialogStartOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmStartDialogClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите остановить экземпляры ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(Зона: ' + row.zoneId + ')').join(', ') +
            '?'
          }
          open={this.state.confirmDialogStopOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmStopDialogClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите сбросить скорость обработки экземпляров ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name + '(Зона: ' + row.zoneId + ')').join(', ') +
            ' до значений по умолчанию?'
          }
          open={this.state.confirmDialogMultiResetOverdraft}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.dialogMultiResetOverdraftClose}
        />

        {(this.state.overdraftValue || this.state.overdraftValue == 0) && (
          <OverdraftDialog
            open={this.state.confirmOverdraft}
            handleClose={() => this.setState({ confirmOverdraft: false })}
            overdraftValue={this.state.overdraftValue}
            project={this.state.overdraftProject}
            name={this.state.overdraftName}
            zoneId={this.state.overdraftZoneId}
            fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
            displayError={this.props.displayError}
            changeInstanceOverdraft={this.props.changeInstanceOverdraft}
            resetInstanceOverdraft={this.props.resetInstanceOverdraft}
            refetchPipelines={this.props.refetchPipelines}
            maxAvailableOverdraft={this.state.overdraftMaxAvailable}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
  };
}

export default connect(mapStateToProps, null)(IndexOverviewInstancesTable);

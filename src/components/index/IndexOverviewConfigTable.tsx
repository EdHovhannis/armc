import MaterialTable, { MTableAction, MTableBodyRow, MTableGroupbar, MTableGroupRow, MTableHeader } from '@material-table/core';
import { Chip, ThemeProvider, createTheme, IconButton, Typography, Tooltip, Link } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { green } from '@material-ui/core/colors';
import { Delete, Visibility, ErrorOutlineSharp, CheckCircleOutline } from '@material-ui/icons';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import MenuIcon from '@material-ui/icons/Menu';
import { IndexInstanceQuotasDialog } from '@src/components/index/IndexInstanceQuotasDialog';
import { computeSizeDisplayValue } from '@src/utils/sizeUnits';
import { computeSpeedDisplayValue } from '@src/utils/speedUnits';
import { computeTimeDisplayValue } from '@src/utils/timeUnits';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router';

import AddBlockDialogContainer from '../../containers/constraint/AddBlockDialogContainer';
import AddFulltextLabelContainer from '../../containers/index/AddFulltextLabelContainer';
import ProjectService from '../../services/ProjectService';
import { ApplicationState } from '../../store/Store';
import { User } from '../../store/auth/Types';
import { ConstraintType } from '../../store/constraint/Types';
import { getEnableFeatureSettingLimits } from '../../store/featureSettings/Reducer';
import { Group } from '../../store/group/Types';
import { Unit } from '../../store/role/Types';
import { IndexUtils, IndexOverviewDataTableConfig, IndexOverviewDataNew } from '../../utils/IndexUtils';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { BACKUPS_PAGE } from '../backups/utils';
import ConstraintEditDialog from '../constraint/ConstraintEditDialog';
import { LIMIT_FEATURE_SETTING_COLUMNS } from '../shared/constants';
import { CellText } from '../shared/ui';
import { Loader } from '../utils/Loader';

import AddInstanceDialog from './AddInstanceDialog';
import { FullTextOffsetDialog } from './FullTextOffsetDialog';
import IndexInfoDialog from './IndexInfoDialog';
import OverdraftDialog from './OverdraftDialog';
import SecurityIndexForm from './SecurityIndexForm';
import { TableDetailPanel } from './TableDetailPanel';
import { IndexOverviewConfigTableProps, IndexOverviewState, MENU_TYPE } from './types';

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
  const canView = props.data.flowActions.includes('VIEW') || props.isAdmin;
  const canViewDefault = true;
  const canEditLabel = props.data.indexActions.includes('EDIT') || props.isAdmin;
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
        {canView && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.export, props.data.name, props.data.project);
              handleClose();
            }}
          >
            Экспорт
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            disabled={IndexUtils.isAllZonesHasImplements(props.data, props.allZones)}
            onClick={(e) => {
              props.onClose(MENU_TYPE.addInstance, props.data.name, props.data.project);
              handleClose();
            }}
          >
            Добавить экземпляр
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.edit, props.data.name, props.data.project);
              handleClose();
            }}
          >
            Редактирование
          </MenuItem>
        )}
        {canViewDefault && (
          <MenuItem
            onClick={(e) => {
              props.onClose(MENU_TYPE.label, props.data.name, props.data.project, props.data.id, canEditLabel);
              handleClose();
            }}
          >
            Метки
          </MenuItem>
        )}
        {props.isAdmin && canViewDefault && (
          <div>
            <MenuItem
              onClick={(e) => {
                props.onClose(MENU_TYPE.constraints, props.data.name, props.data.project, props.data.id);
                handleClose();
              }}
            >
              Ограничения
            </MenuItem>
            {props.isLegacyMode && (
              <MenuItem
                onClick={(e) => {
                  props.onClose(MENU_TYPE.block, props.data.name, props.data.project, props.data.id);
                  handleClose();
                }}
              >
                Блокировки
              </MenuItem>
            )}
            {props.isLegacyMode && (
              <MenuItem
                onClick={(e) => {
                  props.onClose(MENU_TYPE.privilege, props.data.name, props.data.project, props.data.id);
                  handleClose();
                }}
              >
                Права
              </MenuItem>
            )}
          </div>
        )}
        {canRun && (
          <MenuItem
            disabled={props.data.countZone > 0}
            onClick={(e) => {
              props.onClose(MENU_TYPE.delete, props.data.name, props.data.project);
              handleClose();
            }}
          >
            <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

interface IndexOverviewConfigTableAdvProps extends IndexOverviewConfigTableProps {
  isLimitFeatureSettingEnabled: boolean;
}

class IndexOverviewConfigTable extends React.Component<IndexOverviewConfigTableAdvProps, IndexOverviewState> {
  constructor(props: IndexOverviewConfigTableProps) {
    super(props);
    this.state = {
      labelDialogOpen: false,
      canEditLabel: false,
      labelRefetch: false,
      overviewIsOpen: false,
      confirmDialogDeleteOpen: false,
      confirmAllDeleteDialogOpen: false,
      isSingleDeletion: true,
      isBlockUserDialogOpen: false,
      constraintDialogOpen: false,
      isStart: true,
      errorMessage: '',
      confirmStart: false,
      confirmStop: false,
      confirmRotate: false,
      roleEditOpen: false,
      redefineQuotasDialogOpen: false,
      confirmRefreshInstance: false,
      confirmAddInstance: false,
      confirmOverdraft: false,
      groupingState: [],
      isOffsetDialogOpen: false,
      forcePageSizeUpdate: 0, // Счетчик для принудительного обновления
    };
  }

  handleConfirmDialogDeleteOpen = () => {
    this.setState({ confirmDialogDeleteOpen: true });
  };

  handleConfirmDialogDeleteClose = (value) => {
    this.setState({ confirmDialogDeleteOpen: false });
    if (value === 'Ok' && this.state.deleteProjectName && this.state.deleteIndexName) {
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
          this.setState({
            taskDeletionComplete: true,
            successTaskDeletion: true,
            deleteProjectName: undefined,
            deleteIndexName: undefined,
            deleteZoneId: undefined,
          });
        },
        (errorMsg: { message: string; details?: string }) => {
          this.setState({
            taskDeletionComplete: true,
            successTaskDeletion: false,
            deleteProjectName: undefined,
            deleteIndexName: undefined,
            deleteZoneId: undefined,
            errorMessage: 'При удалении произошла ошибка: ' + errorMsg.message,
            detailsMessage: errorMsg.details,
          });
        },
      );
    }
  };

  handleConfirmAllDeleteDialogClose = (value) => {
    this.setState({ confirmAllDeleteDialogOpen: false });
    if (value === 'Ok' && this.state.selectedRows) {
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
                detailsMessage: endData.details,
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
      this.setState({
        waitForUpdateInstance: true,
        completeUpdateInstance: false,
        successUpdateInstance: false,
      });
      this.props.refreshInstanceFulltext(
        this.state.refreshProject,
        this.state.refreshName,
        this.state.refreshZoneId,
        () => {
          this.setState({
            completeUpdateInstance: true,
            successUpdateInstance: true,
          });
          // this.props.refetchPipelines();
        },
        (errorMsg: { message: string; details?: string }) => {
          this.setState({
            completeUpdateInstance: true,
            successUpdateInstance: false,
            errorMessage:
              'При обновление инстанса ' +
              this.state.refreshProject +
              '/' +
              this.state.refreshName +
              '(' +
              this.state.refreshZoneId +
              ') произошла ошибка: ' +
              errorMsg.message,
            detailsMessage: errorMsg.details,
          });
          // this.props.displayError(error);
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

  handleConfirmStartClose = (value) => {
    this.setState({ confirmStart: false });
    if (value === 'Ok' && this.state.startProjectShortName && this.state.startIndexName && this.state.startZoneId) {
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
    if (value === 'Ok' && this.state.stopProjectShortName && this.state.stopIndexName && this.state.stopZoneId) {
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
      case MENU_TYPE.offset:
        this.setState({
          isOffsetDialogOpen: true,
          rowData: rowData,
        });
        break;
      case MENU_TYPE.addInstance:
        this.setState({
          confirmAddInstance: true,
          addInstanceIndexName: name,
          addInstanceProjectShortName: projectShortName,
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
      case MENU_TYPE.export:
        this.props.downloadPipeline(projectShortName, name);
        break;
      case MENU_TYPE.edit:
        this.props.redirect({
          pathname: '/index/' + name,
          search: '?project=' + projectShortName,
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
      case MENU_TYPE.label:
        this.setState({
          labelDialogOpen: true,
          labelName: name,
          labelProjectName: projectShortName,
          canEditLabel: canEditLabel,
        });
        break;
      case MENU_TYPE.constraints:
        this.props.getFulltextTaskByProjectAndName(
          projectShortName,
          name,
          (fulltextTask) => {
            this.props.fetchConstraintForObject(
              fulltextTask.id,
              ConstraintType.fulltext,
              (constraint) => {
                this.setState({
                  constraintDialogOpen: true,
                  currentConstraint: constraint,
                  constraintEditTask: {
                    projectId: projectShortName,
                    objectName: name,
                  },
                  constraintTitle: (
                    <React.Fragment>
                      Ограничения на индекс{' '}
                      <b>
                        {projectShortName}/{name}
                      </b>
                    </React.Fragment>
                  ),
                });
              },
              (error) => {
                this.props.displayError(error);
              },
            );
          },
          (error) => {
            this.props.displayError(error);
          },
        );
        break;
      case MENU_TYPE.block:
        this.setState({
          isBlockUserDialogOpen: true,
          blockIndexProjectName: projectShortName,
          blockIndexName: name,
          blockedObject: {
            id: id,
            projectShortName: projectShortName,
            name: name,
          },
          blockTitle: (
            <React.Fragment>
              Блокировки на индекс{' '}
              <b>
                {projectShortName}/{name}
              </b>
            </React.Fragment>
          ),
        });
        break;
      case MENU_TYPE.privilege:
        this.setState({
          roleEditOpen: true,
          roleIndexId: id,
          roleIndexName: name,
          roleProjectShortName: projectShortName,
        });
        break;
      case MENU_TYPE.redefine:
        this.setState({
          redefineQuotasDialogOpen: true,
          rowData: rowData,
        });
    }
  };

  customSort = (data, data2) => {
    let compare1, compare2;
    if (data.countZoneRender) {
      if (typeof data.countZoneRender === 'object') {
        compare1 = 0;
        compare2 = data2.countZoneRender;
      } else if (typeof data2.countZoneRender === 'object') {
        compare1 = data.countZoneRender;
        compare2 = 0;
      }
    } else {
      if (typeof data === 'object') {
        compare1 = 0;
        compare2 = data2;
      } else if (typeof data2 === 'object') {
        compare1 = data;
        compare2 = 0;
      }
    }
    return compare1 - compare2;
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
    // в data.topic может попасть не только строка
    const topics = typeof data.topic === 'string' ? data.topic.split(',') : ''.split(',');
    const topic = topics[0];
    const otherTopics = topics.slice(1);
    const lengthOtherTopics = otherTopics.length;

    return lengthOtherTopics > 1 ? (
      <>
        {topic}
        <Tooltip title={IndexUtils.sourcesTooltip(otherTopics)} placement="top">
          <Typography color="primary" style={{ display: 'inline-block', marginLeft: 8 }} onClick={() => this.indexInfoHandler(data)}>
            и еще {lengthOtherTopics}
          </Typography>
        </Tooltip>
      </>
    ) : (
      topic
    );
  };

  indexInfoHandler = (rowData: IndexOverviewDataTableConfig) => {
    ProjectService.fetchProjectByName(rowData.project, (project) => {
      const canView = rowData.flowActions.includes('VIEW') || this.props.isAdmin;
      if (canView) {
        this.props.getPipelineInfo(
          project.shortName,
          rowData.name,
          (pipeline) => {
            this.setState({
              overviewIsOpen: true,
              pipeline: pipeline,
              backupCount: rowData.backupCount,
            });
          },
          (errorMsg) => {
            this.props.displayError(errorMsg);
          },
        );
      } else {
        this.props.displayError('У пользователя не хватает прав на просмотр информации по индексу.');
      }
    });
  };

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    const { rowData } = this.state;
    const { isLimitFeatureSettingEnabled } = this.props;

    const COLUMNS = [
      {
        title: '',
        field: 'icon',

        render: (row: IndexOverviewDataTableConfig) => {
          const removeWoNulls = row.instances?.map((item) => item.woBackup).filter((item) => item !== null && item !== undefined);
          const isWo = removeWoNulls?.some((item) => item);
          if (!removeWoNulls?.length) {
            return <></>;
          } else if (!isWo) {
            return <CheckCircleOutline color="primary" />;
          }
          return (
            <Tooltip title={'Риск потери данныx: не ко всем коллекцияместь бэкапы'} placement="top">
              <ErrorOutlineSharp color="error" />
            </Tooltip>
          );
        },
        grouping: false,
      },
      {
        title: 'Название',
        field: 'name',
        render: (row: IndexOverviewDataTableConfig) => <CellText title={row.name} />,
        grouping: false,
      },
      {
        field: 'id',
        hidden: true,
      },
      {
        title: 'Ключ проекта',
        field: 'project',
        render: (row: IndexOverviewDataTableConfig) => <CellText title={row.project} />,
      },
      {
        title: 'Источник данных',
        field: 'topic',
        render: this.sourcesRender,
      },
      {
        title: 'Метки',
        field: 'labels',
        render: this.labelsRerender,
      },
      {
        title: 'Макс. скорость записи',
        field: 'maxDataRateBytesPerSec',
        grouping: false,
        width: 200,
        minWidth: 200,
        render: (row: IndexOverviewDataTableConfig) => (
          <CellText title={row.maxDataRateBytesPerSec ? computeSpeedDisplayValue(row.maxDataRateBytesPerSec, 2).formatted : ''} />
        ),
      },
      {
        title: 'Макс. размер индекса',
        field: 'maxSizeBytes',
        grouping: false,
        width: 200,
        minWidth: 200,
        render: (row: IndexOverviewDataTableConfig) => (
          <CellText title={row.maxSizeBytes ? computeSizeDisplayValue(row.maxSizeBytes, 2).formatted : ''} />
        ),
      },
      {
        title: 'Макс. время хранения данных',
        field: 'maxStorageTimeSec',
        grouping: false,
        width: 200,
        minWidth: 200,
        render: (row: IndexOverviewDataTableConfig) => (
          <CellText title={row.maxStorageTimeSec ? computeTimeDisplayValue(row.maxStorageTimeSec, 2).formatted : ''} />
        ),
      },
      {
        title: 'Зоны',
        field: 'countZone',
        hidden: true,
      },
      {
        title: 'Количество зон',
        field: 'countZoneRender',
        customSort: this.customSort,
      },
      {
        title: 'Зоны',
        field: 'zones',
        render: (data: any, renderType: string) => {
          if (renderType === 'group') {
            return data.length == 0 ? '-' : data.join(', ');
          } else {
            return data.zones ? data.zones.join(', ') : '';
          }
        },
      },
      {
        title: 'Бэкапы',
        field: 'backupCount',
        render: (data: { name: any; project: any; backupCount: any }) => (
          // @ts-ignore
          <RouterLink to={`${BACKUPS_PAGE.list}?indexFilter=${data.name}&projectFilter=${data.project}`} component={Link}>
            {data.backupCount}
          </RouterLink>
        ),
      },
      {
        title: 'Стратегия',
        field: 'strategy',
        render: (data: { name: any; project: any; backupCount: any; instances: any }) => {
          return (
            <>
              {data?.instances.map((item: any) => (
                <div key={item.id}>{item.recoveryStrategy}</div>
              ))}
            </>
          );
        },
      },
    ];
    const columns = isLimitFeatureSettingEnabled ? COLUMNS : COLUMNS.filter((column) => !LIMIT_FEATURE_SETTING_COLUMNS.includes(column.field));
    return (
      <React.Fragment>
        <Paper style={{ width: '100%' }}>
          <ThemeProvider theme={theme}>
            {/*@ts-ignore*/}
            <MaterialTable
              icons={tableIcons}
              columns={Utils.getColumns(columns, this.state.groupingState)}
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
              data={this.props.data}
              detailPanel={(rowData) => {
                return (
                  <TableDetailPanel
                    data={rowData.rowData.instances}
                    displayError={this.props.displayError}
                    user={this.props.user}
                    isAdmin={this.props.isAdmin}
                    menuType={MENU_TYPE}
                    onCloseMenu={this.onCloseMenu}
                    refreshInstanceDialog={this.handleConfirmDialogRefreshOpen}
                    statisticsLoad={(rowData) => this.props.statisticsLoad(rowData)}
                    fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
                    countInstance={IndexUtils.getCountInstanceOverdraft(this.props.instancesData)}
                    isLimitFeatureSettingEnabled={isLimitFeatureSettingEnabled}
                  />
                );
              }}
              title="Список полнотекстовых индексов"
              options={{
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                emptyRowsWhenPaging: false,
                padding: 'dense',
                search: true,
                searchText: this.props.searchText,
                paging: true,
                showTitle: true,
                header: true,
                actionsColumnIndex: -1,
                grouping: true,
              }}
              actions={[
                {
                  icon: () => <InfoOutlinedIcon color={'primary'} />,
                  tooltip: 'Информация об индексе',
                  onClick: (_, rowData: IndexOverviewDataTableConfig) => this.indexInfoHandler(rowData),
                  position: 'row',
                },
                (rowData) => ({
                  icon: () => <Visibility color={rowData.countZone === 0 ? 'disabled' : 'primary'} />,
                  tooltip: 'Просмотр',
                  disabled: rowData.countZone === 0,
                  onClick: (event, rowData: IndexOverviewDataTableConfig) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.props.redirect(`/index/search/${rowData.name}/${rowData.project}`);
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
                  icon: () => <Delete />,
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
                Row: (props) => {
                  return (
                    <MTableBodyRow
                      {...{
                        ...props,
                        options: {
                          ...props.options,
                          selection: true,
                          selectionProps: (rowData) => ({
                            disabled: rowData.countZone != 0,
                          }),
                        },
                      }}
                      onDoubleClick={(e) => {
                        if (props.data.countZone != 0) {
                          this.props.redirect(`/index/search/${props.data.name}/${props.data.project}`);
                        }
                      }}
                    />
                  );
                },
                Groupbar: (props) => {
                  if (props.groupColumns.length != this.state.groupingState.length) {
                    this.setState({ groupingState: props.groupColumns });
                  }
                  return <MTableGroupbar {...props} />;
                },
                GroupRow: (props) => {
                  return (
                    <MTableGroupRow
                      {...{
                        ...props,
                        options: {
                          ...props.options,
                          selection: IndexUtils.isSelectEnable(props.groupData.data),
                          showSelectGroupCheckbox: true,
                        },
                      }}
                    />
                  );
                },
                Action: (props) => {
                  if (props.action.tooltip === 'Действия') {
                    return (
                      <div>
                        <ButtonMenu
                          {...props}
                          allZones={this.props.allZones.availableZones}
                          user={this.props.user}
                          isAdmin={this.props.isAdmin}
                          isLegacyMode={this.props.isLegacyMode}
                          onClose={this.onCloseMenu}
                          displayError={this.props.displayError}
                        />
                      </div>
                    );
                  } else if (props.action.tooltip === 'Удалить выбранные строки') {
                    const flag = props.data.some((item) => item.countZone > 0);
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
              onRowClick={(event, rowData) => {}}
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

        {this.state.overviewIsOpen && this.state.pipeline && (
          <IndexInfoDialog
            close={() => {
              this.setState({ overviewIsOpen: false, pipeline: undefined });
            }}
            pipeline={this.state.pipeline}
            backupCount={this.state.backupCount}
          />
        )}

        {this.state.confirmAddInstance && (
          <AddInstanceDialog
            close={() => {
              this.setState({ confirmAddInstance: false });
            }}
            fullName={this.state.addInstanceProjectShortName + '/' + this.state.addInstanceIndexName}
            zones={this.props.allZones.availableZones}
            checkedZones={
              this.props.data.find(
                (instance) => instance.name === this.state.addInstanceIndexName && instance.project === this.state.addInstanceProjectShortName,
              )?.zones
            }
            displayError={this.props.displayError}
            onAddZone={(zone) => {
              if (this.state.addInstanceIndexName && this.state.addInstanceProjectShortName) {
                this.setState({
                  waitForAddingInstance: true,
                  successAddingInstance: false,
                  completeAddingInstance: false,
                });
                this.props.addInstanceFulltext(
                  this.state.addInstanceProjectShortName,
                  this.state.addInstanceIndexName,
                  zone,
                  () => {
                    this.setState({
                      completeAddingInstance: true,
                      successAddingInstance: true,
                    });
                    // this.props.refetchPipelines();
                  },
                  (errorMsg: { message: string; details?: string }) => {
                    this.setState({
                      completeAddingInstance: true,
                      successAddingInstance: false,
                      errorMessage: 'Произошла ошибка при добавлении экземпляра: ' + errorMsg.message.message,
                      detailsMessage: errorMsg.details,
                    });
                    // this.props.displayError(error);
                  },
                );
              }
            }}
          />
        )}

        {this.state.constraintDialogOpen && (
          <ConstraintEditDialog
            displayError={this.props.displayError}
            close={() => {
              this.setState({
                constraintDialogOpen: false,
                currentConstraint: undefined,
                constraintTitle: undefined,
              });
            }}
            type={ConstraintType.fulltext}
            title={this.state.constraintTitle}
            onPatch={(type, patch, constraintResult) => {
              this.props.getFulltextTaskByProjectAndName(
                this.state.constraintEditTask.projectId,
                this.state.constraintEditTask.objectName,
                (task) => {
                  this.props.updateConstraintOnObject(
                    task.id,
                    type,
                    patch,
                    () => {
                      this.setState({
                        currentConstraint: constraintResult,
                      });
                    },
                    (error) => {
                      this.props.displayError(error);
                    },
                  );
                },
                (error) => {
                  this.props.displayError(error);
                },
              );
            }}
            constraint={this.state.currentConstraint}
          />
        )}

        {this.state.isBlockUserDialogOpen && (
          <AddBlockDialogContainer
            close={() => {
              this.setState({
                isBlockUserDialogOpen: false,
              });
            }}
            onClose={(
              value: string,
              constraintType?: ConstraintType,
              isGlobal?: boolean,
              description?: string,
              subjectType?: Unit,
              subject?: User | Group,
              objectId?: number,
              projectId?: string,
              isProject?: boolean,
            ) => {
              if (value === 'Ok') {
                this.props.blockSubjectOnObject(
                  subject?.id,
                  subjectType,
                  projectId,
                  objectId,
                  isProject,
                  constraintType,
                  description,
                  () => {
                    this.props.displaySuccess('Блокировка создана успешно');
                  },
                  (error) => {
                    this.props.displayError(error);
                  },
                );
              }
            }}
            fulltextTasks={this.props.fulltextTasks}
            type={ConstraintType.fulltext}
            object={this.state.blockedObject}
            fulltextTask={this.state.blockedObject}
            isEdit={true}
          />
        )}

        {this.state.roleEditOpen && (
          <SecurityIndexForm
            indexId={this.state.roleIndexId}
            indexName={this.state.roleIndexName}
            indexProject={this.state.roleProjectShortName}
            close={() => {
              this.setState({
                roleEditOpen: false,
                roleProjectShortName: undefined,
                roleIndexName: undefined,
                roleIndexId: undefined,
              });
            }}
          />
        )}
        <IndexInstanceQuotasDialog
          open={this.state.redefineQuotasDialogOpen}
          handleClose={() => this.setState({ redefineQuotasDialogOpen: false })}
          rowData={this.state.rowData}
          isAdmin={this.props.isAdmin}
          fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
        />

        {(this.state.overdraftValue || this.state.overdraftValue == 0 || this.state.confirmOverdraft) && (
          <OverdraftDialog
            open={this.state.confirmOverdraft}
            handleClose={() => this.setState({ confirmOverdraft: false })}
            overdraftValue={this.state.overdraftValue || 0}
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

        {this.state.isOffsetDialogOpen && <FullTextOffsetDialog handleClose={() => this.setState({ isOffsetDialogOpen: false })} rowData={rowData} />}

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
              : 'Вы уверены, что хотите удалить конфигурацию ' +
                this.state.deleteProjectName +
                '/' +
                this.state.deleteIndexName +
                '? Ее будет невозможно восстановить.'
          }
          open={this.state.confirmDialogDeleteOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить конфигурации ' +
            this.state.selectedRows?.map((row) => row.project + '/' + row.name).join(', ') +
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
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailsMessage}
        />

        <WaitingDialog
          title={'Добавление экземпляра полнотекстового индекса'}
          open={this.state.waitForAddingInstance}
          onClose={() => {
            this.setState({ waitForAddingInstance: false });
            if (this.state.successAddingInstance) {
              this.props.refetchPipelines();
            }
          }}
          complete={this.state.completeAddingInstance}
          success={this.state.successAddingInstance}
          successMessage={'Экземпляр успешно добавлен'}
          errorMessage={this.state.errorMessage}
          customFormat={true}
          needDetailedInfo={true}
          details={this.state.detailsMessage}
        />

        <WaitingDialog
          title={'Обновление экземпляра полнотекстового индекса'}
          open={this.state.waitForUpdateInstance}
          onClose={() => {
            this.setState({ waitForUpdateInstance: false });
            if (this.state.successUpdateInstance) {
              this.props.refetchPipelines();
            }
          }}
          complete={this.state.completeUpdateInstance}
          success={this.state.successUpdateInstance}
          successMessage={'Экземпляр успешно обновлен'}
          errorMessage={this.state.errorMessage}
          customFormat={true}
          needDetailedInfo={true}
          details={this.state.detailsMessage}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
  };
}

export default connect(mapStateToProps, null)(IndexOverviewConfigTable);

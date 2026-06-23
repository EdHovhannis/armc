import MaterialTable, { MTableGroupbar, MTableHeader } from '@material-table/core';
import { createTheme, IconButton, ThemeProvider } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import AirplayIcon from '@material-ui/icons/Airplay';
import DeleteButton from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import * as React from 'react';

import { FlowOverview, FlowRowType } from '../../store/flow/Types';
import { Project } from '../../store/project/Types';
import { FlowUtils } from '../../utils/FlowUtils';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { CellText } from '../shared/ui';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import AddFlowInstanceDialog from './AddFlowInstanceDialog';
import { FlowOverviewDetailPanel } from './FlowOverviewDetailPanel';
import SecurityForm from './SecurityForm';

export interface FlowConfigurationListProps {
  projects: Project[];
  overview: Array<FlowOverview>;
  zones: string[];
  isLegacyMode: boolean;
  refetch: () => void;
  displayError: (error) => void;
  addInstanceFlow: (
    flowId: number,
    zoneId: string,
    startFlow: boolean,
    callback?: (id: number) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
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
  handleDeleted: (id: number, callback?: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => void;
}

export interface FlowConfigurationListState {
  openPermissions: boolean;
  addInstance: boolean;
  flowId: number;
  flowName: string;
  canManageAccess: boolean;
  instances: string[];
  projectName: string;
  deletedFlowId: number;
  openDeleteConfirmDialog: boolean;
  groupingState: any[];

  waitForAddInstance: boolean;
  successAddInstance: boolean;
  completeAddInstance: boolean;

  waitForDeleteConfig: boolean;
  successDeleteConfig: boolean;
  completeDeleteConfig: boolean;

  errorMessage: string;
  detailMessage?: string;
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

class FlowConfigurationList extends React.Component<FlowConfigurationListProps & WithNavigationProps, FlowConfigurationListState> {
  constructor(props) {
    super(props);
    this.state = {
      openPermissions: false,
      addInstance: false,
      canManageAccess: false,
      flowId: 0,
      flowName: '',
      instances: [],
      projectName: '',
      deletedFlowId: 0,
      openDeleteConfirmDialog: false,
      groupingState: [],
      successAddInstance: false,
      waitForAddInstance: false,
      completeAddInstance: false,
      waitForDeleteConfig: false,
      completeDeleteConfig: false,
      successDeleteConfig: false,
      errorMessage: '',
    };
    this.handleDeleteDialogClose = this.handleDeleteDialogClose.bind(this);
  }

  handleDeleteDialogClose(value: string) {
    this.setState({ ...this.state, openDeleteConfirmDialog: false });
    if (value === 'Ok') {
      this.setState({
        waitForDeleteConfig: true,
        completeDeleteConfig: false,
        successDeleteConfig: false,
      });
      this.props.handleDeleted(
        this.state.deletedFlowId,
        () => {
          this.setState({
            deletedFlowId: 0,
            projectName: '',
            completeDeleteConfig: true,
            successDeleteConfig: true,
          });
        },
        (errorMsg) => {
          this.setState({
            deletedFlowId: 0,
            projectName: '',
            completeDeleteConfig: true,
            successDeleteConfig: false,
            errorMessage: 'При удалении конфигурации произошла ошибка: ' + errorMsg.message,
            detailMessage: errorMsg.details,
          });
        },
      );
    }
  }

  render() {
    const columns = [
      {
        field: 'id',
        hidden: true,
      },
      {
        title: 'Название',
        field: 'name',
        cellStyle: {
          paddingTop: '10px',
        },
        grouping: false,
      },
      {
        title: 'Ключ проекта',
        field: 'project',
      },
      {
        title: 'Зоны',
        field: 'countZone',
        render: (rowData: any, renderType: any) => {
          if (renderType === 'group') {
            return <span>{rowData}</span>;
          }
          if (rowData.countZone === 0) {
            return <div style={{ color: '#FFA500' }}>0</div>;
          }
          return <div>{rowData.countZone}</div>;
        },
        grouping: true,
      },
      {
        title: 'Добавить экземпляр',
        field: 'addInstance',
        render: (rowData: FlowRowType) => {
          if (!rowData.zones) return null;

          const zones = this.props.zones;
          const result =
            rowData.zones.length === this.props.zones.length &&
            rowData.zones.every(function (zone) {
              return zones.includes(zone);
            });
          return (
            <IconButton
              disabled={result || !rowData.canEdit}
              size={'small'}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({
                  flowName: rowData.name,
                  flowId: rowData.id,
                  addInstance: true,
                  instances: rowData.zones,
                });
              }}
            >
              <AirplayIcon />
            </IconButton>
          );
        },
      },
      {
        title: 'Приватность',
        field: 'privacy',
        render: (rowData: FlowRowType) => {
          if (rowData.canManageAccess === undefined) return null;
          return (
            <IconButton
              disabled={!rowData.canManageAccess}
              size={'small'}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({
                  flowName: rowData.name,
                  flowId: rowData.id,
                  openPermissions: true,
                  canManageAccess: rowData.canManageAccess,
                });
              }}
            >
              <SettingsIcon />
            </IconButton>
          );
        },
      },
      {
        title: 'Удалить',
        field: 'delete',
        render: (rowData: FlowRowType) => {
          if (rowData.countZone === undefined) return null;
          return (
            <IconButton
              disabled={rowData.countZone !== 0 || !rowData.canEdit}
              size={'small'}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({
                  ...this.state,
                  projectName: `${rowData.project}/${rowData.name}`,
                  deletedFlowId: rowData.id,
                  openDeleteConfirmDialog: true,
                });
              }}
            >
              <DeleteButton />
            </IconButton>
          );
        },
      },
      { field: 'canEdit', hidden: true },
      { field: 'canManageAccess', hidden: true },
      { field: 'checkpointIntervalMillis', hidden: true },
      { field: 'version', hidden: true },
      { field: 'projectId', hidden: true },
      { field: 'quotaSize', hidden: true },
    ].filter((col) => {
      if (this.props.isLegacyMode) {
        return true;
      }
      return !(col.field === 'privacy');
    });

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
                  nRowsSelected: '{0} экземпляр(-ов) выбрано',
                },
                grouping: {
                  placeholder: 'Перетащите сюда заголовок столбца, по которому хотите сгруппировать данные',
                  groupedBy: 'Сгруппировано по ',
                },
                body: {
                  emptyDataSourceMessage: 'Список конфигураций потоков обработки пуст',
                },
                header: {
                  actions: '',
                },
              }}
              data={(this.props.overview || []).map((flow): FlowRowType => {
                const project = (this.props.projects || []).find((prj) => prj.id === flow.projectId);
                const projectName = project ? project.shortName : '';

                const countZone = Array.isArray(flow.instances) ? flow.instances.length : 0;

                return {
                  id: flow.id,
                  name: flow.name,
                  project: projectName,
                  canEdit: flow.canEdit,
                  canManageAccess: flow.canManageAccess,
                  checkpointIntervalMillis: flow.checkpointIntervalMillis,
                  version: flow.version,
                  countZone: countZone, // Всегда число
                  zones: (flow.instances || []).map((instance) => instance.zoneId),
                };
              })}
              onRowClick={(event, rowData) => {
                if (rowData && rowData.id) {
                  this.props.navigate('/flow/' + rowData.id);
                }
              }}
              title="Список конфигураций потоков обработки"
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
              detailPanel={({ rowData }) => {
                return (
                  <FlowOverviewDetailPanel
                    refetch={this.props.refetch}
                    data={FlowUtils.getFlowDetailData(this.props.overview, rowData)}
                    rowData={rowData}
                    updateVersionInstanceFlow={this.props.updateVersionInstanceFlow}
                    suspendClicked={this.props.suspendClicked}
                    resumeClicked={this.props.resumeClicked}
                    deleteInstanceFlow={this.props.deleteInstanceFlow}
                  />
                );
              }}
              components={{
                Groupbar: (props) => {
                  if (props.groupColumns.length != this.state.groupingState.length) {
                    this.setState({ groupingState: props.groupColumns });
                  }
                  return <MTableGroupbar {...props} />;
                },
                Header: (props) => (
                  <ThemeProvider theme={themeHeader}>
                    <MTableHeader
                      {...{
                        ...props,
                      }}
                    />
                  </ThemeProvider>
                ),
              }}
            />
          </ThemeProvider>
        </Paper>
        {this.state.openPermissions && (
          <SecurityForm
            flowId={this.state.flowId}
            canManageAccess={this.state.canManageAccess}
            flowName={this.state.flowName}
            close={(open) => {
              this.setState({ openPermissions: open });
            }}
          />
        )}

        {this.state.addInstance && (
          <AddFlowInstanceDialog
            flowName={this.state.flowName}
            zones={this.props.zones}
            instances={this.state.instances}
            close={() => {
              this.setState({ addInstance: false });
            }}
            displayError={this.props.displayError}
            onAddZone={(zoneId: string, startFlow: boolean) => {
              this.setState({
                waitForAddInstance: true,
                completeAddInstance: false,
                successAddInstance: false,
              });
              this.props.addInstanceFlow(
                this.state.flowId,
                zoneId,
                startFlow,
                () => {
                  this.setState({
                    completeAddInstance: true,
                    successAddInstance: true,
                  });
                },
                (error) => {
                  this.setState({
                    completeAddInstance: true,
                    successAddInstance: false,
                    errorMessage: 'При добавлении экземпляра произошла ошибка: ' + error.message.message,
                    detailMessage: error.details,
                  });
                },
              );
            }}
          />
        )}

        {this.state.openDeleteConfirmDialog && (
          <ConfirmDialog
            warningText={`Вы уверены, что хотите удалить конфигурацию ${this.state.projectName}? Ее будет невозможно восстановить.`}
            open={this.state.openDeleteConfirmDialog}
            okString={'Удалить'}
            cancelString={'Отмена'}
            onClose={this.handleDeleteDialogClose}
          />
        )}

        <WaitingDialog
          customFormat={true}
          customSuccessMessage={true}
          title={'Добавление экземпляра потока'}
          open={this.state.waitForAddInstance}
          onClose={() => {
            this.setState({ waitForAddInstance: false, errorMessage: '', detailMessage: undefined });
            if (this.state.successAddInstance) {
              this.props.refetch();
            }
          }}
          complete={this.state.completeAddInstance}
          success={this.state.successAddInstance}
          successMessage={'Экземпляр успешно добавлен'}
          errorMessage={this.state.errorMessage}
          details={this.state.detailMessage}
          needDetailedInfo={true}
        />

        <WaitingDialog
          customFormat={true}
          customSuccessMessage={true}
          title={'Удаление конфигурации'}
          open={this.state.waitForDeleteConfig}
          onClose={() => {
            this.setState({ waitForDeleteConfig: false, errorMessage: '', detailMessage: undefined });
            if (this.state.successDeleteConfig) {
              this.props.refetch();
            }
          }}
          complete={this.state.completeDeleteConfig}
          success={this.state.successDeleteConfig}
          successMessage={'Конфигурация успешно удалена'}
          errorMessage={this.state.errorMessage}
          details={this.state.detailMessage}
          needDetailedInfo={true}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(FlowConfigurationList);

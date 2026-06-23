import MaterialTable, { MTableAction, MTableBodyRow, MTableGroupRow, MTableHeader, MTableGroupbar } from '@material-table/core';
import { Avatar, createTheme, ThemeProvider } from '@material-ui/core';
import { Delete, PlayArrow, Stop } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';

import ArchiveTaskInstanceActions from '../../containers/archive/ArchiveTaskInstanceActions';
import { ArchivalStatus, ArchiveTaskInstance, ArchiveTaskInstanceStatus, ArchiveTaskRequestStatus } from '../../store/archive/Types';
import SizeConverter from '../../utils/SizeConverter';
import { tableIcons, Utils, speedIcon } from '../../utils/Utils';
import ConfirmDialog, { DEFAULT_DECISION } from '../ConfirmDialog';
import { LoaderInString } from '../loader/LoaderInString';
import { LIMIT_FEATURE_SETTING_COLUMNS } from '../shared/constants';
import { FilterMenuItem } from '../utils/FilterMenu';
import { StatusFlag } from '../utils/StatusFlag';

enum CONFIRM_DIALOG {
  resumeInstance,
  suspendInstance,
  deleteInstance,
  resetOverdraft,
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

interface ActionsCellProps {
  action: any;
  data: any;
  isLoadingStatusesPagination?: boolean;
}

class ActionsCell extends React.Component<ActionsCellProps> {
  constructor(props: ActionsCellProps) {
    super(props);
  }

  render() {
    if (this.props.action.tooltip === 'Действия') {
      return (
        <ArchiveTaskInstanceActions
          archiveTaskInstanceId={this.props.data.archiveTaskInstanceId}
          isZone={true}
          isLoadingStatusesPagination={this.props.isLoadingStatusesPagination}
        />
      );
    } else if (
      this.props.action.tooltip === 'Старт выбранных экземпляров' ||
      this.props.action.tooltip === 'Остановить выбранные экземпляры' ||
      this.props.action.tooltip === 'Удалить выбранные экземпляры'
    ) {
      const flag = this.props.data.some((item: { canEdit: boolean }) => !item.canEdit);
      return (
        <div style={{ color: flag ? 'disabled' : '#4CAF50' }}>
          <MTableAction
            {...{
              ...this.props,
              disabled: flag,
            }}
          />
        </div>
      );
    } else {
      return <MTableAction {...this.props} />;
    }
  }
}

const COLUMNS = [
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
    field: 'zoneId',
    defaultGroupOrder: 0,
  },
  {
    title: 'Ключ проекта',
    field: 'project',
    grouping: true,
  },
  {
    title: 'Статус',
    field: 'statusIndexingStatus',
    grouping: true,
  },
  {
    title: 'Статистика памяти',
    field: 'memoryUsage',
    grouping: false,
  },
  {
    title: 'Макс.скорость записи',
    field: 'maxDataRateBytesPerSec',
    grouping: false,
  },
  {
    title: 'Макс.размер индекса',
    field: 'maxSizeBytes',
    grouping: false,
  },
  {
    title: 'Макс.время хранения данных',
    field: 'maxStorageTimeSec',
    grouping: false,
  },
];

interface Props {
  filter: FilterMenuItem | undefined;
  resumeArchiveInstances: (archiveTaskInstancesId: string[]) => void;
  suspendArchiveInstances: (archiveTaskInstancesId: string[]) => void;
  deleteArchiveTaskInstances: (archiveTaskInstancesId: string[]) => void;
  resetInstanceOverdrafts: (archiveTaskInstancesId: string[]) => void;
  getArchiveTaskInstancesOverdraftPercent: (params: { projectName: string; taskName: string; zoneId: string }[]) => void;
  archiveTaskInstanceStatus: {
    instance: ArchiveTaskInstance;
    status?: ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus;
  }[];
  fetchArchiveTaskInstanceStatuses: (unFetchedInstanceStatusIds: string[]) => void;
  isAdmin?: boolean;
  tasks?: any;
  isLoadingStatusesPagination?: boolean;
  showUnableToChangeNotification: (archiveTaskInstancesId: string[]) => void;
  isLimitFeatureSettingEnabled: boolean;
}

interface ArchiveTaskInstanceRowData {
  archiveTaskInstanceId: string;
  project: string;
  name: string;
  zoneId: string;
  statusIndexingStatus?: string;
  memoryUsage?: string;
  canEdit: boolean;
}

interface State {
  confirmDialogOpen: CONFIRM_DIALOG | null;
  selectedArchiveTaskInstances: ArchiveTaskInstanceRowData[];
  groupingState: any[];
}

class ArchiveZoneInstancesTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      confirmDialogOpen: null,
      selectedArchiveTaskInstances: [],
      groupingState: [],
    };

    this.setSelectedArchiveTaskInstances = this.setSelectedArchiveTaskInstances.bind(this);
    this.openDialogWithInstances = this.openDialogWithInstances.bind(this);
    this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
    this.updateStatuses = this.updateStatuses.bind(this);
  }
  componentDidMount() {
    this.updateStatuses(this.props.archiveTaskInstanceStatus);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if (this.countUndefinedStatuses(this.props.archiveTaskInstanceStatus) > 0) {
      this.updateStatuses(this.props.archiveTaskInstanceStatus);
    }
  }

  countUndefinedStatuses(
    archiveTaskInstanceStatus: {
      instance: ArchiveTaskInstance;
      status?: ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus;
    }[],
  ): number {
    return archiveTaskInstanceStatus.filter(({ instance, status }) => {
      return typeof instance !== 'undefined' && typeof status === 'undefined';
    }).length;
  }

  updateStatuses(
    archiveTaskInstanceStatus: {
      instance: ArchiveTaskInstance;
      status?: ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus;
    }[],
  ) {
    const unFetchedInstanceStatusIds: string[] = [];
    archiveTaskInstanceStatus.forEach(({ instance, status }) => {
      if (typeof status === 'undefined') {
        unFetchedInstanceStatusIds.push(instance.archiveTaskInstanceId);
      }
    });
    this.props.fetchArchiveTaskInstanceStatuses(unFetchedInstanceStatusIds);
  }

  openDialogWithInstances(confirmDialogOpen: CONFIRM_DIALOG | null, rowData: ArchiveTaskInstanceRowData | ArchiveTaskInstanceRowData[]) {
    const selectedArchiveTaskInstances = Array.isArray(rowData) ? rowData : [rowData];
    const archiveTaskInstancesReadOnly = selectedArchiveTaskInstances.filter(({ canEdit }) => canEdit === false);
    if (archiveTaskInstancesReadOnly.length > 0) {
      this.props.showUnableToChangeNotification(archiveTaskInstancesReadOnly.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId));
      return;
    }
    this.setState({
      confirmDialogOpen,
      selectedArchiveTaskInstances,
    });
  }

  setSelectedArchiveTaskInstances(selectedArchiveTaskInstances: ArchiveTaskInstance[]) {
    this.setState({ selectedArchiveTaskInstances });
  }

  closeConfirmDialog(dialog: CONFIRM_DIALOG) {
    const { selectedArchiveTaskInstances } = this.state;
    const { resumeArchiveInstances, suspendArchiveInstances, deleteArchiveTaskInstances, resetInstanceOverdrafts } = this.props;
    return (decision: string) => {
      if (decision !== DEFAULT_DECISION.OK) {
        this.openDialogWithInstances(null, selectedArchiveTaskInstances);
        return;
      }
      switch (dialog) {
        case CONFIRM_DIALOG.resumeInstance:
          resumeArchiveInstances(selectedArchiveTaskInstances.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId));
          break;
        case CONFIRM_DIALOG.suspendInstance:
          suspendArchiveInstances(selectedArchiveTaskInstances.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId));
          break;
        case CONFIRM_DIALOG.deleteInstance:
          deleteArchiveTaskInstances(selectedArchiveTaskInstances.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId));
          break;
        case CONFIRM_DIALOG.resetOverdraft:
          resetInstanceOverdrafts(selectedArchiveTaskInstances.map(({ archiveTaskInstanceId }) => archiveTaskInstanceId));
      }
      this.openDialogWithInstances(null, []);
    };
  }

  render() {
    const { filter, archiveTaskInstanceStatus, isAdmin, tasks, isLoadingStatusesPagination, isLimitFeatureSettingEnabled } = this.props;
    const { selectedArchiveTaskInstances, confirmDialogOpen } = this.state;

    const columns = isLimitFeatureSettingEnabled ? COLUMNS : COLUMNS.filter((column) => !LIMIT_FEATURE_SETTING_COLUMNS.includes(column.field || ''));

    const filteredArchiveTaskInstanceStatuses = filter
      ? Utils.isMeetsConditionsArchiveTaskInstance(filter, archiveTaskInstanceStatus)
      : archiveTaskInstanceStatus;
    const data = filteredArchiveTaskInstanceStatuses
      .filter(({ instance }) => !!instance)
      .map(({ instance, status }) => {
        const maxDataRateBytesPerSec = instance?.maxDataRateBytesPerSec ? `${instance?.maxDataRateBytesPerSec} B/s` : '';
        const maxSizeBytes = instance?.maxSizeBytes ? `${instance?.maxSizeBytes} B` : '';
        const maxStorageTimeSec = instance?.maxStorageTimeSec ? `${instance?.maxStorageTimeSec} сек` : '';

        return {
          archiveTaskInstanceId: instance.archiveTaskInstanceId,
          project: instance.project,
          name: instance.name,
          zoneId: instance.zoneId,
          canEdit: instance.canEdit,
          statusIndexingStatus:
            status?.indexing?.status === ArchivalStatus.WITHOUT_RESPONSE ? (
              <StatusFlag title={'Статус задачи не получен. Обратитесь к администратору'} placement={'right'} fill={'red'} />
            ) : (
              (status?.indexing?.status ?? <LoaderInString style={{ top: '6px' }} />)
            ),
          memoryUsage: status?.storage
            ? `${SizeConverter.makeSizeString(SizeConverter.convertBytes(status.storage.currentSizeBytes), false)} / ${SizeConverter.makeSizeString(
                SizeConverter.convertBytes(status.storage.maxSizeBytes),
                false,
              )}`
            : '',
          maxDataRateBytesPerSec,
          maxSizeBytes,
          maxStorageTimeSec,
        };
      });

    const actions = [
      {
        icon: () => <MenuIcon color={'primary'} />,
        tooltip: 'Действия',
        isFreeAction: false,
        onClick: (event, row) => {},
        position: 'row',
      },
      {
        icon: () => <PlayArrow />,
        tooltip: 'Старт выбранных экземпляров',
        onClick: (event, rowData) => {
          event.preventDefault();
          event.stopPropagation();
          this.openDialogWithInstances(CONFIRM_DIALOG.resumeInstance, rowData);
        },
        position: 'toolbarOnSelect',
      },
      {
        icon: () => <Stop />,
        tooltip: 'Остановить выбранные экземпляры',
        onClick: (event, rowData) => {
          event.preventDefault();
          event.stopPropagation();
          this.openDialogWithInstances(CONFIRM_DIALOG.suspendInstance, rowData);
        },
        position: 'toolbarOnSelect',
      },
      isAdmin && {
        icon: () => <Avatar src={speedIcon} style={{ width: 24, height: 24 }} alt="Сбросить овердрафт" />,
        tooltip: 'Сбросить овердрафт',
        onClick: (event, rowData) => {
          event.preventDefault();
          event.stopPropagation();
          this.openDialogWithInstances(CONFIRM_DIALOG.resetOverdraft, rowData);
        },
        position: 'toolbarOnSelect',
      },
      {
        icon: () => <Delete />,
        tooltip: 'Удалить выбранные экземпляры',
        onClick: (event, rowData) => {
          event.preventDefault();
          event.stopPropagation();
          this.openDialogWithInstances(CONFIRM_DIALOG.deleteInstance, rowData);
          // this.setState({selectedRows: rowData, confirmFewDelete: true})
        },
        position: 'toolbarOnSelect',
      },
    ].filter((action) => !!action);
    return (
      <>
        <ThemeProvider theme={theme}>
          {/*@ts-ignore*/}
          <MaterialTable
            icons={tableIcons}
            options={{
              pageSize: 10,
              pageSizeOptions: [10], //, 20, 50, 100],
              padding: 'dense',
              paging: true,
              showTitle: false,
              actionsColumnIndex: -1,
              grouping: true,
              search: false,
            }}
            localization={{
              grouping: {
                placeholder: 'Перетащите сюда заголовок столбца, по которому хотите сгруппировать данные',
                groupedBy: 'Сгруппировано по ',
              },
              body: {
                emptyDataSourceMessage: 'Список экземпляров архивного индекса пуст',
              },
              header: {
                actions: '',
              },
            }}
            data={data}
            columns={Utils.getColumns(columns, this.state.groupingState)}
            actions={actions}
            components={{
              Groupbar: (props) => {
                if (props.groupColumns.length != this.state.groupingState.length) {
                  this.setState({ groupingState: props.groupColumns });
                }
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
              Action: (props) => <ActionsCell {...props} isLoadingStatusesPagination={isLoadingStatusesPagination} />,
              Header: (props) => {
                return (
                  <ThemeProvider theme={themeHeader}>
                    <MTableHeader
                      {...{
                        ...props,
                        hasSelection: true,
                      }}
                    />
                  </ThemeProvider>
                );
              },
            }}
          />
        </ThemeProvider>
        <ConfirmDialog
          warningText={`Вы уверены, что хотите запустить экземпляры ${selectedArchiveTaskInstances
            .map(({ project, name, zoneId }) => project + '/' + name + '(' + zoneId + ')')
            .join(', ')}?`}
          open={confirmDialogOpen === CONFIRM_DIALOG.resumeInstance}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.closeConfirmDialog(CONFIRM_DIALOG.resumeInstance)}
        />
        <ConfirmDialog
          warningText={`Вы уверены, что хотите остановить экземпляры ${selectedArchiveTaskInstances
            .map(({ project, name, zoneId }) => project + '/' + name + '(' + zoneId + ')')
            .join(', ')}?`}
          open={confirmDialogOpen === CONFIRM_DIALOG.suspendInstance}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.closeConfirmDialog(CONFIRM_DIALOG.suspendInstance)}
        />
        <ConfirmDialog
          warningText={`Вы уверены, что хотите удалить экземпляры ${selectedArchiveTaskInstances
            .map(({ project, name, zoneId }) => project + '/' + name + '(' + zoneId + ')')
            .join(', ')}? Их будет невозможно восстановить.`}
          open={confirmDialogOpen === CONFIRM_DIALOG.deleteInstance}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.closeConfirmDialog(CONFIRM_DIALOG.deleteInstance)}
        />
        <ConfirmDialog
          warningText={`Вы уверены, что хотите сбросить скорость обработки экземпляров ${selectedArchiveTaskInstances
            .map(({ project, name, zoneId }) => project + '/' + name + '(' + zoneId + ')')
            .join(', ')} до значений по-умолчанию?`}
          open={confirmDialogOpen === CONFIRM_DIALOG.resetOverdraft}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.closeConfirmDialog(CONFIRM_DIALOG.resetOverdraft)}
        />
      </>
    );
  }
}

export default ArchiveZoneInstancesTable;

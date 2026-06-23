import MaterialTable from '@material-table/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Delete, Publish, SaveAlt, Settings } from '@material-ui/icons';
import * as React from 'react';

import { User } from '../../store/auth/Types';
import { DictionaryQuota, ShortInfo, Dictionary } from '../../store/lookup/Types';
import { Project, EditableProject } from '../../store/project/Types';
import { Zone } from '../../store/zone/Types';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import { CellText } from '../shared/ui';
import { AddFab } from '../utils/AddFab';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { ImportFab } from '../utils/ImortFab';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import PermissionsDialog from './PermissionsDialog';
import UploadDictionaryDialog from './UploadDictionaryDialog';

export interface DictionaryOverviewProps {
  dictionaries: Dictionary[];
  projects: Project[];
  editableProjects: EditableProject[];
  zone: Zone;
  isAdmin: boolean;
  isLegacyMode: boolean;
  user: User;
  filter: FilterMenuItem[] | undefined;

  setDictionaryFilter(filter: FilterMenuItem[] | undefined): any;

  createDictionary(projectShortName: string, name: string, zone: string, data: string, successCallback, errorCallback?): any;

  getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?): any;

  getDictionaryId(projectShortName: string, name: string, zone: string, successCallback?: (id: number) => void, errorCallback?): any;

  updateDictionary(projectShortName: string, name: string, zone: string, data: string, successCallback, errorCallback?): any;

  deleteDictionary(projectShortName: string, name: string, successCallback?, errorCallback?): any;

  downloadDictionary(projectShortName: string, name: string, zone: string): any;

  fetchListDictionary(user: User, okCallback?, errorCallback?): any;

  displayError(msg: string): any;
}

export interface DictionaryOverviewStat {
  isCreateDialogOpen: boolean;
  confirmDialogOpen: boolean;
  isAddDialogOpened: boolean;
  isUpdateDialogOpen: boolean;
  isPermissionDialogOpen: boolean;
  idPermission?: number;
  editData?: any;
  rawData?: any;
  filter: FilterMenuItem[] | undefined;
}

class DictionaryOverview extends React.Component<DictionaryOverviewProps & WithNavigationProps, DictionaryOverviewStat> {
  constructor(props) {
    super(props);
    this.state = {
      isUpdateDialogOpen: false,
      isCreateDialogOpen: false,
      confirmDialogOpen: false,
      isAddDialogOpened: false,
      isPermissionDialogOpen: false,
      filter: this.props.filter,
    };

    this.handleConfirmDialogOpen = this.handleConfirmDialogOpen.bind(this);
    this.handleConfirmDialogClose = this.handleConfirmDialogClose.bind(this);
  }

  handleConfirmDialogOpen() {
    this.setState({ confirmDialogOpen: true });
  }

  handleConfirmDialogClose(value) {
    this.setState({ confirmDialogOpen: false });
    if (value === 'Ok') {
      this.props.deleteDictionary(this.state.rawData?.project, this.state.rawData?.name, this.state.rawData?.zone, () => {
        this.props.fetchListDictionary(this.props.user);
      });
    }
  }

  getDictionaryWithFilter(filter: FilterMenuItem[] | undefined, dictionaries: Dictionary[]): Dictionary[] {
    if (filter) {
      let tmpDictionaries: Dictionary[] = dictionaries;
      filter.map((filter) => {
        tmpDictionaries = Utils.isMeetsConditionsDictionary(filter, tmpDictionaries);
      });
      return tmpDictionaries;
    } else {
      return dictionaries;
    }
  }

  render() {
    const filterTextField = (
      <Grid item style={{ width: '90%', alignSelf: 'center', padding: 6 }}>
        <FilterMenu
          filter={this.props.filter}
          onChange={(data) => {
            this.setState({ filter: data.length === 0 ? undefined : data });
            this.props.setDictionaryFilter(data.length === 0 ? undefined : data);
          }}
          columns={[
            {
              name: 'Название',
              field: 'name',
              variants: Utils.getAllPossibleValues(
                this.props.dictionaries.map((dict: Dictionary) => {
                  return dict.name;
                }),
              ),
            },
            {
              name: 'Проект',
              field: 'shortName',
              variants: this.props.projects.filter((project: Project) => {
                return Utils.getAllPossibleValues(
                  this.props.dictionaries.map((dict: Dictionary) => {
                    return dict.project;
                  }),
                ).includes(project.shortName);
              }),
            },
            {
              name: 'Зона',
              field: 'zone',
              variants: this.props.zone.availableZones || [],
            },
          ]}
        />
      </Grid>
    );

    const { dictionaries, projects } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          style={{ width: '100%', marginTop: '1vw', margin: '1px' }}
          justifyContent="center"
          spacing={8}
          alignItems="center"
          direction="column"
        >
          {filterTextField}
          <div style={{ display: 'flex', width: '90%', justifyContent: 'center' }}>
            <Paper style={{ width: '100%' }}>
              <MaterialTable
                icons={tableIcons}
                columns={[
                  {
                    title: 'Имя справочника',
                    field: 'name',
                    render: (rowData) => <CellText title={rowData.name} />,
                  },
                  { title: 'Проект', field: 'project' },
                  { title: 'Зона', field: 'zone' },
                  { title: 'ShortProjectName', field: 'project', hidden: true },
                  { title: 'canEdit', field: 'canEdit', hidden: true },
                ]}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти справочник',
                  },
                  body: {
                    emptyDataSourceMessage: 'Список справочников пуст',
                    addTooltip: '',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {
                      deleteText: 'Вы уверены, что хотите удалить справочник?',
                      cancelTooltip: 'Отмена',
                      saveTooltip: 'Подтвердить',
                    },
                  },
                  header: {
                    actions: '',
                  },
                }}
                data={
                  dictionaries &&
                  this.getDictionaryWithFilter(this.state.filter, dictionaries)
                    .sort(function (a, b) {
                      if (a.name > b.name) {
                        return 1;
                      }
                      if (a.name < b.name) {
                        return -1;
                      }
                      // a должно быть равным b
                      return 0;
                    })
                    .map((dictionary: Dictionary) => {
                      const zones = dictionary.instances.map((instance) => instance.zoneId).join();
                      return {
                        name: dictionary.name,
                        projectName: dictionary.project,
                        zone: zones,
                        project: dictionary.project,
                        canEdit: dictionary.editable,
                      };
                    })
                }
                title="Список справочников"
                options={{
                  search: true,
                  pageSize: 20,
                  pageSizeOptions: [20, 50, 100],
                  emptyRowsWhenPaging: false,
                  paging: true,
                  showTitle: true,
                  actionsColumnIndex: -1,
                  header: true,
                }}
                actions={[
                  {
                    icon: () => <Settings color={'primary'} />,
                    tooltip: 'Настройки приватности',
                    hidden: !this.props.isAdmin || !this.props.isLegacyMode,
                    onClick: (event, rowData) => {
                      event.preventDefault();
                      event.stopPropagation();
                      this.props.getDictionaryId(rowData.project, rowData.name, rowData.zone, (id) => {
                        this.setState({
                          idPermission: id,
                          isPermissionDialogOpen: true,
                        });
                      });
                      // this.setState({editData: rowData as ShortInfo, isUpdateDialogOpen: true});
                    },
                  },
                  (rowData) => {
                    return {
                      icon: () => <Publish color={'primary'} />,
                      hidden: !rowData.canEdit,
                      tooltip: 'Обновить справочник через загрузку файла',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({
                          editData: rowData as ShortInfo,
                          isUpdateDialogOpen: true,
                        });
                      },
                    };
                  },
                  {
                    icon: () => <SaveAlt color={'primary'} />,
                    tooltip: 'Скачать справочник',
                    onClick: (event, rowData) => {
                      event.preventDefault();
                      event.stopPropagation();
                      this.props.downloadDictionary(rowData.project, rowData.name, rowData.zone);
                    },
                  },
                  (rowData) => {
                    return {
                      hidden: !rowData.canEdit,
                      icon: () => <Delete color={'primary'} />,
                      tooltip: 'Удалить справочник',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({ rawData: rowData });
                        this.handleConfirmDialogOpen();
                      },
                    };
                  },
                ]}
                onRowClick={(event, rowData) => {
                  if (!rowData) return;
                  this.props.navigate('/dictionary/' + rowData.name, {
                    state: {
                      detail: rowData.project,
                      zone: rowData.zone,
                    },
                  });
                }}
              />
            </Paper>
          </div>
        </Grid>
        {this.props.editableProjects.length > 0 && (
          <ImportFab
            title={'Импортировать справочник из файла'}
            onClick={() => {
              this.setState({ isAddDialogOpened: true });
            }}
          />
        )}
        {this.props.editableProjects.length > 0 && (
          <AddFab
            title={'Создать справочник с помощью таблицы'}
            onClick={() => {
              this.props.navigate('/dictionary/new');
            }}
          />
        )}

        {this.state.isPermissionDialogOpen && (
          <PermissionsDialog
            close={() => {
              this.setState({ isPermissionDialogOpen: false });
            }}
            id={this.state.idPermission}
            isAdmin={this.props.isAdmin}
          />
        )}
        {this.state.isAddDialogOpened && (
          <UploadDictionaryDialog
            isUpdate={false}
            close={() => {
              this.setState({ isAddDialogOpened: false });
            }}
            getDictionaryQuota={this.props.getDictionaryQuota}
            displayError={this.props.displayError}
            changeInfo={(projectName, name, zone, files) => {
              const fileReader = new FileReader();
              fileReader.readAsText(files[0]);
              fileReader.onload = () => {
                if (fileReader.result != null) {
                  const data = fileReader.result.toString();
                  this.props.createDictionary(projectName, name, zone, data, () => {
                    this.props.fetchListDictionary(this.props.user);
                  });
                }
              };
              this.setState({ isAddDialogOpened: false });
            }}
            projects={projects}
            zones={this.props.zone.availableZones || []}
          />
        )}
        {this.state.isUpdateDialogOpen && (
          <UploadDictionaryDialog
            isUpdate={true}
            projectName={this.state.editData?.project}
            name={this.state.editData?.name}
            zone={this.state.editData?.zone}
            getDictionaryQuota={this.props.getDictionaryQuota}
            close={() => {
              this.setState({ isUpdateDialogOpen: false });
            }}
            displayError={this.props.displayError}
            changeInfo={(projectName, name, zone, files) => {
              const fileReader = new FileReader();
              fileReader.readAsText(files[0]);
              fileReader.onload = () => {
                if (fileReader.result != null) {
                  const data = fileReader.result.toString();
                  this.props.updateDictionary(projectName, name, zone, data, () => {
                    this.props.fetchListDictionary(this.props.user);
                  });
                }
              };
              this.setState({ isUpdateDialogOpen: false });
            }}
            projects={this.props.projects.filter((project) => project.hasRole || this.props.isAdmin)}
            zones={this.props.zone.availableZones || []}
          />
        )}
        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить справочник ' +
            this.state.rawData?.project +
            '/' +
            this.state.rawData?.name +
            '? ' +
            'Его будет невозможно восстановить.'
          }
          open={this.state.confirmDialogOpen}
          okString={'Подтвердить'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(DictionaryOverview);

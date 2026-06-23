import MaterialTable, { Column, MTableAction, MTableBodyRow, MTableGroupbar, MTableHeader } from '@material-table/core';
import { createTheme, IconButton, TablePagination, ThemeProvider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Delete, Refresh, Settings, Visibility } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import { computeSizeDisplayValue } from '@src/utils/sizeUnits';
import { computeSpeedDisplayValue } from '@src/utils/speedUnits';
import { computeTimeDisplayValue } from '@src/utils/timeUnits';
import * as React from 'react';
import { connect } from 'react-redux';

import KafkaCreateDialogContainer from '../../containers/kafka/KafkaCreateDialogContainer';
import KafkaAddRecordDialogContainer from '../../containers/kafka/viewer/KafkaAddRecordDialogContainer';
import { ApplicationState } from '../../store/Store';
import { User } from '../../store/auth/Types';
import { Cluster } from '../../store/clusters/Types';
import * as featureSettingsSelectors from '../../store/featureSettings/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { CellText } from '../shared/ui';
import { AddFab } from '../utils/AddFab';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { Loader } from '../utils/Loader';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

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

enum MENU_TYPE {
  delete,
  add,
}

export interface KafkaOverviewProps {
  topics: Array<KafkaTopic>;
  isLoading: boolean;
  filter: FilterMenuItem[] | undefined;
  projects: Array<Project>;
  clusters: Cluster[];
  isAdmin: boolean;
  user?: User;
  enabledLimits: boolean;
  editableProjects: EditableProject[];
}

export interface KafkaOverviewDispatchProps {
  fetchTopics: () => void;
  fetchClusters: () => void;
  fetchUserProjects: () => void;
  handleDeleteClick: (topicId: number, okCallback?, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => void;
  setKafkaFilter: (filter: FilterMenuItem[] | undefined) => void;
}

interface TopicsFormState {
  isCreateDialogOpen: boolean;
  confirmDialogOpen: boolean;
  confirmAllDeleteDialogOpen: boolean;
  rawData: any;
  waitForDeletion: boolean;
  deletionComplete: boolean;
  successDeletion: boolean;
  isSingleDeletion: boolean;
  errorMessage: any;
  detailMessage?: any;
  addTopic: number;
  selectedRows: any[];
  isAddDialogOpened: boolean;
  filter: FilterMenuItem[] | undefined;
  groupingState: any[];
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
          onClick={(e) => {
            props.onClose(MENU_TYPE.add, props.data.idT);
            handleClose();
          }}
        >
          Добавить сообщение
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            props.onClose(MENU_TYPE.delete, props.data);
            handleClose();
          }}
        >
          <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
        </MenuItem>
      </Menu>
    </>
  );
};

class KafkaOverview extends React.Component<KafkaOverviewProps & KafkaOverviewDispatchProps & WithNavigationProps, TopicsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      isCreateDialogOpen: false,
      confirmDialogOpen: false,
      confirmAllDeleteDialogOpen: false,
      rawData: { idT: -1 },
      addTopic: -3,
      deletionComplete: false,
      isSingleDeletion: true,
      successDeletion: false,
      errorMessage: '',
      waitForDeletion: false,
      selectedRows: [],
      isAddDialogOpened: false,
      filter: this.props.filter,
      groupingState: [],
    };
    this.handleConfirmDialogOpen = this.handleConfirmDialogOpen.bind(this);
    this.handleConfirmDialogClose = this.handleConfirmDialogClose.bind(this);
    this.handleConfirmAllDeleteDialogClose = this.handleConfirmAllDeleteDialogClose.bind(this);
    this.onCloseMenu = this.onCloseMenu.bind(this);
    this.deleteTopicsById = this.deleteTopicsById.bind(this);
  }

  handleConfirmDialogOpen() {
    this.setState({ confirmDialogOpen: true });
  }

  handleConfirmDialogClose(value) {
    this.setState({ confirmDialogOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: true,
        waitForDeletion: true,
        deletionComplete: false,
        successDeletion: false,
      });
      this.props.handleDeleteClick(
        this.state.rawData.idT,
        () => {
          this.setState({
            deletionComplete: true,
            successDeletion: true,
          });
        },
        (error: { message: string; details?: string }) => {
          this.setState({
            deletionComplete: true,
            successDeletion: false,
            errorMessage: 'При удалении источника данных произошла ошибка: \n' + error.message + '\n Попробуйте удалить топик вручную',
            detailMessage: error.details,
          });
        },
      );
    }
  }

  handleConfirmAllDeleteDialogClose(value) {
    this.setState({ confirmAllDeleteDialogOpen: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: false,
        waitForDeletion: true,
        deletionComplete: false,
        successDeletion: false,
      });
      if (this.state.selectedRows.length > 0) {
        const result = {
          success: [],
          errors: [],
        };
        this.deleteTopicsById(this.state.selectedRows, result);
        this.setState({ selectedRows: [] });
      }
    }
  }

  deleteTopicsById(topics: any[], result: any) {
    this.props.handleDeleteClick(
      topics[0].idT,
      () => {
        result.success.push(topics[0].idT);
        topics.splice(0, 1);
        if (topics.length === 0) {
          if (result.errors.length > 0) {
            const errorString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>Произошла ошибка при удалении источника(-ов) данных</b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error) => {
                    return <div>{error.row.project + '/' + error.row.name + ' (' + error.row.clusterId + '): ' + error.errorMsg.message + ''}</div>;
                  })}
                </Typography>
              </React.Fragment>
            );
            const detailString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    return (
                      <React.Fragment>
                        <div>
                          <b>{error.row.project + '/' + error.row.name + ' (' + error.row.clusterId + '): '}</b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  })}
                </Typography>
              </React.Fragment>
            );
            this.setState({
              deletionComplete: true,
              successDeletion: false,
              errorMessage: errorString,
              detailMessage: detailString,
            });
          } else {
            this.setState({
              deletionComplete: true,
              successDeletion: true,
            });
          }
          return result;
        } else {
          return this.deleteTopicsById(topics, result);
        }
      },
      (error) => {
        result.errors.push({ row: topics[0], errorMsg: error });
        topics.splice(0, 1);
        if (topics.length === 0) {
          const errorString = (
            <React.Fragment>
              <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                <b>Произошла ошибка при удалении источника(-ов) данных</b>
              </Typography>
              <Typography variant="subtitle1">
                {result.errors.map((error: any) => {
                  return (
                    <div key={error.row.project + '/' + error.row.name + ' (' + error.row.clusterId + '): ' + error.errorMsg.message + ''}>
                      {error.row.project + '/' + error.row.name + ' (' + error.row.clusterId + '): ' + error.errorMsg.message + ''}
                    </div>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          const detailString = (
            <React.Fragment>
              <Typography variant="body2" color={'error'}>
                {result.errors.map((currentError: any) => {
                  return (
                    <React.Fragment key={currentError.row.project + '/' + currentError.row.name + ' (' + currentError.row.clusterId + '): '}>
                      <div>
                        <b>{currentError.row.project + '/' + currentError.row.name + ' (' + currentError.row.clusterId + '): '}</b>
                      </div>
                      <div>{currentError.errorMsg.details}</div>
                    </React.Fragment>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          this.setState({
            deletionComplete: true,
            successDeletion: false,
            errorMessage: errorString,
            detailMessage: detailString,
          });
          return result;
        } else {
          return this.deleteTopicsById(topics, result);
        }
      },
    );
  }

  onCloseMenu(type: MENU_TYPE, id: number) {
    switch (type) {
      case MENU_TYPE.add:
        this.setState({ isAddDialogOpened: true, addTopic: id });
        break;
      case MENU_TYPE.delete:
        this.setState({ rawData: id });
        this.handleConfirmDialogOpen();
        break;
    }
  }

  getTopicsWithFilter(filter: FilterMenuItem[] | undefined, topics: KafkaTopic[]): KafkaTopic[] {
    if (filter) {
      let tmpTopics: KafkaTopic[] = topics;
      filter.map((f) => {
        tmpTopics = Utils.isMeetsConditionsKafka(f, tmpTopics);
      });
      return tmpTopics;
    } else {
      return topics;
    }
  }

  componentDidMount(): void {
    this.props.fetchUserProjects();
    this.props.fetchTopics();
    this.props.fetchClusters();
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }

    const { topics, enabledLimits } = this.props;

    const listOfProjects: Project[] = [];
    const listOfTopicNames: string[] = [];
    const listOfTopicFullNames: string[] = [];
    const listOfTopics = topics.map((topic: KafkaTopic, index: number) => {
      const project = this.props.projects.find((currentProject: Project) => {
        if (topic.projectId === currentProject.id) {
          listOfProjects.push(currentProject);
          return currentProject;
        }
        return false;
      });
      listOfTopicNames.push(topic.name);
      listOfTopicFullNames.push(topic.topicFullName);
      return {
        ...topic,
        idT: topic.id,
        id: index,
        replications: topic.replication,
        clusterId: this.props.clusters?.find((cluster) => Number(cluster.id) === topic.clusterId)?.name ?? topic.clusterId,
        project: project?.name,
        projectShortName: project?.shortName,
      };
    });
    // Наличие проектов говорит о том, что можно создавать или редактировать
    const hasProjects = this.props.projects.length > 0;

    return (
      <>
        <div style={{ display: 'flex', direction: 'row' as any, marginTop: 6 }}>
          <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
            Список топиков
          </Typography>
        </div>
        {(this.props.isAdmin || hasProjects) && (
          <AddFab
            title={'Создать источник данных'}
            onClick={() => {
              this.setState({
                isCreateDialogOpen: true,
              });
            }}
          />
        )}
        {this.state.isAddDialogOpened && (
          <KafkaAddRecordDialogContainer
            isOpen={this.state.isAddDialogOpened}
            onAddDialogClose={() => {
              this.setState({
                isAddDialogOpened: false,
              });
            }}
            onAddCreateSuccess={() => {
              this.setState({
                isAddDialogOpened: false,
              });
            }}
            continueAdd={(isContinue) => {
              this.setState({
                isAddDialogOpened: isContinue,
              });
            }}
            topicId={this.state.addTopic}
          />
        )}
        <KafkaCreateDialogContainer
          isOpen={this.state.isCreateDialogOpen}
          onDialogClose={() => {
            this.setState({
              isCreateDialogOpen: false,
            });
          }}
          editableProjects={this.props.editableProjects}
          onCreateSuccess={() => {
            this.setState({
              isCreateDialogOpen: false,
            });
            this.props.fetchTopics();
          }}
        />
        <Grid
          container
          style={{ width: '100%', marginTop: '1vw', margin: '1px' }}
          justifyContent="center"
          spacing={8}
          alignItems="center"
          direction="column"
        >
          <Grid
            style={{
              width: '90%',
              alignSelf: 'center',
              padding: 6,
              marginTop: -6,
            }}
            container
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Grid item style={{ width: 'calc(100% - 54px)' }}>
              <FilterMenu
                filter={this.props.filter}
                onChange={(data) => {
                  this.setState({
                    filter: data.length === 0 ? undefined : data,
                  });
                  this.props.setKafkaFilter(data.length === 0 ? undefined : data);
                }}
                columns={[
                  {
                    name: 'Имя источника данных',
                    field: 'name',
                    variants: listOfTopicNames,
                  },
                  {
                    name: 'Имя топика Kafka',
                    field: 'topicFullName',
                    variants: listOfTopicFullNames,
                  },
                  {
                    name: 'Проект',
                    field: 'id',
                    variants: Utils.getAllPossibleValues(listOfProjects),
                  },
                  {
                    name: 'Количество партиций',
                    field: 'partitions',
                    variants: ['≤2', '≤5', '≥2', '≥5'],
                  },
                  {
                    name: 'Количество реплик',
                    field: 'replication',
                    variants: ['1', '2', '>2'],
                  },
                  ...(enabledLimits
                    ? [
                        {
                          name: 'Макс. скорость записи',
                          field: 'plannedRate',
                        },
                        {
                          name: 'Макс. объем хранилища',
                          field: 'plannedVolume',
                        },
                        {
                          name: 'Макс. время хранения данных',
                          field: 'plannedRetentionTime',
                        },
                        {
                          name: 'Ротация',
                          field: 'retentionType',
                        },
                      ]
                    : []),
                ]}
              />
            </Grid>
            <Grid item style={{ width: '48px', marginTop: 6 }}>
              <IconButton
                onClick={() => {
                  this.props.fetchTopics();
                }}
              >
                <Refresh id={'refreshButton'} color={'primary'} />
              </IconButton>
            </Grid>
          </Grid>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Paper style={{ width: '100%' }}>
              <ThemeProvider theme={theme}>
                <MaterialTable
                  icons={tableIcons}
                  columns={Utils.getColumns(
                    [
                      {
                        title: 'Имя источника данных',
                        field: 'name',
                        render: (rowData) => <CellText title={rowData.name} />,
                        cellStyle: {
                          paddingTop: '10px',
                        },
                        width: '250px',
                        grouping: false,
                      },
                      {
                        title: 'Имя топика Kafka',
                        field: 'topicFullName',
                        render: (rowData) => <CellText title={rowData.topicFullName} />,
                        grouping: false,
                        width: '250px',
                      },
                      {
                        title: 'Ключ проекта',
                        field: 'projectShortName',
                      },
                      {
                        title: 'Имя кластера',
                        field: 'clusterId',
                        render: (rowData) => <CellText title={rowData.clusterId} />,
                      },
                      {
                        title: 'Количество партиций',
                        field: 'partitions',
                        type: 'numeric',
                        grouping: false,
                      },
                      {
                        title: 'Количество реплик',
                        field: 'replications',
                        type: 'numeric',
                        grouping: false,
                      },
                      ...(enabledLimits
                        ? ([
                            {
                              title: 'Макс. скорость записи',
                              field: 'plannedRate',
                              render: (rowData) => (
                                <CellText title={rowData.plannedRate ? computeSpeedDisplayValue(rowData.plannedRate, 2).formatted : ''} />
                              ),
                            },
                            {
                              title: 'Макс. объем хранилища',
                              field: 'plannedVolume',
                              render: (rowData) => (
                                <CellText title={rowData.plannedVolume ? computeSizeDisplayValue(rowData.plannedVolume, 2).formatted : ''} />
                              ),
                            },
                            {
                              title: 'Макс. время хранения данных',
                              field: 'plannedRetentionTime',
                              render: (rowData) => (
                                <CellText
                                  title={rowData.plannedRetentionTime ? computeTimeDisplayValue(rowData.plannedRetentionTime, 2).formatted : ''}
                                />
                              ),
                            },
                            {
                              title: 'Ротация',
                              field: 'retentionType',
                              render: (rowData) => {
                                const retentionType = rowData.retentionType || 'BY_TIME';
                                let title = '';
                                if (retentionType === 'BY_TIME' && rowData.plannedRetentionTime) {
                                  title = `По времени`;
                                } else if (retentionType === 'BY_SIZE' && rowData.plannedVolume) {
                                  title = `По объему`;
                                } else if (retentionType === 'BY_TIME_AND_SIZE' && rowData.plannedVolume && rowData.plannedRetentionTime) {
                                  title = 'По времени и объему';
                                }
                                return <CellText title={title} />;
                              },
                            },
                          ] as Column<any>[])
                        : []),
                    ],
                    this.state.groupingState,
                  )}
                  localization={{
                    toolbar: {
                      searchTooltip: 'Поиск',
                      searchPlaceholder: 'Поиск',
                      nRowsSelected: '{0} строк(-и) выбрано',
                    },
                    body: {
                      emptyDataSourceMessage: 'Список топиков пуст',
                      addTooltip: '',
                      deleteTooltip: 'Удалить',
                      editTooltip: 'Редактировать',
                      editRow: {
                        deleteText: 'Вы уверены, что хотите удалить топик?',
                        cancelTooltip: 'Отмена',
                        saveTooltip: 'Подтвердить',
                      },
                    },
                    grouping: {
                      placeholder: 'Перетащите сюда заголовок столбца "Ключ проекта", для группировки по проектам',
                      groupedBy: 'Сгруппировано по ',
                    },
                    header: {
                      actions: '',
                    },
                  }}
                  data={topics && this.getTopicsWithFilter(this.state.filter, listOfTopics)}
                  title="Список топиков"
                  options={{
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    emptyRowsWhenPaging: false,
                    padding: 'dense',
                    search: true,
                    paging: true,
                    tableLayout: 'fixed',
                    showTitle: true,
                    header: true,
                    actionsColumnIndex: -1,
                    grouping: true,
                  }}
                  actions={[
                    {
                      icon: () => <Visibility color={'primary'} />,
                      tooltip: 'Просмотр',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.props.navigate('/kafka/viewer/' + rowData.idT);
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Settings color={'primary'} />,
                      tooltip: 'Конфигурация топика',
                      onClick: (event, rowData: KafkaTopic) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.props.navigate('/kafka/topics/' + rowData.name + '/' + rowData.projectShortName);
                      },
                      position: 'row',
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
                        // this.props.history.push("/kafka/topics/" + rowData.name + "&" + rowData.project)
                      },
                      position: 'toolbarOnSelect',
                    },
                    {
                      icon: () => <MenuIcon color={'primary'} />,
                      tooltip: 'Действия',
                      isFreeAction: false,
                      onClick: (event, row) => {},
                      position: 'row',
                    },
                  ]}
                  components={{
                    Pagination: TablePagination,
                    Row: (props) => (
                      <MTableBodyRow
                        {...{
                          ...props,
                          options: {
                            ...props.options,
                            selection: true,
                          },
                        }}
                        onDoubleClick={(e) => {
                          this.props.navigate('/kafka/viewer/' + props.data.idT);
                        }}
                      />
                    ),
                    Groupbar: (props) => {
                      if (props.groupColumns.length != this.state.groupingState.length) {
                        this.setState({ groupingState: props.groupColumns });
                      }
                      return <MTableGroupbar {...props} />;
                    },
                    Action: (props) => {
                      if (props.action.tooltip === 'Действия') {
                        return (
                          <div>
                            <ButtonMenu {...props} onClose={this.onCloseMenu} />
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
                />
              </ThemeProvider>
            </Paper>
          </div>
        </Grid>
        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить топик ' + this.state.rawData.topicFullName + '?'}
          open={this.state.confirmDialogOpen}
          okString={'Подтвердить'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogClose}
        />
        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить топики ' + this.state.selectedRows.map((row) => row.topicFullName).join(', ') + '?'}
          open={this.state.confirmAllDeleteDialogOpen}
          okString={'Подтвердить'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmAllDeleteDialogClose}
        />

        <WaitingDialog
          title={this.state.isSingleDeletion ? 'Удаление источника данных' : 'Удаление источников данных'}
          open={this.state.waitForDeletion}
          onClose={() => {
            this.setState({
              waitForDeletion: false,
            });
            this.props.fetchTopics();
          }}
          complete={this.state.deletionComplete}
          success={this.state.successDeletion}
          successMessage={this.state.isSingleDeletion ? 'Источник данных удален.' : 'Источники данных успешно удалены.'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />
      </>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    enabledLimits: featureSettingsSelectors.getEnableFeatureSettingLimits(state),
  };
}

export default connect(mapStateToProps, null)(withNavigation(KafkaOverview));

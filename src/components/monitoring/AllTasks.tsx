import { Grid, InputAdornment, Paper, TextField, Typography, Divider, TablePagination } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import * as React from 'react';
import { Link } from 'react-router';

import AddBlockDialogContainer from '../../containers/constraint/AddBlockDialogContainer';
import AddMonitoringLabelsDialog from '../../containers/monitoring/AddMonitoringLabelsDialog';
import { AuthType, User } from '../../store/auth/Types';
import { AnalyticConstraint, ArchiveConstraint, FulltextConstraint, ConstraintType } from '../../store/constraint/Types';
import { Group } from '../../store/group/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import { DruidSupervisorInfo, GranularitySpec, TaskData, TaskDataPrevious } from '../../store/monitoring/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { Unit } from '../../store/role/Types';
import WaitingDialog from '../WaitingDialog';
import ConstraintEditDialog from '../constraint/ConstraintEditDialog';
import { AddFab } from '../utils/AddFab';
import { ImportFileFab } from '../utils/ImportFileFab';

import SupervisorCard from './SupervisorCard';

export interface AllTasksProps {
  isAdmin: boolean;
  authType: AuthType;
  zones: string[];
  projects: Project[];
  topics: KafkaTopic[];
  supervisors: Array<DruidSupervisorInfo>;
  globalConfigurationVersion: Map<string, string>;
  editableProjects: EditableProject[];

  refetchSupervisors: () => void;
  refetchAllLabels: () => void;

  downloadConfig: (id: number) => void;
  importConfig: (task: TaskData) => void;
  openConfig: (id: number) => void;
  deleteConfig: (id: number, okCallback?, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => void;

  addSupervisorInstanceById: (
    taskId: number,
    zoneId: string,
    okCallback?,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteSupervisorInstanceById: (
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

  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => void;
  refreshSupervisor: (id: number) => void;
  updateConstraintOnObject: (
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  blockSubjectOnObject: (
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    description: string,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;

  displayError: (error: string) => void;
  displaySuccess: (success: string) => void;
}

export interface AllTasksState {
  nameFilter?: string;
  constraintDialogOpen: boolean;
  currentConstraint?: ArchiveConstraint | AnalyticConstraint | FulltextConstraint;
  constraintTitle?: any;
  blockedObject?: DruidSupervisorInfo;
  isBlockUserDialogOpen: boolean;
  blockTitle?: any;
  blockIndexProjectName?: string;
  blockIndexName?: string;
  constraintObject?: any;
  isLabelDialogOpen: boolean;
  labelRefetch: boolean;
  labelProjectName?: string;
  labelProjectId?: number;
  labelName?: string;
  labelId?: number;
  labelCanEdit?: boolean;

  waitForConfigDeletion: boolean;
  completeConfigDeletion: boolean;
  successConfigDeletion: boolean;

  waitForInstanceAdd: boolean;
  completeInstanceAdd: boolean;
  successInstanceAdd: boolean;

  waitForInstanceUpdate: boolean;
  completeInstanceUpdate: boolean;
  successInstanceUpdate: boolean;

  errorMessage: string;
  detailMessage?: string;

  rowsPerPage: number;
  page: number;
}

export default class AllTasks extends React.Component<AllTasksProps, AllTasksState> {
  constructor(props: AllTasksProps) {
    super(props);
    this.state = {
      isLabelDialogOpen: false,
      isBlockUserDialogOpen: false,
      constraintDialogOpen: false,
      labelRefetch: false,
      waitForConfigDeletion: false,
      waitForInstanceUpdate: false,
      waitForInstanceAdd: false,
      successConfigDeletion: false,
      successInstanceUpdate: false,
      successInstanceAdd: false,
      completeConfigDeletion: false,
      completeInstanceUpdate: false,
      completeInstanceAdd: false,
      errorMessage: '',
      rowsPerPage: 10,
      page: 0,
    };
  }

  handleChangePage = (event, value) => {
    this.setState({ page: value });
  };

  handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
    this.setState({ page: 0 });
  };

  render() {
    const filterTextField = (
      <Grid container style={{ width: '100%' }} justifyContent="center" alignItems="center" direction="row">
        <Grid item style={{ width: '100%', paddingBottom: 6 }}>
          <Paper elevation={1}>
            <Grid container direction={'row'}>
              <Grid
                item
                style={{
                  width: '45%',
                  paddingTop: 16,
                  paddingLeft: 16,
                  paddingBottom: 8,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Список конфигураций аналитических индексов
                </Typography>
              </Grid>
              <Grid
                item
                style={{
                  width: '55%',
                  paddingTop: 16,
                  paddingRight: 8,
                  paddingLeft: 8,
                  paddingBottom: 8,
                }}
              >
                <TextField
                  label="Поиск"
                  size="small"
                  variant="outlined"
                  value={this.state.nameFilter}
                  fullWidth
                  onChange={(ev) => {
                    this.setState({ nameFilter: ev.target.value, page: 0 });
                  }}
                  style={{
                    marginBottom: 10,
                    backgroundColor: 'white',
                    width: '100%',
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color={'primary'} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );

    const canCreate = this.props.editableProjects.length > 0;

    return (
      <React.Fragment>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container style={{ width: '100%', marginBottom: 128 }} justifyContent="center" alignItems="center" direction="column">
            {filterTextField}
            {this.props.supervisors
              .filter((supervisor) =>
                this.state.nameFilter ? supervisor.info.datasource.toLowerCase().includes(this.state.nameFilter.toLowerCase()) : true,
              )
              .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
              .map((supervisorInfo: DruidSupervisorInfo) => {
                const canEdit = this.props.isAdmin || supervisorInfo.info.canEdit;
                let nameProject = '';
                let nameTopic = '';
                {
                  this.props.projects.map((project) => {
                    if (project.id === supervisorInfo.info.projectId) {
                      nameProject = project.shortName;
                    }
                  });
                }
                {
                  this.props.topics.map((topic) => {
                    if (topic.id === supervisorInfo.info.topicId) {
                      nameTopic = topic.name;
                    }
                  });
                }
                return (
                  <Grid
                    key={supervisorInfo.info.id + supervisorInfo.info.datasourceFullName}
                    container
                    style={{ width: '100%', margin: '1px' }}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                  >
                    <Grid item key={supervisorInfo.info.datasourceFullName} style={{ width: '100%', paddingBottom: 6 }}>
                      <SupervisorCard
                        globalConfigurationVersion={this.props.globalConfigurationVersion}
                        displayError={this.props.displayError}
                        zones={this.props.zones}
                        isAdmin={this.props.isAdmin}
                        authType={this.props.authType}
                        index_task={supervisorInfo}
                        project={nameProject}
                        topic={nameTopic}
                        onBlock={(projectShortName, name, task) => {
                          this.setState({
                            isBlockUserDialogOpen: true,
                            blockedObject: task,
                            blockIndexProjectName: projectShortName,
                            blockIndexName: name,
                            blockTitle: (
                              <React.Fragment>
                                Блокировки на индекс{' '}
                                <b>
                                  {projectShortName}/{name}
                                </b>
                              </React.Fragment>
                            ),
                          });
                        }}
                        downloadSupervisorConfig={() => this.props.downloadConfig(supervisorInfo.info.id)}
                        canEdit={canEdit}
                        refreshSupervisor={this.props.refreshSupervisor}
                        addSupervisorInstanceById={(id, zone) => {
                          this.setState({
                            waitForInstanceAdd: true,
                            completeInstanceAdd: false,
                            successInstanceAdd: false,
                          });
                          this.props.addSupervisorInstanceById(
                            id,
                            zone,
                            () => {
                              this.setState({
                                completeInstanceAdd: true,
                                successInstanceAdd: true,
                              });
                            },
                            (error) => {
                              this.setState({
                                completeInstanceAdd: true,
                                successInstanceAdd: false,
                                errorMessage: 'Произошла ошибка при добавлении экземпляра: ' + error.message.message,
                                detailMessage: error.details,
                              });
                            },
                          );
                        }}
                        startSupervisorInstance={this.props.startSupervisorInstance}
                        deleteSupervisorInstanceById={this.props.deleteSupervisorInstanceById}
                        stopSupervisorInstance={this.props.stopSupervisorInstance}
                        resetSupervisorInstance={this.props.resetSupervisorInstance}
                        updateSupervisorInstanceById={(id, zone) => {
                          this.setState({
                            waitForInstanceUpdate: true,
                            completeInstanceUpdate: false,
                            successInstanceUpdate: false,
                          });
                          this.props.updateSupervisorInstanceById(
                            id,
                            zone,
                            () => {
                              this.setState({
                                completeInstanceUpdate: true,
                                successInstanceUpdate: true,
                              });
                            },
                            (error) => {
                              this.setState({
                                completeInstanceUpdate: true,
                                successInstanceUpdate: false,
                                errorMessage: 'При обновлении экземпляра произошла ошибка: ' + error.message,
                                detailMessage: error.details,
                              });
                            },
                          );
                        }}
                        openSupervisor={() => this.props.openConfig(supervisorInfo.info.id)}
                        deleteConfig={() => {
                          this.setState({
                            waitForConfigDeletion: true,
                            successConfigDeletion: false,
                            completeConfigDeletion: false,
                          });
                          this.props.deleteConfig(
                            supervisorInfo.info.id,
                            () => {
                              this.setState({
                                completeConfigDeletion: true,
                                successConfigDeletion: true,
                              });
                            },
                            (error) => {
                              this.setState({
                                completeConfigDeletion: true,
                                successConfigDeletion: false,
                                errorMessage: 'Произошла ошибка при удалении конфигурации: ' + error.message,
                                detailMessage: error.details,
                              });
                            },
                          );
                        }}
                        onLabels={(taskId, projectName, name, projectId) => {
                          this.setState({
                            isLabelDialogOpen: true,
                            labelId: taskId,
                            labelName: name,
                            labelProjectName: projectName,
                            labelProjectId: projectId,
                            labelCanEdit: canEdit,
                          });
                        }}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            <Divider />
            {this.props.supervisors.filter((supervisor) =>
              this.state.nameFilter ? supervisor.info.datasource.toLowerCase().includes(this.state.nameFilter.toLowerCase()) : true,
            ).length > 10 ? (
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={
                  this.props.supervisors.filter((supervisor) =>
                    this.state.nameFilter ? supervisor.info.datasource.toLowerCase().includes(this.state.nameFilter.toLowerCase()) : true,
                  ).length
                }
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                onPageChange={this.handleChangePage}
                onRowsPerPageChange={this.handleChangeRowsPerPage}
              />
            ) : (
              <></>
            )}
          </Grid>
        </div>

        {this.state.isLabelDialogOpen && (
          <AddMonitoringLabelsDialog
            close={() => {
              this.setState({
                isLabelDialogOpen: false,
                labelProjectName: undefined,
                labelName: undefined,
                labelId: undefined,
                labelProjectId: undefined,
                labelCanEdit: false,
              });
              if (this.state.labelRefetch) {
                this.props.refetchSupervisors();
                this.props.refetchAllLabels();
                this.setState({ labelRefetch: false });
              }
            }}
            refetch={() => {
              this.setState({ labelRefetch: true });
            }}
            projectShortName={this.state.labelProjectName}
            name={this.state.labelName}
            canEdit={this.state.labelCanEdit}
            projectId={this.state.labelProjectId}
            id={this.state.labelId}
          />
        )}

        {this.state.constraintDialogOpen && (
          <ConstraintEditDialog
            displayError={this.props.displayError}
            onPatch={(type, patch, constraintResult) => {
              this.props.updateConstraintOnObject(
                this.state.constraintObject.objectId,
                type,
                patch,
                () => {
                  this.setState({ currentConstraint: constraintResult });
                },
                (error) => {
                  this.props.displayError(error);
                },
              );
            }}
            close={() => {
              this.setState({
                constraintDialogOpen: false,
                currentConstraint: undefined,
                constraintTitle: undefined,
                constraintObject: undefined,
              });
            }}
            type={ConstraintType.analytic}
            title={this.state.constraintTitle}
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
            analyticTasks={this.props.supervisors}
            type={ConstraintType.analytic}
            object={this.state.blockedObject}
            analyticTask={this.state.blockedObject}
            isEdit={true}
          />
        )}

        <WaitingDialog
          customFormat={true}
          title={'Обновление экземпляра'}
          open={this.state.waitForInstanceUpdate}
          onClose={() => {
            this.setState({ waitForInstanceUpdate: false, errorMessage: '' });
            if (this.state.successInstanceUpdate) {
              this.props.refetchSupervisors();
            }
          }}
          complete={this.state.completeInstanceUpdate}
          success={this.state.successInstanceUpdate}
          successMessage={'Экземпляр успешно обновлен'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />

        <WaitingDialog
          customFormat={true}
          title={'Добавление экземпляра'}
          open={this.state.waitForInstanceAdd}
          onClose={() => {
            this.setState({ waitForInstanceAdd: false, errorMessage: '' });
            if (this.state.successInstanceAdd) {
              this.props.refetchSupervisors();
            }
          }}
          complete={this.state.completeInstanceAdd}
          success={this.state.successInstanceAdd}
          successMessage={'Экземпляр успешно добавлен'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />

        <WaitingDialog
          customFormat={true}
          title={'Удаление конфигурации'}
          open={this.state.waitForConfigDeletion}
          onClose={() => {
            this.setState({ waitForConfigDeletion: false, errorMessage: '' });
          }}
          complete={this.state.completeConfigDeletion}
          success={this.state.successConfigDeletion}
          successMessage={'Конфигурация успешно удалена'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />

        {canCreate && <AddFab title={'Создать аналитический индекс'} component={Link} {...({ to: '/monitoring/task/new' } as any)} />}

        {canCreate && (
          <ImportFileFab
            title={'Импортировать аналитический индекс из файла (в формате .json)'}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const handleError = (message: string) => {
                this.props.displayError(message);
                event.target.value = '';
              };

              if (!file.name.endsWith('.json')) {
                handleError('Ошибка: Пожалуйста, выберите файл в формате .json');
                return;
              }

              const fileReader = new FileReader();
              fileReader.readAsText(file);

              fileReader.onload = () => {
                const result = fileReader.result;
                if (typeof result !== 'string') return;

                try {
                  const data = JSON.parse(result);
                  if (Array.isArray(data)) {
                    throw new Error();
                  }
                  if (!data.granularitySpec) {
                    data.granularitySpec = {
                      queryGranularity: data.queryGranularity,
                      rollup: data.rollup,
                      type: 'uniform',
                      segmentGranularity: 'HOUR',
                    };
                  }

                  this.props.importConfig(data);
                } catch (e) {
                  handleError('Ошибка при чтении JSON: некорректный формат данных внутри файла.');
                }
              };
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

import { Grid, Divider } from '@material-ui/core';
import { debounce, DebouncedFunc } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import WaitingDialog from '../../components/WaitingDialog';
import ConstraintEditDialog from '../../components/constraint/ConstraintEditDialog';
import { AddFab } from '../../components/utils/AddFab';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ImportFileFab } from '../../components/utils/ImportFileFab';
import { Loader } from '../../components/utils/Loader';
import ResetOverdraftDialog from '../../components/utils/ResetOverdraftDialog';
import { StyledTab, StyledTabs } from '../../components/utils/StyledTabs';
import { withNavigation, WithNavigationProps } from '../../components/utils/withNavigation';
import ArchiveOverdraftDialog from '../../containers/archive/ArchiveOverdraftDialog';
import * as archiveActions from '../../store/archive/Actions';
import { ShortArchiveTaskWithRole } from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchiveTask, ArchiveTaskDelete, ArchiveTaskInstanceStatus, ArchiveTaskRequestStatus } from '../../store/archive/Types';
import * as authSelectors from '../../store/auth/Reducer';
import { AuthType, User } from '../../store/auth/Types';
import * as constraintActions from '../../store/constraint/Actions';
import { AnalyticConstraint, ArchiveConstraint, ConstraintType, FulltextConstraint } from '../../store/constraint/Types';
import { Group } from '../../store/group/Types';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftActions from '../../store/overdraft/Actions';
import { OverdraftConfig } from '../../store/overdraft/Types';
import * as projectActions from '../../store/project/Actions';
import { ProjectWithRole } from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';
import { Unit } from '../../store/role/Types';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';
import AddBlockDialogContainer from '../constraint/AddBlockDialogContainer';

import AddArchiveLabelsDialog from './AddArchiveLabelsDialog';
import DeleteArchiveTaskInstanceWaitingDialog from './DeleteArchiveTaskInstanceWaitingDialog';
import DeleteArchiveTaskWaitingDialog from './DeleteArchiveTaskWaitingDialog';
import ResetArchiveTaskInstanceOverdraftWaitingDialog from './ResetArchiveTaskInstanceOverdraftWaitingDialog';
import { TablePaginationComponent } from './TablePaginationComponent';
import { TaskList, FilterTextField } from './TaskList';
import ZoneListTable from './ZoneListTable';
import { fetchArhiveStatuses } from './utils/useArchiveListWithFilter';

enum SELECTED_TAB {
  instances = 'instances',
  zones = 'zones',
}

export interface ArchiveTasksProps extends WithNavigationProps {
  deleteArchiveTask: (projectShortName: string, name: string, okCallback?: () => void, errorCallback?: (errorMsg: string) => void) => void;
  listArchiveTasksWithRoles: (
    okCallback?: (tasks: ShortArchiveTaskWithRole[]) => void,
    errorCallback?: (errorMsg: string) => void,
    page?: number,
    nameLike?: string,
  ) => void;
  fetchUserProjects: () => void;
  fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void) => void;
  displayError: (error: string) => void;
  displaySuccess: (message: string) => void;
  importTask: (task: ArchiveTask) => void;
  downloadArchiveTask: (projectShortName: string, name: string) => void;
  setArchiveFilter: (filter: FilterMenuItem[] | undefined, isRefetch: boolean) => void;
  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?: any, errorCallback?: any) => void;
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
  getArchiveFilterValues: (okCallback?: any, errorCallback?: any) => void;
  getArchiveOverdraftConfig: (okCallback?: any, errorCallback?: any) => void;
  fetchArchiveTaskInstanceStatuses: (archiveTaskInstanceIds: string[]) => void;
  resetZoneOverdraft: (zoneId: string, okCallback?: () => void, errorCallback?: (error: string) => void) => void;
  getFulltextOverdraftConfig: (okCallback?: (overdraft: OverdraftConfig) => void, errorCallback?: (error: string) => void) => void;
  projects: Array<ProjectWithRole>;
  archives: ShortArchiveTaskWithRole[];
  user: User;
  authType: AuthType;
  filter: FilterMenuItem[] | undefined;
  isLoading: boolean;
  isStatusesLoading: boolean;
  isLoadingStatusesPagination: boolean;
  topics: Array<KafkaTopic>;
  metas: any;
  statuses: Map<string, ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus>;
  allLabels: string[];
  archiveTaskDelete: ArchiveTaskDelete | null;
  archiveTaskInstanceStatusUpdate: Set<string>;
  zone: Zone;
  fetchZones: (fetchedCallback?: (zone: Zone) => void) => any;
  isResetInstanceOverdraftsFetch: boolean;
  isUpdating: boolean;
  isRefetch?: boolean;
  editableProjects: EditableProject[];
  archiveTotalCount: number;
}

export interface ArchiveTasksState {
  nameFilter?: string;
  constraintDialogOpen: boolean;
  currentConstraint?: ArchiveConstraint | AnalyticConstraint | FulltextConstraint;
  constraintTitle?: any;
  isBlockUserDialogOpen: boolean;
  blockTitle?: any;
  blockedObject?: ShortArchiveTaskWithRole;
  constraintObject?: ShortArchiveTaskWithRole;
  archives: ShortArchiveTaskWithRole[];
  createArchiveTaskModalInfoOpen?: boolean;
  isLabelDialogOpen: boolean;
  labelRefetch: boolean;
  labelProjectName?: string;
  labelName?: string;
  labelCanEdit?: boolean;
  currentTab: SELECTED_TAB.instances;
  openDialogAllReset: boolean;
  filter: FilterMenuItem[] | undefined;
  rowsPerPage: number;
  page: number;
  listOfEditorRole: number[];
  listOfArchives: any[];
  countOfFilteredArchives: number;
  isRefresh: boolean;
}

export class ArchiveTasks extends React.Component<ArchiveTasksProps, ArchiveTasksState> {
  isLegacyMode: boolean;
  // Контроллер для отмены запросов
  private paginationAbortController: AbortController | null = null;
  debouncedSetState: DebouncedFunc<(value: string) => void>;
  constructor(props: ArchiveTasksProps) {
    super(props);
    this.isLegacyMode = this.props.authType === 'legacy';
    this.state = {
      isBlockUserDialogOpen: false,
      constraintDialogOpen: false,
      currentTab: SELECTED_TAB.instances,
      openDialogAllReset: false,
      archives: [],
      isLabelDialogOpen: false,
      labelRefetch: false,
      filter: this.props.filter,
      rowsPerPage: 10,
      page: 0,
      listOfArchives: this.props.archives,
      listOfEditorRole: [],
      countOfFilteredArchives: 0,
      isRefresh: false,
    };
    this.deleteHandler = this.deleteHandler.bind(this);
    this.debouncedSetState = debounce((value) => {
      this.setState({ nameFilter: value, page: 0 });
    }, 500);
  }

  deleteHandler(projectShortName: string, name: string): void {
    this.props.deleteArchiveTask(projectShortName, name);
  }

  refetchAllLabels(): void {
    this.props.getArchiveFilterValues();
  }

  componentDidMount(): void {
    const { page } = this.state;
    if (this.props.zone.availableZones.length === 0) {
      this.props.fetchZones();
    }

    this.props.listArchiveTasksWithRoles(
      () => {},
      () => {},
      page + 1,
    );

    this.props.getArchiveFilterValues();
    this.props.fetchAllProjects();
    this.props.getArchiveOverdraftConfig();
  }

  componentDidUpdate(prevProps: ArchiveTasksProps, prevState: ArchiveTasksState) {
    if (prevProps.archives !== this.props.archives) {
      this.setState({ listOfArchives: this.props.archives });
    }
    if (
      prevState.page !== this.state.page ||
      prevState.nameFilter !== this.state.nameFilter ||
      prevState.filter !== this.state.filter ||
      prevState.isRefresh !== this.state.isRefresh ||
      (prevState.isLabelDialogOpen && !this.state.isLabelDialogOpen)
    ) {
      this.props.listArchiveTasksWithRoles(
        () => {},
        () => {},
        this.state.page + 1,
        this.state.nameFilter,
      );
      this.setState({ isRefresh: false });
    }
  }

  componentWillUnmount() {
    if (this.paginationAbortController) {
      this.paginationAbortController.abort();
    }
    this.debouncedSetState.cancel();
  }

  handleChangePage = (_: any, value: number) => {
    this.setState({ page: value });
  };
  handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 });
  };

  render() {
    const { nameFilter } = this.state;
    const showLoader = this.props.isLoading;
    const hasProjects = this.props.editableProjects.length > 0;

    return (
      <div style={{ position: 'relative', width: '100%', minHeight: '200px' }}>
        {showLoader && !nameFilter && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              backdropFilter: 'blur(2px)',
            }}
          >
            <Loader />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
          <Grid
            container
            style={{ width: '100%', marginTop: '12px', margin: '1px' }}
            justifyContent="center"
            spacing={8}
            alignItems="center"
            direction="column"
          >
            <Grid item style={{ padding: '0 10px 10px', width: '90%' }}>
              <StyledTabs
                value={this.state.currentTab}
                onChange={(event, value) => {
                  this.setState({ currentTab: value });
                }}
              >
                <StyledTab label="Конфигурации" value={SELECTED_TAB.instances} />
                <StyledTab label="Зоны" value={SELECTED_TAB.zones} />
              </StyledTabs>
            </Grid>

            <FilterTextField
              tabInstances={this.state.currentTab === SELECTED_TAB.instances}
              archives={this.props.archives}
              isUpdating={this.props.isUpdating}
              nameFilter={this.state.nameFilter}
              setState={this.setState.bind(this)}
              user={this.props.user}
              projects={this.props.projects}
              filter={this.props.filter}
              isStatusesLoading={this.props.isStatusesLoading}
              allLabels={this.props.allLabels}
              availableZones={this.props.zone.availableZones || []}
              isRefetch={this.props.isRefetch || false}
              setArchiveFilter={this.props.setArchiveFilter}
              fetchArhiveStatuses={fetchArhiveStatuses}
              paginationAbortController={this.paginationAbortController}
              displayError={this.props.displayError}
              page={this.state.page}
              setDebouncedState={this.debouncedSetState}
            />

            {this.state.currentTab === SELECTED_TAB.instances ? (
              <TaskList
                setState={this.setState.bind(this)}
                user={this.props.user}
                availableZones={this.props.zone.availableZones || []}
                listOfArchives={this.state.listOfArchives}
                fetchConstraintForObject={this.props.fetchConstraintForObject}
                fetchUserProjects={this.props.fetchUserProjects}
                deleteHandler={this.deleteHandler}
                navigate={this.props.navigate}
                downloadArchiveTask={this.props.downloadArchiveTask}
                page={this.state.page}
                nameFilter={this.state.nameFilter}
              />
            ) : (
              <ZoneListTable listOfArchives={this.state.listOfArchives} filter={this.props.filter} user={this.props.user} page={this.state.page} />
            )}

            <Divider />
            {this.props.archiveTotalCount > 10 && (
              <TablePaginationComponent
                count={this.props.archiveTotalCount}
                page={this.state.page}
                rowsPerPageOptions={[10]} //, 25, 50]}
                rowsPerPage={this.state.rowsPerPage}
                onChange={this.handleChangePage}
                onRowsPerPageChange={this.handleChangeRowsPerPage}
              />
            )}

            {hasProjects ? (
              <ImportFileFab
                title={'Импортировать архив из файла'}
                onChange={(event: any) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  const fileReader = new FileReader();
                  fileReader.readAsText(file);

                  fileReader.onload = () => {
                    if (fileReader.result != null) {
                      try {
                        const data: ArchiveTask = JSON.parse(fileReader.result.toString());
                        this.props.importTask(data);
                        this.props.navigate('/archive/import');
                      } catch (e) {
                        this.props.displayError('Ошибка при чтении JSON: некорректный формат данных внутри файла.');
                        event.target.value = '';
                      }
                    }
                  };
                }}
              />
            ) : null}

            {hasProjects ? (
              <AddFab
                title={'Создать архив'}
                onClick={() => {
                  this.props.navigate('/archive/new');
                }}
              />
            ) : null}

            <DeleteArchiveTaskWaitingDialog />
            <DeleteArchiveTaskInstanceWaitingDialog page={this.state.page} nameFilter={this.state.nameFilter} />

            <ResetArchiveTaskInstanceOverdraftWaitingDialog />
            <ArchiveOverdraftDialog />

            <ResetOverdraftDialog
              open={this.state.openDialogAllReset}
              handleClose={() => this.setState({ openDialogAllReset: false })}
              handleResetOverdraft={(zone) => {
                this.props.resetZoneOverdraft(zone, () => {});
                this.setState({ openDialogAllReset: false });
              }}
              zones={this.props.zone.availableZones}
              displayError={this.props.displayError}
            />

            {this.state.constraintDialogOpen && (
              <ConstraintEditDialog
                displayError={this.props.displayError}
                close={() => {
                  this.setState({
                    constraintDialogOpen: false,
                    currentConstraint: undefined,
                    constraintTitle: undefined,
                    constraintObject: undefined,
                  });
                }}
                onPatch={(type, patch, constraintResult) => {
                  this.props.updateConstraintOnObject(
                    this.state.constraintObject?.id,
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
                type={ConstraintType.archive}
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
                type={ConstraintType.archive}
                object={this.state.blockedObject}
                archive={this.state.blockedObject}
                isEdit={true}
              />
            )}
            {this.state.isLabelDialogOpen && (
              <AddArchiveLabelsDialog
                close={() => {
                  this.setState({
                    isLabelDialogOpen: false,
                    labelProjectName: undefined,
                    labelName: undefined,
                    labelCanEdit: false,
                  });
                  if (this.state.labelRefetch) {
                    this.refetchAllLabels();
                    this.setState({ labelRefetch: false });
                  }
                }}
                refetch={() => {
                  this.setState({ labelRefetch: true });
                }}
                projectShortName={this.state.labelProjectName || ''}
                name={this.state.labelName || ''}
                canEdit={this.state.labelCanEdit || true}
              />
            )}
          </Grid>
          <WaitingDialog
            title="Обновление экземпляра задачи"
            open={this.props.archiveTaskInstanceStatusUpdate.size > 0}
            onClose={() => {}}
            complete={false}
            success={false}
            successMessage="Экземпляр задачи обновлён успешно"
            errorMessage="При обновлении экземпляра задачи произошла ошибка"
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displaySuccess: (message: string) => {
      dispatch(notificationActions.success(message));
    },
    importTask: (task: ArchiveTask) => {
      dispatch(archiveActions.replaceArchiveTask(task));
    },
    fetchUserProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    deleteArchiveTask: (projectShortName: string, name: string, okCallback?: () => void, errorCallback?: (errorMsg: string) => void): void => {
      dispatch(archiveActions.deleteArchiveTask(projectShortName, name, okCallback, errorCallback));
    },
    listArchiveTasksWithRoles: (
      okCallback?: (tasks: ShortArchiveTaskWithRole[]) => void,
      errorCallback?: (errorMsg: string) => void,
      page?: number,
      nameLike?: string,
    ): void => {
      dispatch(archiveActions.fetchListArchivesWithRoles(okCallback, errorCallback, page, nameLike));
    },
    downloadArchiveTask: (projectShortName: string, name: string): void => {
      dispatch(archiveActions.downloadArchiveTask(projectShortName, name));
    },
    fetchAllProjects: (okCallback?) => {
      dispatch(projectActions.fetchAllProjects(okCallback));
    },
    setArchiveFilter: (filter: FilterMenuItem[] | undefined, isRefetch: boolean) => {
      dispatch(archiveActions.setArchiveFilter(filter, isRefetch));
    },
    fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchConstraintForObject(taskId, type, okCallback, errorCallback));
    },
    updateConstraintOnObject: (
      taskId: number,
      type: ConstraintType,
      patch: any,
      okCallback: () => void,
      errorCallback: (message: string) => void,
    ) => {
      dispatch(constraintActions.updateConstraintOnObject(taskId, type, patch, okCallback, errorCallback));
    },
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
    ) => {
      dispatch(
        constraintActions.blockSubjectOnObject(subjectId, subjectType, projectId, taskId, isProject, type, description, okCallback, errorCallback),
      );
    },
    getArchiveFilterValues: (okCallback?, errorCallback?) => {
      dispatch(archiveActions.getArchiveFilterValues(okCallback, errorCallback));
    },
    resetZoneOverdraft: (zoneId: string, okCallback?: () => void, errorCallback?: (error: string) => void) => {
      dispatch(archiveActions.resetZoneOverdraft(zoneId, okCallback, errorCallback));
    },
    getArchiveOverdraftConfig: (okCallback, errorCallback) => {
      dispatch(overdraftActions.getArchiveOverdraftConfig(okCallback, errorCallback));
    },
    fetchZones(fetchedCallback?: (zone: Zone) => void): any {
      dispatch(zoneActions.fetchAllZone(fetchedCallback));
    },
    fetchArchiveTaskInstanceStatuses: (archiveTaskInstanceIds: string[]) => {
      dispatch(archiveActions.fetchArchiveTaskInstanceStatuses(archiveTaskInstanceIds));
    },
  };
};

const mapStateToProps = (state) => {
  return {
    projects: projectSelectors.getProjects(state),
    archives: archiveSelectors.getArchivesWithRoles(state),
    isLoading: archiveSelectors.isTaskWithRolesLoading(state),
    isStatusesLoading: archiveSelectors.isStatusesLoading(state),
    isLoadingStatusesPagination: archiveSelectors.isLoadingStatusesPagination(state),
    isUpdating: archiveSelectors.isTaskWithRolesRefetching(state),
    user: authSelectors.user(state),
    authType: authSelectors.authType(state),
    filter: archiveSelectors.getArchiveFilter(state),
    topics: kafkaSelectors.getTopics(state),
    statuses: archiveSelectors.getArchiveTaskInstanceStatus(state),
    metas: archiveSelectors.getStatuses(state),
    filterValues: archiveSelectors.getFilterValues(state),
    archiveTaskDelete: archiveSelectors.getArchiveTaskDelete(state),
    archiveTaskInstanceStatusUpdate: archiveSelectors.getArchiveTaskInstanceStatusUpdate(state),
    zone: zoneSelectors.getZones(state),
    isResetInstanceOverdraftsFetch: archiveSelectors.getIsResetInstanceOverdraftsFetch(state),
    isRefetch: archiveSelectors.isRefetch(state),
    archiveTotalCount: archiveSelectors.getArchiveTotalCount(state),
  };
};

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(ArchiveTasks));

import { checkAuthType } from '@src/store/auth/Actions';
import { AuthType } from '@src/store/auth/Types';
import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import AllTasks from '../../components/monitoring/AllTasks';
import { Loader } from '../../components/utils/Loader';
import * as authSelectors from '../../store/auth/Reducer';
import * as constraintsActions from '../../store/constraint/Actions';
import { ConstraintType } from '../../store/constraint/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidSupervisorInfo, TaskData } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import { EditableProject, Project } from '../../store/project/Types';
import { Unit } from '../../store/role/Types';
import { withRouter, RouterProps } from '../../utils/withRouter';

export interface TaskViewPropsParent {
  globalConfigurationVersion: Map<string, string>;
  supervisors: Array<DruidSupervisorInfo>;
  fetchSupervisors: () => void;
  fetchAllLabels: () => void;
  projects: Array<Project>;
  topics: Array<KafkaTopic>;
  zones: string[];
}

export interface TaskViewProps {
  isAdmin: boolean;
  authType?: AuthType;
  supervisorsIsLoading: boolean;
  editableProjects: EditableProject[];
}

export interface TasksViewDispatchProps {
  replaceSupervisor: (task: TaskData) => void;
  downloadConfig: (id: number) => void;
  openConfig: (id: number) => void;
  deleteConfig: (id: number, okCallback?, errorCallback?) => void;

  addSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  deleteSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  updateSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  stopSupervisorInstance: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  resetSupervisorInstance: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  startSupervisorInstance: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;

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
  checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => void;
}

interface AllTasksViewState {
  authType?: AuthType;
}

type AllTaskViewProps = TaskViewProps & TasksViewDispatchProps & TaskViewPropsParent & RouterProps;

class AllTasksView extends React.Component<AllTaskViewProps, AllTasksViewState> {
  constructor(props: AllTaskViewProps) {
    super(props);
    autoBind(this);
    this.state = {
      authType: this.props.authType,
    };
  }

  componentDidMount() {
    if (!this.props.authType) {
      this.props.checkAuthType(
        (type: AuthType) => this.setState({ authType: type }),
        (error: string) => this.props.displayError(error),
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        {!this.props.supervisorsIsLoading && this.renderAllTasks()}
        {this.props.supervisorsIsLoading && <Loader />}
      </React.Fragment>
    );
  }

  renderAllTasks() {
    return (
      <AllTasks
        displaySuccess={this.props.displaySuccess}
        globalConfigurationVersion={this.props.globalConfigurationVersion}
        zones={this.props.zones}
        blockSubjectOnObject={this.props.blockSubjectOnObject}
        displayError={this.props.displayError}
        fetchConstraintForObject={this.props.fetchConstraintForObject}
        refreshSupervisor={this.props.refreshSupervisor}
        updateConstraintOnObject={this.props.updateConstraintOnObject}
        refetchSupervisors={() => {
          this.props.fetchSupervisors();
        }}
        refetchAllLabels={() => {
          this.props.fetchAllLabels();
        }}
        isAdmin={this.props.isAdmin}
        authType={this.props.authType || 'autz'}
        supervisors={this.props.supervisors}
        projects={this.props.projects}
        editableProjects={this.props.editableProjects}
        topics={this.props.topics}
        downloadConfig={(id) => {
          this.props.downloadConfig(id);
        }}
        deleteConfig={this.props.deleteConfig}
        openConfig={(id) => {
          this.props.navigate('/monitoring/task/' + id);
        }}
        resetSupervisorInstance={this.props.resetSupervisorInstance}
        stopSupervisorInstance={this.props.stopSupervisorInstance}
        startSupervisorInstance={this.props.startSupervisorInstance}
        importConfig={(task) => {
          this.props.replaceSupervisor(task);
          this.props.navigate('/monitoring/task/import');
        }}
        updateSupervisorInstanceById={this.props.updateSupervisorInstanceById}
        deleteSupervisorInstanceById={this.props.deleteSupervisorInstanceById}
        addSupervisorInstanceById={this.props.addSupervisorInstanceById}
      />
    );
  }
}

function mapStateToProps(state): TaskViewProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    authType: authSelectors.authType(state),
    supervisorsIsLoading: monitoringSelectors.supervisorsIsLoading(state) || monitoringSelectors.isAllLabelsLoading(state),
  };
}

function mapDispatchToProps(dispatch: any): TasksViewDispatchProps {
  return {
    checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
      dispatch(checkAuthType(okCallback, errorCallback));
    },
    deleteConfig: (id, okCallback, errorCallback) => {
      dispatch(monitoringActions.deleteConfigById(id, okCallback, errorCallback));
    },
    downloadConfig: (task_id: number) => {
      dispatch(monitoringActions.downloadConfig(task_id));
    },
    replaceSupervisor: (task: TaskData) => {
      dispatch(monitoringActions.replaceCurrentConfig(task));
    },
    fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => {
      dispatch(constraintsActions.fetchConstraintForObject(taskId, type, okCallback, errorCallback));
    },
    refreshSupervisor: (id: number) => {
      dispatch(monitoringActions.fetchSupervisorById(id));
    },
    updateConstraintOnObject: (
      taskId: number,
      type: ConstraintType,
      patch: any,
      okCallback: () => void,
      errorCallback: (message: string) => void,
    ) => {
      dispatch(constraintsActions.updateConstraintOnObject(taskId, type, patch, okCallback, errorCallback));
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
        constraintsActions.blockSubjectOnObject(subjectId, subjectType, projectId, taskId, isProject, type, description, okCallback, errorCallback),
      );
    },
    addSupervisorInstanceById: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.addSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    deleteSupervisorInstanceById: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.deleteSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    updateSupervisorInstanceById: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.updateSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    startSupervisorInstance: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.startSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    stopSupervisorInstance: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.stopSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    resetSupervisorInstance: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.resetSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    openConfig: (id) => {
      dispatch(monitoringActions.fetchConfigById(id));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displaySuccess: (success) => {
      dispatch(notificationActions.success(success));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AllTasksView));

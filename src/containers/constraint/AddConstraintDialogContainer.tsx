import * as React from 'react';
import { connect } from 'react-redux';

import AddNewConstraintDialog, { AddNewConstraintDialogProps } from '../../components/constraint/AddNewConstraintDialog';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ShortArchiveTask, ShortArchiveTaskWithId } from '../../store/archive/Types';
import * as constraintActions from '../../store/constraint/Actions';
import { ConstraintType } from '../../store/constraint/Types';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import { FulltextTask } from '../../store/index/Types';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as pipelineActions from '../../store/pipeline/Actions';
import * as pipelineSelectors from '../../store/pipeline/Reducer';
import { PipelineShort } from '../../store/pipeline/Types';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Project } from '../../store/project/Types';

export interface AddNewConstraintDialogDispatchProps {
  displayInfo: (info: string) => void;
  listArchiveTasks: (okCallback?: (tasks: ShortArchiveTask[]) => void, errorCallback?: (errorMsg: string) => void) => void;
  fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => void;
  fetchAllMonitoringTasks: () => void;
  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => void;
  fetchConstraintForProject: (projectShortName: string, okCallback?, errorCallback?) => void;
  updateConstraintOnObject: (
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  updateConstraintOnProject: (
    projectShortName: string,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  getFulltextTasksList: (okCallback?, errorCallback?) => void;
  // listPipelines: (okCallback?: (pipelines: PipelineShort[]) => void, errorCallback?: (errorMsg: string) => void) => void
}

export interface AddNewConstraintDialogStateProps {
  projects: Project[];
  archives: ShortArchiveTaskWithId[];
  analyticTasks: DruidSupervisorInfo[];
  fulltextTasks: FulltextTask[];
}

class AddConstraintDialogContainer extends React.Component<
  AddNewConstraintDialogStateProps & AddNewConstraintDialogDispatchProps & AddNewConstraintDialogProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchAllProjects();
    this.props.fetchAllMonitoringTasks();
    this.props.getFulltextTasksList();
    this.props.listArchiveTasks();
  }

  render() {
    return (
      <AddNewConstraintDialog
        close={this.props.close}
        displayError={this.props.displayError}
        fetchConstraintForObject={this.props.fetchConstraintForObject}
        fetchConstraintForProject={this.props.fetchConstraintForProject}
        updateConstraintOnObject={this.props.updateConstraintOnObject}
        updateConstraintOnProject={this.props.updateConstraintOnProject}
        projects={this.props.projects}
        analyticTasks={this.props.analyticTasks}
        archives={this.props.archives}
        fulltextTasks={this.props.fulltextTasks}
        displayInfo={this.props.displayInfo}
      />
    );
  }
}

function mapStateToProps(state): AddNewConstraintDialogStateProps {
  return {
    projects: projectSelectors.getProjects(state),
    analyticTasks: monitoringSelectors.getAllTasks(state),
    archives: archiveSelectors.getArchivesWithIds(state),
    fulltextTasks: indexSelectors.getFulltextTasks(state),
  };
}

function mapDispatchToProps(dispatch: any): AddNewConstraintDialogDispatchProps {
  return {
    fetchConstraintForObject: (taskId: number, type, okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchConstraintForObject(taskId, type, okCallback, errorCallback));
    },
    listArchiveTasks: (okCallback?: (tasks: ShortArchiveTask[]) => void, errorCallback?: (errorMsg: string) => void) => {
      dispatch(archiveActions.listArchiveTasksWithIds(undefined, okCallback, errorCallback));
    },
    getFulltextTasksList: (okCallback?, errorCallback?) => {
      dispatch(indexActions.getFulltextTasksList(okCallback, errorCallback));
    },
    fetchAllMonitoringTasks: () => {
      dispatch(monitoringActions.fetchAllSupervisors());
    },
    fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => {
      dispatch(projectActions.fetchAllProjects(fetchedCallback, errorCallback));
    },
    fetchConstraintForProject: (projectShortName: string, okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchConstraintForProject(projectShortName, okCallback, errorCallback));
    },
    displayInfo: (info) => {
      dispatch(notificationActions.warning(info));
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
    updateConstraintOnProject: (
      projectShortName: string,
      type: ConstraintType,
      patch: any,
      okCallback: () => void,
      errorCallback: (message: string) => void,
    ) => {
      dispatch(constraintActions.updateConstraintOnProject(projectShortName, type, patch, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddConstraintDialogContainer);

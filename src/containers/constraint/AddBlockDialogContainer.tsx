import * as React from 'react';
import { connect } from 'react-redux';

import { AddNewConstraintDialogProps } from '../../components/constraint/AddNewConstraintDialog';
import BlockedDialog, { BlockedDialogProps } from '../../components/constraint/BlockedDialog';
import { Loader } from '../../components/utils/Loader';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ShortArchiveTask, ShortArchiveTaskWithId } from '../../store/archive/Types';
import { User } from '../../store/auth/Types';
import * as configSelectors from '../../store/config/Reducer';
import { ConstraintType } from '../../store/constraint/Types';
import * as groupActions from '../../store/group/Actions';
import * as groupSelectors from '../../store/group/Reducer';
import { Group } from '../../store/group/Types';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import { FulltextTask } from '../../store/index/Types';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Project } from '../../store/project/Types';
import * as userActions from '../../store/user/Actions';
import * as userSelectors from '../../store/user/Reducer';

export interface AddBlockDialogContainerDispatchProps {
  displayError: (error: string) => void;
  listArchiveTasks: (okCallback?: (tasks: ShortArchiveTask[]) => void, errorCallback?: (errorMsg: string) => void) => void;
  fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => void;
  fetchAllMonitoringTasks: () => void;
  fetchAllGroups: () => void;
  fetchUsers: () => void;
  listFulltextTasks: (labels?: string[], okCallback?, errorCallback?) => void;
  // listPipelines: (okCallback?: (pipelines: PipelineShort[]) => void, errorCallback?: (errorMsg: string) => void) => void,
}

export interface AddBlockDialogContainerStateProps {
  projects: Project[];
  archives: ShortArchiveTaskWithId[];
  analyticTasks: DruidSupervisorInfo[];
  fulltextTasks: FulltextTask[];
  users: User[];
  groups: Group[];
  isTaskWithIdsLoading: boolean;
  pvmMode: boolean;
}

class AddBlockDialogContainer extends React.Component<
  AddBlockDialogContainerStateProps & BlockedDialogProps & AddBlockDialogContainerDispatchProps & AddNewConstraintDialogProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.isEdit) {
      this.props.fetchAllProjects();
      this.props.fetchAllMonitoringTasks();
      this.props.listFulltextTasks();
      this.props.listArchiveTasks();
    }
    if (this.props.isEdit) {
      if (this.props.type === ConstraintType.archive) {
        this.props.listArchiveTasks();
      }
      this.props.fetchAllGroups();
      if (!this.props.pvmMode) {
        this.props.fetchUsers();
      }
    }
  }

  render() {
    if (this.props.isTaskWithIdsLoading && this.props.type === ConstraintType.archive) {
      return <Loader />;
    }
    return (
      <BlockedDialog
        pvmMode={this.props.pvmMode}
        isEdit={this.props.isEdit}
        object={this.props.object}
        type={this.props.type}
        displayError={this.props.displayError}
        close={this.props.close}
        onClose={this.props.onClose}
        groups={this.props.groups}
        users={this.props.users}
        projects={this.props.projects}
        archives={this.props.archives}
        analyticTasks={this.props.analyticTasks}
        fulltextTasks={this.props.fulltextTasks}
        fulltextTask={this.props.fulltextTask}
        archive={
          this.props.archives.filter((archive) => archive.name === this.props.archive?.name && archive.project === this.props.archive.project)[0]
        }
        analyticTask={this.props.analyticTask}
      />
    );
  }
}

function mapStateToProps(state): AddBlockDialogContainerStateProps {
  return {
    projects: projectSelectors.getProjects(state),
    analyticTasks: monitoringSelectors.getAllTasks(state),
    archives: archiveSelectors.getArchivesWithIds(state),
    fulltextTasks: indexSelectors.getFulltextTasks(state),
    // fulltextTasks: pipelineSelectors.getPipelines(state),
    users: userSelectors.getAllUsers(state),
    groups: groupSelectors.getGroups(state),
    isTaskWithIdsLoading: archiveSelectors.isTaskWithIdsLoading(state),
    pvmMode: configSelectors.isPvmModeEnabled(state),
  };
}

function mapDispatchToProps(dispatch: any): AddBlockDialogContainerDispatchProps {
  return {
    listArchiveTasks: (okCallback?: (tasks: ShortArchiveTaskWithId[]) => void, errorCallback?: (errorMsg: string) => void) => {
      dispatch(archiveActions.listArchiveTasksWithIds(undefined, okCallback, errorCallback));
    },
    // listPipelines: (okCallback? : (pipelines : PipelineShort[]) => void, errorCallback? : (errorMsg : string) => void) => {
    //   dispatch(pipelineActions.listPipelines(okCallback, errorCallback))
    // },
    listFulltextTasks: (labels?: string[], okCallback?, errorCallback?) => {
      dispatch(indexActions.getFulltextTasksList(labels, okCallback, errorCallback));
    },
    fetchAllMonitoringTasks: () => {
      dispatch(monitoringActions.fetchAllSupervisors());
    },
    fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => {
      dispatch(projectActions.fetchAllProjects(fetchedCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    fetchAllGroups() {
      dispatch(groupActions.fetchGroups());
    },
    fetchUsers: () => {
      dispatch(userActions.fetchUsers());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddBlockDialogContainer);

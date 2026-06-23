import * as React from 'react';
import { connect } from 'react-redux';

import BlockObjectPage from '../../components/constraint/BlockObjectPage';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { Loader } from '../../components/utils/Loader';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ShortArchiveTask, ShortArchiveTaskWithId } from '../../store/archive/Types';
import { User } from '../../store/auth/Types';
import * as configSelectors from '../../store/config/Reducer';
import * as constraintActions from '../../store/constraint/Actions';
import * as constraintSelectors from '../../store/constraint/Reducer';
import { BlockedObject, BlockedUnit, BlockFilterParams, Blocks, ConstraintType } from '../../store/constraint/Types';
import * as groupActions from '../../store/group/Actions';
import * as groupSelectors from '../../store/group/Reducer';
import { Group } from '../../store/group/Types';
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
import { Unit } from '../../store/role/Types';
import * as userActions from '../../store/user/Actions';
import * as userSelectors from '../../store/user/Reducer';
import { Utils } from '../../utils/Utils';

export interface BlockObjectContainerProps {
  isBlocksLoading: boolean;
  blocks: Blocks[];
  blockedUnits: BlockedUnit[];
  isBlockedUnitsLoading: boolean;
  users: User[];
  groups: Group[];
  projects: Project[];
  pvmMode: boolean;
  filter?: FilterMenuItem[];
}

export interface BlockObjectContainerDispatchProps {
  displayError: (error: string) => void;
  displaySuccess: (message: string) => void;
  fetchBlockedUsers: (blockFilterParams?: BlockFilterParams | undefined) => void;
  fetchAllGroups: () => void;
  fetchAllBlocks: (blockFilterParams?: BlockFilterParams | undefined, okCallback?, errorCallback?) => void;
  fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => void;
  deleteBlockFromUserOnObject: (
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    okCallback,
    errorCallback,
  ) => void;
  getBlocksOnProject: (
    projectShortName: string,
    type: ConstraintType,
    okCallback: (blocks: BlockedUnit[]) => void,
    errorCallback: (error: string) => void,
  ) => void;
  getBlocksOnObject: (
    taskId: number,
    type: ConstraintType,
    okCallback: (blocks: BlockedUnit[]) => void,
    errorCallback: (error: string) => void,
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
  unblockSubject: (subjectId: number, subjectType: Unit, type: ConstraintType, okCallback, errorCallback) => void;
  fetchUsers: () => void;
  blockSubject: (subjectId: number, subjectType: Unit, type: ConstraintType, description: string, okCallback?, errorCallback?) => void;
  setBlocksFilter: (filter: FilterMenuItem[] | undefined) => void;
}

export interface BlockObjectContainerState {}

class BlockObjectContainer extends React.Component<BlockObjectContainerDispatchProps & BlockObjectContainerProps, BlockObjectContainerState> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.pvmMode) this.props.fetchUsers();
    this.props.fetchAllGroups();
    if (this.props.filter?.length > 0) {
      this.props.fetchAllBlocks(Utils.createBlockFilterParamsFromFilterMenuItem(this.props.filter));
      this.props.fetchBlockedUsers(Utils.createBlockFilterParamsFromFilterMenuItem(this.props.filter));
    } else {
      this.props.fetchAllBlocks();
      this.props.fetchBlockedUsers();
    }
    this.props.fetchAllProjects();
  }

  render() {
    if (this.props.isBlockedUnitsLoading || this.props.isBlocksLoading) {
      return <Loader />;
    }
    return (
      <BlockObjectPage
        pvmMode={this.props.pvmMode}
        refetch={(blockFilterParams) => {
          this.props.fetchBlockedUsers(blockFilterParams);
          this.props.fetchAllBlocks(blockFilterParams);
        }}
        projects={this.props.projects}
        getBlocksOnObject={this.props.getBlocksOnObject}
        blockSubject={this.props.blockSubject}
        blockSubjectOnObject={this.props.blockSubjectOnObject}
        deleteBlockFromUserOnObject={this.props.deleteBlockFromUserOnObject}
        unblockSubject={this.props.unblockSubject}
        groups={this.props.groups}
        users={this.props.users}
        displayError={this.props.displayError}
        displaySuccess={this.props.displaySuccess}
        blocks={this.props.blocks}
        blockedUnits={this.props.blockedUnits}
        getBlocksOnProject={this.props.getBlocksOnProject}
        filter={this.props.filter}
        setBlocksFilter={this.props.setBlocksFilter}
      />
    );
  }
}

function mapStateToProps(state): BlockObjectContainerProps {
  return {
    blocks: constraintSelectors.getBlocks(state),
    blockedUnits: constraintSelectors.getBlockedUnits(state),
    isBlockedUnitsLoading: constraintSelectors.isBlockedUnitsLoading(state),
    isBlocksLoading: constraintSelectors.isBlocksLoading(state),
    users: userSelectors.getAllUsers(state),
    groups: groupSelectors.getGroups(state),
    projects: projectSelectors.getProjects(state),
    filter: constraintSelectors.getBlockFilter(state),
    pvmMode: configSelectors.isPvmModeEnabled(state),
  };
}

function mapDispatchToProps(dispatch: any): BlockObjectContainerDispatchProps {
  return {
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displaySuccess: (message: string) => {
      dispatch(notificationActions.success(message));
    },
    fetchAllBlocks: (blockFilterParams: BlockFilterParams | undefined, okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchAllBlocks(blockFilterParams, okCallback, errorCallback));
    },
    fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => {
      dispatch(projectActions.fetchAllProjects(fetchedCallback, errorCallback));
    },
    fetchBlockedUsers: (blockFilterParams?: BlockFilterParams | undefined) => {
      dispatch(constraintActions.fetchAllBlockedUsers(blockFilterParams));
    },
    deleteBlockFromUserOnObject: (
      subjectId: number,
      subjectType: Unit,
      projectId: number,
      taskId: number,
      isProject: boolean,
      type: ConstraintType,
      okCallback,
      errorCallback,
    ) => {
      dispatch(constraintActions.deleteBlockFromUserOnObject(subjectId, subjectType, projectId, taskId, isProject, type, okCallback, errorCallback));
    },
    getBlocksOnProject: (
      projectShortName: string,
      type: ConstraintType,
      okCallback: (blocks: BlockedUnit[]) => void,
      errorCallback: (error: string) => void,
    ) => {
      dispatch(constraintActions.getBlocksOnProject(projectShortName, type, okCallback, errorCallback));
    },
    getBlocksOnObject: (
      taskId: number,
      type: ConstraintType,
      okCallback: (blocks: BlockedUnit[]) => void,
      errorCallback: (error: string) => void,
    ) => {
      dispatch(constraintActions.getBlocksOnObject(taskId, type, okCallback, errorCallback));
    },
    unblockSubject: (subjectId: number, subjectType: Unit, type: ConstraintType, okCallback, errorCallback) => {
      dispatch(constraintActions.unblockSubject(subjectId, subjectType, type, okCallback, errorCallback));
    },
    blockSubject: (subjectId: number, subjectType: Unit, type: ConstraintType, description: string, okCallback?, errorCallback?) => {
      dispatch(constraintActions.blockSubject(subjectId, subjectType, type, description, okCallback, errorCallback));
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
    setBlocksFilter: (filter: FilterMenuItem[] | undefined) => {
      dispatch(constraintActions.setBlockFilter(filter));
    },
    fetchAllGroups() {
      dispatch(groupActions.fetchGroups());
    },
    fetchUsers: () => {
      dispatch(userActions.fetchUsers());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BlockObjectContainer);

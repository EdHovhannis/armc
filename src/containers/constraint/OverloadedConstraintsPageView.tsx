import * as React from 'react';
import { connect } from 'react-redux';

import OverloadedConstraintsPage from '../../components/constraint/OverloadedConstraintsPage';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { Loader } from '../../components/utils/Loader';
import * as constraintActions from '../../store/constraint/Actions';
import * as constraintSelectors from '../../store/constraint/Reducer';
import { ConstraintFilterParams, ConstraintShort, ConstraintType, OBJECT_TYPE } from '../../store/constraint/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Project } from '../../store/project/Types';
import { Utils } from '../../utils/Utils';

export interface OverloadedConstraintsPageViewProps {
  overloadedConstraintObjects: ConstraintShort[];
  projects: Project[];
  filter?: FilterMenuItem[];
  isLoading: boolean;
}

export interface OverloadedConstraintsPageViewDispatchProps {
  fetchAllConstraints: (constraintFilterParams?: ConstraintFilterParams, okCallback?, errorCallback?) => void;
  fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => void;
  setConstraintFilter: (filter: FilterMenuItem[] | undefined) => void;
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
  clearObjectConstrain: (objectId: number, objectType: OBJECT_TYPE, type: ConstraintType, okCallback, errorCallback) => void;
  displayError: (error: string) => void;
}

export interface OverloadedConstraintsPageViewStat {}

class OverloadedConstraintsPageView extends React.Component<
  OverloadedConstraintsPageViewDispatchProps & OverloadedConstraintsPageViewProps,
  OverloadedConstraintsPageViewStat
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.filter?.length > 0) {
      this.props.fetchAllConstraints(Utils.createConstraintFilterParamsFromFilterMenuItem(this.props.filter));
    } else {
      this.props.fetchAllConstraints();
    }
    this.props.fetchAllProjects();
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <OverloadedConstraintsPage
        refetch={(constraintFilterParams) => {
          this.props.fetchAllConstraints(constraintFilterParams);
        }}
        projects={this.props.projects}
        displayError={this.props.displayError}
        fetchConstraintForObject={this.props.fetchConstraintForObject}
        fetchConstraintForProject={this.props.fetchConstraintForProject}
        overloadedConstraints={this.props.overloadedConstraintObjects}
        updateConstraintOnObject={this.props.updateConstraintOnObject}
        clearObjectConstrain={this.props.clearObjectConstrain}
        updateConstraintOnProject={this.props.updateConstraintOnProject}
        setConstraintFilter={this.props.setConstraintFilter}
        filter={this.props.filter}
      />
    );
  }
}

function mapStateToProps(state): OverloadedConstraintsPageViewProps {
  return {
    isLoading: constraintSelectors.isOverloadedConstraintObjectsLoading(state),
    overloadedConstraintObjects: constraintSelectors.getOverloadedConstraintObjects(state),
    projects: projectSelectors.getProjects(state),
    filter: constraintSelectors.getConstraintFilter(state),
  };
}

function mapDispatchToProps(dispatch: any): OverloadedConstraintsPageViewDispatchProps {
  return {
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    setConstraintFilter: (filter: FilterMenuItem[] | undefined) => {
      dispatch(constraintActions.setConstraintFilter(filter));
    },
    fetchAllProjects: (fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) => {
      dispatch(projectActions.fetchAllProjects(fetchedCallback, errorCallback));
    },
    fetchAllConstraints: (constraintFilterParams: ConstraintFilterParams | undefined, okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchAllConstraints(constraintFilterParams, okCallback, errorCallback));
    },
    fetchConstraintForObject: (taskId, type: ConstraintType, okCallback?, errorCallback?) => {
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
    updateConstraintOnProject: (
      projectShortName: string,
      type: ConstraintType,
      patch: any,
      okCallback: () => void,
      errorCallback: (message: string) => void,
    ) => {
      dispatch(constraintActions.updateConstraintOnProject(projectShortName, type, patch, okCallback, errorCallback));
    },
    clearObjectConstrain: (objectId: number, objectType: OBJECT_TYPE, type: ConstraintType, okCallback, errorCallback) => {
      dispatch(constraintActions.clearObjectConstraint(objectId, objectType, type, okCallback, errorCallback));
    },
    fetchConstraintForProject: (projectShortName: string, okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchConstraintForProject(projectShortName, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OverloadedConstraintsPageView);

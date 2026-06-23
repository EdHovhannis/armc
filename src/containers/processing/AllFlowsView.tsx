import { checkAuthType } from '@src/store/auth/Actions';
import { AuthType } from '@src/store/auth/Types';
import * as React from 'react';
import { connect } from 'react-redux';

import AllFlowForm, { AllFlowFormProps } from '../../components/processing/AllFlowForm';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import * as authSelectors from '../../store/auth/Reducer';
import * as processingActions from '../../store/flow/Actions';
import * as processingSelectors from '../../store/flow/Reducer';
import { BusinessTask } from '../../store/flow/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';

export interface AllFlowsViewDispatchProps {
  checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => void;
  fetchPipelines: (buisinessTask?: BusinessTask) => void;
  suspendPipeline: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resumePipeline: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deletePipeline: (pipelineId: number, callbackk: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => void;
  setFlowFilter: (filter: FilterMenuItem[] | undefined) => void;
  fetchZones: (fetchedCallback?: (zone: Zone) => void) => any;
  displayError: (error: string) => void;
  addInstanceFlow: (
    flowId: number,
    zoneId: string,
    startFlow: boolean | undefined,
    callback?: (id: number) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  updateInstanceFlow: (
    flowId: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteInstanceFlow: (
    flowId: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  suspendInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resumeInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  fetchAllProjects: () => void;
}

interface AllFlowsViewState {
  authType?: AuthType;
}

class AllFlowsView extends React.Component<AllFlowFormProps & AllFlowsViewDispatchProps, AllFlowsViewState> {
  constructor(props) {
    super(props);
    this.state = {
      authType: this.props.authType,
    };
  }

  componentDidMount() {
    this.props.fetchPipelines();
    this.props.fetchAllProjects();
    this.props.fetchZones();

    if (!this.props.authType) {
      this.props.checkAuthType(
        (type: AuthType) => this.setState({ authType: type }),
        (error: string) => this.props.displayError(error),
      );
    }
  }

  render(): React.ReactNode {
    return (
      <AllFlowForm
        isAdmin={this.props.isAdmin}
        authType={this.state.authType}
        projects={this.props.projects}
        editableProjects={this.props.editableProjects}
        zone={this.props.zone}
        setFlowFilter={this.props.setFlowFilter}
        filter={this.props.filter}
        isOverviewsLoading={this.props.isOverviewsLoading}
        overview={this.props.overview}
        flowInProgress={this.props.flowInProgress}
        displayError={this.props.displayError}
        refetchOverview={this.props.fetchPipelines}
        addInstanceFlow={this.props.addInstanceFlow}
        updateInstanceFlow={this.props.updateInstanceFlow}
        deleteInstanceFlow={this.props.deleteInstanceFlow}
        deleteInstances={this.props.deleteInstances}
        deleteClicked={this.props.deletePipeline}
        suspendInstances={this.props.suspendInstances}
        suspendClicked={this.props.suspendPipeline}
        resumeInstances={this.props.resumeInstances}
        resumeClicked={this.props.resumePipeline}
      />
    );
  }
}

function mapStateToProps(state): AllFlowFormProps {
  return {
    isOverviewsLoading: processingSelectors.isOverviewsLoading(state),
    flowInProgress: processingSelectors.getFlowsInProgress(state),
    overview: processingSelectors.getOverviews(state),
    filter: processingSelectors.getFlowFilter(state),
    projects: projectSelectors.getProjects(state),
    zone: zoneSelectors.getZones(state),
    isAdmin: authSelectors.isAdmin(state),
    authType: authSelectors.authType(state),
    user: authSelectors.user(state),
  };
}

function mapDispatchToProps(dispatch: any): AllFlowsViewDispatchProps {
  return {
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    fetchAllProjects() {
      dispatch(projectActions.fetchAllProjects());
    },
    fetchPipelines: () => {
      dispatch(processingActions.fetchOverview(BusinessTask.NON));
    },
    fetchZones(fetchedCallback?: (zone: Zone) => void): any {
      dispatch(zoneActions.fetchAllZone(fetchedCallback));
    },
    setFlowFilter(filter) {
      dispatch(processingActions.setFlowFilter(filter));
    },
    addInstanceFlow: (
      flowId: number,
      zoneId: string,
      startFlow: boolean | undefined,
      callback?: (id: number) => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.addInstanceFlow(flowId, zoneId, startFlow, callback, errorCallback));
    },
    updateInstanceFlow: (
      flowId: number,
      zoneId: string,
      callback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.updateInstanceFlow(flowId, zoneId, callback, errorCallback));
    },
    deleteInstanceFlow: (
      flowId: number,
      zoneId: string,
      callback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.deleteInstanceFlow(flowId, zoneId, callback, errorCallback));
    },
    deletePipeline: (pipelineId, callback, errorCallback) => {
      dispatch(processingActions.deleteFlow(pipelineId, callback, errorCallback));
    },
    suspendPipeline: (id: number, zoneId: string, callback?, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => {
      dispatch(processingActions.suspendFlow(id, zoneId, callback, errorCallback));
    },
    resumePipeline: (id: number, zoneId: string, callback?, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => {
      dispatch(processingActions.resumeFlow(id, zoneId, callback, errorCallback));
    },
    suspendInstances: (
      flowId: number,
      zoneId: string,
      okCallback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.suspendInstances(flowId, zoneId, okCallback, errorCallback));
    },
    resumeInstances: (
      flowId: number,
      zoneId: string,
      okCallback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.resumeInstances(flowId, zoneId, okCallback, errorCallback));
    },
    deleteInstances: (
      flowId: number,
      zoneId: string,
      callback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.deleteInstances(flowId, zoneId, callback, errorCallback));
    },
    checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
      dispatch(checkAuthType(okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AllFlowsView);

import * as React from 'react';
import { connect } from 'react-redux';

import { SupervisorInstanceOverview } from '../../components/monitoring/SupervisorInstanceOverview';
import { Loader } from '../../components/utils/Loader';
import * as authSelectors from '../../store/auth/Reducer';
import { User } from '../../store/auth/Types';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Project } from '../../store/project/Types';
import { AnalyticIndexUtils } from '../../utils/AnalyticIndexUtils';

export interface SupervisorInstanceViewPropsParent {
  projects: Project[];
  topics: KafkaTopic[];
  supervisors: DruidSupervisorInfo[];
  fetchSupervisors: () => void;
  globalConfigurationVersion: Map<string, string>;
}

export interface SupervisorInstanceViewProps {
  user: User;
  isLoading: boolean;
}

export interface SupervisorInstanceViewDispatchProps {
  deleteSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  startSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  stopSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  resetSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  updateSupervisorInstanceById: (taskId: number, zoneId: string, okCallback?, errorCallback?) => void;
  fetchSupervisorById: (id: number, okCallback?: () => void) => void;
  displayError: (error) => void;
  displayInfo: (info) => void;
  displaySuccess: (success) => void;
}

class SupervisorInstanceView extends React.Component<
  SupervisorInstanceViewProps & SupervisorInstanceViewDispatchProps & SupervisorInstanceViewPropsParent,
  void
> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        {!this.props.isLoading && this.renderInstances()}
        {this.props.isLoading && <Loader />}
      </React.Fragment>
    );
  }

  renderInstances() {
    return (
      <React.Fragment>
        <SupervisorInstanceOverview
          isAdmin={this.props.user.admin}
          globalConfigurationVersion={this.props.globalConfigurationVersion}
          supervisors={this.props.supervisors}
          projects={this.props.projects}
          topics={this.props.topics}
          user={this.props.user}
          displayError={this.props.displayError}
          displayInfo={this.props.displayInfo}
          displaySuccess={this.props.displaySuccess}
          updateSupervisorInstanceById={this.props.updateSupervisorInstanceById}
          startSupervisorInstanceById={this.props.startSupervisorInstanceById}
          stopSupervisorInstanceById={this.props.stopSupervisorInstanceById}
          resetSupervisorInstanceById={this.props.resetSupervisorInstanceById}
          deleteSupervisorInstanceById={this.props.deleteSupervisorInstanceById}
          refreshSupervisor={(id) => {
            this.props.fetchSupervisorById(id);
          }}
          refetch={() => {
            this.props.fetchSupervisors();
          }}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): SupervisorInstanceViewProps {
  return {
    user: authSelectors.user(state),
    isLoading: monitoringSelectors.supervisorsIsLoading(state) || projectSelectors.isLoading(state) || kafkaSelectors.receiveInProgress(state),
  };
}

function mapDispatchToProps(dispatch: any): SupervisorInstanceViewDispatchProps {
  return {
    displayInfo(info): void {
      dispatch(notificationActions.info(info));
    },
    displaySuccess(success): void {
      dispatch(notificationActions.success(success));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    updateSupervisorInstanceById: (taskId, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.updateSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    deleteSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
      dispatch(monitoringActions.deleteSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    startSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
      dispatch(monitoringActions.startSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    stopSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
      dispatch(monitoringActions.stopSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    resetSupervisorInstanceById(taskId: number, zoneId: string, okCallback?, errorCallback?) {
      dispatch(monitoringActions.resetSupervisorInstanceById(taskId, zoneId, okCallback, errorCallback));
    },
    fetchSupervisorById: (id, okCallback) => {
      dispatch(monitoringActions.fetchSupervisorById(id, okCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SupervisorInstanceView);

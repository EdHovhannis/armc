import * as React from 'react';
import { connect } from 'react-redux';

import SupervisorOverview from '../../components/monitoring/SupervisorOverview';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';
import * as zoneActions from '../../store/zone/Actions';
import * as zonesSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';
import { Utils } from '../../utils/Utils';

export interface SupervisorsViewProps {
  zones: string[];
  projects: Project[];
  topics: KafkaTopic[];
  filter: FilterMenuItem[] | undefined;
  allLabels: string[];
  isRefetch?: boolean;
  supervisors: Array<DruidSupervisorInfo>;
  globalConfigVersions: string[];
  globalConfigurationVersion: Map<string, string>;
  editableProjects: EditableProject[];
}

export interface SupervisorsViewDispatchProps {
  setMonitoringFilter: (filter: FilterMenuItem[] | undefined, isRefetchFilter: boolean) => void;
  refetchSupervisors: (labels?: string[]) => void;
  refetchAllLabels: () => void;
  fetchProjects: () => void;
  fetchTopics: () => void;
  fetchAllZone: (okCallback?, errorCallback?) => void;
  refetchGlobalConfigurationVersion: () => void;
  getAllGlobalConfigsVersions: (
    zones: string[],
    okCallback?: (versions: string[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

class SupervisorsView extends React.Component<SupervisorsViewDispatchProps & SupervisorsViewProps, void> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.refetchAllLabels();
    if (this.props.filter?.length > 0) {
      this.props.refetchSupervisors(Utils.createLabelsFilter(this.props.filter));
    } else {
      this.props.refetchSupervisors();
    }
    this.props.refetchGlobalConfigurationVersion();
    this.props.fetchProjects();
    this.props.fetchTopics();
    this.props.fetchAllZone((zone: Zone) => {
      this.props.getAllGlobalConfigsVersions(zone.availableZones);
    });
  }

  render() {
    return (
      <SupervisorOverview
        globalConfigVersions={this.props.globalConfigVersions}
        globalConfigurationVersion={this.props.globalConfigurationVersion}
        zones={this.props.zones}
        projects={this.props.projects}
        topics={this.props.topics}
        filter={this.props.filter}
        allLabels={this.props.allLabels}
        isRefetch={this.props.isRefetch}
        supervisors={this.props.supervisors}
        editableProjects={this.props.editableProjects}
        setMonitoringFilter={this.props.setMonitoringFilter}
        refetchSupervisors={(labels?: string[]) => {
          this.props.refetchSupervisors(labels);
          this.props.refetchGlobalConfigurationVersion();
        }}
        refetchAllLabels={this.props.refetchAllLabels}
        fetchAllZone={this.props.fetchAllZone}
      />
    );
  }
}

function mapStateToProps(state): SupervisorsViewProps {
  return {
    supervisors: monitoringSelectors.getAllTasks(state),
    projects: projectSelectors.getProjects(state),
    topics: kafkaSelectors.getTopics(state),
    filter: monitoringSelectors.getMonitoringFilter(state),
    isRefetch: monitoringSelectors.isRefetch(state),
    allLabels: monitoringSelectors.getAllLabels(state),
    zones: zonesSelectors.getZones(state).availableZones,
    globalConfigurationVersion: monitoringSelectors.getGlobalConfigVersion(state),
    globalConfigVersions: monitoringSelectors.getGlobalConfigVersions(state),
  };
}

function mapDispatchToProps(dispatch: any): SupervisorsViewDispatchProps {
  return {
    fetchProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    setMonitoringFilter: (filter: FilterMenuItem[] | undefined, isRefetch: boolean) => {
      dispatch(monitoringActions.setMonitoringFilter(filter, isRefetch));
    },
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    refetchSupervisors: (labels?) => {
      dispatch(monitoringActions.fetchAllSupervisors(labels));
    },
    refetchAllLabels: () => {
      dispatch(monitoringActions.fetchAllLabels());
    },
    refetchGlobalConfigurationVersion: () => {
      dispatch(monitoringActions.getGlobalConfigurationVersionForDruid());
    },
    getAllGlobalConfigsVersions: (zones, okCallback, errorCallback) => {
      dispatch(monitoringActions.getAllGlobalConfigsVersions(zones, okCallback, errorCallback));
    },
    fetchAllZone: (okCallback, errorCallback) => {
      dispatch(zoneActions.fetchAllZone(okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SupervisorsView);

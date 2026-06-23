import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import ProjectsForm from '../../components/projects/ProjectsForm';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { Loader } from '../../components/utils/Loader';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchivalQuota, ArchivalQuotaWithProject } from '../../store/archive/Types';
import * as authSelectors from '../../store/auth/Reducer';
import * as collectorActions from '../../store/collector/Actions';
import * as collectorSelectors from '../../store/collector/Reducer';
import { CollectorProjectQuota } from '../../store/collector/Type';
import * as processingActions from '../../store/flow/Actions';
import * as processingSelectors from '../../store/flow/Reducer';
import { FlowQuota } from '../../store/flow/Types';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaQuota } from '../../store/kafka/Types';
import * as lookupActions from '../../store/lookup/Actions';
import * as lookupSelectors from '../../store/lookup/Reducer';
import { DictionaryQuota, LookupQuota } from '../../store/lookup/Types';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { MonitoringQuota } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as osirisSelectors from '../../store/osiris/Reducer';
import { OsirisCheckQuotaProject, OsirisTrafficQuotaProject } from '../../store/osiris/Type';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Project } from '../../store/project/Types';
import * as unimonSelectors from '../../store/unimon/Reducer';
import { UnimonProjectQuota } from '../../store/unimon/Type';

interface ProjectsViewProps {
  isLoading: boolean;
  isAdmin: boolean;
  filter: FilterMenuItem[] | undefined;
  projects: Array<Project>;
  kafkaQuotas: Map<number, KafkaQuota>;
  indexQuotas: any;
  archiveQuotas: Map<string, ArchivalQuota>;
  monitoringQuotas: Map<number, MonitoringQuota>;
  processingQuotas: Map<number, FlowQuota>;
  dictionaryQuotas: Map<string, DictionaryQuota>;
  lookupQuotas: Map<string, LookupQuota>;
  unimonQuotas: Map<string, UnimonProjectQuota>;
  osirisTrafficQuotas: Map<string, OsirisTrafficQuotaProject>;
  osirisCheckQuotas: Map<string, OsirisCheckQuotaProject>;
  collectorQuotas: CollectorProjectQuota[];
}

interface ProjectsViewDispatchProps {
  fetchProjects: (callback) => void;
  fetchKafkaQuotas: (projectIds) => void;
  fetchProcessingQuotas: (projectIds) => void;
  fetchMonitoringQuotas: (projectIds) => void;
  fetchIndexQuotas: () => void;
  fetchDictionaryQuotas: () => void;
  fetchLookupQuotas: () => void;
  createProject: (projectName: string, shortName: string) => void;
  fetchArchiveQuota: (fetchedCallback?: (quota: ArchivalQuotaWithProject[]) => void, errorCallback?: (msg: string) => void) => void;
  displayError: (msg: string) => void;
  setProjectFilter: (filter: FilterMenuItem[] | undefined) => void;
  fetchCollectorQuotas: (projectNames: string[]) => void;
}

class ProjectsView extends React.Component<ProjectsViewDispatchProps & ProjectsViewProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchProjects((projects: Array<Project>) => {
      const ids = projects.map((project) => project.id);
      this.props.fetchArchiveQuota();
      this.props.fetchIndexQuotas();
      this.props.fetchKafkaQuotas(ids);
      this.props.fetchMonitoringQuotas(ids);
      this.props.fetchProcessingQuotas(ids);
      this.props.fetchDictionaryQuotas();
      this.props.fetchLookupQuotas();
      this.props.fetchCollectorQuotas([]);
    });
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <ProjectsForm
        filter={this.props.filter}
        setProjectFilter={this.props.setProjectFilter}
        isLoading={this.props.isLoading}
        isAdmin={this.props.isAdmin}
        projects={this.props.projects}
        kafkaQuotas={this.props.kafkaQuotas}
        archiveQuotas={this.props.archiveQuotas}
        monitoringQuotas={this.props.monitoringQuotas}
        processingQuotas={this.props.processingQuotas}
        indexQuotas={this.props.indexQuotas}
        dictionaryQuotas={this.props.dictionaryQuotas}
        lookupQuotas={this.props.lookupQuotas}
        createProject={this.props.createProject}
        displayError={this.props.displayError}
        unimonQuotas={this.props.unimonQuotas}
        osirisTrafficQuotas={this.props.osirisTrafficQuotas}
        osirisCheckQuotas={this.props.osirisCheckQuotas}
        collectorQuotas={this.props.collectorQuotas}
      />
    );
  }
}

function mapStateToProps(state): ProjectsViewProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    filter: projectSelectors.getProjectFilter(state),
    projects: projectSelectors.getProjects(state),
    indexQuotas: indexSelectors.getQuotas(state),
    kafkaQuotas: kafkaSelectors.getQuotas(state),
    monitoringQuotas: monitoringSelectors.getQuotas(state),
    processingQuotas: processingSelectors.getQuotas(state),
    dictionaryQuotas: lookupSelectors.getDictionaryQuotas(state),
    lookupQuotas: lookupSelectors.getLookupQuotas(state),
    unimonQuotas: unimonSelectors.getQuotas(state),
    osirisCheckQuotas: osirisSelectors.getCheckQuotas(state),
    osirisTrafficQuotas: osirisSelectors.getTrafficQuotas(state),
    isLoading:
      projectSelectors.isLoading(state) ||
      kafkaSelectors.isQuotasLoading(state) ||
      monitoringSelectors.isQuotaLoading(state) ||
      processingSelectors.isQuotasLoading(state) ||
      archiveSelectors.isQuotasLoading(state) ||
      lookupSelectors.isDictionaryQuotasLoading(state) ||
      lookupSelectors.isLookupQuotasLoading(state),
    archiveQuotas: archiveSelectors.getQuotas(state),
    collectorQuotas: collectorSelectors.getQuotas(state),
  };
}

function mapDispatchToProps(dispatch: any): ProjectsViewDispatchProps {
  return {
    setProjectFilter(filter) {
      dispatch(projectActions.setProjectFilter(filter));
    },
    fetchArchiveQuota(fetchedCallback?: (quota: ArchivalQuotaWithProject[]) => void, errorCallback?: (msg: string) => void) {
      dispatch(archiveActions.fetchQuotas(fetchedCallback, errorCallback));
    },
    fetchCollectorQuotas: (projectNames: string[]) => {
      dispatch(collectorActions.getListQuotasForAvailableProjects(projectNames));
    },
    fetchProjects: (callback) => {
      dispatch(projectActions.fetchAllProjects(callback));
    },
    createProject(projectName: string, shortName: string) {
      dispatch(projectActions.createProject(projectName, shortName));
    },
    fetchKafkaQuotas: (projectIds: Array<number>) => {
      dispatch(kafkaActions.fetchQuotas(projectIds));
    },
    fetchMonitoringQuotas: (projectIds: Array<number>) => {
      dispatch(monitoringActions.fetchQuotas(projectIds));
    },
    fetchProcessingQuotas: (projectIds: Array<number>) => {
      dispatch(processingActions.fetchQuotas(projectIds));
    },
    fetchIndexQuotas: () => {
      dispatch(indexActions.fetchQuotas());
    },
    fetchDictionaryQuotas: () => {
      dispatch(lookupActions.fetchListDictionaryQuotas());
    },
    fetchLookupQuotas: () => {
      dispatch(lookupActions.fetchListLookupQuotas());
    },
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsView);

import { Grid, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { AuthType } from '@src/store/auth/Types';
import { getEnableFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import { Cluster, ClusterItem } from '../../components/clusters/types';
import ProjectInfoForm from '../../components/projects/ProjectInfoForm';
import { Loader } from '../../components/utils/Loader';
import { withParams, WithParamsProps } from '../../components/utils/withParams';
import * as almgrActions from '../../store/almgr/Actions';
import * as almgrSelectors from '../../store/almgr/Reducer';
import { AlmgrQuota, AlmgrReducedQuota } from '../../store/almgr/Type';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchivalQuota } from '../../store/archive/Types';
import { checkAuthType } from '../../store/auth/Actions';
import * as authSelectors from '../../store/auth/Reducer';
import * as clustersActions from '../../store/clusters/Actions';
import * as clustersSelectors from '../../store/clusters/Reducer';
import {
  FetchProjectClusters,
  FetchClustersQuota,
  FetchClustersRemainingQuota,
  QuotaListItem,
  QuotaRemainingItem,
  UpdateClustersAllowance,
  UpdateClustersQuota,
  FetchClusters,
} from '../../store/clusters/Types';
import * as collectorActions from '../../store/collector/Actions';
import * as collectorSelectors from '../../store/collector/Reducer';
import { EMPTY_QUOTA } from '../../store/collector/Reducer';
import { CollectorProjectQuota } from '../../store/collector/Type';
import * as processingActions from '../../store/flow/Actions';
import * as processingSelectors from '../../store/flow/Reducer';
import { FlowQuota } from '../../store/flow/Types';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import { IndexQuota } from '../../store/index/Types';
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
import * as osirisActions from '../../store/osiris/Actions';
import * as osirisSelectors from '../../store/osiris/Reducer';
import {
  OsirisCheckQuotaProject,
  OsirisCheckQuotaRequest,
  OsirisQuotaType,
  OsirisTrafficQuotaProject,
  OsirisTrafficQuotaRequest,
} from '../../store/osiris/Type';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Project } from '../../store/project/Types';
import { Resource, Role } from '../../store/role/Types';
import * as unimonActions from '../../store/unimon/Actions';
import * as unimonSelectors from '../../store/unimon/Reducer';
import { UnimonProjectQuota, UnimonProjectRequestQuota } from '../../store/unimon/Type';
import { ClusterUtils } from '../../utils/ClusterUtils';
import { Utils } from '../../utils/Utils';
import PermissionUserView from '../permissions/PermissionUserView';

interface ProjectInfoViewProps {
  isAdmin: boolean;
  authType: AuthType | undefined;
  isLoading: boolean;
  project: Project;
  kafkaQuota: KafkaQuota;
  monitoringQuota: MonitoringQuota;
  flowQuota: FlowQuota;
  indexQuota: IndexQuota;
  archiveQuota: ArchivalQuota;
  dictionaryQuota: DictionaryQuota;
  lookupQuota: LookupQuota;
  fulltextQuota: IndexQuota;
  unimonQuota: UnimonProjectQuota;
  almgrQuota: AlmgrQuota;
  osirisTrafficQuota?: OsirisTrafficQuotaProject;
  osirisCheckQuota?: OsirisCheckQuotaProject;
  collectorQuota: CollectorProjectQuota | null;
  clusters: Cluster[];
  projectClusters: ClusterItem[];
  clustersQuota: QuotaListItem[];
  clustersRemainingQuota: QuotaRemainingItem[];
  isLimitFeatureSettingEnabled: boolean;
}

interface ProjectInfoViewDispatchProps {
  fetchProject: (project_id: number, okCallback?, errorCallbavk?) => void;
  fetchKafkaQuota: (project_id: number) => void;
  fetchMonitoringQuota: (project_id: number) => void;
  fetchProcessingQuota: (project_id: number) => void;
  fetchDictionaryQuota: (projectShortName: string) => void;
  fetchFulltextQuota: (projectShortName: string) => void;
  fetchArchiveQuota: (projectShortName: string) => void;
  fetchLookupQuota: (projectShortName: string) => void;
  fetchAlmgrQuota: (projectName: string) => void;
  fetchCollectorQuota: (projectName: string) => void;
  fetchClusters: FetchClusters;
  fetchProjectClusters: FetchProjectClusters;
  fetchClustersQuota: FetchClustersQuota;
  fetchClusterRemainingQuota: FetchClustersRemainingQuota;
  setCollectorQuotaProject: (projectName: string, quota: number, okCallback?: (quotaCollector: CollectorProjectQuota) => void) => void;
  updateKafkaQuota: (projectId: number, maxPartitions: number) => void;
  updateMonitoringQuota: (projectId: number, maxPartitions: number) => void;
  updateProcessingQuota: (projectId: number, maxPipelines: number) => void;
  updateIndexQuota: (projectShortName: string, maxVolume: number, maxRate: number, callback) => void;
  updateArchiveQuota: (projectShortName: string, volume: number, rate: number, callback?) => void;
  updateDictionaryQuota: (projectShortName: string, maxSize: number) => void;
  updateLookupQuota: (projectShortName: string, maxCount: number) => void;
  updateUnimonQuota: (projectName: string, quota: UnimonProjectRequestQuota, okCallback?, errorCallback?) => void;
  updateAlmgrQuota: (projectName: string, quota: AlmgrReducedQuota, okCallback?, errorCallback?) => void;
  updateClustersQuota: UpdateClustersQuota;
  updateClustersAllowance: UpdateClustersAllowance;
  createCheckQuota: (
    projectName: string,
    quota: OsirisCheckQuotaRequest,
    fetchedCallback?: (quota: OsirisCheckQuotaRequest) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  createTrafficQuota: (
    projectName: string,
    quota: OsirisTrafficQuotaRequest,
    fetchedCallback?: (quota: OsirisTrafficQuotaRequest) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  updateCheckQuota: (
    projectName: string,
    quota: OsirisCheckQuotaRequest,
    fetchedCallback?: (quota: OsirisCheckQuotaRequest) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  updateTrafficQuota: (
    projectName: string,
    quota: OsirisTrafficQuotaRequest,
    fetchedCallback?: (quota: OsirisTrafficQuotaRequest) => void,
    errorCallback?: (error: string) => void,
  ) => void;

  displayError: (error: string) => void;
  saveProject: (project: Project) => void;
  checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => void;
  // removeProjectById: (project_id: number) => void
}

interface ProjectInfoViewState {
  authType?: AuthType;
}

class ProjectInfoView extends React.Component<ProjectInfoViewProps & ProjectInfoViewDispatchProps & WithParamsProps, ProjectInfoViewState> {
  constructor(props) {
    super(props);

    this.state = {
      authType: this.props.authType,
    };
    autoBind(this);
  }

  componentDidMount() {
    if (!this.props.authType) {
      this.props.checkAuthType(
        (type: AuthType) => this.setState({ authType: type }),
        (error: string) => this.props.displayError(error),
      );
    }
    if (!this.props.id) {
      console.error('Project ID is not provided');
      return;
    }

    const projectId = Number(this?.props?.id) || 0;
    if (isNaN(projectId)) {
      console.error('Invalid project ID:', this.props.id);
      return;
    }

    this.props.fetchProject(projectId, (project: Project) => {
      this.props.fetchDictionaryQuota(project.shortName);
      this.props.fetchLookupQuota(project.shortName);
      this.props.fetchArchiveQuota(project.shortName);
      this.props.fetchFulltextQuota(project.shortName);
      this.props.fetchAlmgrQuota(project.shortName);
      this.props.fetchCollectorQuota(project.shortName); // 500
      // get clusters info
      this.props.fetchClusters();
      this.props.fetchProjectClusters(project);
      this.props.fetchClustersQuota([project.shortName], []);
      this.props.fetchClusterRemainingQuota();
    });

    this.props.fetchKafkaQuota(projectId);
    this.props.fetchMonitoringQuota(projectId);
    this.props.fetchProcessingQuota(projectId);
  }

  render() {
    if (this.props.isLoading) return <Loader />;
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ width: '100%' }}>
        <Grid item style={{ width: 800 }}>
          <ProjectInfoForm
            displayError={this.props.displayError}
            isAdmin={this.props.isAdmin}
            projectName={this.props.project.name}
            shortName={this.props.project.shortName}
            currentKafkaPartitions={this.props.kafkaQuota.currentPartitions}
            maxKafkaPartitions={this.props.kafkaQuota.maxPartitions}
            currentDruidTaskCount={this.props.monitoringQuota.currentTaskCount}
            maxDruidTaskCount={this.props.monitoringQuota.maxTaskCount}
            currentQuotaSize={this.props.flowQuota.currentQuotaSize}
            maxQuotaSize={this.props.flowQuota.maxQuotaSize}
            currentVolume={this.props.indexQuota.currentVolume}
            maxVolume={this.props.indexQuota.maxVolume}
            currentRate={this.props.indexQuota.currentRate}
            maxRate={this.props.indexQuota.maxRate}
            currentArchVolume={this.props.archiveQuota.currentSizeBytes}
            maxArchVolume={this.props.archiveQuota.maxSizeBytes}
            currentArchRate={this.props.archiveQuota.currentDataRateBytesPerSec}
            maxArchRate={this.props.archiveQuota.maxDataRateBytesPerSec}
            currentCountLookup={this.props.lookupQuota.currentCount}
            maxCountLookup={this.props.lookupQuota.maxCount}
            currentSizeDictionary={this.props.dictionaryQuota.currentSizeBytes}
            maxSizeDictionary={this.props.dictionaryQuota.maxSizeBytes}
            unimonQuota={this.props.unimonQuota}
            almgrQuota={this.props.almgrQuota}
            collectorQuota={this.props.collectorQuota || EMPTY_QUOTA}
            osirisCheckQuota={
              this.props.osirisCheckQuota || {
                quotaType: {
                  name: OsirisQuotaType.CHECK_QUOTA,
                },
                max: 0,
                spent: 0,
              }
            }
            osirisTrafficQuota={
              this.props.osirisTrafficQuota || {
                quotaType: {
                  name: OsirisQuotaType.TRAFFIC_QUOTA,
                },
                max: 0,
                spent: 0,
                over: 0,
                maxSecondsInOver: 0,
              }
            }
            clustersInfo={
              ClusterUtils.getClusterTableData(
                this.props.clusters,
                this.props.projectClusters,
                this.props.clustersQuota,
                this.props.clustersRemainingQuota,
              ) ?? []
            }
            redirect={false}
            confirmDeleteOpen={false}
            collectorQuotaLimitUnit="b"
            updateProject={(
              projectName,
              maxPartitions,
              maxDruidTasks,
              maxPipelines,
              maxVolume,
              maxRate,
              maxArchVolume,
              maxArchRate,
              maxSizeDictionary,
              maxCountLookup,
              unimonQuota,
              almgrQuota,
              osirisCheckQuota,
              osirisTrafficQuota,
              collectorQuota,
              clustersInfo,
            ) => {
              this.props.kafkaQuota.maxPartitions !== maxPartitions
                ? this.props.updateKafkaQuota(this.props.kafkaQuota.projectId, maxPartitions)
                : null;
              this.props.monitoringQuota.maxTaskCount !== maxDruidTasks
                ? this.props.updateMonitoringQuota(this.props.monitoringQuota.projectId, maxDruidTasks)
                : null;
              this.props.flowQuota.maxQuotaSize !== maxPipelines
                ? this.props.updateProcessingQuota(this.props.flowQuota.project_id, maxPipelines)
                : null;
              // Не сохраняем квоты при включенных лимитах
              if (!this.props.isLimitFeatureSettingEnabled) {
                if (this.props.indexQuota.maxRate !== maxRate || this.props.indexQuota.maxVolume !== maxVolume) {
                  this.props.updateIndexQuota(this.props.project.shortName, maxVolume, maxRate, () => {});
                }

                if (this.props.archiveQuota.maxDataRateBytesPerSec !== maxArchRate || this.props.archiveQuota.maxSizeBytes !== maxArchVolume) {
                  this.props.updateArchiveQuota(this.props.project.shortName, maxArchVolume, maxArchRate);
                }
              }
              if (this.props.lookupQuota.maxCount !== maxCountLookup) {
                // if (maxCountLookup !== 0 ) {
                this.props.updateLookupQuota(this.props.project.shortName, maxCountLookup);
                // }
              }
              if (this.props.dictionaryQuota.maxSizeBytes !== maxSizeDictionary) {
                // if (maxSizeDictionary !== 0 ) {
                this.props.updateDictionaryQuota(this.props.project.shortName, maxSizeDictionary);
                // }
              }
              if (!Utils.isUnimonQuotaEquals(this.props.unimonQuota, unimonQuota)) {
                this.props.updateUnimonQuota(this.props.project.shortName, {
                  overdraftMinutes: unimonQuota.overdraftMinutes,
                  overdraftPercent: unimonQuota.overdraftPercent,
                  limitTrafficPerMin: unimonQuota.limitTrafficPerMin,
                });
              }

              if (!Utils.isAlmgrQuotaEquals(this.props.almgrQuota, almgrQuota)) {
                this.props.updateAlmgrQuota(this.props.project.shortName, {
                  ...almgrQuota,
                });
              }

              if (!Utils.isOsirisTrafficQuotaEmpty(osirisTrafficQuota)) {
                if (!this.props.osirisTrafficQuota) {
                  this.props.createTrafficQuota(this.props.project.shortName, {
                    over: osirisTrafficQuota.over,
                    max: osirisTrafficQuota.max,
                    maxSecondsInOver: osirisTrafficQuota.maxSecondsInOver,
                    quotaType: osirisTrafficQuota.quotaType,
                  });
                } else if (!Utils.isOsirisTrafficQuotaEquals(this.props.osirisTrafficQuota, osirisTrafficQuota)) {
                  this.props.updateTrafficQuota(this.props.project.shortName, {
                    ...this.props.osirisTrafficQuota,
                    over: osirisTrafficQuota.over,
                    max: osirisTrafficQuota.max,
                    maxSecondsInOver: osirisTrafficQuota.maxSecondsInOver,
                    quotaType: osirisTrafficQuota.quotaType,
                  });
                }
              }

              if (!Utils.isOsirisCheckQuotaEmpty(osirisCheckQuota)) {
                if (!this.props.osirisCheckQuota) {
                  this.props.createCheckQuota(this.props.project.shortName, {
                    max: osirisCheckQuota.max,
                    quotaType: osirisCheckQuota.quotaType,
                  });
                } else if (!Utils.isOsirisCheckQuotaEquals(this.props.osirisCheckQuota, osirisCheckQuota)) {
                  this.props.updateCheckQuota(this.props.project.shortName, {
                    ...this.props.osirisCheckQuota,
                    max: osirisCheckQuota.max,
                    quotaType: osirisCheckQuota.quotaType,
                  });
                }
              }

              if (this.props.project.name !== projectName) {
                const project: Project = this.props.project;
                project.name = projectName;
                this.props.saveProject(project);
              }

              if (this.props.project.shortName) {
                this.props.setCollectorQuotaProject(this.props.project.shortName, collectorQuota.limitTrafficBytesPerMin);
              }

              // При включенных лимитах запрос слать не нужно
              if (clustersInfo !== undefined && !this.props.isLimitFeatureSettingEnabled) {
                const enabledClusters = ClusterUtils.getEnabledClusters(clustersInfo);
                const clustersId = ClusterUtils.getClustersId(enabledClusters);

                // отправляем квоты для всех существующих кластеров, нулевые квоты не шлем
                this.props.updateClustersQuota(this.props.project.id, ClusterUtils.getClustersQuotaUpdateData(clustersInfo), this.props.displayError);

                // отправляем список включенных кластеров
                this.props.updateClustersAllowance(this.props.project.id, clustersId, this.props.displayError);
              }
            }}
            isLoading={this.props.isLoading}
            isLimitFeatureSettingEnabled={this.props.isLimitFeatureSettingEnabled}
          />
          {this.state.authType === 'legacy' && (
            <div style={{ marginTop: '16px', width: '100%' }}>
              <Paper style={{ height: 64 }}>
                <Typography
                  variant="h6"
                  style={{
                    width: '100%',
                    padding: 16,
                    color: 'rgba(0.0,0.0,0.0,0.54)',
                  }}
                >
                  Права проекта
                </Typography>
              </Paper>
              <div style={{ marginTop: '16px' }}>
                <PermissionUserView
                  canEditAccess={this.props.isAdmin || this.props.project.canManageAccess}
                  resourceId={Number(this?.props?.id) || 0}
                  resource={Resource.PROJECT}
                  showSharedToggle={true}
                  excludedRoles={[Role.FULL_TEXT_INDEX_EXPORT, Role.ARCHIVE_INDEX_EXPORT]}
                />
              </div>
            </div>
          )}
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state: any): ProjectInfoViewProps {
  const project = projectSelectors.getSelectedProject(state);
  return {
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
    isAdmin: authSelectors.isAdmin(state),
    authType: authSelectors.authType(state),
    project: project,
    kafkaQuota: kafkaSelectors.getQuotaForProject(state, project.id),
    monitoringQuota: monitoringSelectors.getQuotaForProject(state, project.id),
    flowQuota: processingSelectors.getQuotaForProject(state, project.id),
    indexQuota: indexSelectors.getQuotaById(state, project.shortName),
    archiveQuota: archiveSelectors.getQuotaByProjectName(state, project.shortName),
    fulltextQuota: indexSelectors.getQuotaById(state, project.shortName),
    lookupQuota: lookupSelectors.getLookupQuota(state, project.shortName),
    dictionaryQuota: lookupSelectors.getDictionaryQuota(state, project.shortName),
    unimonQuota: unimonSelectors.getQuota(state),
    almgrQuota: almgrSelectors.getQuotas(state),
    osirisTrafficQuota: osirisSelectors.getTrafficQuota(state),
    osirisCheckQuota: osirisSelectors.getCheckQuota(state),
    collectorQuota: collectorSelectors.getQuota(state),
    clusters: clustersSelectors.getClusters(state),
    projectClusters: clustersSelectors.getProjectClusters(state),
    clustersQuota: clustersSelectors.getClustersQuota(state),
    clustersRemainingQuota: clustersSelectors.getClustersRemainingQ(state),
    isLoading:
      projectSelectors.isLoading(state) ||
      monitoringSelectors.isQuotaLoading(state) ||
      kafkaSelectors.isQuotasLoading(state) ||
      lookupSelectors.isLookupQuotasLoading(state) ||
      lookupSelectors.isDictionaryQuotasLoading(state) ||
      processingSelectors.isQuotasLoading(state) ||
      archiveSelectors.isQuotaLoading(state) ||
      indexSelectors.isQuotasLoading(state) ||
      clustersSelectors.isGlobalClustersLoading(state),
  };
}

function mapDispatchToProps(dispatch: any): ProjectInfoViewDispatchProps {
  return {
    fetchProject: (project_id: number, okCallback, errorCallbavk) => {
      dispatch(projectActions.fetchProjectById(project_id, okCallback, errorCallbavk));
    },
    saveProject: (project: Project) => {
      dispatch(projectActions.updateProjectById(project.id, project));
    },
    // removeProjectById(project_id: number) {
    //   dispatch(projectActions.deleteProjectById(project_id))
    // },
    fetchKafkaQuota(project_id: number) {
      dispatch(kafkaActions.fetchQuotas([project_id]));
    },
    updateKafkaQuota(projectId: number, maxPartitions: number) {
      dispatch(kafkaActions.updateQuotas(projectId, maxPartitions));
    },
    fetchMonitoringQuota(project_id: number) {
      dispatch(monitoringActions.fetchQuotas([project_id]));
    },
    fetchDictionaryQuota(projectShortName) {
      dispatch(lookupActions.getDictionaryQuota(projectShortName));
    },
    fetchLookupQuota(projectShortName) {
      dispatch(lookupActions.getLookupQuota(projectShortName));
    },
    fetchArchiveQuota: (projectShortName) => {
      dispatch(archiveActions.fetchQuota(projectShortName));
    },
    fetchFulltextQuota: (projectShortName) => {
      dispatch(indexActions.fetchQuota(projectShortName));
    },
    fetchClusters: (...args) => {
      dispatch(clustersActions.fetchClusters(...args));
    },
    fetchProjectClusters: (...args) => {
      dispatch(clustersActions.fetchProjectClusters(...args));
    },
    fetchClustersQuota: (...args) => {
      dispatch(clustersActions.fetchClustersQuota(...args));
    },
    fetchClusterRemainingQuota: (...args) => dispatch(clustersActions.fetchClustersRemainingQuota(...args)),
    updateDictionaryQuota(projectShortName: string, maxSize: number) {
      dispatch(lookupActions.createDictionaryQuota(projectShortName, maxSize));
    },
    updateLookupQuota(projectShortName: string, maxCount: number) {
      dispatch(lookupActions.createLookupQuota(projectShortName, maxCount));
    },
    updateMonitoringQuota(projectId: number, maxTaskCount: number) {
      dispatch(monitoringActions.updateQuotas(projectId, maxTaskCount));
    },
    updateProcessingQuota(projectId: number, maxPipelines: number) {
      dispatch(processingActions.updateQuotas(projectId, maxPipelines));
    },
    fetchProcessingQuota(project_id: number) {
      dispatch(processingActions.fetchQuotas([project_id]));
    },
    updateIndexQuota(projectShortName: string, maxVolume: number, maxRate: number, callback) {
      dispatch(indexActions.updateQuotaForProject(projectShortName, maxVolume, maxRate, callback));
    },
    updateArchiveQuota(projectShortName: string, volume: number, rate: number, callback?) {
      dispatch(archiveActions.updateQuotaForProject(projectShortName, volume, rate, callback));
    },
    updateUnimonQuota: (projectName, quota, okCallback, errorCallback) => {
      dispatch(unimonActions.setQuota(projectName, quota, okCallback, errorCallback));
    },
    updateAlmgrQuota: (projectName, quota, okCallback, errorCallback) => {
      dispatch(almgrActions.setQuota(projectName, quota, okCallback, errorCallback));
    },
    fetchAlmgrQuota: (projectName) => {
      dispatch(almgrActions.fetchQuota(projectName));
    },
    fetchCollectorQuota: (projectName) => {
      dispatch(collectorActions.fetchQuotaSafe(projectName));
    },
    setCollectorQuotaProject: (projectName, quota, okCallback?) => {
      dispatch(collectorActions.setQuota(projectName, quota, okCallback));
    },
    createCheckQuota: (projectName, quota, fetchedCallback, errorCallback) => {
      dispatch(osirisActions.createCheckQuota(projectName, quota, fetchedCallback, errorCallback));
    },
    createTrafficQuota: (projectName, quota, fetchedCallback, errorCallback) => {
      dispatch(osirisActions.createTrafficQuota(projectName, quota, fetchedCallback, errorCallback));
    },
    updateCheckQuota: (projectName, quota, fetchedCallback, errorCallback) => {
      dispatch(osirisActions.updateCheckQuota(projectName, quota, fetchedCallback, errorCallback));
    },
    updateTrafficQuota: (projectName, quota, fetchedCallback, errorCallback) => {
      dispatch(osirisActions.updateTrafficQuota(projectName, quota, fetchedCallback, errorCallback));
    },
    updateClustersQuota: (...args) => dispatch(clustersActions.updateClustersQuota(...args)),
    updateClustersAllowance: (...args) => dispatch(clustersActions.updateClustersAllowance(...args)),
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
      dispatch(checkAuthType(okCallback, errorCallback));
    },
  };
}

export default withParams(connect(mapStateToProps, mapDispatchToProps)(ProjectInfoView));

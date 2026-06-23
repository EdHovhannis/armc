import * as React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import { IndexOverview, IndexOverviewProps } from '../../components/index/IndexOverview';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import * as authSelectors from '../../store/auth/Reducer';
import * as constraintsActions from '../../store/constraint/Actions';
import * as constraintActions from '../../store/constraint/Actions';
import { ConstraintType } from '../../store/constraint/Types';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftActions from '../../store/overdraft/Actions';
import * as overdraftSelectors from '../../store/overdraft/Reducer';
import * as pipelineActions from '../../store/pipeline/Actions';
import * as pipelineSelectors from '../../store/pipeline/Reducer';
import { Pipeline, PipelineMeta, PipelineShort, PipelineStatus } from '../../store/pipeline/Types';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { Unit } from '../../store/role/Types';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';

const IndexTasks: React.FC<IndexOverviewProps> = (props) => {
  const navigate = useNavigate();

  return (
    <IndexOverview
      {...props}
      redirect={(where) => {
        navigate(where);
      }}
    />
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchZones(fetchedCallback?: (zone: Zone) => void): any {
      dispatch(zoneActions.fetchAllZone(fetchedCallback));
    },
    listFulltextTasks: (labels?: string[], okCallback?: any, errorCallback?: any) => {
      dispatch(indexActions.getFulltextTasksList(labels, okCallback, errorCallback));
    },
    listPipelines: (okCallback: (pipelines: PipelineShort[]) => void, errCallback: (errorMsg: string) => void): void => {
      dispatch(pipelineActions.listPipelines(okCallback, errCallback));
    },
    getAllFulltextLabelsList: (okCallback?, errorCallback?) => {
      dispatch(indexActions.getAllFulltextLabelsList(okCallback, errorCallback));
    },
    getPipelineInfo: (
      projectShortName: string,
      name: string,
      okCallback?: (pipeline: Pipeline) => void,
      errorCallback?: (errorMsg: string) => void,
    ) => {
      dispatch(pipelineActions.getPipelineInfo(projectShortName, name, okCallback, errorCallback));
    },
    fetchPipelineMeta: (
      projectShortName: string,
      name: string,
      zoneId: string,
      okCallback: (pipeline: PipelineMeta) => void,
      errorCallback?: (errorMsg: string) => void,
    ) => {
      dispatch(pipelineActions.getPipelineMeta(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    deletePipelineById: (projectShortName: string, name: string, zoneId?: string, okCallback?, errorCallback?) => {
      dispatch(pipelineActions.deletePipeline(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displayInfo: (info) => {
      dispatch(notificationActions.info(info));
    },
    displaySuccess: (message: string) => {
      dispatch(notificationActions.success(message));
    },
    fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => {
      dispatch(constraintsActions.fetchConstraintForObject(taskId, type, okCallback, errorCallback));
    },
    importTask: (task: Pipeline) => {
      dispatch(pipelineActions.replaceCurrentPipeline(task));
    },
    resumeTask: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => {
      dispatch(pipelineActions.resumePipeline(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    forceRotate: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => {
      dispatch(indexActions.forceRotateIndex(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    suspendTask: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => {
      dispatch(pipelineActions.suspendPipeline(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    refreshInstanceFulltext: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => {
      dispatch(pipelineActions.refreshInstancePipeline(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    addInstanceFulltext: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => {
      dispatch(pipelineActions.addInstancePipeline(projectShortName, name, zoneId, okCallback, errorCallback));
    },
    downloadPipeline(projectShortName: string, name: string) {
      dispatch(pipelineActions.downloadPipeline(projectShortName, name));
    },
    getListPipelinesStatus: (okCallback?, errorCallback?) => {
      dispatch(pipelineActions.getListPipelinesStatus(okCallback, errorCallback));
    },
    fetchTopics() {
      dispatch(kafkaActions.fetchTopics());
    },
    setIndexFilter(filter: FilterMenuItem[] | undefined, isRefetch: boolean) {
      dispatch(pipelineActions.setIndexFilter(filter, isRefetch));
    },
    fetchUserProjects: () => {
      dispatch(projectActions.fetchAllProjects());
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
    getFulltextTaskByProjectAndName(projectShortName, indexName, okCallback?, errorCallback?) {
      dispatch(indexActions.getFulltextTaskByProjectAndName(projectShortName, indexName, okCallback, errorCallback));
    },
    getFulltextOverdraftConfig: (okCallback, errorCallback) => {
      dispatch(overdraftActions.getFulltextOverdraftConfig(okCallback, errorCallback));
    },
    changeInstanceOverdraft: (
      project: string,
      name: string,
      zoneId: string,
      value: number,
      okCallback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(pipelineActions.changeInstanceOverdraft(project, name, zoneId, value, okCallback, errorCallback));
    },
    resetInstanceOverdraft: (
      project: string,
      name: string,
      zoneId: string,
      okCallback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(pipelineActions.resetInstanceOverdraft(project, name, zoneId, okCallback, errorCallback));
    },
    resetZoneOverdraft: (zoneId: string, okCallback?: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => {
      dispatch(pipelineActions.resetZoneOverdraft(zoneId, okCallback, errorCallback));
    },
  };
};

const mapStateToProps = (state) => {
  return {
    isLoading:
      pipelineSelectors.isIndexesLoading(state) || indexSelectors.isFulltextTaskListLoading(state) || indexSelectors.isAllLabelsLoading(state),
    isAdmin: authSelectors.isAdmin(state),
    authType: authSelectors.authType(state),
    user: authSelectors.user(state),
    projects: projectSelectors.getProjects(state),
    topics: kafkaSelectors.getTopics(state),
    statuses: pipelineSelectors.getStatuses(state) as unknown as Map<string, PipelineStatus>,
    metas: pipelineSelectors.getMeta(state),
    filter: pipelineSelectors.getIndexFilter(state),
    fulltextTasks: indexSelectors.getFulltextTasks(state),
    allLabels: indexSelectors.getAllLabels(state),
    isRefetch: pipelineSelectors.isRefetch(state),
    allZones: zoneSelectors.getZones(state),
    fulltextOverdraftConfig: overdraftSelectors.getFulltextOverdraftConfig(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexTasks);

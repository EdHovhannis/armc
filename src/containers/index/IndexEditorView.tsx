import { CreateIndexPage } from '@src/components/index/CreateIndexPage';
import { FulltextFlowEstimateResponse } from '@src/components/shared';
import { Loader } from '@src/components/utils/Loader';
import { WithParamsProps } from '@src/components/utils/withParams';
import { ApplicationState } from '@src/store/Store';
import { FlowServiceConfigs } from '@src/store/flow/Types';
import { IndexQuota } from '@src/store/index/Types';
import { KafkaTopic } from '@src/store/kafka/Types';
import { OverdraftConfig } from '@src/store/overdraft/Types';
import { Pipeline, PipelineInputFormatListEnum, QuotaForOverdraft, SourcesPipeline } from '@src/store/pipeline/Types';
import { EditableProject, Project } from '@src/store/project/Types';
import { PipelineUtils } from '@src/utils/PipelineUtils';
import { RouterProps, withRouter } from '@src/utils/withRouter';
import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import FulltextEditorEmptyForm from '../../components/index/FulltextEditorEmptyForm';
import * as authSelectors from '../../store/auth/Reducer';
import * as flowActions from '../../store/flow/Actions';
import * as processingSelectors from '../../store/flow/Reducer';
import * as indexActions from '../../store/index/Actions';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import * as kafkaViewerActions from '../../store/kafkaViewer/Actions';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftActions from '../../store/overdraft/Actions';
import * as overdraftSelectors from '../../store/overdraft/Reducer';
import * as pipelineActions from '../../store/pipeline/Actions';
import * as pipelineSelectors from '../../store/pipeline/Reducer';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';

import IndexProvider from './IndexProvider';

export enum TaskType {
  new,
  import,
  update,
}

export interface IndexEditorViewProps extends WithParamsProps {
  id: string;
  taskType: TaskType;
  topics: KafkaTopic[];
  isAdmin: boolean;
  projects: Project[];
  timeZones: string[];
  dateFormats: string[];
  pipeline: Pipeline;
  isLoading: boolean;
  isLoadingSchema: boolean;
  fulltextOverdraftConfig: OverdraftConfig;
  inputFormatList: PipelineInputFormatListEnum[];
  schemaNames: string[];
  flowServiceConfigs: FlowServiceConfigs;
  editableProjects: EditableProject[];
}

export interface IndexEditorDispatchProps {
  selectNewTask(): void;

  fetchProjects(): void;

  fetchTopics(): void;

  fetchDateFormats(): void;

  fetchTimeZones(): void;

  fetchRecords(topicId: number, numRecords: number, callback: (records: any[]) => void): void;

  fetchQuota(projectShortName: string, okCallback: (quota: IndexQuota) => void, errorCallback?: (error: string) => void): void;

  fetchPipelineById(
    projectShortName: string | null,
    name: string | undefined,
    okCallback?: (pipeline: Pipeline) => void,
    errorCallback?: (msg: string) => void,
  ): void;

  checkQuota(
    projectShortName: string,
    size: number,
    rate: number,
    duration: number,
    replicationFactor: number,
    sources: SourcesPipeline,
    indexName?: string,
    maxShard?: number | null,
    collShard?: number | null,
    sourcesParallelism?: number | null,
    nodesAndSinkParallelism?: number | null,
    fetchedCallback?: (quota: FulltextFlowEstimateResponse) => void,
    notFetchedCallback?: (msg: string) => void,
  ): void;

  getOverdraftValue(quota: QuotaForOverdraft, fetchedCallback?: (value: number) => void): void;

  createSchema(topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback?: (schema: any) => void): void;

  getFulltextOverdraftConfig(): void;

  getInputFormatList(): void;

  getSchemaNames(): void;

  updatePipeline(
    projectShortName: string,
    name: string,
    pipeline: any,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ): void;

  displayError(error: string): void;

  displaySuccess(message: string): void;

  resetUnits(): void;
}

export interface IndexEditorViewState {
  type: TaskType;
  id: number;
}

// Расширяем интерфейс WithParamsProps для нашего случая
interface IndexWithParamsProps extends WithParamsProps {
  id?: string;
  projectShortName?: string;
}

type Dispatch = (action: any) => void;

export class IndexEditorView extends React.Component<IndexEditorViewProps & IndexEditorDispatchProps & RouterProps, IndexEditorViewState> {
  constructor(props: IndexEditorViewProps & IndexEditorDispatchProps & RouterProps & IndexWithParamsProps) {
    super(props);
    autoBind(this);

    const id = this.props.params.id || '';

    if (id === 'new') {
      this.props.selectNewTask();
      this.state = { type: TaskType.new, id: -1 };
    } else if (id === 'import') {
      this.state = { type: TaskType.import, id: -1 };
    } else {
      this.state = { type: TaskType.update, id: parseInt(id) || -1 };
    }
  }

  componentDidMount() {
    this.props.fetchProjects();
    this.props.fetchTopics();
    this.props.fetchDateFormats();
    this.props.fetchTimeZones();
    this.props.getFulltextOverdraftConfig();
    this.props.getSchemaNames();
    this.props.getInputFormatList();

    const id = this.props.params.id;
    const projectShortName = this.props.searchParams.get('project');
    if (id !== 'new' && id !== 'import') {
      this.props.fetchPipelineById(projectShortName, id);
    }
  }

  render() {
    if (this.props.isLoading) return <Loader />;

    if (this.props.params.id === 'import' && !PipelineUtils.isImportTaskValid(this.props.pipeline)) {
      return (
        <FulltextEditorEmptyForm
          message={`Импортировать задачу не удалось, так как json в файле не является конфигурацией полнотекстовых индексов.`}
          captionButton="Вернуться к списку"
          redirect={() => {
            this.props.navigate('/index');
          }}
        />
      );
    }
    if (this.props.params.id !== 'new' && this.props.params.id !== 'import') {
      if (!this.props.pipeline) {
        return (
          <FulltextEditorEmptyForm
            message={`Для полнотекстового индекса не найдена конфигурация потока.`}
            captionButton="Вернуться к списку"
            redirect={() => {
              this.props.navigate('/index');
            }}
          />
        );
      }
    }

    return (
      <React.Fragment>
        <CreateIndexPage
          fetchQuota={this.props.fetchQuota}
          isLoadingSchema={this.props.isLoadingSchema}
          createSchema={this.props.createSchema}
          isAdmin={this.props.isAdmin}
          redirect={() => {
            this.props.navigate('/index');
          }}
          id={this.state.id}
          taskType={this.state.type}
          pipeline={this.state.type === TaskType.new ? IndexProvider.getEmptyPipeline() : this.props.pipeline}
          fetchRecords={this.props.fetchRecords}
          displayError={this.props.displayError}
          displaySuccess={this.props.displaySuccess}
          topics={this.props.topics}
          projects={this.props.projects}
          dateFormats={this.props.dateFormats}
          checkQuota={this.props.checkQuota}
          timeZones={this.props.timeZones}
          fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
          getOverdraftValue={this.props.getOverdraftValue}
          inputFormatList={this.props.inputFormatList}
          schemaNames={this.props.schemaNames}
          updatePipeline={this.props.updatePipeline}
          resetUnits={this.props.resetUnits}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    topics: kafkaSelectors.getTopics(state),
    projects: projectSelectors.getProjects(state),
    dateFormats: kafkaSelectors.getDateFormats(state),
    timeZones: processingSelectors.getTimeZones(state),
    pipeline: pipelineSelectors.getCurrentPipeline(state),
    isLoading: pipelineSelectors.isLoading(state) || overdraftSelectors.isFulltextOverdraftConfigLoading(state),
    isAdmin: authSelectors.isAdmin(state),
    isLoadingSchema: kafkaSelectors.isLoadingSchema(state),
    fulltextOverdraftConfig: overdraftSelectors.getFulltextOverdraftConfig(state),
    inputFormatList: pipelineSelectors.getArchiveInputFormatList(state),
    schemaNames: pipelineSelectors.getArchiveSchemaNames(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): IndexEditorDispatchProps => {
  return {
    fetchProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    createSchema: (topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback?: (schema: any) => void) => {
      dispatch(kafkaActions.createSchema(topicId, flatten, false, excludedFields, successCallback));
    },
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    fetchDateFormats: () => {
      dispatch(kafkaActions.fetchDateFormats());
    },
    fetchTimeZones: () => {
      dispatch(flowActions.fetchTimeZones());
    },
    fetchRecords: (topicId: number, numRecords: number, callback: (records: any[]) => void) => {
      const kafkaQuery = {
        maxRowsInResult: numRecords,
        maxRowsToScan: numRecords,
        offset: 'LATEST',
        filter: {
          type: 'true',
        },
      };
      dispatch(kafkaViewerActions.fetchRecords(topicId, kafkaQuery, callback));
    },
    fetchPipelineById: (projectShortName: string, name: string, okCallback: (pipeline: Pipeline) => void, errorCallback: (msg: string) => void) => {
      dispatch(pipelineActions.getPipelineInfo(projectShortName, name, okCallback, errorCallback));
    },
    displayError: (error: string) => {
      dispatch(notificationActions.error(error));
    },
    displaySuccess: (message: string) => {
      dispatch(notificationActions.success(message));
    },
    checkQuota: (
      projectShortName: string,
      size: number,
      rate: number,
      duration: number,
      replicationFactor: number,
      sources: SourcesPipeline,
      indexName?: string | undefined,
      maxShard?: number | null,
      collShard?: number | null,
      sourcesParallelism?: number | null,
      nodesAndSinkParallelism?: number | null,
      fetchedCallback?: (quota: FulltextFlowEstimateResponse) => void,
      notFetchedCallback?: (msg: string) => void,
    ) => {
      dispatch(
        indexActions.fetchCalculatedQuota(
          projectShortName,
          size,
          rate,
          duration,
          replicationFactor,
          sources,
          fetchedCallback,
          notFetchedCallback,
          indexName,
          maxShard,
          collShard,
          sourcesParallelism,
          nodesAndSinkParallelism,
        ),
      );
    },
    selectNewTask() {
      dispatch(pipelineActions.selectNewPipeline());
    },
    fetchQuota: (projectShortName: string, okCallback: (quota: IndexQuota) => void, errorCallback?: (error: string) => void) => {
      dispatch(indexActions.fetchQuota(projectShortName, okCallback, errorCallback));
    },
    getFulltextOverdraftConfig: (okCallback?: () => void, errorCallback?: (error: string) => void) => {
      dispatch(overdraftActions.getFulltextOverdraftConfig(okCallback, errorCallback));
    },
    getOverdraftValue: (quota: QuotaForOverdraft, fetchedCallback?: (value: number) => void) => {
      dispatch(pipelineActions.getOverdraftValue(quota, fetchedCallback));
    },
    getInputFormatList() {
      dispatch(pipelineActions.getPipelineInputFormatList());
    },
    getSchemaNames() {
      dispatch(pipelineActions.getArchiveSchemaNames());
    },
    updatePipeline(
      projectShortName: string,
      name: string,
      pipeline: any,
      okCallback?: () => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) {
      dispatch(pipelineActions.updatePipeline(projectShortName, name, pipeline, okCallback, errorCallback));
    },
    resetUnits() {
      dispatch(flowActions.resetUnitsAction());
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IndexEditorView));

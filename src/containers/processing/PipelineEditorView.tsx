import * as React from 'react';
import { connect } from 'react-redux';

import WaitingDialog from '../../components/WaitingDialog';
import FlowEditorForm from '../../components/processing/FlowEditorForm';
import { Loader } from '../../components/utils/Loader';
import { withNavigation, WithNavigationProps } from '../../components/utils/withNavigation';
import { withParams } from '../../components/utils/withParams';
import * as archiveActions from '../../store/archive/Actions';
import * as processingActions from '../../store/flow/Actions';
import * as processingSelectors from '../../store/flow/Reducer';
import { DlqTopic, BusinessTask, FlowDetails, NodeType, ProcessingNode, ProcessingNodeType, SourceType, FlowOverview } from '../../store/flow/Types';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';

interface FlowEditorViewProps {
  projects: Project[];
  overview: Array<FlowOverview>;
  topics: KafkaTopic[];
  timeZones: string[];
  dateFormats: string[];
  flows: Map<number, FlowDetails>;
  flowInProgress: Set<number>;
  createInProgress: boolean;
  flowIsLoading: boolean;
  schemaNames: string[];
  id?: string;
  editableProjects: EditableProject[];
}

interface FlowEditorViewDispatchProps {
  fetchProjects: () => void;
  fetchTopics: () => void;
  fetchFlow: (flowId: number) => void;
  fetchPipelines: () => void;
  fetchDateFormats: () => void;
  fetchTimeZones: () => void;
  displayError: (msg: string) => void;
  displayWarning: (msg: string) => void;
  createFlow: (
    name: string,
    projectId: number,
    data: any,
    businessTask: BusinessTask,
    useGlobalConsumerGroup: boolean,
    dlqTopic: DlqTopic | undefined,
    callback: (id: number) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  updateFlow: (
    id: number,
    name: string,
    projectId: number,
    data: any,
    useGlobalConsumerGroup: boolean,
    dlqTopic: DlqTopic | undefined,
    callback: (id: number) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getSchemaNames: () => void;
}

interface FlowEditorViewState {
  isNew: boolean;
  id: number;
  successTaskCreation: boolean;
  taskCreationComplete: boolean;
  waitForCreate: boolean;
  errorMessage: string;
  isStartedFlow: boolean;
  useGlobalConsumerGroup: boolean;
  detailMessage?: string;
}

export const PipelineUtils = {
  getEmptyPipeline(parallelism: number): ProcessingNode[] {
    const processingNodes: ProcessingNode[] = [];
    const sourceNode: ProcessingNode = {
      id: 'kafkaSource00',
      element: NodeType.source,
      parallelism: parallelism,
      node: {
        type: SourceType.kafka,
        projectShortName: '',
        topic: '',
      },
    };
    const jsonParseNode: ProcessingNode = {
      id: 'jsonParse1',
      parents: ['kafkaSource00'],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.jsonParse,
      },
    };
    const jsonSerializeNode: ProcessingNode = {
      id: 'jsonSerialize2',
      parents: ['jsonParse1'],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.jsonSerialize,
      },
    };
    const sinkNode: ProcessingNode = {
      id: 'kafkaSink3',
      parents: ['jsonSerialize2'],
      parallelism: parallelism,
      element: NodeType.sink,
      node: {
        type: SourceType.kafka,
        projectShortName: '',
        topic: '',
      },
    };

    processingNodes.push(sourceNode, jsonParseNode, jsonSerializeNode, sinkNode);
    return processingNodes;
  },

  getEmptySourceSinkNodes(parallelism: number): ProcessingNode[] {
    const processingNodes: ProcessingNode[] = [];
    const sourceNode: ProcessingNode = {
      id: 'kafkaSource0',
      element: NodeType.source,
      parallelism: parallelism,
      node: {
        type: SourceType.kafka,
        projectShortName: '',
        topic: '',
      },
    };
    const sinkNode: ProcessingNode = {
      id: 'kafkaSink0',
      parents: [],
      parallelism: parallelism,
      element: NodeType.sink,
      node: {
        type: SourceType.kafka,
        projectShortName: '',
        topic: '',
      },
    };
    const multiSinkKafkaNode: ProcessingNode = {
      id: 'multiSinkKafka0',
      parents: [],
      parallelism: parallelism,
      element: NodeType.processing,
      node: {
        type: SourceType.multiKafka,
        topics: [],
      },
    };
    processingNodes.push(sourceNode);
    processingNodes.push(sinkNode);
    processingNodes.push(multiSinkKafkaNode);
    return processingNodes;
  },

  getEmptyProcessingNodes(parallelism: number): ProcessingNode[] {
    const processingNodes: ProcessingNode[] = [];
    const addCurrentTimeNode: ProcessingNode = {
      id: 'addCurrentTime0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.addCurrentTime,
        toField: '',
        timeFormat: '',
        timezone: '',
      },
    };
    const copyFieldProcessingNode: ProcessingNode = {
      id: 'copyField0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.copyField,
        copyParametersList: [],
      },
    };
    const generateUUIDNode: ProcessingNode = {
      id: 'generateUUID0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.generateUUID,
        toField: '',
      },
    };
    const jsonFlattenNode: ProcessingNode = {
      id: 'jsonFlatten0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.jsonFlatten,
        excludedFromFlatteningFields: [],
      },
    };
    const jsonParseNode: ProcessingNode = {
      id: 'jsonParse0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.jsonParse,
      },
    };
    const jsonSerializeNode: ProcessingNode = {
      id: 'jsonSerialize0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.jsonSerialize,
      },
    };
    const timestampConvertNode: ProcessingNode = {
      id: 'timestampConvert0',
      parents: [],
      element: NodeType.processing,
      parallelism: parallelism,
      node: {
        type: ProcessingNodeType.timestampConvert,
        field: '',
        inputTimezone: '',
        outputTimezone: '',
        inputFormats: [],
        outputFormat: '',
      },
    };
    const avroNode: ProcessingNode = {
      id: 'avroParse',
      parents: ['kafkaSource'],
      parallelism: parallelism,
      element: NodeType.processing,
      node: {
        type: ProcessingNodeType.avroParse,
        schemaName: '',
      },
    };
    const rateLimiter: ProcessingNode = {
      id: 'rateLimiter2',
      parents: ['kafkaSource'],
      parallelism: parallelism,
      element: NodeType.processing,
      node: {
        type: ProcessingNodeType.rateLimiter,
        schemaName: '',
      },
    };
    processingNodes.push(jsonParseNode);
    processingNodes.push(addCurrentTimeNode);
    processingNodes.push(copyFieldProcessingNode);
    processingNodes.push(generateUUIDNode);
    processingNodes.push(jsonFlattenNode);
    processingNodes.push(timestampConvertNode);
    processingNodes.push(jsonSerializeNode);
    processingNodes.push(avroNode);
    processingNodes.push(rateLimiter);
    return processingNodes;
  },
};

class FlowEditorView extends React.Component<FlowEditorViewProps & FlowEditorViewDispatchProps & WithNavigationProps, FlowEditorViewState> {
  constructor(props: FlowEditorViewProps & FlowEditorViewDispatchProps & WithNavigationProps) {
    super(props);

    const id = this.props.id || 'new';
    if (id === 'new') {
      this.state = {
        isNew: true,
        id: -1,
        taskCreationComplete: false,
        successTaskCreation: false,
        errorMessage: '',
        waitForCreate: false,
        isStartedFlow: false,
        useGlobalConsumerGroup: false,
      };
    } else {
      props.fetchFlow(parseInt(id.toString()));
      this.state = {
        isNew: false,
        id: parseInt(id.toString()),
        taskCreationComplete: false,
        successTaskCreation: false,
        errorMessage: '',
        waitForCreate: false,
        isStartedFlow: false,
        useGlobalConsumerGroup: false,
      };
    }
  }

  componentDidMount() {
    this.props.fetchProjects();
    this.props.fetchTimeZones();
    this.props.fetchDateFormats();
    this.props.fetchTopics();
    this.props.getSchemaNames();
    this.props.fetchPipelines();
  }

  render(): React.ReactNode {
    const flow = this.props.flows.get(this.state.id);
    if (!this.state.isNew && !flow) {
      return null;
    }
    if (!this.state.isNew && this.props.flowIsLoading) {
      return <Loader />;
    } else {
      //проверка -> начат ли поток для определения возможности назначить concsumerGroup
      const { overview } = this.props;
      if (overview.length && flow) {
        const startedFlow = overview.find((el) => el.id === this.state.id && el.instances.length);
        flow!.isStartedFlow = Boolean(startedFlow);
      }
      return this.renderEditor(flow!);
    }
  }

  renderEditor(flow: FlowDetails) {
    return (
      <React.Fragment>
        <FlowEditorForm
          isNew={this.state.isNew}
          isStartedFlow={this.state.isNew ? false : flow?.isStartedFlow}
          useGlobalConsumerGroup={this.state.isNew ? false : flow.useGlobalConsumerGroup}
          flowId={this.state.isNew ? -1 : flow.id}
          canEdit={this.state.isNew ? true : flow.canEdit}
          canManageAccess={this.state.isNew ? false : flow.canManageAccess}
          inProgress={this.state.isNew ? this.props.createInProgress : this.props.flowInProgress.has(this.state.id)}
          state={this.state.isNew ? 'UNKNOWN' : flow.state}
          // Фильтруем проекты только по доступным на права EDIT, так как пользователь может получить все проекты, даже
          // на которые есть право VIEW
          projects={this.props.projects}
          topics={this.props.topics}
          timeFormats={this.props.dateFormats}
          timeZones={this.props.timeZones}
          displayError={this.props.displayError}
          displayWarning={this.props.displayWarning}
          taskCompleteChanged={(value) => {
            this.setState({ taskCreationComplete: value });
          }}
          dlqTopic={this.state.isNew ? undefined : flow.jobConfiguration?.deadLetterQueue}
          submitFlow={(name, projectId, data, businessTask, useGlobalConsumerGroup, dlqTopic) => {
            this.setState({ taskCreationComplete: false, successTaskCreation: false, waitForCreate: true });
            if (this.state.isNew) {
              this.props.createFlow(
                name,
                projectId,
                data,
                businessTask,
                useGlobalConsumerGroup,
                dlqTopic,
                (id) => {
                  this.setState({ taskCreationComplete: true, successTaskCreation: true });
                  this.props.navigate('/flow');
                },
                (error: any) => {
                  this.setState({
                    taskCreationComplete: true,
                    successTaskCreation: false,
                    // почему то вместо error.message как строка может прийти объект, внутри которого будет еще message и details
                    errorMessage: typeof error.message === 'string' ? error.message : (error?.message?.message as string),
                    detailMessage: error.details,
                  });
                },
              );
            } else {
              this.props.updateFlow(
                this.state.id,
                name,
                projectId,
                data,
                useGlobalConsumerGroup,
                dlqTopic,
                () => {
                  this.setState({ taskCreationComplete: true, successTaskCreation: true });
                  this.props.navigate('/flow');
                },
                (error: any) => {
                  this.setState({
                    taskCreationComplete: true,
                    successTaskCreation: false,
                    // почему то вместо error.message как строка может прийти объект, внутри которого будет еще message и details
                    errorMessage: typeof error.message === 'string' ? error.message : (error?.message?.message as string),
                    detailMessage: error.details,
                  });
                },
              );
            }
          }}
          redirect={() => {
            this.props.navigate('/flow');
          }}
          name={this.state.isNew ? '' : flow.name}
          projectId={this.state.isNew ? -1 : flow.projectId}
          items={this.state.isNew ? [] : flow.jobConfiguration?.graph || []}
          data={JSON.stringify(this.state.isNew ? [] : flow.jobConfiguration?.graph || [], null, 2)}
          schemaNames={this.props.schemaNames}
        />
        <WaitingDialog
          title={!this.state.isNew ? 'Обновление потока' : 'Создание потока'}
          open={this.state.waitForCreate}
          onClose={() => {
            this.setState({
              waitForCreate: false,
            });
          }}
          complete={this.state.taskCreationComplete}
          success={this.state.successTaskCreation}
          successMessage={!this.state.isNew ? 'Поток успешно обновлен' : 'Поток успешно создан'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state: any): FlowEditorViewProps {
  return {
    projects: projectSelectors.getProjects(state),
    overview: processingSelectors.getOverviews(state),
    topics: kafkaSelectors.getTopics(state),
    flows: processingSelectors.getOverview(state),
    flowIsLoading: processingSelectors.isFlowLoading(state),
    createInProgress: processingSelectors.createInProgress(state),
    flowInProgress: processingSelectors.getFlowsInProgress(state),
    dateFormats: kafkaSelectors.getDateFormats(state),
    timeZones: processingSelectors.getTimeZones(state),
    schemaNames: processingSelectors.getSchemaNames(state),
  };
}

function mapDispatchToProps(dispatch: any): FlowEditorViewDispatchProps {
  return {
    fetchFlow: (flowId) => {
      dispatch(processingActions.fetchFlow(flowId));
    },
    fetchPipelines: () => {
      dispatch(processingActions.fetchOverview(BusinessTask.NON));
    },
    fetchDateFormats: () => {
      dispatch(kafkaActions.fetchDateFormats());
    },
    fetchTimeZones: () => {
      dispatch(processingActions.fetchTimeZones());
    },
    fetchProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    createFlow: (
      name,
      projectId,
      data,
      businessTask,
      useGlobalConsumerGroup,
      dlqTopic: DlqTopic | undefined,
      callback: (id: number) => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.createFlow(name, projectId, data, businessTask, useGlobalConsumerGroup, dlqTopic, callback, errorCallback));
    },
    updateFlow: (
      id,
      name,
      projectId,
      data,
      useGlobalConsumerGroup,
      dlqTopic: DlqTopic | undefined,
      callback: (id: number) => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(processingActions.updateFlow(id, name, projectId, data, useGlobalConsumerGroup, dlqTopic, callback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displayWarning: (warn) => {
      dispatch(notificationActions.warning(warn));
    },
    getSchemaNames: () => {
      dispatch(archiveActions.getArchiveSchemaNames());
    },
  };
}

export default withParams(connect(mapStateToProps, mapDispatchToProps)(withNavigation(FlowEditorView)));

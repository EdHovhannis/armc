import { Grid, MenuItem, Select, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import TextField from '@material-ui/core/TextField';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import AceEditor from 'react-ace';

import FlowService from '../../services/FlowService';
import { BusinessTask, DlqTarget, DlqTopic, MapNames, NodeType, ProcessingNode, SourceSinkKafkaNode, SourceType } from '../../store/flow/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import { ProjectWithRole } from '../../store/project/Actions';
import { Project } from '../../store/project/Types';
import { Utils } from '../../utils/Utils';
import { getWarningText } from '../../utils/getWarningText';
import WaitingDialog from '../WaitingDialog';
import { WrongInput } from '../index/CreateIndexPage';
import DlqOption from '../utils/DlqOption';

import FlowCreateItem from './FlowCreateItem';

export interface FlowEditorFormProps {
  isNew: boolean;
  flowId: number;
  canEdit: boolean;
  isStartedFlow: boolean;
  useGlobalConsumerGroup: boolean;
  canManageAccess: boolean;
  name: string;
  projectId: number;
  data: string;
  state: string;
  items: Array<ProcessingNode>;
  inProgress: boolean;
  projects: Array<Project>;
  topics: KafkaTopic[];
  timeZones: string[];
  timeFormats: string[];
  dlqTopic: DlqTarget | undefined;
  schemaNames: string[];

  redirect(): any;

  taskCompleteChanged(value: boolean): any;

  displayError(msg: string): any;

  displayWarning(msg: string): any;
}

export interface FlowEditorState {
  name: string;
  projectId: number;
  data: any;
  items: Array<ProcessingNode>;
  activeStep: number;
  wrongInput: WrongInput;
  initParallelism: number;
  customFlow: boolean;
  dlqTopic: DlqTopic | undefined;
  useGlobalConsumerGroup: boolean;
}

export interface FlowEditorFormDispatchProps {
  submitFlow: (
    name: string,
    projectId: number,
    data: any,
    businessTask: BusinessTask,
    useGlobalConsumerGroup: boolean,
    dlqTopic: DlqTopic | undefined,
  ) => void;
}

export const SOURCE_NODE_ERROR = 'На первом месте в потоке должна быть source-нода.';
export const SINK_NODE_ERROR = 'На последнем месте в пайплайне должна быть sink-нода.';
export const MULTI_KAFKA_SINK_ERROR_MULTIPLE = 'В потоке может быть только одна Multi Kafka sink-нода.';
export const MULTI_KAFKA_SINK_ERROR_LAST = 'Multi Kafka sink-нода должна быть последней в пайплайне.';
export const MULTI_KAFKA_SINK_ERROR_DUPLICATE_TOPICS = 'Multi Kafka sink-нода должна быть с уникальными топиками.';
export const SINK_NODE_ERROR_ONLY_MULTI_KAFKA = 'В потоке при наличии Multi Kafka sink-ноды не может быть другой sink-ноды.';
export const SOURCE_NODE_WARN = 'Обратите внимание, что первой в потоке должна быть source-нода!';
export const SINK_NODE_WARN = 'Обратите внимание, что в потоке последней должна быть sink-нода!';
export const MULTI_KAFKA_SINK_WARN = 'Обратите внимание, что Multi Kafka sink-нода должна быть последней в потоке!';
export const MULTI_KAFKA_SINK_WARN_MULTIPLE = 'Обратите внимание, что в потоке может быть только одна Multi Kafka sink-нода!';
export const MULTI_KAFKA_SINK_WARN_WITH_SINK = 'Обратите внимание, что при наличии Multi Kafka sink-ноды не должно быть других sink-нод!';
export const CONSUMER_GROUP_ID_ERROR = 'Недопустимо вносить изменения в id consumer group';
export const COUSUMER_GROUP_ID_ERROR_STARTED_FLOW = 'Редактирование сonsumerGroupId данного потока невозможно, потому что поток уже был запущен.';
export const COUSUMER_GROUP_ID_ERROR_DELETE = 'Удаление сonsumerGroupId данного потока невозможно.';

export default class FlowEditorForm extends React.Component<FlowEditorFormProps & FlowEditorFormDispatchProps, FlowEditorState> {
  steps = ['Название потока обработки', 'Ноды потока обработки', 'Итог'];

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      projectId: this.props.projectId,
      initParallelism: this.props.isNew ? 1 : FlowService.getResultParallelism(this.props.items),
      data: this.clearTopicName(this.props.data, true),
      items: this.clearTopicName(this.props.items, false),
      activeStep: 0,
      wrongInput: this.checkConfigurationOfItems(this.clearTopicName(this.props.items, false)),
      customFlow: false,
      dlqTopic: this.props.dlqTopic?.target.kafka,
      useGlobalConsumerGroup: this.props.useGlobalConsumerGroup,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentNode !== state.currentNode) {
      return {
        topic: props.currentNode ? props.currentNode.node.topic : '',
        projectShortName: props.currentNode ? props.currentNode.node.projectShortName : '',
        currentNode: props.currentNode,
      };
    }
  }

  clearTopicName = (list: Array<ProcessingNode> | string, fromJson: boolean) => {
    let result: Array<ProcessingNode> = [];
    if (!fromJson) {
      result = Utils.getCopyOfElement(list);
    } else {
      result = JSON.parse(list);
    }
    if (!this.props.isNew) {
      const nodeSource: SourceSinkKafkaNode = result[0].node;
      if (nodeSource.type === SourceType.kafka) {
        nodeSource.topic =
          result[0].node.topic.split('.').splice(1).join('.') === '' || result[0].node.topic.split('.')[0] !== result[0].node.projectShortName
            ? result[0].node.topic
            : result[0].node.topic.split('.').splice(1).join('.');
        const source: ProcessingNode = {
          id: result[0].id,
          node: nodeSource,
          parallelism: result[0].parallelism,
          element: result[0].element,
        };
        result[0] = source;
      }
      const nodeSink: SourceSinkKafkaNode = result[result.length - 1].node;
      if (nodeSink.type === SourceType.kafka) {
        nodeSink.topic =
          result[result.length - 1].node.topic.split('.').splice(1).join('.') === '' ||
          result[result.length - 1].node.topic.split('.')[0] !== result[result.length - 1].node.projectShortName
            ? result[result.length - 1].node.topic
            : result[result.length - 1].node.topic.split('.').splice(1).join('.');
        const sink: ProcessingNode = {
          id: result[result.length - 1].id,
          node: nodeSink,
          parallelism: result[result.length - 1].parallelism,
          element: result[result.length - 1].element,
          parents: result[result.length - 1].parents,
        };
        result[result.length - 1] = sink;
      }
    }
    return fromJson ? JSON.stringify(result, null, 2) : result;
  };

  checkConfigurationOfItems(items: Array<ProcessingNode>, step: number) {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };
    // Проверка Multi Kafka sink нод
    const multiKafkaNodes = items.filter((node) => node.node.type === SourceType.multiKafka);
    const sinkNodes = items.filter((node) => node.element === NodeType.sink);
    if (items.length === 0 && step !== 0) {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Sink и source ноды сконфигурированы не верно.';
      return wrongInput;
    }
    items.map((node, ind) => {
      if (
        step === 1 &&
        this.props.isStartedFlow &&
        (items[0].node as SourceSinkKafkaNode).consumerGroupId !== (JSON.parse(this.props.data)[0].node as SourceSinkKafkaNode).consumerGroupId
      ) {
        if ((items[0].node as SourceSinkKafkaNode).consumerGroupId) {
          wrongInput.wrongInput = true;
          wrongInput.message = COUSUMER_GROUP_ID_ERROR_STARTED_FLOW;
        }
        if (
          (items[0].node as SourceSinkKafkaNode).consumerGroupId === undefined &&
          (JSON.parse(this.props.data)[0].node as SourceSinkKafkaNode).consumerGroupId
        ) {
          wrongInput.wrongInput = true;
          wrongInput.message = COUSUMER_GROUP_ID_ERROR_DELETE;
        }
      }
      if (node?.node?.type === SourceType.multiKafka && step === 1) {
        const topics = node.node?.topics;
        if (topics && topics.length > 0) {
          const uniqueTopics = [...new Set(topics.map((t) => t.topic))];
          if (uniqueTopics.length !== topics.length) {
            wrongInput.wrongInput = true;
            wrongInput.message = MULTI_KAFKA_SINK_ERROR_DUPLICATE_TOPICS;
          }
        }
        if (node.node?.topics?.length === 0) {
          wrongInput.wrongInput = true;
          wrongInput.message = 'Multi Sink Kafka нода не заполнена';
        }
        if (topics && topics.length > 0) {
          const uniqueTopics = [...new Set(topics.map((t) => t.topic))];
          if (uniqueTopics.length !== topics.length) {
            wrongInput.wrongInput = true;
            wrongInput.message = MULTI_KAFKA_SINK_ERROR_DUPLICATE_TOPICS;
          }
        }
      }
      // Проверка 1: Может быть только одна Multi Kafka sink нода
      if (multiKafkaNodes.length > 1) {
        wrongInput.wrongInput = true;
        wrongInput.message = MULTI_KAFKA_SINK_ERROR_MULTIPLE;
        return wrongInput;
      }
      // Проверка 2: Если есть Multi Kafka sink нода, не должно быть других sink нод
      if (multiKafkaNodes.length > 0 && sinkNodes.length > 0) {
        wrongInput.wrongInput = true;
        wrongInput.message = SINK_NODE_ERROR_ONLY_MULTI_KAFKA;
        return wrongInput;
      }

      // Проверка 3: Multi Kafka sink нода должна быть последней в пайплайне
      if (multiKafkaNodes.length > 0) {
        const lastMultiKafkaNode = multiKafkaNodes[0];
        const lastNodeIndex = items.findIndex((node) => node.id === lastMultiKafkaNode.id);
        if (lastNodeIndex !== items.length - 1) {
          wrongInput.wrongInput = true;
          wrongInput.message = MULTI_KAFKA_SINK_ERROR_LAST;
          return wrongInput;
        }
      }

      // Проверка 4: Если нет Multi Kafka sink ноды, последняя нода должна быть обычной sink нодой
      if (multiKafkaNodes.length === 0 && items.length > 0) {
        const lastNode = items[items.length - 1];
        if (lastNode.element !== NodeType.sink) {
          wrongInput.wrongInput = true;
          wrongInput.message = SINK_NODE_ERROR;
          return wrongInput;
        }
      }
      if (this.props.isNew === false && step === 1) {
        if (
          !this.props.isStartedFlow &&
          (items[0].node as SourceSinkKafkaNode).consumerGroupId !== (JSON.parse(this.props.data)[0]?.node as SourceSinkKafkaNode)?.consumerGroupId
        ) {
          wrongInput.wrongInput = true;
          wrongInput.message = CONSUMER_GROUP_ID_ERROR;
        }
      }

      if (this.props.isNew && step === 1 && (items[0].node as SourceSinkKafkaNode).consumerGroupId) {
        wrongInput.wrongInput = true;
        wrongInput.message = CONSUMER_GROUP_ID_ERROR;
      }
      if (ind === 0 && node.element !== NodeType.source) {
        wrongInput.wrongInput = true;
        wrongInput.message = SOURCE_NODE_ERROR;
        return wrongInput;
      } else if (!FlowService.checkConfiguration(node) && MapNames[node.node?.type] !== undefined) {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Нода с id ' + node.id + ' сконфигурирована не верно.';
        return wrongInput;
      }
    });
    return wrongInput;
  }

  dlqTopicHandler = (projectId: number | null | undefined, name: string | null) => {
    let dlqTopic: DlqTopic | undefined = undefined;

    this.props.projects.map((project: ProjectWithRole) => {
      if (projectId && name && project.id === projectId) {
        dlqTopic = {
          projectKey: project.shortName,
          name: name,
        };

        return;
      }
    });
    this.setState({ dlqTopic: dlqTopic });
  };

  getDlqValue = () => {
    const projectId = this.props.projects.find((project: ProjectWithRole) => project.shortName === this.state.dlqTopic?.projectKey)?.id ?? undefined;
    if (projectId)
      return this.props.topics.find((topic: KafkaTopic) => topic.projectId === projectId && topic.name === this.state.dlqTopic?.name) ?? undefined;
    return undefined;
  };

  getOptionLabel = (option: KafkaTopic): string => {
    return this.props.projects.filter((project) => {
      return project.id === option.projectId;
    }).length > 0
      ? this.props.projects
          .filter((project) => {
            return project.id === option.projectId;
          })
          .map((project) => {
            return project.shortName;
          })[0] +
          '/' +
          option.name
      : option.topicFullName.split('.').length > 1
        ? option.topicFullName.split('.')[0] + '/' + option.topicFullName.split('.')[1]
        : option.topicFullName.split('.')[0];
  };

  getDlqTopics = () => {
    const topicNames = [];
    this.state.items.map((node: ProcessingNode) => {
      if (node.element === NodeType.source || node.element === NodeType.sink) topicNames.push(node.node.topic);
    });
    return this.props.topics.filter((topic: KafkaTopic) => !topicNames.includes(topic.name));
  };

  render() {
    return this.renderEditor();
  }

  renderEditor() {
    const { name } = this.state;
    const nameHelperText = getWarningText(name);
    return (
      <React.Fragment>
        <Stepper activeStep={this.state.activeStep}>
          {this.steps.map((step) => (
            <Step key={step}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {this.state.activeStep == 0 && (
          <Grid container direction={'column'} style={{ marging: 6 }}>
            <Grid container direction={'row'} justifyContent={'center'}>
              <TextField
                fullWidth
                variant="outlined"
                style={{ width: 'calc(100% - 100px)', marginTop: 10 }}
                disabled={!this.props.canEdit}
                defaultValue={this.state.name}
                value={this.state.name}
                label="Имя потока"
                onChange={(e) => {
                  this.setState({ name: e.target.value });
                }}
                error={!!nameHelperText}
                helperText={nameHelperText}
              />
            </Grid>
            <Grid container direction={'row'} justifyContent={'center'}>
              <Autocomplete
                id="project"
                fullWidth={true}
                options={this.props.projects}
                disabled={!this.props.canEdit}
                defaultValue={this.props.projects.filter((project) => project.id === this.state.projectId)[0]}
                getOptionLabel={(option) => option.name}
                style={{ width: 'calc(100% - 100px)', marginTop: 16 }}
                onChange={(event, newValue: Project) => {
                  this.setState({
                    projectId: newValue.id,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
              />
            </Grid>
            {(FlowService.getResultParallelism(this.props.items) || this.props.isNew) && (
              <Grid container direction={'row'} justifyContent={'center'}>
                <TextField
                  fullWidth
                  variant="outlined"
                  style={{ width: 'calc(100% - 100px)', marginTop: 16 }}
                  error={this.state.initParallelism <= 0 || isNaN(this.state.initParallelism)}
                  disabled={!this.props.canEdit}
                  defaultValue={this.state.initParallelism}
                  value={this.state.initParallelism}
                  label="Стартовый параллелизм нод"
                  onChange={(e) => {
                    this.setState({
                      initParallelism: e.target.value,
                      items: FlowService.changeParalellism(this.state.items, e.target.value),
                      data: JSON.stringify(FlowService.changeParalellism(this.state.items, e.target.value), null, 2),
                    });
                  }}
                />
              </Grid>
            )}
          </Grid>
        )}

        {this.state.activeStep === 1 && (
          <Grid item xs={12}>
            <FlowCreateItem
              data={this.state.data}
              dataChanged={(data) => {
                try {
                  const items = JSON.parse(data);
                  this.setState({
                    items: items,
                    wrongInput: this.checkConfigurationOfItems(items, this.state.activeStep),
                    data: data,
                  });
                } catch (e) {
                  this.setState({
                    wrongInput: {
                      wrongInput: true,
                      message: 'Поток должен быть валидным JSON.',
                    },
                  });
                }
              }}
              canEdit={this.props.canEdit}
              customFlow={this.state.customFlow}
              isStartedFlow={this.props.isStartedFlow}
              useGlobalConsumerGroup={this.state.useGlobalConsumerGroup}
              initParallelism={this.state.initParallelism}
              items={this.state.items}
              changeItems={(items) => {
                const data = JSON.stringify(items, null, 2);
                this.setState({
                  items: items,
                  wrongInput: this.checkConfigurationOfItems(items, this.state.activeStep),
                  data: data,
                });
              }}
              customFlowChanged={(customFlow) => {
                this.setState({ customFlow: customFlow });
              }}
              cunsumerGroupChanged={(value) => {
                this.setState({
                  useGlobalConsumerGroup: value,
                });
              }}
              timeFormats={this.props.timeFormats}
              timezones={this.props.timeZones}
              displayError={this.props.displayError}
              topics={this.props.topics}
              projects={this.props.projects}
              displayWarning={this.props.displayWarning}
              schemaNames={this.props.schemaNames}
            />
          </Grid>
        )}

        {this.state.activeStep === 2 && (
          <Grid item xs={12}>
            <Typography>
              <h4>Dead Letter Queue</h4>
            </Typography>
            <Paper
              style={{
                width: '100%',
                marginTop: 12,
                marginBottom: 20,
                padding: 20,
              }}
            >
              <DlqOption
                topics={this.getDlqTopics()}
                value={this.getDlqValue()}
                onChange={this.dlqTopicHandler}
                getOptionLabel={this.getOptionLabel}
              />
            </Paper>
            <Paper style={{ padding: 12 }}>
              <AceEditor
                readOnly={true}
                mode="javascript"
                value={this.state.data}
                theme="github"
                onChange={(e) => {
                  this.setState({ data: e });
                }}
                highlightActiveLine
                width={'100%'}
                height={'700px'}
                showPrintMargin
                setOptions={{
                  showLineNumbers: true,
                  tabSize: 4,
                }}
              />
            </Paper>
          </Grid>
        )}

        <Grid container direction={'row'} style={{ padding: 16 }} justifyContent={'flex-end'}>
          <Button
            onClick={() => {
              this.setState({ activeStep: this.state.activeStep - 1 });
            }}
            disabled={this.state.activeStep == 0}
          >
            Назад
          </Button>
          <Button
            onClick={() => {
              if (this.state.activeStep === 0 || this.state.activeStep === 1) {
                if (this.state.name === null || this.state.name === undefined || this.state.name == '' || getWarningText(name)) {
                  if (getWarningText(name)) {
                    return this.props.displayError(getWarningText(name));
                  }
                  this.props.displayError('Нужно ввести имя потока!');
                  return;
                }
                if (this.state.projectId === null || this.state.projectId === undefined || this.state.projectId === -1) {
                  this.props.displayError('Проект не выбран');
                  return;
                }
                if (this.state.initParallelism < 0 || isNaN(this.state.initParallelism)) {
                  this.props.displayError('Параллелизм должен быть задан целым положительным числом');
                  return;
                }
                if (this.state.wrongInput.wrongInput && this.state.activeStep === 1) {
                  this.props.displayError(this.state.wrongInput.message);
                  return;
                }
                if (this.state.activeStep === 1) {
                  const wrongInput: WrongInput = this.checkConfigurationOfItems(this.state.items, this.state.activeStep);
                  if (wrongInput.wrongInput) {
                    this.props.displayError(wrongInput.message);
                    return;
                  }
                }
                this.setState({ activeStep: this.state.activeStep + 1 });
                return;
              } else {
                this.props.taskCompleteChanged(false);
                if (this.props.canEdit) {
                  this.props.submitFlow(
                    this.state.name,
                    this.state.projectId,
                    this.state.data,
                    BusinessTask.NON,
                    this.state.useGlobalConsumerGroup,
                    this.state.dlqTopic,
                  );
                } else {
                  this.props.redirect();
                }
              }
            }}
          >
            {this.state.activeStep === 2 ? (this.props.canEdit ? 'Готово' : 'Закрыть') : 'Далее'}
          </Button>
        </Grid>
      </React.Fragment>
    );
  }
}

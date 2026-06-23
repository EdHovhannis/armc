import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import * as React from 'react';

import { TaskType } from '../../containers/index/IndexEditorView';
import IndexProvider from '../../containers/index/IndexProvider';
import ConfigService from '../../services/ConfigService';
import PipelineService from '../../services/PipelineService';
import { DlqTopic } from '../../store/archive/Types';
import { EstimatedIndexQuota, IndexQuota } from '../../store/index/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import { OverdraftConfig } from '../../store/overdraft/Types';
import {
  Field,
  Pipeline,
  PipelineInputFormatListEnum,
  ProcessingPipeline,
  QuotaPipeline,
  SchemaPipeline,
  SourcesPipeline,
  TimestampNode,
  TypePrimaryField,
} from '../../store/pipeline/Types';
import { ProjectWithRole } from '../../store/project/Actions';
import { Project } from '../../store/project/Types';
import { IndexUtils } from '../../utils/IndexUtils';
import { PipelineUtils } from '../../utils/PipelineUtils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { ICopyFieldsSchema } from '../processing/FieldCopy/types';
import { modifySchema } from '../processing/FieldCopy/utils';
import * as transformHelpers from '../processing/TransformArray/functions';
import { ITransformData } from '../processing/TransformArray/types';
import { FulltextFlowEstimateResponse, QuotaIndexProps } from '../shared';
import { getSchemaName } from '../utils/getSchemaName';

import AdvancedItem from './createIndexParts/AdvancedItem';
import { GenerateButton } from './createIndexParts/GenerateButton';
import { NameConfigItem } from './createIndexParts/NameConfigItem';
import ProcessingItem from './createIndexParts/ProcessingItem';
import QuotaItem from './createIndexParts/QuotaItem';
import ResultItem from './createIndexParts/ResultItem';
import SchemaConfigItem from './createIndexParts/SchemaConfigItem';
import TopicConfigItem from './createIndexParts/TopicConfigItem';

export interface SchemaIndex {
  timestampFields: Array<TimestampField>;
  allFields: Array<Field>;
}

export interface TimestampField {
  name: string;
  format: string;
}

export interface WrongInput {
  wrongInput: boolean;
  message: string;
}

interface CreateIndexPageProps {
  id: number;
  taskType: TaskType;
  pipeline: Pipeline;
  topics: KafkaTopic[];
  projects: Project[];
  timeZones: string[];
  dateFormats: string[];
  isAdmin: boolean;
  isLoadingSchema: boolean;
  fulltextOverdraftConfig: OverdraftConfig;
  inputFormatList: PipelineInputFormatListEnum[];
  schemaNames: string[];

  fetchRecords(topicId: number, numRecords: number, callback: any): any;

  fetchQuota(projectShortName: string, okCallback: (quota: IndexQuota) => void, errorCallback?: (error: string) => void): any;

  createSchema(topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback): any;

  checkQuota(
    projectShortName?: string,
    size?: number,
    rate?: number,
    duration?: number,
    replicationFactor?: number,
    sources?: SourcesPipeline,
    indexName?: string,
    maxShards?: number | null,
    collShards?: number | null,
    sourcesParallelism?: number | null,
    nodesAndSinkParallelism?: number | null,
    fetchedCallback?: (quota: FulltextFlowEstimateResponse) => void,
    notFetched?: (msg: string) => void,
  ): any;

  displayError(message: string): any;

  displaySuccess(message: string): any;

  getOverdraftValue(quota: QuotaIndexProps, fetchedCallback?: () => void): any;

  redirect(): any;

  updatePipeline(
    projectShortName: string,
    name: string,
    pipeline: any,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: any; details?: string }) => void,
  );

  resetUnits: () => void;
}

interface CreateIndexPageState extends Pipeline {
  activeStep: number;
  projectName: string;
  estimatedQuota: EstimatedIndexQuota;
  wrongInputItem: WrongInput;
  flatten: boolean;
  excludedFields: Array<string>;
  samples: any;
  topicId: number;
  autoSchema: SchemaIndex;
  dateFormats: string[];
  confirmDialogDeleteOpen: boolean;
  waitForTaskCreation: boolean;
  taskCreationComplete: boolean;
  successTaskCreation: boolean;
  errorMessage: string;
  errorDetails?: string;
  loadingContinueSchema: boolean;
  dlqTopic: DlqTopic | undefined;
  partitionsWarning?: any;
  confirmDialogPartitionsWarning: boolean;
  selectedSourceIds: number[];
  defaultLateMessageRejectionPeriod?: string;
  defaultEarlyMessageRejectionPeriod?: string;
  deletedSchemaData: Field[];
  isAdvancedFields?: boolean;
  isCompositeParams?: boolean;
}

export class CreateIndexPage extends React.Component<CreateIndexPageProps, CreateIndexPageState> {
  steps = ['Название индекса', 'Входные данные', 'Квота', 'Схема', 'Предобработка', 'Параметры составного индекса', 'Итог'];

  constructor(props) {
    super(props);
    const pipeline: Pipeline = structuredClone(this.props.pipeline);

    if (this.props.taskType === TaskType.update || this.props.taskType === TaskType.import) {
      if (pipeline?.processing?.transformArray) {
        pipeline.processing.transformArray = PipelineUtils.addIdsAndFormatsToTransformArray(
          pipeline?.processing?.transformArray,
          pipeline?.processing?.convertTimestampParams,
        );
      }
      if (pipeline?.processing?.convertTimestampParams) {
        pipeline.processing.convertTimestampParams = PipelineUtils.removeProcessingFromTimestamp(
          pipeline?.processing?.convertTimestampParams,
          pipeline.processing?.transformArray,
        );
      }
      if (pipeline?.schema) {
        pipeline.schema = PipelineUtils.removeProcessingFromSchema(pipeline.schema, pipeline.processing?.transformArray);
      }
      if (pipeline?.sources) {
        pipeline.sources = PipelineUtils.addPartitionsInSource(pipeline.sources, this.props.topics, this.props.projects);
      }
      if (!this.props.topics.find((topic) => topic.name === pipeline.deadLetterQueue?.target.kafka.name)) {
        delete pipeline.deadLetterQueue;
      }
    }

    this.state = {
      name: pipeline.name,
      sources: pipeline.sources,
      projectShortName: pipeline.projectShortName,
      processing: pipeline.processing,
      schema: pipeline.schema,
      quota: pipeline.quota,
      labels: pipeline.labels,
      replicationFactor: pipeline.replicationFactor,
      recoveryStrategy: pipeline.recoveryStrategy,
      activeStep: this.props.taskType === TaskType.update ? 1 : 0,
      projectName:
        this.props.taskType !== TaskType.new
          ? this.props.projects
              .filter((project) => {
                return project.shortName === pipeline.projectShortName;
              })
              .map((project) => {
                return project.name;
              })[0]
          : '',
      flatten: this.props.taskType === TaskType.new ? false : this.props.pipeline.processing?.flattenJsonParam != undefined,
      excludedFields:
        this.props.taskType === TaskType.new
          ? []
          : this.props.pipeline.processing?.flattenJsonParam?.excludedFromFlatteningFields
            ? this.props.pipeline.processing?.flattenJsonParam?.excludedFromFlatteningFields
            : [],
      autoSchema: { timestampFields: [], allFields: [] },
      wrongInputItem: { wrongInput: false, message: '' },
      estimatedQuota: IndexProvider.getEmptyEstimatedIndexQuota(),
      topicId:
        this.props.taskType !== TaskType.new
          ? this.props.topics
              .filter((topic) => {
                return (
                  topic.name === pipeline.sources?.kafka[0]?.topicName &&
                  topic.projectId ===
                    this.props.projects
                      .filter((project) => {
                        return project.shortName === this.props.pipeline.sources?.kafka[0]?.projectShortName;
                      })
                      .map((project) => {
                        return project.id;
                      })[0]
                );
              })
              .map((topic) => {
                return topic.id;
              })[0]
          : -1,
      dateFormats: this.props.dateFormats,
      samples: [],
      confirmDialogDeleteOpen: false,
      waitForTaskCreation: false,
      taskCreationComplete: false,
      successTaskCreation: false,
      errorMessage: '',
      errorDetails: '',
      loadingContinueSchema: false,
      dlqTopic: pipeline?.deadLetterQueue?.target.kafka,
      confirmDialogPartitionsWarning: false,
      selectedSourceIds: [],
      defaultLateMessageRejectionPeriod: 'P1D',
      defaultEarlyMessageRejectionPeriod: 'P1D',
      deletedSchemaData: [],
      advanced: pipeline.advanced || {
        globalReadAlias: null,
        collectionNodes: null,
        collectionShards: null,
        sourcesParallelism: null,
        nodesAndSinkParallelism: null,
        maxShardSizeBytes: null,
        sinkNumThreads: null,
        sinkBatchSize: null,
      },
      isAdvancedFields: false,
      isCompositeParams: false,
    };
    this.handleConfirmDialogDeleteOpen = this.handleConfirmDialogDeleteOpen.bind(this);
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
    this.handleConfirmPartitionsWarningClose = this.handleConfirmPartitionsWarningClose.bind(this);
    this.clearSchema = this.clearSchema.bind(this);
  }

  componentWillUnmount() {
    this.props.resetUnits();
  }

  componentDidMount() {
    const advancedFieldsFromPipeline = this.props.pipeline.advanced;
    ConfigService.getIndexConfig(
      'fulltext',
      (config) =>
        this.setState({
          defaultLateMessageRejectionPeriod: config?.lateMessageRejectionPeriod,
          defaultEarlyMessageRejectionPeriod: config?.earlyMessageRejectionPeriod,
        }),
      (message) => {
        return message;
      },
    );
    const advancedFields = {
      maxShardSizeBytes: advancedFieldsFromPipeline?.maxShardSizeBytes,
      sinkNumThreads: advancedFieldsFromPipeline?.sinkNumThreads,
      sinkBatchSize: advancedFieldsFromPipeline?.sinkBatchSize,
      collectionShards: advancedFieldsFromPipeline?.collectionShards,
      sourcesParallelism: advancedFieldsFromPipeline?.sourcesParallelism,
      nodesAndSinkParallelism: advancedFieldsFromPipeline?.nodesAndSinkParallelism,
    };
    const compositeFields = {
      globalReadAlias: advancedFieldsFromPipeline?.globalReadAlias,
      collectionNodes: advancedFieldsFromPipeline?.collectionNodes,
    };
    if (advancedFieldsFromPipeline) {
      this.setState({
        isAdvancedFields: Object.values(advancedFields).some((item) => item),
        isCompositeParams: Object.values(compositeFields).some((item) => item),
      });
    }
  }

  handleConfirmDialogDeleteOpen() {
    this.setState({ confirmDialogDeleteOpen: true });
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDialogDeleteOpen: false });
    if (value === 'Ok') {
      this.clearSchema();
    }
  }

  handleConfirmPartitionsWarningClose(value) {
    this.setState({ confirmDialogPartitionsWarning: false });
    if (value === 'Ok') {
      this.setState({
        activeStep: this.state.activeStep + 1,
        wrongInputItem: { wrongInput: false, message: '' },
      });
    }
  }

  clearSchema() {
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        this.setState((prevState) => {
          const autoSchema: SchemaIndex = IndexProvider.getEmptyAutoSchema();
          const schema: SchemaPipeline = prevState.schema;
          schema.fields = [];
          schema.dynamicFields ? (schema.dynamicFields = []) : null;
          const processing: ProcessingPipeline = prevState.processing;
          processing.convertTimestampParams ? (processing.convertTimestampParams = []) : null;
          processing.copyFieldParams ? (processing.copyFieldParams = []) : null;
          return { ...prevState, autoSchema, processing, schema, wrongInputItem: this.wrongInputCheck(schema) };
        });
      }, 300);
    });
  }

  wrongInputCheck(schema: SchemaPipeline) {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };
    let length = schema.fields.length;
    if (schema.dynamicFields) length += schema.dynamicFields.length;
    if (length === 0) {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Нельзя создать индекс с пустой схемой, добавьте нужные Вам поля.';
      return wrongInput;
    }
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

  createPartitionWarningText(source: SourcesPipeline): any {
    return (
      <React.Fragment>
        <Typography variant={'h6'}>Выбранные источники имеют разное количество партиций: </Typography>
        <Typography variant={'body2'}>
          <ul>
            {source.kafka.map((source, i) => (
              <li key={i}>{`Источник: ${source.projectShortName}/${source.topicName} - ${source.partition}`}</li>
            ))}
          </ul>
        </Typography>
        <Typography variant={'body1'}>
          Данная конфигурация индекса возможна только в исключительных ситуациях и может привести к некорректной работе функций процессинга и
          возникновению инцидентов:{' '}
        </Typography>
        <Typography variant={'body2'}>- дисбаланс чтения из источника данных;</Typography>
        <Typography variant={'body2'}>- некорректное ограничение на скорость записи.</Typography>
        <Typography variant="body1" color={'error'}>
          Вы осознаете возможные риски и уверены, что хотите продолжить?
        </Typography>
      </React.Fragment>
    );
  }

  render() {
    const { defaultLateMessageRejectionPeriod, defaultEarlyMessageRejectionPeriod } = this.state;
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
          <Grid container direction={'column'}>
            <NameConfigItem
              replicationFactor={this.state.replicationFactor}
              name={this.state.name}
              projectName={this.state.projectName}
              estimatedQuota={this.state.estimatedQuota}
              projectShortName={this.state.projectShortName}
              projects={this.props.projects}
              taskType={this.props.taskType}
              quota={this.state.quota}
              fetchQuota={this.props.fetchQuota}
              wrongInputChanged={(wrongInput) => {
                this.setState({ wrongInputItem: wrongInput });
              }}
              estimatedQuotaChanged={(estimatedIndexQuota) => {
                this.setState({ estimatedQuota: estimatedIndexQuota });
                if (this.props.taskType === TaskType.new) {
                  this.setState({ quota: { maxDataRateBytesPerSec: 0, maxSizeBytes: 0, maxStorageTimeSec: 0 } });
                }
              }}
              nameChanged={(name) => this.setState({ name: name })}
              projectNameChanged={(projectName) => this.setState({ projectName })}
              projectShortNameChanged={(projectShortName) => this.setState({ projectShortName: projectShortName })}
            />
          </Grid>
        )}
        {this.state.activeStep == 1 && (
          <TopicConfigItem
            changeSelectedSourceIds={(sourceIds) => this.setState({ selectedSourceIds: sourceIds })}
            displayError={this.props.displayError}
            projectShortName={this.state.projectShortName}
            projects={this.props.projects}
            sources={this.state.sources}
            taskType={this.props.taskType}
            sourcesChanged={(sources) => {
              this.setState({ sources: { ...this.state.sources, ...sources } });
            }}
            processing={this.state.processing}
            topicId={this.state.topicId}
            topicIdChange={(topicId) => {
              this.setState({ topicId: topicId });
            }}
            flattenChanged={(flatten) => {
              this.setState({ flatten: flatten });
            }}
            flatten={this.state.flatten}
            fetchRecords={this.props.fetchRecords}
            samples={this.state.samples}
            topics={this.props.topics}
            excludedFields={this.state.excludedFields}
            excludedFieldsChanged={(excludedFields) => {
              this.setState({ excludedFields });
            }}
            wrongInputChanged={(wrongInput) => {
              this.setState({ wrongInputItem: wrongInput });
            }}
            processingChanged={(processing) => {
              this.setState({ processing: processing });
            }}
            samplesChanged={(samples) => {
              this.setState({ samples: samples });
            }}
            getOptionLabel={this.getOptionLabel}
            inputFormatList={this.props.inputFormatList}
            schemaNames={this.props.schemaNames}
          />
        )}
        {this.state.activeStep == 2 && (
          <QuotaItem
            sources={this.state.sources}
            topics={this.props.topics}
            replicationFactorChanged={(replicationFactor: number) => {
              this.setState({ replicationFactor: replicationFactor });
            }}
            isAdmin={this.props.isAdmin}
            estimatedQuota={this.state.estimatedQuota}
            projectShortName={this.state.projectShortName}
            taskType={this.props.taskType}
            indexName={this.props.taskType === TaskType.update ? this.state.name : undefined}
            quota={this.state.quota}
            estimatedQuotaChanged={(estimatedQuota: EstimatedIndexQuota) => {
              this.setState({ estimatedQuota: estimatedQuota });
            }}
            recoveryStrategy={this.state.recoveryStrategy}
            recoveryStrategyChanged={(recoveryStrategy: any) => {
              this.setState({ recoveryStrategy: recoveryStrategy });
            }}
            wrongInputChanged={(wrongInput: WrongInput) => {
              this.setState({ wrongInputItem: wrongInput });
            }}
            wrongInput={this.state.wrongInputItem}
            quotaChanged={(quota: QuotaPipeline) => {
              this.setState({ quota: quota });
            }}
            replicationFactor={this.state.replicationFactor}
            checkQuota={this.props.checkQuota}
            fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
            onAdvancedChange={(advanced: any) => {
              this.setState({ advanced });
            }}
            advanced={{ ...this.state.advanced }}
            isAdvancedFields={this.state.isAdvancedFields}
            toggleChangeIsAdvance={(toggle: boolean) => {
              this.setState({ isAdvancedFields: toggle });
            }}
          />
        )}
        {this.state.activeStep == 3 && (
          <React.Fragment>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center">
              <GenerateButton
                disabled={this.state.sources.format.type === PipelineInputFormatListEnum.AVRO}
                loadingContinueChanged={(loading) => {
                  this.setState({ loadingContinueSchema: loading });
                }}
                isLoading={this.props.isLoadingSchema}
                topicIds={Object.values(IndexUtils.getTopicIds(this.state.sources.kafka, this.props.topics, this.props.projects))}
                excludedFields={this.state.excludedFields}
                flatten={this.state.flatten}
                createSchema={this.props.createSchema}
                schemasChanges={(schemaNew, autoSchemaNew) => {
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                      this.setState((prevState) => {
                        const autoSchema: SchemaIndex = prevState.autoSchema;
                        let processing: ProcessingPipeline = prevState.processing;
                        const schema: SchemaPipeline = prevState.schema;
                        autoSchema.allFields = autoSchemaNew.allFields;
                        autoSchema.timestampFields = autoSchemaNew.timestampFields;
                        if (autoSchemaNew.timestampFields.length !== 0) {
                          const timestampNodes: TimestampNode[] = [];
                          autoSchemaNew.timestampFields.forEach((timestampField) => {
                            const timestampNode: TimestampNode = {
                              field: timestampField.name,
                              inputFormats: [timestampField.format],
                              inputTimezone: 'UTC',
                              outputTimezone: 'UTC',
                              outputFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
                            };
                            timestampNodes.push(timestampNode);
                          });
                          processing = {
                            convertTimestampParams: timestampNodes,
                            flattenJsonParam: processing.flattenJsonParam,
                          };
                        } else {
                          processing = {
                            flattenJsonParam: processing.flattenJsonParam,
                          };
                        }
                        schema.fields = schemaNew.fields;
                        schema.dynamicFields = schemaNew.dynamicFields;
                        this.setState({ wrongInputItem: this.wrongInputCheck(schema) });
                        return {
                          ...prevState,
                          schema,
                          autoSchema,
                          processing,
                          loadingContinueSchema: false,
                        };
                      });
                    }, 7000);
                  });
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{
                  marginTop: 12,
                  marginBottom: 6,
                  marginLeft: 6,
                  marginRight: 6,
                }}
                onClick={() => {
                  this.handleConfirmDialogDeleteOpen();
                }}
              >
                Очистить поля
              </Button>
            </Grid>
            <SchemaConfigItem
              loadingContinue={this.state.loadingContinueSchema}
              isLoadingSchema={this.props.isLoadingSchema}
              autoSchema={this.state.autoSchema}
              schema={this.state.schema}
              dateFormats={this.props.dateFormats}
              timeZones={this.props.timeZones}
              wrongInputChanged={(wrongInput) => {
                this.setState({ wrongInputItem: wrongInput });
              }}
              processing={this.state.processing}
              displayError={this.props.displayError}
              schemaChanged={(schema) => {
                this.setState({ schema: schema });
              }}
              processingChanged={(processing) => {
                this.setState({ processing: processing });
              }}
              deletedSchemaField={(deletedItem) => {
                const newData = [...this.state.deletedSchemaData, deletedItem];
                this.setState({ deletedSchemaData: newData });
              }}
            />
          </React.Fragment>
        )}
        {this.state.activeStep == 4 && (
          <React.Fragment>
            <ProcessingItem
              dateFormats={this.props.dateFormats}
              timeZones={this.props.timeZones}
              processing={this.state.processing}
              schema={this.state.schema}
              displayError={this.props.displayError}
              processingChanged={(processing) => {
                this.setState({ processing: processing });
              }}
              schemaChanged={(schema) => {
                this.setState({ schema: schema });
              }}
            />
          </React.Fragment>
        )}
        {this.state.activeStep == 5 && (
          <AdvancedItem
            advanced={{ ...this.state.advanced }}
            onAdvancedChange={(advanced) => {
              this.setState({ advanced });
            }}
            isCompositeParams={this.state.isCompositeParams}
            toggleCompositeParams={(toggle: boolean) => {
              this.setState({ isCompositeParams: toggle });
            }}
          />
        )}
        {this.state.activeStep == 6 && (
          <React.Fragment>
            <ResultItem
              labels={this.state.labels}
              changeLabels={(labels) => {
                this.setState({ labels: labels.length > 0 ? labels : null });
              }}
              primaryTimeField={this.state.schema.primaryTimeField}
              changePrimaryTimeField={(primaryTimeField) => {
                const schema = this.state.schema;
                schema.primaryTimeField = primaryTimeField;
                this.setState({ schema: schema });
              }}
              resultSchemaFields={PipelineUtils.getResultFields(this.state.schema.fields, this.state.processing?.transformArray)}
              resultTimestamps={PipelineUtils.getResultTimestamp(
                this.state.processing?.convertTimestampParams,
                this.state.processing?.transformArray,
              )}
              defaultLateMessageRejectionPeriod={defaultLateMessageRejectionPeriod}
              defaultEarlyMessageRejectionPeriod={defaultEarlyMessageRejectionPeriod}
              displayError={this.props.displayError}
              processing={this.state.processing}
              schema={this.state.schema}
              quota={this.state.quota}
              topics={this.props.topics.filter((topic) => !this.state.selectedSourceIds.some((sourceId) => sourceId === topic.id))}
              value={this.getDlqValue()}
              onChange={this.dlqTopicHandler}
              getOptionLabel={this.getOptionLabel}
              advanced={this.state.advanced ?? null}
            />
          </React.Fragment>
        )}
        <Grid container direction={'row'} style={{ padding: 16 }} justifyContent={'flex-end'}>
          <Button
            onClick={() => {
              this.setState({
                activeStep: this.state.activeStep - 1,
                wrongInputItem: { wrongInput: false, message: '' },
              });
            }}
            disabled={this.state.activeStep == 0}
          >
            Назад
          </Button>
          <Button
            onClick={() => {
              if (
                this.steps[this.state.activeStep] === 'Название индекса' ||
                this.steps[this.state.activeStep] === 'Квота' ||
                this.steps[this.state.activeStep] === 'Входные данные' ||
                this.steps[this.state.activeStep] === 'Схема' ||
                this.steps[this.state.activeStep] === 'Предобработка' ||
                this.steps[this.state.activeStep] === 'Параметры составного индекса'
              ) {
                if (this.state.wrongInputItem.wrongInput) {
                  this.props.displayError(this.state.wrongInputItem.message);
                  return;
                }
                if (this.steps[this.state.activeStep] === 'Входные данные') {
                  if (
                    this.state.sources.format?.type === PipelineInputFormatListEnum.AVRO &&
                    !getSchemaName(this.state.sources.format?.schemaName, this.props.schemaNames)
                  ) {
                    this.props.displayError('Не выбрана схема AVRO');
                    return;
                  }

                  let numPart: number | undefined = 0;
                  let needWarn = false;
                  let emptyField = false;
                  this.state.sources.kafka.map((source) => {
                    if (numPart == 0) {
                      numPart = source.partition;
                    } else if (numPart != source.partition) {
                      needWarn = true;
                    }
                    if (!source.projectShortName || !source.topicName) emptyField = true;
                    if (!this.props.topics.find((topic) => topic.name === source.topicName)) emptyField = true;
                  });

                  if (emptyField) {
                    this.props.displayError('Заполните все источники данных');
                    return;
                  }

                  if (needWarn) {
                    this.setState({
                      confirmDialogPartitionsWarning: true,
                      partitionsWarning: this.createPartitionWarningText(this.state.sources),
                    });
                    return;
                  }
                }
                if (this.steps[this.state.activeStep] === 'Предобработка') {
                  if (this.state?.processing?.transformArray) {
                    const transformArrayData = transformHelpers.getTransformTableData(this.state?.processing?.transformArray);

                    const invalid = transformArrayData.some((arrayData, index) => {
                      const fields = arrayData?.fields ?? [];
                      const filteredData = [...transformArrayData].filter((data) => data.id !== arrayData.id);
                      // @ts-ignore
                      if (transformHelpers.validateArrayName(arrayData?.arrayNames, filteredData)) {
                        // данные являются невалидными
                        return true;
                      }
                      // если хотя бы один элемент fields невалиден, то все данные невалидны
                      // fields.some((field) =>!transformHelpers.validateRow(index, this.state.schema, undefined, this.state.processing)(field, transformArrayData));

                      const sourceFields = fields.map((src: ITransformData): string => src.sourceField);
                      const targetArrays = fields.map((trg: ITransformData): string => trg.targetArray);
                      const IsSourceFieldsUnique = Array.from(new Set(sourceFields)).length === sourceFields.length;
                      const IsTargetArraysUnique = Array.from(new Set(targetArrays)).length === sourceFields.length;

                      return !IsSourceFieldsUnique && !IsTargetArraysUnique;
                    });
                    const schemaFields = PipelineUtils.getAllTransformArrayDateFields(
                      transformHelpers.getTransformTableData(this.state?.processing?.transformArray),
                    );
                    const formatsInvalid = schemaFields.some((field) => field.format === '' || !field.format);

                    if (invalid) {
                      this.props.displayError('Ошибка валидации преобразования массива');
                      return;
                    }
                    if (formatsInvalid) {
                      this.props.displayError('Ошибка валидации форматов дат');
                      return;
                    }
                  }
                  const isDeletedSchema = this.state.processing?.copyFieldParams?.find((data) => {
                    const deletedSchemaNames = this.state.deletedSchemaData.map((d) => d.name);
                    return deletedSchemaNames.includes(data.fromField);
                  });
                  if (isDeletedSchema) {
                    this.props.displayError(
                      `Источник копирования ${isDeletedSchema.fromField} для поля ${isDeletedSchema.toFields[0]} был удалён. Чтобы продолжить, выберите новый источник копирования или отмените копирование для этого поля.`,
                    );
                    return;
                  }
                }
                if (this.steps[this.state.activeStep] === 'Квота') {
                  const isParelellFields =
                    (this.state.advanced?.sourcesParallelism && !this.state.advanced?.nodesAndSinkParallelism) ||
                    (!this.state.advanced?.sourcesParallelism && this.state.advanced?.nodesAndSinkParallelism);
                  if (isParelellFields) {
                    this.props.displayError('Заполните все поля параллелизма');
                    return;
                  }
                  const advancedFields = {
                    maxShardSizeBytes: this.state.advanced?.maxShardSizeBytes,
                    sinkNumThreads: this.state.advanced?.sinkNumThreads,
                    sinkBatchSize: this.state.advanced?.sinkBatchSize,
                    collectionShards: this.state.advanced?.collectionShards,
                    sourcesParallelism: this.state.advanced?.sourcesParallelism,
                    nodesAndSinkParallelism: this.state.advanced?.nodesAndSinkParallelism,
                  };
                  if (this.state.isAdvancedFields && Object.values(advancedFields).every((item) => !item)) {
                    this.setState({ isAdvancedFields: false });
                  }
                }
                if (this.steps[this.state.activeStep] === 'Параметры составного индекса') {
                  const compositeFields = {
                    globalReadAlias: this.state.advanced?.globalReadAlias,
                    collectionNodes: this.state.advanced?.collectionNodes,
                  };
                  if (this.state.isCompositeParams && Object.values(compositeFields).every((item) => !item)) {
                    this.setState({ isCompositeParams: false });
                  }
                  if (!this.state.isCompositeParams) {
                    this.setState({
                      advanced: {
                        ...this.state.advanced,
                        globalReadAlias: null,
                        collectionNodes: null,
                      },
                    });
                  }
                }
                this.setState({ activeStep: this.state.activeStep + 1 });
                return;
              } else {
                if (
                  this.state.schema.primaryTimeField.type === TypePrimaryField.CUSTOM &&
                  (this.state.schema.primaryTimeField.customFieldName === '' || this.state.schema.primaryTimeField.customFieldName === undefined)
                ) {
                  this.props.displayError(
                    'Укажите поле из схемы, которое будет использоваться, ' +
                      'как основное время или выберите "использовать время записи в хранилище"',
                  );
                  return;
                }
                this.setState({
                  waitForTaskCreation: true,
                  taskCreationComplete: false,
                  successTaskCreation: false,
                });
                const pipeline: Pipeline = {
                  name: this.state.name,
                  projectShortName: this.state.projectShortName,
                  processing: structuredClone(this.state.processing),
                  schema: structuredClone(this.state.schema),
                  sources: PipelineUtils.removeIdAndPartitions(this.state.sources),
                  quota: this.state.quota,
                  replicationFactor: this.state.replicationFactor,
                  recoveryStrategy: this.state.recoveryStrategy,
                  labels: this.state.labels,
                  advanced: this.state.advanced,
                };
                pipeline.schema.fields = PipelineUtils.getResultFields(this.state.schema.fields, this.state.processing?.transformArray);
                if (pipeline.processing?.messageFilter) {
                  pipeline.processing.messageFilter.condition.conditions.map((cond) => {
                    delete cond.tableData;
                  });
                }

                if (pipeline?.processing) {
                  if (pipeline?.processing?.transformArray) {
                    pipeline.processing.transformArray = pipeline?.processing?.transformArray
                      ? PipelineUtils.removeIdAndFormats(pipeline?.processing?.transformArray)
                      : undefined;
                  }
                  //
                  pipeline.processing.convertTimestampParams = PipelineUtils.getResultTimestamp(
                    this.state.processing?.convertTimestampParams,
                    this.state.processing?.transformArray,
                  );

                  if (pipeline?.processing?.copyAuditParams?.copyAuditParamsSpecs) {
                    pipeline.schema.fields = modifySchema(
                      pipeline.schema.fields as unknown as ICopyFieldsSchema[],
                      pipeline.processing.copyAuditParams.copyAuditParamsSpecs,
                      false,
                    ) as Field[];
                  }

                  if (pipeline?.processing?.copyAuditParams?.copyAuditParamsSpecs.length === 0) delete pipeline?.processing?.copyAuditParams;
                }

                if (this.state.dlqTopic)
                  pipeline.deadLetterQueue = {
                    target: {
                      kafka: this.state.dlqTopic,
                    },
                  };
                if (this.props.taskType === TaskType.update) {
                  this.props.updatePipeline(
                    this.state.projectShortName,
                    this.state.name,
                    pipeline,
                    () => {
                      this.setState({
                        taskCreationComplete: true,
                        successTaskCreation: true,
                      });
                      this.props.displaySuccess('Индекс успешно обновлен');
                      this.props.redirect();
                      // this.props.history.push('/index');
                    },
                    (msg) => {
                      this.setState({
                        taskCreationComplete: true,
                        successTaskCreation: false,
                        // isContinue: true,
                        errorMessage: msg.message.message,
                        errorDetails: msg.details,
                      });
                    },
                  );
                } else {
                  PipelineService.createPipeline(
                    pipeline,
                    () => {
                      this.setState({
                        taskCreationComplete: true,
                        successTaskCreation: true,
                      });
                      this.props.displaySuccess('Индекс успешно создан');
                      this.props.redirect();
                      // this.props.history.push('/index');
                    },
                    (msg) => {
                      this.setState({
                        taskCreationComplete: true,
                        successTaskCreation: false,
                        //  isContinue: true,
                        errorMessage: msg.message.message,
                        errorDetails: msg.details,
                      });
                    },
                  );
                }
              }
            }}
          >
            {this.state.activeStep === 6 ? 'Готово' : 'Далее'}
          </Button>
        </Grid>
        <ConfirmDialog
          warningText={'Вы уверены, что хотите очистить схему?'}
          open={this.state.confirmDialogDeleteOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />
        <ConfirmDialog
          warningText={this.state.partitionsWarning}
          open={this.state.confirmDialogPartitionsWarning}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmPartitionsWarningClose}
        />
        <WaitingDialog
          title={this.props.taskType === TaskType.update ? 'Обновление индекса' : 'Создание индекса'}
          open={this.state.waitForTaskCreation}
          onClose={() => {
            this.setState({
              activeStep: 6,
              waitForTaskCreation: false,
            });
          }}
          complete={this.state.taskCreationComplete}
          success={this.state.successTaskCreation}
          successMessage={this.props.taskType === TaskType.update ? 'Индекс успешно обновлен' : 'Индекс успешно создан'}
          errorMessage={this.state.errorMessage}
          details={this.state.errorDetails}
          needDetailedInfo={true}
        />
      </React.Fragment>
    );
  }
}

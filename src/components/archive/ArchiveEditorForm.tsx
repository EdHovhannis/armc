import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { TaskType } from '@src/containers/archive/ArchiveEditorView';
import {
  ArchivalPrimaryFieldType,
  ArchivalQuota,
  ARCHIVE_TYPES,
  ArchiveInputFormatListEnum,
  ArchiveProcessing,
  ArchiveQuotaEstimation,
  ArchiveSchema,
  ArchiveSource,
  ArchiveTask,
  DlqTopic,
  Field,
} from '@src/store/archive/Types';
import { KafkaTopic } from '@src/store/kafka/Types';
import { Project } from '@src/store/project/Types';
import { ArchiveUtils } from '@src/utils/ArchiveUtils';
import { Utils } from '@src/utils/Utils';
import * as React from 'react';

import ArchiveService from '../../services/ArchiveService';
import ConfigService from '../../services/ConfigService';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { ICopyFieldsSchema } from '../processing/FieldCopy/types';
import { modifySchema } from '../processing/FieldCopy/utils';
import * as transformHelpers from '../processing/TransformArray/functions';
import { ITransformData } from '../processing/TransformArray/types';

import { GenerateButtonPart } from './createArchiveParts/GenerateButtonPart';
import { NameProjectPart } from './createArchiveParts/NameProjectPart';
import ProcessingPart from './createArchiveParts/ProcessingPart';
import QuotaPart from './createArchiveParts/QuotaPart';
import ResultPart from './createArchiveParts/ResultPart';
import SchemaConfigPart from './createArchiveParts/SchemaConfigPart';
import TopicConfigPart from './createArchiveParts/TopicConfigPart';

export interface SchemaArchive {
  allFields: Array<Field>;
}

export interface WrongInput {
  wrongInput: boolean;
  message: string;
}

interface ArchiveEditorFormProps {
  taskType: TaskType;
  canEdit: boolean;
  archiveTask: ArchiveTask;
  projectShortName: string;
  topics: KafkaTopic[];
  projects: Project[];
  allProjects: Project[];
  timeZones: string[];
  dateFormats: string[];
  isAdmin: boolean;
  isLoadingSchema: boolean;
  isDisableNextButton: boolean;
  inputFormatList: ArchiveInputFormatListEnum[];
  schemaNames: string[];

  fetchRecords(topicId: number, numRecords: number, callback: any): any;

  fetchQuota(projectShortName: string, okCallback: (quota: ArchivalQuota) => void, errorCallback?: (error: string) => void): any;

  checkQuota(
    projectShortName: string,
    size: number,
    rate: number,
    fetchedCallback?: (quota: ArchiveQuotaEstimation) => void,
    notFetchedCallback?: (msg: string) => void,
    index?: string,
  ): any;

  createSchema(topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback): any;

  displayError(error: string): any;

  displaySuccess: (message: string) => any;

  redirect(): any;
  resetUnits: () => void;
}

interface ArchiveEditorFormState extends ArchiveTask {
  activeStep: number;
  projectName: string;
  projectShortName: string;
  wrongInputItem: WrongInput;
  flatten: boolean;
  autoSchema: SchemaArchive;
  exclude: Array<string>;
  samples: any;
  topicId: number;
  availableQuota: ArchivalQuota;
  dateFormats: string[];
  confirmDialogDeleteOpen: boolean;
  waitForTaskCreation: boolean;
  taskCreationComplete: boolean;
  successTaskCreation: boolean;
  errorMessage: string;
  detailMessage?: string;
  loadingContinueSchema: boolean;
  dlqTopic: DlqTopic | undefined;
  transformArrayDates: Field[];
  partitionsWarning?: any;
  confirmDialogPartitionsWarning: boolean;
  selectedSourceIds: number[];
  defaultLateMessageRejectionPeriod: string;
  defaultEarlyMessageRejectionPeriod: string;
  sourceEditEnabled: boolean;
  maxCount: number;
  deletedSchemaData: Field[];
}

export class ArchiveEditorForm extends React.Component<ArchiveEditorFormProps, ArchiveEditorFormState> {
  steps = ['Название индекса', 'Входные данные', 'Квота', 'Схема', 'Предобработка', 'Итог'];

  prepareDlqTopic = (props: ArchiveEditorFormProps): DlqTopic | undefined => {
    const dlqTopic = props.archiveTask?.deadLetterQueue?.target?.kafka;
    if (!dlqTopic) {
      return undefined;
    }

    const projectId = props.projects.find((project: Project) => project.shortName === dlqTopic.projectKey)?.id;

    if (!projectId) {
      return undefined;
    }

    const topicExists = props.topics.some((topic: KafkaTopic) => topic.projectId === projectId && topic.name === dlqTopic.name);

    return topicExists ? dlqTopic : undefined;
  };

  constructor(props) {
    super(props);

    const archiveTask: ArchiveTask = this.props.archiveTask;

    if (this.props.taskType === TaskType.update || this.props.taskType === TaskType.import) {
      if (archiveTask?.source) {
        archiveTask.source = ArchiveUtils.addPartitionsInSource(archiveTask.source, this.props.topics, this.props.projects);
      }
      if (archiveTask?.processing?.transformArray) {
        archiveTask.processing.transformArray = ArchiveUtils.addIdsAndFormatsToTransformArray(
          archiveTask?.processing?.transformArray,
          archiveTask?.schema?.fields,
        );
      }
      if (archiveTask?.schema) {
        archiveTask.schema = ArchiveUtils.removeProcessingFromSchema(archiveTask?.schema, archiveTask?.processing?.transformArray);
      }
    }

    this.state = {
      name: archiveTask?.name,
      source: archiveTask?.source,
      projectShortName: this.props.projectShortName,
      processing: archiveTask?.processing,
      schema: archiveTask?.schema,
      quota: archiveTask?.quota,
      labels: archiveTask?.labels,
      activeStep: this.props.taskType === TaskType.update ? 1 : 0,
      projectName:
        this.props.taskType !== TaskType.new
          ? this.props.projects
              .filter((project) => {
                return project.shortName === this.props.projectShortName;
              })
              .map((project) => {
                return project.name;
              })[0]
          : '',
      primaryTimeField:
        archiveTask?.schema?.fields.filter((field) => field.name === archiveTask?.primaryTimeField?.field).length > 0
          ? archiveTask?.primaryTimeField
          : undefined,
      flatten: this.props.taskType === TaskType.new ? false : this.props.archiveTask?.processing?.flatten != undefined,
      exclude:
        this.props.taskType === TaskType.new
          ? []
          : this.props.archiveTask?.processing?.flatten?.exclude
            ? this.props.archiveTask?.processing?.flatten?.exclude
            : [],
      // autoSchema: {timestampFields: [], allFields: []},
      wrongInputItem: { wrongInput: false, message: '' },
      availableQuota: ArchiveUtils.getEmptyArchivalQuota(),
      topicId:
        this.props.taskType !== TaskType.new
          ? this.props.topics.filter((topic) => {
              return (
                topic.name === this.props.archiveTask?.source?.kafka?.name &&
                topic.projectId ===
                  this.props.projects
                    .filter((project) => {
                      return project.shortName === this.props.archiveTask?.source?.kafka?.project;
                    })
                    .map((project) => {
                      return project.id;
                    })[0]
              );
            }).length > 0
            ? this.props.topics
                .filter((topic) => {
                  return (
                    topic.name === this.props.archiveTask?.source?.kafka?.name &&
                    topic.projectId ===
                      this.props.projects
                        .filter((project) => {
                          return project.shortName === this.props.archiveTask?.source?.kafka?.project;
                        })
                        .map((project) => {
                          return project.id;
                        })[0]
                  );
                })
                .map((topic) => {
                  return topic.id;
                })[0]
            : this.props.topics.filter(
                  (topic) =>
                    topic.topicFullName === this.props.archiveTask?.source?.kafka?.project + '.' + this.props.archiveTask?.source?.kafka?.name,
                ).length > 0
              ? this.props.topics.filter(
                  (topic) =>
                    topic.topicFullName === this.props.archiveTask?.source?.kafka?.project + '.' + this.props.archiveTask?.source?.kafka?.name,
                )[0].id
              : -1
          : -1,
      dateFormats: this.props.dateFormats,
      samples: [],
      confirmDialogDeleteOpen: false,
      waitForTaskCreation: false,
      taskCreationComplete: false,
      successTaskCreation: false,
      errorMessage: '',
      autoSchema: ArchiveUtils.getEmptyAutoSchema(),
      loadingContinueSchema: false,
      canEdit: this.props.canEdit,
      dlqTopic: this.prepareDlqTopic(this.props),
      confirmDialogPartitionsWarning: false,
      transformArrayDates: ArchiveUtils.convertTransformArrayToSchema(this.state?.processing?.transformArray).filter(
        (field) => field.subType === ARCHIVE_TYPES.DATE,
      ),
      selectedSourceIds: [],
      defaultLateMessageRejectionPeriod: 'P1D',
      defaultEarlyMessageRejectionPeriod: 'P1D',
      sourceEditEnabled: false,
      maxCount: 5,
      deletedSchemaData: [],
    };
    this.handleConfirmDialogDeleteOpen = this.handleConfirmDialogDeleteOpen.bind(this);
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
    this.clearSchema = this.clearSchema.bind(this);
    this.handleConfirmPartitionsWarningClose = this.handleConfirmPartitionsWarningClose.bind(this);
  }

  componentDidUpdate(prevProps: ArchiveEditorFormProps) {
    if (prevProps.archiveTask !== this.props.archiveTask || prevProps.topics !== this.props.topics || prevProps.projects !== this.props.projects) {
      const preparedDlqTopic = this.prepareDlqTopic(this.props);
      const currentDlqTopic = this.state.dlqTopic;

      if (
        (preparedDlqTopic &&
          (!currentDlqTopic || preparedDlqTopic.name !== currentDlqTopic.name || preparedDlqTopic.projectKey !== currentDlqTopic.projectKey)) ||
        (!preparedDlqTopic && currentDlqTopic)
      ) {
        this.setState({ dlqTopic: preparedDlqTopic });
      }
    }
  }

  componentDidMount() {
    ConfigService.getIndexConfig(
      'archive',
      (config) =>
        this.setState({
          defaultLateMessageRejectionPeriod: config.lateMessageRejectionPeriod || this.state.defaultLateMessageRejectionPeriod,
          defaultEarlyMessageRejectionPeriod: config.earlyMessageRejectionPeriod || this.state.defaultEarlyMessageRejectionPeriod,
          sourceEditEnabled: config.sourceEditEnabled ?? false,
          maxCount: config.maxSourceCount ?? 5,
        }),
      () => {
        return;
      },
    );
  }

  componentWillUnmount() {
    this.props.resetUnits();
  }

  handleConfirmDialogDeleteOpen() {
    this.setState({ confirmDialogDeleteOpen: true });
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDialogDeleteOpen: false });
    if (value === 'Ok') {
      this.clearSchema(true);
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

  clearSchema(needCheckWrongInput) {
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
        this.setState((prevState) => {
          const autoSchema: SchemaArchive = ArchiveUtils.getEmptyAutoSchema();
          const schema: ArchiveSchema = prevState.schema;
          schema.fields = [];
          if (needCheckWrongInput) this.setState({ wrongInputItem: this.wrongInputCheck(schema) });
          const processing: ArchiveProcessing = prevState.processing;
          processing.copyField ? (processing.copyField = []) : null;
          return { ...prevState, autoSchema, processing, schema };
        });
      }, 300);
    });
  }

  wrongInputCheck(schema: ArchiveSchema) {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };
    if (schema.fields.length === 0) {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Нельзя создать архив с пустой схемой, добавьте нужные Вам поля.';
      return wrongInput;
    }
    return wrongInput;
  }

  dlqTopicHandler = (projectId: number | null | undefined, name: string | null) => {
    let dlqTopic: DlqTopic | undefined = undefined;

    this.props.projects.map((project: Project) => {
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
    const projectId = this.props.projects.find((project: Project) => project.shortName === this.state.dlqTopic?.projectKey)?.id ?? undefined;
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

  createPartitionWarningText(source: ArchiveSource): any {
    return (
      <React.Fragment>
        <Typography variant={'h6'}>Выбранные источники имеют разное количество партиций:</Typography>
        <Typography variant={'body2'}>
          <ul>
            {source.kafka.map((source, i) => (
              <li key={i}>{`Источник: ${source.project}/${source.name} - ${source.partition}`}</li>
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
    const topicIds = Object.values(
      ArchiveUtils.getTopicIds(this.state.source?.kafka || [], this.props.topics || [], this.props.allProjects || []),
    ).filter((id) => Boolean(id)) as number[];

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
            <NameProjectPart
              name={this.state.name}
              projectName={this.state.projectName}
              availableQuota={this.state.availableQuota}
              projectShortName={this.state.projectShortName}
              projects={this.props.projects}
              taskType={this.props.taskType}
              fetchQuota={this.props.fetchQuota}
              quota={this.state.quota}
              wrongInputChanged={(wrongInput) => {
                this.setState({ wrongInputItem: wrongInput });
              }}
              availableQuotaChanged={(availableQuota) => {
                if (!ArchiveUtils.isEqualQuota(availableQuota, this.state.availableQuota)) {
                  this.setState({ availableQuota: availableQuota });
                  if (this.props.taskType === TaskType.new) {
                    this.setState({
                      quota: { maxDataRateBytesPerSec: 0, maxSizeBytes: 0 },
                    });
                  }
                }
              }}
              nameChanged={(name) => this.setState({ name: name })}
              projectNameChanged={(projectName) => this.setState({ projectName: projectName })}
              projectShortNameChanged={(projectShortName) => this.setState({ projectShortName: projectShortName })}
              checkQuota={this.props.checkQuota}
            />
          </Grid>
        )}
        {this.state.activeStep == 1 && (
          <TopicConfigPart
            displayError={this.props.displayError}
            canEdit={this.props.canEdit}
            projects={this.props.allProjects}
            source={this.state.source}
            taskType={this.props.taskType}
            sourcesChanged={(sources) => {
              this.setState({ source: { ...this.state.source, ...sources } });
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
            exclude={this.state.exclude}
            excludeChanged={(exclude) => {
              this.setState({ exclude: exclude });
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
            maxCount={this.state.maxCount}
            sourceEditEnabled={this.state.sourceEditEnabled}
          />
        )}
        {this.state.activeStep == 2 && (
          <QuotaPart
            availableQuota={this.state.availableQuota}
            availableQuotaChanged={(availableQuota) => {
              this.setState({ availableQuota: availableQuota });
            }}
            canEdit={this.props.canEdit}
            projectShortName={this.state.projectShortName}
            wrongInputChanged={(wrongInput) => {
              this.setState({ wrongInputItem: wrongInput });
            }}
            wrongInput={this.state.wrongInputItem.wrongInput}
            quota={this.state.quota}
            quotaChanged={(quota) => {
              this.setState({ quota: quota });
            }}
            fetchQuota={this.props.fetchQuota}
            kafkaTopics={this.state.source.kafka || []}
            topics={this.props.topics}
            indexName={this.props.taskType === TaskType.update ? this.state.name : ''}
          />
        )}
        {this.state.activeStep == 3 && (
          <React.Fragment>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center">
              <GenerateButtonPart
                disabled={topicIds.length === 0 || !this.props.canEdit || this.state.source.format.type === ArchiveInputFormatListEnum.AVRO}
                loadingContinueChanged={(loading) => {
                  this.setState({ loadingContinueSchema: loading });
                }}
                isLoading={this.props.isLoadingSchema}
                topicIds={topicIds}
                exclude={this.state.exclude}
                flatten={this.state.flatten}
                createSchema={this.props.createSchema}
                schemaChanged={(schemaNew) => {
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                      this.setState((prevState) => {
                        const schema: ArchiveSchema = prevState.schema;
                        schema.fields = schemaNew.fields;
                        this.setState({
                          wrongInputItem: this.wrongInputCheck(schema),
                        });
                        return {
                          ...prevState,
                          schema,
                          loadingContinueSchema: false,
                        };
                      });
                    }, 7000);
                  });
                }}
                autoSchemaChanged={(autoSchemaNew) => {
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                      this.setState((prevState) => {
                        const autoSchema: SchemaArchive = prevState.autoSchema;
                        autoSchema.allFields = autoSchemaNew.allFields;
                        let processing: ArchiveProcessing = prevState.processing;
                        processing = {
                          flatten: processing.flatten,
                        };
                        return {
                          ...prevState,
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
                disabled={!this.props.canEdit}
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
            <SchemaConfigPart
              canEdit={this.props.canEdit}
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
              deletedSchemaField={(deletedItem) => {
                const newData = [...this.state.deletedSchemaData, deletedItem];
                this.setState({ deletedSchemaData: newData });
              }}
            />
          </React.Fragment>
        )}
        {this.state.activeStep == 4 && (
          <React.Fragment>
            <ProcessingPart
              canEdit={this.props.canEdit}
              processing={this.state.processing}
              schema={this.state.schema}
              dateFormats={this.props.dateFormats}
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
          <React.Fragment>
            <ResultPart
              labels={this.state.labels}
              changeLabels={(labels) => {
                this.setState({ labels: labels });
              }}
              canEdit={this.props.canEdit}
              primaryTimeField={this.state.primaryTimeField}
              changePrimaryTimeField={(primaryTimeField) => {
                this.setState({ primaryTimeField: primaryTimeField });
              }}
              processing={this.state.processing}
              schema={this.state.schema}
              resultSchemaFields={ArchiveUtils.getResultFields(this.state.schema.fields, this.state.processing?.transformArray)}
              defaultLateMessageRejectionPeriod={this.state.defaultLateMessageRejectionPeriod}
              defaultEarlyMessageRejectionPeriod={this.state.defaultEarlyMessageRejectionPeriod}
              quota={this.state.quota}
              topics={this.props.topics.filter((topic: KafkaTopic) => topic.id !== this.state.topicId)}
              value={this.getDlqValue()}
              onChange={this.dlqTopicHandler}
              getOptionLabel={this.getOptionLabel}
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
            disabled={this.props.isDisableNextButton}
            onClick={() => {
              if (
                this.steps[this.state.activeStep] === 'Название индекса' ||
                this.steps[this.state.activeStep] === 'Квота' ||
                this.steps[this.state.activeStep] === 'Входные данные' ||
                this.steps[this.state.activeStep] === 'Схема' ||
                this.steps[this.state.activeStep] === 'Предобработка'
              ) {
                if (this.state.wrongInputItem.wrongInput) {
                  this.props.displayError(this.state.wrongInputItem.message);
                  return;
                }
                if (this.steps[this.state.activeStep] === 'Входные данные') {
                  if (this.state.source.format?.type === ArchiveInputFormatListEnum.AVRO && !this.state.source.format?.schemaName) {
                    this.props.displayError('Не выбрана схема AVRO');
                    return;
                  }

                  let emptyField = false;
                  let numPart: number | undefined = 0;
                  let needWarn = false;
                  this.state.source?.kafka?.map((source) => {
                    const topicInList = this.props.topics?.find((topic: KafkaTopic) => topic.name === source.name);
                    if (numPart == 0 && topicInList) {
                      numPart = source.partition;
                    } else if (numPart != source.partition && topicInList) {
                      needWarn = true;
                    }
                    if (!source.project || !source.name || !topicInList) {
                      emptyField = true;
                    }
                  });

                  if (
                    emptyField &&
                    (this.props.taskType === TaskType.new ||
                      this.props.taskType === TaskType.import ||
                      (this.state.sourceEditEnabled && this.props.taskType === TaskType.update))
                  ) {
                    this.props.displayError('Заполните все источники данных');
                    return;
                  }

                  if (needWarn) {
                    this.setState({
                      confirmDialogPartitionsWarning: true,
                      partitionsWarning: this.createPartitionWarningText(this.state.source),
                    });
                    return;
                  }
                }

                // валидация страницы предобработка, вкладка "преобразование массивов"
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
                    const schemaFields = ArchiveUtils.getAllSubTypeDates(this.state?.processing?.transformArray);
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
                  const isDeletedSchema = this.state.processing.copyField?.find((data) => {
                    const deletedSchemaNames = this.state.deletedSchemaData.map((d) => d.name);
                    return deletedSchemaNames.includes(data.from);
                  });
                  if (isDeletedSchema) {
                    this.props.displayError(
                      `Источник копирования ${isDeletedSchema.from} для поля ${isDeletedSchema.to[0]} был удалён. Чтобы продолжить, выберите новый источник копирования или отмените копирование для этого поля.`,
                    );
                    return;
                  }
                }
                this.setState({ activeStep: this.state.activeStep + 1 });
                return;
              } else {
                if (!this.props.canEdit) {
                  this.props.redirect();
                } else {
                  if (
                    this.state.primaryTimeField.type === ArchivalPrimaryFieldType.CUSTOM &&
                    (this.state.primaryTimeField.field === '' || this.state.primaryTimeField.field == null)
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

                  const archive: ArchiveTask = {
                    name: this.state.name,
                    processing: Utils.getCopyOfElement(this.state.processing),
                    schema: Utils.getCopyOfElement(this.state.schema),
                    source: Utils.getCopyOfElement(this.state.source),
                    quota: this.state.quota,
                    primaryTimeField: this.state.primaryTimeField,
                    labels: this.state.labels,
                  };
                  // удаляем id и партиции из сорсов
                  archive.source.kafka.map((kafka) => {
                    delete kafka.id;
                    delete kafka.partition;
                  });
                  archive.processing.copyField?.map((processing) => delete processing.tableData);
                  archive.processing.messageFilter?.condition?.conditions.map((filter) => delete filter.tableData);
                  // добавить в схему поля из схемы и преобразования массивов
                  archive.schema.fields = ArchiveUtils.getResultFields(archive.schema.fields, this.state?.processing?.transformArray);
                  archive.schema.fields.map((field) => delete field.tableData);
                  // удаляем id и формат из processing
                  archive.processing.transformArray = archive?.processing?.transformArray
                    ? ArchiveUtils.removeIdAndFormats(archive?.processing?.transformArray)
                    : undefined;
                  //удаление tableData из transformArray
                  if (archive?.processing) {
                    archive.processing.transformArray = archive?.processing.transformArray?.map((transformArray) => {
                      return {
                        sourceArrays: transformArray.sourceArrays,
                        targetConfig: transformArray.targetConfig.map(({ isNew, tableData, ...rest }) => ({ ...rest })),
                      };
                    });

                    if (archive?.processing?.copyAuditParams?.copyAuditParamsSpecs) {
                      archive.schema.fields = modifySchema(
                        archive.schema.fields as unknown as ICopyFieldsSchema[],
                        archive.processing.copyAuditParams.copyAuditParamsSpecs,
                      ) as Field[];
                    }

                    if (archive?.processing?.copyAuditParams?.copyAuditParamsSpecs.length === 0) delete archive?.processing?.copyAuditParams;
                  }

                  if (this.state.dlqTopic)
                    archive.deadLetterQueue = {
                      target: {
                        kafka: this.state.dlqTopic,
                      },
                    };
                  if (this.props.taskType === TaskType.update) {
                    ArchiveService.updateArchiveTask(
                      archive,
                      this.state.projectShortName,
                      () => {
                        this.setState({
                          taskCreationComplete: true,
                          successTaskCreation: true,
                        });
                        this.props.displaySuccess('Архив успешно обновлен');
                        this.props.redirect();
                      },
                      (msg) => {
                        this.setState({
                          taskCreationComplete: true,
                          successTaskCreation: false,
                          errorMessage: msg.message.message,
                          detailMessage: msg.details,
                        });
                      },
                    );
                  } else {
                    ArchiveService.createArchiveTask(
                      archive,
                      this.state.projectShortName,
                      () => {
                        this.setState({
                          taskCreationComplete: true,
                          successTaskCreation: true,
                        });
                        this.props.displaySuccess('Архив успешно создан');
                        this.props.redirect();
                      },
                      (msg) => {
                        this.setState({
                          taskCreationComplete: true,
                          successTaskCreation: false,
                          errorMessage: msg.message.message,
                          detailMessage: msg.details,
                        });
                      },
                    );
                  }
                }
              }
            }}
          >
            {this.state.activeStep === 5 ? (this.props.canEdit ? 'Готово' : 'Закрыть') : 'Далее'}
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
          title={this.props.taskType === TaskType.update ? 'Обновление архива' : 'Создание архива'}
          open={this.state.waitForTaskCreation}
          onClose={() => {
            this.setState({
              activeStep: 5,
              waitForTaskCreation: false,
            });
          }}
          complete={this.state.taskCreationComplete}
          success={this.state.successTaskCreation}
          successMessage={this.props.taskType === TaskType.update ? 'Архив успешно обновлен' : 'Архив успешно создан'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailMessage}
        />
      </React.Fragment>
    );
  }
}

import { Button, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Delete, Visibility } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import * as React from 'react';
import AceEditor from 'react-ace';

import { TaskType } from '../../../containers/archive/ArchiveEditorView';
import ProjectService from '../../../services/ProjectService';
import { ArchiveInputFormatListEnum, ArchiveProcessing, ArchiveSource, KafkaArchiveSource } from '../../../store/archive/Types';
import { KafkaTopic } from '../../../store/kafka/Types';
import { Project } from '../../../store/project/Types';
import { ArchiveUtils } from '../../../utils/ArchiveUtils';
import { Utils } from '../../../utils/Utils';
import { CustomAutocomplete as ArchiveFormatData, CustomAutocomplete as ArchiveSchemaNames } from '../../utils/CustomAutocomplete';
import { WrongInput } from '../ArchiveEditorForm';

interface TopicConfigPartProps {
  flatten: boolean;
  canEdit: boolean;
  projects: Array<Project>;
  taskType: TaskType;
  exclude: Array<string>;
  source: ArchiveSource;
  samples: any;
  topics: Array<KafkaTopic>;
  topicId: number;
  processing: ArchiveProcessing;
  inputFormatList: Array<ArchiveInputFormatListEnum>;
  schemaNames: Array<string>;
  maxCount: number;
  sourceEditEnabled: boolean;
  samplesChanged(samples: Array<string>): any;

  fetchRecords(topicId: number, numRecords: number, callback: any): any;

  processingChanged(processing: ArchiveProcessing): any;

  flattenChanged(flatten: boolean): any;

  excludeChanged(exclude: Array<string>): any;

  topicIdChange(topicId: number): any;

  wrongInputChanged(wrongInput: WrongInput): any;

  sourcesChanged(sources: ArchiveSource): any;

  displayError(msg: string): any;

  getOptionLabel(option: KafkaTopic): string;
}

interface TopicConfigPartState {
  flatten: boolean;
  topicId: number;
  source: ArchiveSource;
  samples: Array<string>;
  processing: ArchiveProcessing;
  exclude: Array<string>;
  sourcesIds: Record<string, number>;
  sampleName: string | null;
}

export default class TopicConfigPart extends React.Component<TopicConfigPartProps, TopicConfigPartState> {
  prepareKafkaSources = (props: TopicConfigPartProps) => {
    const kafkaSources = (props.source?.kafka ?? [this.emptyTopic()]).map((row) => ({
      ...row,
      id: row?.id ?? nanoid(),
    }));
    const filteredSources = kafkaSources.filter((source) => {
      const hasSourceInfo = source?.project || source?.name;
      if (!hasSourceInfo) {
        return true;
      }
      const projectId = props.projects.find((project) => project.shortName === source.project)?.id;
      if (!projectId) {
        return false;
      }

      return props.topics.some((topic: KafkaTopic) => topic.projectId === projectId && topic.name === source.name);
    });

    if (filteredSources.length) {
      return filteredSources;
    }

    return [this.emptyTopic()];
  };

  constructor(props) {
    super(props);

    const kafka: KafkaArchiveSource[] = this.prepareKafkaSources(this.props);
    const sourcesKafka = { ...(this.props.source || {}), kafka: kafka };
    if (!_.isEqual(sourcesKafka.kafka, this.props.source?.kafka)) {
      this.props.sourcesChanged(sourcesKafka);
    }

    this.state = {
      flatten: this.props.flatten,
      topicId: this.props.topicId,
      source: sourcesKafka,
      samples: this.props.samples,
      processing: this.props.processing,
      exclude: this.props.exclude,
      sourcesIds: ArchiveUtils.getTopicIds(kafka, this.props.topics, this.props.projects),
      sampleName: null,
    };
  }

  componentDidUpdate(prevProps: TopicConfigPartProps) {
    if (prevProps.source !== this.props.source || prevProps.topics !== this.props.topics || prevProps.projects !== this.props.projects) {
      const kafka = this.prepareKafkaSources(this.props);
      if (!_.isEqual(kafka, this.state.source.kafka)) {
        const sourcesKafka = { ...(this.props.source || {}), kafka };
        this.setState({
          source: sourcesKafka,
          sourcesIds: ArchiveUtils.getTopicIds(kafka, this.props.topics, this.props.projects),
        });
        if (!_.isEqual(sourcesKafka.kafka, this.props.source?.kafka)) {
          this.props.sourcesChanged(sourcesKafka);
        }
      }
    }
  }

  createSamples(topic: number) {
    this.props.fetchRecords(topic, 10, (records) => {
      const samples = records.map((record) => record.value);
      this.setState({
        samples: samples,
        sampleName: Utils.getTopicNameWithProject(topic, this.props.topics, this.props.projects),
      });
      this.props.samplesChanged(samples);
    });
  }

  emptyTopic() {
    return {
      project: '',
      name: '',
      id: nanoid(),
      partition: 0,
    };
  }

  addSourceHandler() {
    let sourcesKafka = _.clone(this.state.source?.kafka || []);
    sourcesKafka = [...sourcesKafka, this.emptyTopic()];

    this.setState((state) => ({
      source: { ...state.source, kafka: sourcesKafka },
    }));

    this.props.sourcesChanged({ ...this.state.source, kafka: sourcesKafka });
  }

  deleteSourceHandler(id: string) {
    const sourcesIds = _.clone(this.state.sourcesIds);
    delete sourcesIds[id];

    let sourcesKafka = _.clone(this.state.source?.kafka || []);
    sourcesKafka = sourcesKafka.filter((kafka: KafkaArchiveSource) => kafka.id !== id);
    sourcesKafka = sourcesKafka.length ? sourcesKafka : [this.emptyTopic()];

    this.setState((state) => ({
      source: { ...state.source, kafka: sourcesKafka },
      sourcesIds: sourcesIds,
    }));

    this.props.sourcesChanged({ ...this.state.source, kafka: sourcesKafka });
  }

  getTopicValue(key: string) {
    const id = this.state.sourcesIds[key];
    if (!id) return undefined;

    const topic: KafkaTopic | undefined = this.props.topics.find((topic: KafkaTopic) => topic.id === id);
    return topic;
  }

  renderTopicSelect(key: string) {
    return (
      <Grid container>
        <Grid xs item>
          <Autocomplete
            disableClearable
            disabled={!this.props.sourceEditEnabled && this.props.taskType === TaskType.update}
            key={key}
            id={`topic_${key}`}
            options={this.props.topics.filter((topic: KafkaTopic) => Object.values(this.state.sourcesIds).indexOf(topic.id as number) === -1)}
            defaultValue={this.getTopicValue(key)}
            getOptionLabel={(option: KafkaTopic) => this.props.getOptionLabel(option)}
            style={{ marginTop: 16 }}
            onChange={(event, newValue: KafkaTopic) => {
              ProjectService.fetchProjectById(
                newValue.projectId as number,
                (project) => {
                  const sourceFormat = { ...this.state.source.format };
                  const sourceKafka = _.clone(this.state.source?.kafka || []);

                  sourceKafka.map((kafka: KafkaArchiveSource) => {
                    if (kafka.id === key) {
                      kafka.project = project.shortName;
                      kafka.name = newValue.name;
                      kafka.partition = newValue.partitions;
                    }
                  });

                  let sourcesIds = _.clone(this.state.sourcesIds);
                  sourcesIds = { ...sourcesIds, ...{ [key]: newValue.id as number } };
                  this.setState((state) => ({
                    source: { kafka: sourceKafka, format: sourceFormat },
                    sourcesIds: sourcesIds,
                  }));

                  this.props.sourcesChanged({ kafka: sourceKafka, format: sourceFormat });
                  // this.createSamples(newValue.id as number);
                  this.props.topicIdChange(newValue.id as number);
                  this.setState({ topicId: newValue.id as number });
                },
                (msg) => {
                  this.props.displayError(msg);
                },
              );
            }}
            renderInput={(params) => <TextField {...params} label="Источник данных" variant="outlined" />}
          />
        </Grid>
        <Grid item xs="auto" style={{ paddingTop: 25 }}>
          <Button disabled={!this.state.sourcesIds[key]} onClick={() => this.createSamples(this.state.sourcesIds[key])}>
            <Visibility color={!this.state.sourcesIds[key] ? 'disabled' : 'primary'} />
          </Button>
          <Button disabled={!this.props.sourceEditEnabled && this.props.taskType === TaskType.update} onClick={() => this.deleteSourceHandler(key)}>
            <Delete color={!this.props.sourceEditEnabled && this.props.taskType === TaskType.update ? 'disabled' : 'primary'} />
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    const topicDataPreviewer = this.state.samples ? (
      <Grid container direction={'column'} style={{ marginTop: 10 }}>
        <AceEditor
          mode={'json'}
          theme={'xcode'}
          name={'blah2'}
          editorProps={{ $blockScrolling: true }}
          height={'300px'}
          width={'auto'}
          value={'[' + this.state.samples.join(',\n') + ']'}
        />
      </Grid>
    ) : null;

    const flattenCheckbox = (
      <FormControlLabel
        control={
          <Checkbox
            disabled={!this.props.canEdit}
            checked={this.state.flatten}
            onChange={(event) => {
              let processing = this.state.processing;
              if (event.target.checked) {
                processing.flatten = { exclude: [] };
              } else {
                processing = {
                  copyField: processing.copyField,
                };
              }
              this.setState({ flatten: event.target.checked, processing: processing });
              this.props.processingChanged(processing);
              this.props.flattenChanged(event.target.checked);
            }}
            color={'primary'}
          />
        }
        label={'Flatten'}
      />
    );

    const excludedFieldsEdit = this.state.flatten ? (
      <Grid item style={{ marginTop: 10 }}>
        <TextField
          fullWidth
          disabled={!this.props.canEdit}
          variant="outlined"
          label="Поля, к которым не нужно применять flatten"
          defaultValue={''}
          // style={{ width: "85%" }}
          value={this.state.exclude}
          onChange={(e) => {
            const processing = this.state.processing;
            processing.flatten = {
              exclude: e.target.value.split(/\s*,\s*/),
            };
            this.setState({ exclude: e.target.value, processing: processing });
            this.props.excludeChanged(e.target.value.split(/\s*,\s*/));
            this.props.processingChanged(processing);
          }}
        />
      </Grid>
    ) : null;

    const formatDataChanged = (value: ArchiveInputFormatListEnum | null) => {
      const source = { ...this.state.source };
      if (!Object.keys(source).some((key) => key == 'format')) {
        source.format = {
          type: value === null ? ArchiveInputFormatListEnum.JSON : value,
        };
      } else {
        source.format.type = value === null ? ArchiveInputFormatListEnum.JSON : value;
      }
      if (value === ArchiveInputFormatListEnum.JSON || value === null) {
        source.format.schemaName = undefined;
      }
      this.setState({ source });
      this.props.sourcesChanged(source);
    };

    const schemaNamesChanged = (value: string | undefined) => {
      const source = { ...this.state.source };
      source.format.schemaName = value;
      this.setState({ source });
      this.props.sourcesChanged(source);
    };

    const renderInputs = (taskType: TaskType) => {
      if (taskType === TaskType.new || taskType === TaskType.import || (this.props.sourceEditEnabled && this.props.taskType === TaskType.update)) {
        return this.state.source?.kafka?.map((row) => this.renderTopicSelect(row.id as string)) || [];
      }
      // для кейсов когда sourceEditEnabled=false и TaskType.update
      // логика отображения пустого input если топики все удалены, если больше то фильтруем пустые поля
      return this.state.source?.kafka?.map((row, index) => {
        const topicInList = this.props.topics?.find((topic: KafkaTopic) => topic.name === row.name);
        if (topicInList && this.state.source?.kafka?.length > 1) {
          return this.renderTopicSelect(row.id as string);
        }
        if (index === 0) {
          return this.renderTopicSelect(row.id as string);
        }
      });
    };

    return (
      <Grid container direction={'column'} style={{ width: 'calc(100% - 100px)', margin: '0 auto' }}>
        {renderInputs(this.props.taskType)}
        <Grid item style={{ marginTop: 10, marginBottom: 20 }}>
          <Button
            color="primary"
            disabled={
              this.props.maxCount <= this.state.source?.kafka?.length || (!this.props.sourceEditEnabled && this.props.taskType === TaskType.update)
            }
            onClick={() => this.addSourceHandler()}
          >
            Добавить источник Данных
          </Button>
        </Grid>
        <ArchiveFormatData
          value={this.state.source.format?.type}
          options={this.props.inputFormatList}
          id={'archiveFormatData'}
          style={{}}
          onChange={formatDataChanged}
          label={'Формат Данных'}
        />
        <Typography variant="caption" color="textSecondary">
          Выберите единый формат для всех источников данных
        </Typography>
        {this.state.source.format?.type === ArchiveInputFormatListEnum.AVRO && (
          <ArchiveSchemaNames
            value={this.state.source.format?.schemaName === null ? undefined : this.state.source.format?.schemaName}
            options={this.props.schemaNames}
            id={'archiveSchemaNames'}
            onChange={schemaNamesChanged}
            label={'Схемы'}
          />
        )}
        {this.state.source.format?.type !== ArchiveInputFormatListEnum.AVRO && flattenCheckbox}
        <Typography variant="caption" color="textSecondary" style={{ visibility: this.state.sampleName ? 'visible' : 'hidden' }}>
          Сообщения из источника данных: {this.state.sampleName}
        </Typography>
        {topicDataPreviewer}
        {this.state.source.format?.type !== ArchiveInputFormatListEnum.AVRO && excludedFieldsEdit}
      </Grid>
    );
  }
}

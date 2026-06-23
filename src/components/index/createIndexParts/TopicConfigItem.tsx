import { Button, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Delete, Visibility } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { getSchemaName } from '@src/components/utils/getSchemaName';
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import * as React from 'react';
import AceEditor from 'react-ace';

import { TaskType } from '../../../containers/index/IndexEditorView';
import ConfigService from '../../../services/ConfigService';
import ProjectService from '../../../services/ProjectService';
import { KafkaTopic } from '../../../store/kafka/Types';
import { ProcessingPipeline, SourcesPipeline, PipelineInputFormatListEnum, KafkaSource } from '../../../store/pipeline/Types';
import { Project } from '../../../store/project/Types';
import { IndexUtils } from '../../../utils/IndexUtils';
import { Utils } from '../../../utils/Utils';
import { CustomAutocomplete as PipelineInputFormatList, CustomAutocomplete as PipelineSchemaNames } from '../../utils/CustomAutocomplete';
import { WrongInput } from '../CreateIndexPage';

interface TopicConfigItemProps {
  flatten: boolean;
  projects: Array<Project>;
  taskType: TaskType;
  excludedFields: Array<string>;
  sources: SourcesPipeline;
  samples: any;
  topics: Array<KafkaTopic>;
  fetchRecords: any;
  topicId: number;
  processing: ProcessingPipeline;
  inputFormatList: PipelineInputFormatListEnum[];
  schemaNames: string[];

  samplesChanged(samples: Array<string>): any;

  processingChanged(processing: ProcessingPipeline): any;

  flattenChanged(flatten: boolean): any;

  excludedFieldsChanged(excludedFields: Array<string>): any;

  topicIdChange(topicId: number): any;

  wrongInputChanged(wrongInput: WrongInput): any;

  sourcesChanged(sources: SourcesPipeline): any;

  displayError(msg: string): any;

  getOptionLabel(option: KafkaTopic): string;

  changeSelectedSourceIds: (sourceIds: number[]) => void;
}

interface TopicConfigItemState {
  flatten: boolean;
  topicId: number;
  sources: SourcesPipeline;
  samples: Array<string>;
  processing: ProcessingPipeline;
  excludedFields: Array<string>;
  sourcesIds: Record<string, number>;
  maxCount: number;
  sourceEditEnabled: boolean;
  sampleName: string | null;
}

export default class TopicConfigItem extends React.Component<TopicConfigItemProps, TopicConfigItemState> {
  constructor(props) {
    super(props);

    const kafka: KafkaSource[] = this.props.sources.kafka.map((row) => (row = { ...row, id: nanoid() }));
    const sourcesKafka = { ...this.props.sources, kafka: kafka };
    this.props.sourcesChanged(sourcesKafka);

    this.state = {
      flatten: this.props.flatten,
      topicId: this.props.topicId,
      sources: sourcesKafka,
      samples: this.props.samples,
      processing: this.props.processing,
      excludedFields: this.props.excludedFields,
      sourcesIds: IndexUtils.getTopicIds(kafka, this.props.topics, this.props.projects),
      maxCount: 5,
      sourceEditEnabled: false,
      sampleName: null,
    };
  }

  componentDidMount() {
    ConfigService.getIndexConfig(
      'fulltext',
      (config) => this.setState({ maxCount: config.maxSourceCount, sourceEditEnabled: config.sourceEditEnabled }),
      () => {
        return;
      },
    );
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
      projectShortName: '',
      topicName: '',
      id: nanoid(),
    };
  }

  addSourceHandler() {
    let sourcesKafka = _.clone(this.state.sources.kafka);
    sourcesKafka = [...sourcesKafka, this.emptyTopic()];

    this.setState((state) => ({
      sources: { ...state.sources, kafka: sourcesKafka },
    }));

    this.props.sourcesChanged({ ...this.state.sources, kafka: sourcesKafka });
  }

  deleteSourceHandler(id: string) {
    const sourcesIds = _.clone(this.state.sourcesIds);
    delete sourcesIds[id];

    let sourcesKafka = _.clone(this.state.sources.kafka);
    sourcesKafka = sourcesKafka.filter((kafka: KafkaSource) => kafka.id !== id);
    sourcesKafka = sourcesKafka.length ? sourcesKafka : [this.emptyTopic()];

    this.setState((state) => ({
      sources: { ...state.sources, kafka: sourcesKafka },
      sourcesIds: sourcesIds,
    }));

    this.props.changeSelectedSourceIds(Object.keys(sourcesIds).map((key) => sourcesIds[key]));
    this.props.sourcesChanged({ ...this.state.sources, kafka: sourcesKafka });
  }

  getTopicValue(key: string): KafkaTopic | undefined {
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
            disabled={this.props.taskType === TaskType.update && !this.state.sourceEditEnabled}
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
                  const sourceFormat = { ...this.state.sources.format };
                  const sourceKafka = _.clone(this.state.sources.kafka);

                  sourceKafka.map((kafka: KafkaSource) => {
                    if (kafka.id === key) {
                      kafka.projectShortName = project.shortName;
                      kafka.topicName = newValue.name;
                      kafka.partition = newValue.partitions;
                    }
                  });

                  let sourcesIds = _.clone(this.state.sourcesIds);
                  sourcesIds = { ...sourcesIds, ...{ [key]: newValue.id as number } };
                  this.setState(() => ({
                    sources: { kafka: sourceKafka, format: sourceFormat },
                    sourcesIds: sourcesIds,
                  }));

                  this.props.changeSelectedSourceIds(Object.keys(sourcesIds).map((sourceKey) => sourcesIds[sourceKey]));
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
          <Button disabled={!this.state.sourceEditEnabled && this.props.taskType === TaskType.update} onClick={() => this.deleteSourceHandler(key)}>
            <Delete color={!this.state.sourceEditEnabled && this.props.taskType === TaskType.update ? 'disabled' : 'primary'} />
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
            checked={this.state.flatten}
            onChange={(event) => {
              let processing = this.state.processing;
              if (event.target.checked) {
                processing.flattenJsonParam = { excludedFromFlatteningFields: [] };
              } else {
                processing = {
                  convertTimestampParams: processing.convertTimestampParams,
                  copyFieldParams: processing.copyFieldParams,
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
          variant="outlined"
          label="Поля, к которым не нужно применять flatten"
          defaultValue={''}
          // style={{ width: "85%" }}
          value={this.state.excludedFields}
          onChange={(e) => {
            const processing = this.state.processing;
            processing.flattenJsonParam = {
              excludedFromFlatteningFields: e.target.value.split(/\s*,\s*/),
            };
            this.setState({ excludedFields: e.target.value, processing: processing });
            this.props.excludedFieldsChanged(e.target.value.split(/\s*,\s*/));
            this.props.processingChanged(processing);
          }}
        />
      </Grid>
    ) : null;

    const formatDataChanged = (value: PipelineInputFormatListEnum | null) => {
      const sources = { ...this.state.sources };
      if (!Object.keys(sources).some((key) => key == 'format')) {
        sources.format = {
          type: value === null ? PipelineInputFormatListEnum.JSON : value,
        };
      } else {
        sources.format.type = value === null ? PipelineInputFormatListEnum.JSON : value;
      }
      if (value === PipelineInputFormatListEnum.JSON || value === null) {
        sources.format.schemaName = undefined;
      }
      this.setState({ sources });
      this.props.sourcesChanged(sources);
    };

    const schemaNamesChanged = (value: string | undefined) => {
      const sources = { ...this.state.sources };
      sources.format.schemaName = value;
      this.setState({ sources });
      this.props.sourcesChanged(sources);
    };

    return (
      <Grid container direction={'column'} style={{ width: 'calc(100% - 100px)', margin: '0 auto' }}>
        {this.state.sources.kafka.map((row) => this.renderTopicSelect(row.id as string))}
        <Grid item style={{ marginTop: 10, marginBottom: 20 }}>
          <Button
            color="primary"
            disabled={
              this.state.maxCount <= this.state.sources.kafka.length || (!this.state.sourceEditEnabled && this.props.taskType === TaskType.update)
            }
            onClick={() => this.addSourceHandler()}
          >
            Добавить источник Данных
          </Button>
        </Grid>
        <PipelineInputFormatList
          value={this.state.sources.format?.type}
          options={this.props.inputFormatList}
          id={'archiveFormatData'}
          style={{}}
          onChange={formatDataChanged}
          label={'Формат Данных'}
        />
        <Typography variant="caption" color="textSecondary">
          Выберите единый формат для всех источников данных
        </Typography>
        {this.state.sources.format?.type === PipelineInputFormatListEnum.AVRO && (
          <PipelineSchemaNames
            value={getSchemaName(this.state.sources.format?.schemaName, this.props.schemaNames)}
            options={this.props.schemaNames}
            id={'archiveSchemaNames'}
            onChange={schemaNamesChanged}
            label={'Схемы'}
          />
        )}
        {this.state.sources.format?.type !== PipelineInputFormatListEnum.AVRO && flattenCheckbox}
        <Typography variant="caption" color="textSecondary" style={{ visibility: this.state.sampleName ? 'visible' : 'hidden' }}>
          Сообщения из источника данных: {this.state.sampleName}
        </Typography>
        {topicDataPreviewer}
        {this.state.sources.format?.type !== PipelineInputFormatListEnum.AVRO && excludedFieldsEdit}
      </Grid>
    );
  }
}

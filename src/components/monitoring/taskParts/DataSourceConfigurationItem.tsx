import { Grid, MenuItem, Select, TextField, Theme, Tooltip, withStyles, Paper, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import InfoIcon from '@material-ui/icons/Info';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import AceEditor from 'react-ace';

import { HtmlTooltip } from '../../../containers/App';
import KafkaService from '../../../services/KafkaService';
import ProjectService from '../../../services/ProjectService';
import { IndexConfig } from '../../../store/config/Types';
import { KafkaTopic } from '../../../store/kafka/Types';
import { IOConfig } from '../../../store/monitoring/Types';
import { Project } from '../../../store/project/Types';
import { Schema } from '../TaskEditor';

export interface DataSourceConfigurationItemState {
  ioConfig: IOConfig;
  topicId: number;
  samples?: any;

  earlyPeriodLabel: string;
  latePeriodLabel: string;

  schema?: Schema;
}

export interface DataSourceConfigurationItemProps {
  initialState: DataSourceConfigurationItemState;
  projects: Project[];

  ioConfigChanged(configChanged: IOConfig);
  fetchRecords(topicId: number, numRecords: number, callback);
  topicChanged(id: number);
  saveSamples(samples: any);
  createsSchema(schema: any);
  displayError(msg: string): any;

  topics: Array<KafkaTopic>;
  canEdit: boolean;
  analyticalServiceConfig?: IndexConfig;
}

export default class DataSourceConfigurationItem extends React.Component<DataSourceConfigurationItemProps, DataSourceConfigurationItemState> {
  constructor(props) {
    super(props);
    this.state = {
      ioConfig: this.props.initialState.ioConfig,
      topicId: this.props.initialState.topicId,
      samples: this.props.initialState.samples,
      schema: this.props.initialState.schema
        ? this.props.initialState.schema
        : this.props.initialState.topicId === -1
          ? undefined
          : this.createSchema(this.props.initialState.topicId),
      earlyPeriodLabel:
        this.props.initialState.ioConfig.earlyMessageRejectionPeriod != null
          ? 'Период'
          : this.props.analyticalServiceConfig?.dataEarlyRejectionPeriod || 'P1D',
      latePeriodLabel:
        this.props.initialState.ioConfig.lateMessageRejectionPeriod != null
          ? 'Период'
          : this.props.analyticalServiceConfig?.dataLateRejectionPeriod || 'P1D',
    };
    if (this.props.initialState.topicId !== -1) {
      this.createSamples(this.props.initialState.topicId);
    }
    this.props.createsSchema(this.state.schema);
  }

  changeEarlyLabel(label: string) {
    this.setState({
      earlyPeriodLabel:
        this.state.ioConfig.earlyMessageRejectionPeriod != null && this.state.ioConfig.earlyMessageRejectionPeriod != '' ? 'Период' : label,
    });
  }

  changeLateLabel(label: string) {
    this.setState({
      latePeriodLabel:
        this.state.ioConfig.lateMessageRejectionPeriod != null && this.state.ioConfig.lateMessageRejectionPeriod != '' ? 'Период' : label,
    });
  }

  createSamples(topic: number) {
    this.props.fetchRecords(topic, 10, (records) => {
      const samples = records.map((record) => record.value);
      this.setState({ samples: samples });
      this.props.saveSamples(samples);
    });
  }

  createSchema(topic: number): Schema {
    const schema: Schema = {
      stringFields: [],
      longFields: [],
      doubleFields: [],
      timestampFields: [],
      flattenFields: [],
      nonFlattenFields: [],
      allFields: [],
    };
    KafkaService.createSchemaFromTopic([topic], false, false, [], (fields) => {
      Object.keys(fields.messageSchemaMap).forEach((key) => {
        schema.nonFlattenFields.push(key);
        schema.allFields.push(key);
        const type = fields.messageSchemaMap[key].elementType;
        switch (type) {
          case 'LONG':
            schema.longFields.push(key);
            break;
          case 'DOUBLE':
            schema.doubleFields.push(key);
            break;
          case 'TIMESTAMP':
            schema.timestampFields.push(key);
            break;
          default:
            schema.stringFields.push(key);
            break;
        }
      });
    });

    return schema;
  }

  render() {
    const topicDataPreviewer = this.state.samples ? (
      <Grid container direction={'column'} style={{ width: '100%', marginTop: 10 }}>
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

    return (
      <React.Fragment>
        <Paper style={{ padding: 12, width: '100%', marginTop: 8 }}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Выбор топика
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" gutterBottom>
                  Допустимый диапазон времени в сообщении (прошлое)
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" gutterBottom>
                  Допустимый диапазон времени в сообщении (будущее)
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2" gutterBottom>
                  Вычитывать с начала топика
                </Typography>
              </Grid>
            </Grid>
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Autocomplete
                  id="topicIn"
                  disabled={!this.props.canEdit}
                  fullWidth={true}
                  options={this.props.topics}
                  defaultValue={this.state.topicId === -1 ? undefined : this.props.topics.filter((topic) => topic.id === this.state.topicId)[0]}
                  getOptionLabel={(option: KafkaTopic) => option.topicFullName.replace(`.${option.name}`, `/${option.name}`)}
                  style={{ width: '100%' }}
                  onChange={(event, newValue: KafkaTopic) => {
                    if (newValue == null) {
                      const ioConfig = this.state.ioConfig;
                      ioConfig.topic = undefined;
                      this.setState({ ioConfig: ioConfig, topicId: -1 });
                      this.props.topicChanged(-1);
                      this.props.ioConfigChanged(ioConfig);
                    } else {
                      const ioConfig = this.state.ioConfig;
                      ioConfig.topic = newValue.name;
                      this.setState({ topicId: newValue.id, ioConfig: ioConfig });
                      this.props.topicChanged(newValue.id);
                      this.props.ioConfigChanged(ioConfig);

                      this.createSamples(newValue.id);

                      const schema: Schema = this.createSchema(newValue.id);
                      this.props.createsSchema(schema);
                      this.setState({ schema: schema });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label=" Топик " variant="standard" />}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  disabled={!this.props.canEdit}
                  label={this.state.latePeriodLabel}
                  onFocus={(e) => {
                    this.changeLateLabel('Период');
                  }}
                  onBlur={(e) => {
                    this.changeLateLabel(this.props.analyticalServiceConfig?.dataLateRejectionPeriod);
                  }}
                  placeholder={this.props.analyticalServiceConfig?.dataLateRejectionPeriod}
                  defaultValue={this.state.ioConfig.lateMessageRejectionPeriod}
                  onChange={(e) => {
                    const ioconf = this.state.ioConfig;
                    ioconf.lateMessageRejectionPeriod = e.target.value;
                    this.setState({ ioConfig: ioconf });
                    this.props.ioConfigChanged(ioconf);
                  }}
                />
              </Grid>
              <Grid item xs={1} alignItems={'flex-start'}>
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit" variant={'body2'}>
                        Вводить в формате ISO8601 Period
                      </Typography>
                      {'Сообщения с отметкой времени раньше указанного диапазона (относительно времени получения сообщения) будут отклонены. '}
                      {'Например, если период установлен '}
                      <em>{'PT1H'}</em> {' и сообщение приходит в '}
                      <em>{' 2016-01-01T12:00Z'}</em> {' с отметкой времени раньше, чем '}
                      <em>{'2016-01-01T11:00Z'}</em>
                      {', то оно будет '}
                      <b>{'отброшено'}</b>.{' '}
                    </React.Fragment>
                  }
                >
                  <InfoIcon fontSize={'small'} color={'primary'} />
                </HtmlTooltip>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  disabled={!this.props.canEdit}
                  label={this.state.earlyPeriodLabel}
                  onFocus={(e) => {
                    this.changeEarlyLabel('Период');
                  }}
                  onBlur={(e) => {
                    this.changeEarlyLabel(this.props.analyticalServiceConfig?.dataEarlyRejectionPeriod);
                  }}
                  placeholder={this.props.analyticalServiceConfig?.dataEarlyRejectionPeriod}
                  defaultValue={this.state.ioConfig.earlyMessageRejectionPeriod}
                  onChange={(e) => {
                    const ioconf = this.state.ioConfig;
                    ioconf.earlyMessageRejectionPeriod = e.target.value;
                    this.setState({ ioConfig: ioconf });
                    this.props.ioConfigChanged(ioconf);
                  }}
                />
              </Grid>
              <Grid item xs={1} alignItems={'flex-start'}>
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit" variant={'body2'}>
                        Вводить в формате ISO8601 Period
                      </Typography>
                      {'Сообщения с отметкой времени позже указанного диапазона (относительно времени получения сообщения) будут отклонены. '}
                      {'Например, если период установлен '}
                      <em>{'PT1H'}</em> {' и сообщение приходит в '}
                      <em>{'2016-01-01T11:00Z'}</em> {' с отметкой времени позже, чем '}
                      <em>{'2016-01-01T12:00Z'}</em>
                      {', то оно будет '}
                      <b>{'отброшено'}</b>.{' '}
                    </React.Fragment>
                  }
                >
                  <InfoIcon fontSize={'small'} color={'primary'} />
                </HtmlTooltip>
              </Grid>

              <Grid item xs={'auto'}>
                <Checkbox
                  defaultChecked={this.state.ioConfig.useEarliestOffset || false}
                  onChange={(event) => {
                    const ioconf = this.state.ioConfig;
                    ioconf.useEarliestOffset = event.target.checked;
                    this.setState({ ioConfig: ioconf });
                    this.props.ioConfigChanged(ioconf);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        {topicDataPreviewer}
      </React.Fragment>
    );
  }
}

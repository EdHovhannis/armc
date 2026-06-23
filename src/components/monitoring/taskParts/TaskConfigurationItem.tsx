import {
  Grid,
  MenuItem,
  Select,
  TextField,
  Paper,
  Typography,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  Tooltip,
  IconButton,
  Chip,
} from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { green } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import * as React from 'react';

import { HtmlTooltip } from '../../../containers/App';
import { GranularitySpec, IOConfig, AnalyticalQuotaResponse, TimestampSpec, TuningConfig } from '../../../store/monitoring/Types';
import { Project } from '../../../store/project/Types';
import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP } from '../../../utils/Utils';

import { QuotaErrors } from './QuotaErrors';
import { QuotaEstimate } from './QuotaEstimate';

export interface TimestampValues {
  inputValue?: string;
  title: string;
}

const filter = createFilterOptions<TimestampValues[]>();

export interface TaskConfigurationState {
  datasourceName: string;
  project_id: number;
  ioConfig: IOConfig;
  timeFields: Array<TimestampValues>;
  timestampSpec: TimestampSpec;
  granularitySpec: GranularitySpec;
  tuningConfig: TuningConfig;
  isTracing: boolean;
  labels: string[];
  label?: string;
  quotaEstimate: AnalyticalQuotaResponse | null;
}

export interface TaskConfigurationProps {
  initialState: TaskConfigurationState;
  isUpdate: boolean;
  isAdmin: boolean;
  labels: string[];

  changeLabels(labels: string[]): any;

  displayError(msg: string): any;

  timestampSpecChanged(spec: TimestampSpec);

  ioConfigChanged(configChanged: IOConfig);

  projectChanged(project_id: number);

  datasourceNameChanged(datasource: string);

  tuningConfigChanged(tuningConfig: TuningConfig);

  granularityChanged(granularity: GranularitySpec);

  isTracingChanged(isTracing: boolean);

  timestampFieldsChange(timestampFields: Array<TimestampValues>);

  projects: Array<Project>;
  timeFields: Array<string>;
  timestampFields: Array<TimestampValues>;
  canEdit: boolean;
  onChangeQuotaValid: (isValid: boolean) => void;
  additionalIoConfig?: string;
}

export default class TaskConfigurationItem extends React.Component<TaskConfigurationProps, TaskConfigurationState> {
  constructor(props) {
    super(props);
    this.state = {
      datasourceName: this.props.initialState.datasourceName,
      project_id: this.props.initialState.project_id,
      ioConfig: this.props.initialState.ioConfig,
      timeFields:
        this.props.timestampFields.length === 0
          ? this.props.timeFields?.map((field) => {
              return { title: field };
            })
          : this.props.timestampFields,
      timestampSpec: this.props.initialState.timestampSpec,
      granularitySpec: this.props.initialState.granularitySpec,
      tuningConfig: this.props.initialState.tuningConfig,
      isTracing: false,
      labels: this.props.labels || [],
    };
  }

  render() {
    const currentProject = this.props.projects.find((project) => project.id === this.state.project_id)?.name || null;
    const { quotaEstimate } = this.state;
    const maxTaskCount = quotaEstimate?.projectQuota?.maxTaskCount || 0;
    const currentTaskCount = quotaEstimate?.projectQuota.currentTaskCount || 0;
    const quotaCount = !quotaEstimate?.directUsage && maxTaskCount ? maxTaskCount - currentTaskCount : '';

    const chips: Array<any> = [];
    this.state.labels?.map((label, ind) => {
      chips.push(
        <Chip
          id={'labelAnalytic' + ind}
          label={label}
          onDelete={() => {
            const newLabels = this.state.labels.filter((l) => l !== label);
            this.setState({ labels: newLabels });
            this.props.changeLabels(newLabels);
          }}
          style={{ backgroundColor: green[300], color: 'white', marginRight: 4, marginBottom: 4, maxWidth: '100%' }}
          variant={'outlined'}
        />,
      );
    });

    return (
      <React.Fragment>
        <QuotaEstimate
          onValidChange={(isValid) => this.props.onChangeQuotaValid(isValid)}
          onEstimate={(data) => this.setState({ quotaEstimate: data })}
          maxTaskCount={this.state.ioConfig.taskCount}
          replicaCount={this.state.ioConfig.replicas}
          project={currentProject}
          indexName={this.state.datasourceName}
          additionalIoConfig={this.props.additionalIoConfig}
        />
        <Paper style={{ padding: 8, width: '100%' }}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Проект
                </Typography>
              </Grid>
            </Grid>
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Autocomplete
                  id="project"
                  options={this.props.projects}
                  disabled={!this.props.canEdit || this.props.isUpdate}
                  style={{ marginTop: 16, width: '100%' }}
                  defaultValue={this.props.projects.filter((project) => project.id === this.state.project_id)[0]}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue: Project) => {
                    this.setState({
                      project_id: newValue.id,
                    });
                    this.props.projectChanged(newValue.id);
                  }}
                  renderInput={(params) => <TextField {...params} label="Проект" variant="standard" />}
                />
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Paper style={{ padding: 12, width: '100%', marginTop: 8 }}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Имя таблицы
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Количество задач
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Количество доступной квоты
                </Typography>
              </Grid>
            </Grid>
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  disabled={!this.props.canEdit || this.props.isUpdate}
                  label="Имя таблицы"
                  defaultValue={this.state.datasourceName}
                  onChange={(e) => {
                    const name = e.target.value.trim();
                    this.setState({
                      datasourceName: name,
                    });
                    this.props.datasourceNameChanged(name);
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  disabled={!this.props.canEdit}
                  label="Кол-во задач"
                  error={!!quotaCount && this.state.ioConfig.taskCount > quotaCount}
                  defaultValue={this.state.ioConfig.taskCount || 1}
                  onChange={(e) => {
                    const ioconf = this.state.ioConfig;
                    ioconf.taskCount = parseInt(e.target.value);
                    this.setState({ ioConfig: ioconf });
                    this.props.ioConfigChanged(ioconf);
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField value={quotaCount} fullWidth disabled label="Кол-во задач" />
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Paper style={{ padding: 12, width: '100%', marginTop: 8 }}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Столбец времени
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Формат
                </Typography>
              </Grid>
            </Grid>
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Autocomplete
                  options={this.state.timeFields}
                  renderOption={(option) => {
                    if (typeof option === 'string') {
                      return option;
                    }
                    if (option.inputValue) {
                      return option.title;
                    }
                    return option.title;
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params) as TimestampValues[];
                    if (params.inputValue !== '') {
                      filtered.push({
                        inputValue: params.inputValue,
                        title: `Добавить "${params.inputValue}"`,
                      });
                    }
                    return filtered;
                  }}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                      return option;
                    }
                    if (option.inputValue) {
                      return option.inputValue;
                    }
                    return option.title;
                  }}
                  defaultValue={{ title: this.state.timestampSpec.column }}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                      this.setState({ timestamp: newValue.title });
                    } else if (newValue && newValue.inputValue) {
                      const timeFields = this.state.timeFields;
                      timeFields.push({ title: newValue.inputValue });
                      const newTimestampSpec = {
                        format: this.state.timestampSpec.format,
                        column: newValue.inputValue,
                      };
                      this.setState({ timestampSpec: newTimestampSpec, timeFields: timeFields });
                      this.props.timestampSpecChanged(newTimestampSpec);
                      this.props.timestampFieldsChange(timeFields);
                    } else {
                      const newTimestampSpec = {
                        format: this.state.timestampSpec.format,
                        column: newValue?.title ? newValue.title : newValue,
                      };
                      this.setState({ timestampSpec: newTimestampSpec });
                      this.props.timestampSpecChanged(newTimestampSpec);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" label="Столбец" placeholder="Выберите или введите свой" margin="normal" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  style={{ paddingTop: 6 }}
                  label="Формат"
                  disabled={!this.props.canEdit}
                  defaultValue={this.state.timestampSpec.format || 'auto'}
                  onChange={(e) => {
                    const newTimestampSpec = {
                      format: e.target.value,
                      column: this.state.timestampSpec.column,
                    };
                    this.setState({ timestampSpec: newTimestampSpec });
                    this.props.timestampSpecChanged(newTimestampSpec);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Paper style={{ padding: 12, width: '100%', marginTop: 8 }}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Интервал агрегации
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Rollup enabled
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Детализация сегмента
                </Typography>
              </Grid>
            </Grid>
            <Grid container style={{ width: '100%' }} spacing={8}>
              <Grid item xs={4}>
                <Select
                  disabled={!this.props.canEdit}
                  value={this.state.granularitySpec.queryGranularity || 'NONE'}
                  style={{ marginTop: 16, width: '100%' }}
                  onChange={(e) => {
                    const granularitySpec = this.state.granularitySpec;
                    granularitySpec.queryGranularity = e.target.value as string;
                    this.setState({
                      granularitySpec: granularitySpec,
                    });
                    this.props.granularityChanged(granularitySpec);
                  }}
                >
                  <MenuItem value="NONE">NONE</MenuItem>
                  <MenuItem value="SECOND">SECOND</MenuItem>
                  <MenuItem value="MINUTE">MINUTE</MenuItem>
                  <MenuItem value="FIVE_MINUTE">FIVE_MINUTE</MenuItem>
                  <MenuItem value="TEN_MINUTE">TEN_MINUTE</MenuItem>
                  <MenuItem value="FIFTEEN_MINUTE">FIFTEEN_MINUTE</MenuItem>
                  <MenuItem value="THIRTY_MINUTE">THIRTY_MINUTE</MenuItem>
                  <MenuItem value="HOUR">HOUR</MenuItem>
                  <MenuItem value="SIX_HOUR">SIX_HOUR</MenuItem>
                  <MenuItem value="DAY">DAY</MenuItem>
                  <MenuItem value="WEEK">WEEK</MenuItem>
                  <MenuItem value="MONTH">MONTH</MenuItem>
                  <MenuItem value="QUARTER">QUARTER</MenuItem>
                  <MenuItem value="YEAR">YEAR</MenuItem>
                  <MenuItem value="ALL">ALL</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={2} alignItems={'flex-start'}>
                <Checkbox
                  disabled={!this.props.canEdit}
                  defaultChecked={this.state.granularitySpec.rollup}
                  onChange={(event) => {
                    const granularitySpec = this.state.granularitySpec;
                    granularitySpec.rollup = event.target.checked;
                    this.setState({ granularitySpec: granularitySpec });
                    this.props.granularityChanged(granularitySpec);
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <Select
                  disabled={!this.props.canEdit}
                  value={this.state.granularitySpec.segmentGranularity || 'HOUR'}
                  style={{ marginTop: 16, width: '100%' }}
                  onChange={(e) => {
                    const granularitySpec = this.state.granularitySpec;
                    granularitySpec.segmentGranularity = e.target.value as string;
                    this.setState({
                      granularitySpec: granularitySpec,
                    });
                    this.props.granularityChanged(granularitySpec);
                  }}
                >
                  <MenuItem value="HOUR">HOUR</MenuItem>
                  <MenuItem value="DAY">DAY</MenuItem>
                  <MenuItem value="WEEK">WEEK</MenuItem>
                  <MenuItem value="MONTH">MONTH</MenuItem>
                  <MenuItem value="YEAR">YEAR</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={1} alignItems={'flex-start'}>
                <HtmlTooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit" variant={'body2'}></Typography>
                      {'Детализация для создания временных фрагментов. За один временной отрезок можно создать несколько сегментов. '}
                      {'Например, с сегментацией '}
                      <em>{'DAY'}</em> {' события одного и того же дня попадают в один и тот же временной фрагмент, '}
                      {'который может быть дополнительно разделен на несколько сегментов на основе других конфигураций и размера входных данных.'}
                    </React.Fragment>
                  }
                >
                  <InfoIcon fontSize={'small'} color={'primary'} />
                </HtmlTooltip>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Paper style={{ padding: 12, width: '100%', marginTop: 8 }}>
          <Typography variant="subtitle1" style={{ marginLeft: 32 }}>
            Метки
          </Typography>
          <Grid container direction={'column'}>
            <Grid item style={{ width: '100%', marginLeft: 32, marginRight: 20, marginTop: 10 }}>
              {chips}
            </Grid>
            <Grid container direction={'row'}>
              <Grid item style={{ width: 'calc(100% - 90px)', marginLeft: 32, marginBottom: 10 }}>
                <React.Fragment>
                  {!NAME_REGEXP.exec(this.state.label) ? (
                    <Tooltip placement="bottom-start" title={ERROR_NAME_REGEXP_STRING}>
                      <TextField
                        autoFocus={this.state.label?.length > 0}
                        margin="dense"
                        id="label"
                        label="Метка"
                        error={!NAME_REGEXP.exec(this.state.label) && this.state.label !== ''}
                        onChange={(e) => {
                          if (e.target.value === '') {
                            this.setState({ label: undefined });
                          } else {
                            this.setState({ label: e.target.value.trim() });
                          }
                        }}
                        value={this.state.label}
                        fullWidth
                      />
                    </Tooltip>
                  ) : (
                    <TextField
                      autoFocus={this.state.label?.length > 0}
                      margin="dense"
                      id="label"
                      label="Метка"
                      error={!NAME_REGEXP.exec(this.state.label) && this.state.label !== ''}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          this.setState({ label: undefined });
                        } else {
                          this.setState({ label: e.target.value.trim() });
                        }
                      }}
                      value={this.state.label}
                      fullWidth
                    />
                  )}
                </React.Fragment>
              </Grid>
              <Grid item style={{ marginTop: 10, marginRight: 10 }}>
                <IconButton
                  onClick={(e) => {
                    if (this.state.label === '' || !this.state.label) {
                      this.props.displayError('Новая метка не введена');
                      return;
                    }
                    if (!NAME_REGEXP.exec(this.state.label)) {
                      this.props.displayError('Введеная метка не валидна. Вы ввели недопустимые символы. ');
                      return;
                    }
                    this.state.labels.push(this.state.label);
                    this.props.changeLabels(this.state.labels);
                    this.setState({ labels: this.state.labels, label: '' });
                  }}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {this.props.isAdmin && (
          <Accordion defaultExpanded={false} style={{ width: '100%', marginTop: 8 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Параметры составного индекса</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                <Grid container style={{ width: '100%' }} spacing={8}>
                  <Grid item xs={4}>
                    <Typography variant="caption" gutterBottom>
                      Максимальное количество строк для сегмента
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" gutterBottom>
                      Максимальное количество строк сегментов, хранимое в памяти
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" gutterBottom>
                      Максимальное количество байт сегментов, хранимое в памяти
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container style={{ width: '100%' }} spacing={8}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      style={{ paddingTop: 6 }}
                      disabled={!this.props.canEdit}
                      defaultValue={this.state.tuningConfig.maxRowsPerSegment}
                      onChange={(e) => {
                        const tuningConfig = this.state.tuningConfig;
                        tuningConfig.maxRowsPerSegment = e.target.value;
                        this.setState({ tuningConfig: tuningConfig });
                        this.props.tuningConfigChanged(tuningConfig);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      style={{ paddingTop: 6 }}
                      disabled={!this.props.canEdit}
                      defaultValue={this.state.tuningConfig.maxRowsInMemory}
                      onChange={(e) => {
                        const tuningConfig = this.state.tuningConfig;
                        tuningConfig.maxRowsInMemory = e.target.value;
                        this.setState({ tuningConfig: tuningConfig });
                        this.props.tuningConfigChanged(tuningConfig);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      style={{ paddingTop: 6 }}
                      disabled={!this.props.canEdit}
                      defaultValue={this.state.tuningConfig.maxBytesInMemory}
                      onChange={(e) => {
                        const tuningConfig = this.state.tuningConfig;
                        tuningConfig.maxBytesInMemory = e.target.value;
                        this.setState({ tuningConfig: tuningConfig });
                        this.props.tuningConfigChanged(tuningConfig);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
        <QuotaErrors quotaData={quotaEstimate} />
      </React.Fragment>
    );
  }
}

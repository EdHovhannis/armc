import { Grid, IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { withStyles, createStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import SendIcon from '@material-ui/icons/Send';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import * as moment from 'moment';
import { Moment } from 'moment';
import * as React from 'react';

import { TracingSupervisorDescription } from '../../../store/tracingDatasources/Types';
import { Lookbacks, TraceQueryFilter, TracingTimeSort } from '../../../store/tracingSearch/Types';
import JournalLoader from '../../loader/JournalLoader';

export interface TraceSearchParamFormProps {
  datasources: Map<number, TracingSupervisorDescription> | undefined;
  services: string[] | undefined;
  spans: string[] | undefined;
  keys: string[] | undefined;

  datasourcesLoading: boolean;
  spansLoading: boolean;
  keysLoading: boolean;
  servicesLoading: boolean;

  selectedDatasource: TracingSupervisorDescription | undefined;
  selectedServices: Array<string>;
  selectedSpans: Array<string>;
  filters: Array<TraceQueryFilter>;
  limit: number;
  rootOnlyMatch: boolean;
  timeSortEnabled: boolean;
  timeSort: TracingTimeSort;
  lookBack: number;
  startTime: Moment;
  endTime: Moment;
}

export interface TraceSearchParamFormDispatchProps {
  displayError: (error: string) => void;

  fetchDatasources: () => void;
  fetchServices: (datasource: TracingSupervisorDescription, startTs: number, endTs: number) => void;
  fetchKeys: (datasource: TracingSupervisorDescription) => void;
  fetchSpans: (datasource: TracingSupervisorDescription, services: string[], startTs: number, endTs: number) => void;

  datasourceSelected: (datasource: TracingSupervisorDescription) => void;
  servicesSelected: (services: Array<string>) => void;
  spansSelected: (spans: Array<string>) => void;

  filterChange: (filters: TraceQueryFilter[]) => void;
  filterAdded: (filter: TraceQueryFilter) => void;
  filterRemoved: (filter: TraceQueryFilter) => void;
  filtersCleared: () => void;
  limitChanged: (limit: number) => void;
  lookBackChanged: (lookback: number) => void;
  rootOnlyMatchChanged: (rootOnlyMatch: boolean) => void;
  timeSortEnabledChanged: (timeSortEnabled: boolean) => void;
  timeSortChanged: (timeSort: TracingTimeSort) => void;
  startTimeChanged: (date: Moment) => void;
  endTimeChanged: (date: Moment) => void;
  traceSelected: (traceId: string) => void;
  searchRequested: (
    datasource: TracingSupervisorDescription,
    services: string[],
    spans: string[],
    filters: TraceQueryFilter[],
    rootOnlyMatch: boolean,
    timeSortEnabled: boolean,
    timeSort: TracingTimeSort,
    limit: number,
    startTs: number,
    endTs: number,
  ) => void;
}

interface TraceSearchParamFormState {
  traceId: string;
  filters: TraceQueryFilter[];
  filterEditorOpened: boolean;
  filterKey: string;
  filterValue: string;
}

const styles = (theme) =>
  createStyles({
    container: {
      width: '100%',
      padding: 16,
      marginTop: 16,
    },
    containerWithSidePadding: {
      width: '100%',
      padding: 16,
      marginTop: 16,
      paddingTop: 8,
      paddingBottom: 8,
    },
    firstContainer: {
      width: '100%',
      padding: 16,
    },
  });

class TraceSearchParamsForm extends React.Component<TraceSearchParamFormProps & TraceSearchParamFormDispatchProps & any, TraceSearchParamFormState> {
  constructor(props) {
    super(props);
    this.state = {
      traceId: '',
      filters: this.props.filters,
      filterEditorOpened: false,
      filterKey: '',
      filterValue: '',
    };

    if (this.props.datasources === undefined) {
      this.props.fetchDatasources();
    }
  }

  renderDsSelector() {
    const datasources = Array.from(this.props.datasources!.values());
    return (
      <Paper className={this.props.classes.firstContainer}>
        <FormControl variant="outlined" style={{ width: '100%' }}>
          <InputLabel htmlFor="outline-age-simple">Датасорс</InputLabel>
          <Select
            style={{ width: '100%' }}
            value={this.props.selectedDatasource ? this.props.selectedDatasource.id : -1}
            input={<OutlinedInput labelWidth={80} name="топик" id="outlined-age-simple" />}
            onChange={(event) => {
              const datasource = datasources!.filter((ds: TracingSupervisorDescription) => ds.id == (event.target.value as number))[0];
              this.props.datasourceSelected(datasource);
              this.props.fetchServices(datasource, this.getStartTs(), this.getEndTs());
              this.props.fetchKeys(datasource);
            }}
          >
            {datasources!.map((ds: TracingSupervisorDescription) => {
              return (
                <MenuItem value={ds.id} key={ds.id}>
                  {ds.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Paper>
    );
  }

  render() {
    if (this.props.datasources === undefined) {
      return null;
    }

    const fetching = this.props.servicesLoading || this.props.keysLoading;
    return (
      <div style={{ width: 350 }}>
        {this.renderDsSelector()}
        {fetching && <JournalLoader />}
        {this.props.selectedDatasource && this.renderTimeAndTraceCountSelector()}
        {this.props.selectedDatasource && !fetching && this.props.lookBack === Lookbacks[Lookbacks.length - 1].value && this.renderTimePickers()}
        {this.props.selectedDatasource && !fetching && this.renderParamsForm()}
        {this.props.selectedDatasource && !fetching && this.renderOptionsForm()}
        {this.props.selectedDatasource && !fetching && this.renderFilters()}
        {this.state.filterEditorOpened && this.renderFilterForm()}
        {this.props.selectedDatasource && this.renderSelectorByTraceId()}
        {this.props.selectedDatasource && this.renderSearchButton()}
      </div>
    );
  }

  renderSelectorByTraceId() {
    return (
      <Paper className={this.props.classes.containerWithSidePadding} style={{ display: 'flex', flexDirection: 'row' }}>
        <TextField
          label="Идентификатор"
          margin="normal"
          variant="outlined"
          defaultValue={this.state.traceId}
          fullWidth
          onChange={(e) => {
            this.setState({
              traceId: e.target.value.trim(),
            });
          }}
        ></TextField>
        <IconButton
          color="primary"
          style={{ marginTop: 16, width: 64 }}
          onClick={() => {
            if (this.state.traceId !== '') {
              this.props.traceSelected(this.state.traceId);
            }
          }}
        >
          <SendIcon style={{ width: 32, height: 32, marginTop: -8 }} />
        </IconButton>
      </Paper>
    );
  }

  renderTimeAndTraceCountSelector() {
    return (
      <Paper className={this.props.classes.container} style={{ display: 'flex', flexDirection: 'row' }}>
        <TextField
          label="Кол-во трейсов"
          variant="outlined"
          defaultValue={this.props.limit}
          style={{ width: 140 }}
          onChange={(e) => {
            this.props.limitChanged(parseInt(e.target.value as string));
          }}
        />
        <FormControl variant="outlined" style={{ display: 'flex', flexGrow: 1, marginLeft: 8 }}>
          <InputLabel htmlFor="outline-age-simple">Время</InputLabel>
          <Select
            style={{ width: '100%' }}
            input={<OutlinedInput labelWidth={40} name="топик" id="outlined-age-simple" />}
            value={this.props.lookBack}
            onChange={(event) => {
              this.props.lookBackChanged(parseInt(event.target.value as string));
              this.reloadServices();
              this.reloadSpans();
            }}
          >
            {Lookbacks.map((lookback) => {
              return (
                <MenuItem value={lookback.value} id={lookback.title} key={lookback.title}>
                  {' '}
                  {lookback.title}{' '}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Paper>
    );
  }

  renderParamsForm() {
    return (
      <Paper className={this.props.classes.container}>
        {this.props.services && (
          <Autocomplete
            multiple
            options={this.props.services}
            getOptionLabel={(option) => option}
            limitTags={2}
            onChange={(event, values) => {
              this.props.servicesSelected(values);
              this.props.spansSelected([]);
              if (values && values.length > 0) this.props.fetchSpans(this.props.selectedDatasource!, values, this.getStartTs(), this.getEndTs());
            }}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox checked={selected} />
                {option}
              </React.Fragment>
            )}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Сервис" fullWidth />}
          />
        )}
        {this.props.spansLoading && <JournalLoader />}
        {!this.props.spansLoading && this.props.spans && this.props.selectedServices.length > 0 && (
          <Autocomplete
            multiple
            options={this.props.spans}
            style={{ marginTop: 8 }}
            onChange={(_, values) => {
              this.props.spansSelected(values as any);
            }}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox checked={selected} />
                {option}
              </React.Fragment>
            )}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Операции" fullWidth />}
          />
        )}
      </Paper>
    );
  }

  renderOptionsForm() {
    return (
      <Paper className={this.props.classes.container}>
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked={this.props.rootOnlyMatch}
              value={this.props.rootOnlyMatch}
              onChange={(event) => {
                this.props.rootOnlyMatchChanged(event.target.checked);
              }}
            />
          }
          label="Искать только в корневом вызове"
        />
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked={this.props.timeSortEnabled}
              value={this.props.timeSortEnabled}
              onChange={(event) => {
                this.props.timeSortEnabledChanged(event.target.checked);
              }}
            />
          }
          label="Сортировать по времени"
        />

        {this.props.timeSortEnabled && (
          <FormControl variant="outlined" style={{ width: '100%', marginTop: 8 }}>
            <InputLabel htmlFor="outline-age-simple">Тип сортировки</InputLabel>
            <Select
              style={{ width: '100%' }}
              input={<OutlinedInput labelWidth={130} name="топик" id="outlined-age-simple" />}
              value={this.props.timeSort === TracingTimeSort.ORDER_TIME_DESC ? 0 : 1}
              onChange={(event: any) => {
                this.props.timeSortChanged(parseInt(event.target.value) === 0 ? TracingTimeSort.ORDER_TIME_DESC : TracingTimeSort.ORDER_TIME_ASC);
              }}
            >
              <MenuItem value={0}> Сначала самые последние </MenuItem>
              <MenuItem value={1}> Сначала самые ранние </MenuItem>
            </Select>
          </FormControl>
        )}
      </Paper>
    );
  }

  renderSearchButton() {
    return (
      <Paper className={this.props.classes.container}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          style={{
            marginTop: 12,
            marginBottom: 6,
          }}
          onClick={() => {
            let startTs, endTs;
            const currentTime = moment().unix();
            if (this.props.lookBack !== Lookbacks[Lookbacks.length - 1].value) {
              startTs = currentTime * 1000 - this.props.lookBack;
              endTs = moment().unix() * 1000;
            } else {
              startTs = this.props.startTime.unix() * 1000;
              endTs = this.props.endTime.unix() * 1000;
            }
            if (endTs < startTs) {
              this.props.displayError('Начало интервала поиска должно быть раньше, чем конец интервала.');
              return;
            }
            this.props.searchRequested(
              this.props.selectedDatasource!,
              this.props.selectedServices,
              this.props.selectedSpans,
              this.props.filters,
              this.props.rootOnlyMatch,
              this.props.timeSortEnabled,
              this.props.timeSort,
              this.props.limit,
              startTs,
              endTs,
            );
          }}
        >
          Поиск
        </Button>
      </Paper>
    );
  }

  getStartTs() {
    const currentTime = moment().unix();
    if (this.props.lookBack !== Lookbacks[Lookbacks.length - 1].value) {
      return currentTime * 1000 - this.props.lookBack;
    } else {
      return this.props.startTime.unix() * 1000;
    }
  }

  getEndTs() {
    if (this.props.lookBack !== Lookbacks[Lookbacks.length - 1].value) {
      return moment().unix() * 1000;
    } else {
      return this.props.endTime.unix() * 1000;
    }
  }

  reloadServices() {
    if (!this.props.selectedDatasource) {
      return;
    }
    this.props.fetchServices(this.props.selectedDatasource, this.getStartTs(), this.getEndTs());
    this.props.fetchKeys(this.props.selectedDatasource);
  }

  reloadSpans() {
    if (!this.props.selectedDatasource || !this.props.selectedServices || this.props.selectedServices.length == 0) {
      return;
    }
    this.props.fetchSpans(this.props.selectedDatasource!, this.props.selectedServices, this.getStartTs(), this.getEndTs());
  }

  renderFilters() {
    return (
      <Paper className={this.props.classes.container}>
        {this.props.filters.map((filter, ind) => {
          return this.renderFilter(filter, ind);
        })}
        <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
          <IconButton
            color="primary"
            style={{}}
            onClick={() => {
              this.setState({
                filterEditorOpened: true,
              });
            }}
          >
            <AddIcon />
          </IconButton>
          {this.props.filters.length > 0 && (
            <IconButton
              color="primary"
              style={{}}
              onClick={() => {
                this.props.filtersCleared();
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </Paper>
    );
  }

  renderFilter(filter: TraceQueryFilter, id: number) {
    return (
      <Grid container style={{ width: '100%' }} justifyContent="center" alignItems="center" direction="row" spacing={1}>
        <Grid item xs={10}>
          <Grid container style={{ width: '100%' }} justifyContent="center" alignItems="center" direction="row" spacing={0}>
            <Grid item xs={12}>
              <TextField fullWidth disabled label="Ключ" margin="normal" value={filter.key} />
            </Grid>
          </Grid>
          <Grid container style={{ width: '100%', marginTop: -16 }} justifyContent="center" alignItems="center" direction="row" spacing={0}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Значение"
                margin="normal"
                value={filter.value}
                onChange={(e) => {
                  const filters = this.state.filters;
                  const filterTmp = {
                    key: filter.key,
                    value: e.target.value,
                  };
                  filters[id] = filterTmp;
                  this.setState({ filters: filters });
                  this.props.filterChange(filters);
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={2}>
          <IconButton
            color="primary"
            style={{}}
            onClick={() => {
              this.props.filterRemoved(filter);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  }

  renderFilterForm() {
    return (
      <Paper className={this.props.classes.container}>
        <FormControl variant="outlined" style={{ width: '100%', marginTop: 8 }}>
          <InputLabel htmlFor="outline-age-simple">Ключ</InputLabel>
          <Select
            style={{ width: '100%' }}
            value={this.state.filterKey}
            input={<OutlinedInput labelWidth={40} name="Ключ" id="outlined-age-simple" />}
            onChange={(event) => {
              this.setState({
                filterKey: event.target.value as string,
              });
            }}
          >
            {this.props.keys?.map((key: string) => {
              return (
                <MenuItem value={key} id={key}>
                  {key}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextField
          label="Значение"
          margin="normal"
          variant="outlined"
          defaultValue={this.state.filterValue}
          fullWidth
          onChange={(e) => {
            this.setState({
              filterValue: e.target.value,
            });
          }}
        ></TextField>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          style={{
            marginTop: 12,
            marginBottom: 6,
          }}
          onClick={(event) => {
            const filters = this.state.filters;
            const filter = {
              key: this.state.filterKey,
              value: this.state.filterValue,
            };
            if (this.state.filterKey != '' && this.state.filterValue != '') this.props.filterAdded(filter);
            filters.push(filter);
            this.setState({
              filterEditorOpened: false,
              filterKey: '',
              filterValue: '',
              filters: filters,
            });
          }}
        >
          Добавить
        </Button>
      </Paper>
    );
  }

  renderTimePickers() {
    return (
      <Paper className={this.props.classes.container}>
        <KeyboardDateTimePicker
          style={{ width: '100%' }}
          ampm={false}
          variant="inline"
          inputVariant="outlined"
          showTodayButton
          label="Начало"
          format="YYYY/MM/DD HH:mm"
          value={this.props.startTime.toDate()}
          onChange={(event) => {
            const date = event as Moment;
            this.props.startTimeChanged(date);
            this.reloadServices();
            this.reloadSpans();
          }}
        />
        <KeyboardDateTimePicker
          style={{ width: '100%', marginTop: 12 }}
          ampm={false}
          variant="inline"
          inputVariant="outlined"
          showTodayButton
          label="Конец"
          format="YYYY/MM/DD HH:mm"
          value={this.props.endTime.toDate()}
          onChange={(event) => {
            const date = event as Moment;
            this.props.endTimeChanged(date);
            this.reloadServices();
            this.reloadSpans();
          }}
        />
      </Paper>
    );
  }
}

export default withStyles(styles)(TraceSearchParamsForm);

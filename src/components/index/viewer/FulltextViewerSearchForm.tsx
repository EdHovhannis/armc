import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import { FulltextConstraint } from '../../../store/constraint/Types';
import { Field } from '../../../store/index/Types';
import { Chips } from '../../utils/Chips';

import DateTimePicker from './DateTimePicker';
import { FulltextFilterPanel } from './FulltextFilterPanel';

const SORT = ['asc', 'desc'];

export interface FulltextViewerSearchFormProps {
  currentConstraint: FulltextConstraint;
  fields: Field[];
  selectedFields: any[];
  query: string;
  maxCount: number;
  sort: string;
  filter: any[];

  selectedFieldsChange(selectedFields: any[]): any;

  onSearch(): any;

  filterChange(filter: any[]): any;

  sortChange(sort: string): any;

  queryChange(query: string): any;

  maxCountChange(maxCount: number): any;
}

export interface FulltextViewerSearchFormStat {
  selectedFields: any[];
  query: string;
  filters: any[];
  maxCount: number;
  sort: string;
  isTimepickerOpen: boolean;
  timeChosen: boolean;
  dataForFilter?: any;
  isOpen: boolean;
  changingInd: number;
  isFilterEdit: boolean;
}

export class FulltextViewerSearchForm extends React.Component<FulltextViewerSearchFormProps, FulltextViewerSearchFormStat> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFields: this.props.selectedFields || [],
      query: this.props.query || '*:*',
      maxCount: this.props.maxCount || 10,
      sort: this.props.sort || 'desc',
      filters: [],
      isTimepickerOpen: false,
      timeChosen: true,
      changingInd: -1,
      isOpen: false,
      isFilterEdit: false,
    };

    this.handleTimepickerClickAway = this.handleTimepickerClickAway.bind(this);
  }

  handleTimepickerClickAway(e: any) {
    if (
      e.target.className === 'monthselect' ||
      e.target.className === 'yearselect' ||
      e.target.className === 'hourselect' ||
      e.target.className === 'minuteselect' ||
      e.target.className === 'secondselect'
    ) {
      return;
    }
    this.setState({ isTimepickerOpen: false });
  }

  render() {
    return (
      <React.Fragment>
        <Paper style={{ width: '100%', paddingLeft: 8, paddingBottom: 6 }}>
          <Grid container style={{ width: '100%', marginTop: '6' }} justifyContent="space-between" alignItems="center" direction="row">
            <Grid container style={{ width: 'calc(100% - 76px)' }} justifyContent="center" alignItems="center" direction="column">
              <Grid container style={{ width: '100%', marginTop: '6' }} justifyContent="space-between" alignItems="center" direction="row">
                <Grid item style={{ marginRight: 4, width: 'calc(45% - 4px)' }}>
                  <TextField
                    label="Query"
                    margin="normal"
                    variant="outlined"
                    fullWidth
                    size={'small'}
                    multiline
                    defaultValue={this.state.query}
                    onChange={(e) => {
                      this.setState({ query: e.target.value });
                      this.props.queryChange(e.target.value);
                    }}
                  ></TextField>
                </Grid>
                <Grid item style={{ marginRight: 4, width: 'calc(35% - 4px)' }}>
                  <Autocomplete
                    id="selectedFields"
                    multiple
                    color={'primary'}
                    limitTags={2}
                    size={'small'}
                    fullWidth={true}
                    options={this.props.fields.filter((field) => field.name !== 'tengriId')}
                    defaultValue={this.props.selectedFields}
                    renderOption={(option) => option.name}
                    getOptionLabel={(option) => option.name}
                    style={{ width: '100%', marginTop: 8 }}
                    onChange={(event, newValue) => {
                      this.props.selectedFieldsChange(newValue);
                      this.setState({ selectedFields: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color={'primary'}
                        label={this.props.selectedFields.length === 0 ? 'Выбраны все поля' : 'Поля'}
                        placeholder={this.props.selectedFields.length === 0 ? 'Выберите поля, если Вам нужны не все' : 'Выберите поля'}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item style={{ marginRight: 4, minWidth: 120, width: 'calc(20% - 4px)' }}>
                  <TextField
                    label="Максимальное кол-во записей"
                    margin="normal"
                    variant="outlined"
                    size={'small'}
                    error={this.state.maxCount < 0 || this.state.maxCount > this.props.currentConstraint?.mergedRestrictions?.maxRecordCountByQuery}
                    defaultValue={this.props.maxCount}
                    fullWidth
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      this.props.maxCountChange(value);
                      this.setState({ maxCount: value });
                    }}
                  ></TextField>
                </Grid>
              </Grid>
              <Grid container style={{ marginTop: '6', marginTop: 4 }} justifyContent="flex-start" alignItems="center" direction="row" spacing={1}>
                <Grid item style={{ minWidth: '30%' }}>
                  <DateTimePicker
                    rangeChosenChanged={(rangeChosen) => {
                      this.setState({ timeChosen: rangeChosen, isTimepickerOpen: false });
                    }}
                    onClick={() => {
                      if (this.state.isTimepickerOpen) {
                        this.setState({ isTimepickerOpen: false });
                      }
                    }}
                    onDropdownClick={this.handleTimepickerClickAway}
                  />
                </Grid>
                <Grid item style={{ marginRight: 4, minWidth: 120, width: 'calc(17% - 4px)' }}>
                  <Autocomplete
                    id="sort"
                    fullWidth={true}
                    options={SORT}
                    size={'small'}
                    defaultValue={this.state.sort}
                    getOptionLabel={(option) => option}
                    style={{ width: '100%' }}
                    onChange={(event, newValue: string) => {
                      this.props.sortChange(newValue);
                      this.setState({ sort: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Сортировка по времени"
                        variant="outlined"
                        // error={this.state.sort == null}
                      />
                    )}
                  />
                </Grid>
                <Grid item style={{ width: '50%' }}>
                  <Grid container direction={'column'} justifyContent="flex-start" alignItems="flex-start">
                    <Button
                      fullWidth
                      onClick={() => {
                        this.setState({ isOpen: !this.state.isOpen, changingInd: -1 });
                      }}
                      id={'filterButton'}
                      style={{ width: '30%' }}
                      variant={'outlined'}
                    >
                      Добавить фильтр
                    </Button>
                    {this.state.isOpen && (
                      <FulltextFilterPanel
                        fields={this.props.fields}
                        filters={this.state.filters}
                        changingId={this.state.changingInd}
                        filterChange={(filter) => {
                          this.setState({
                            filters: filter,
                          });
                          this.props.filterChange(filter);
                        }}
                        onClose={() => {
                          this.setState({ isOpen: false });
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item style={{ width: 76 }}>
              <IconButton
                style={{ marginTop: 8, marginRight: 8, width: 60 }}
                disabled={!this.state.timeChosen}
                color={'primary'}
                onClick={(e) => {
                  this.props.onSearch();
                }}
              >
                <SearchIcon style={{ height: 30, width: 30 }} />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
        <Grid item style={{ marginTop: 10 }}>
          <Chips
            data={this.state.filters}
            greenOperators={['is', 'is one of']}
            onChange={(ind: number) => {
              this.setState({ changingInd: ind, isFilterEdit: true });
            }}
            onDelete={(ind: number) => {
              this.state.filters.splice(ind, 1);
              this.setState({ filters: this.state.filters });
              this.props.filterChange(this.state.filters);
            }}
          />
          {this.state.isFilterEdit && (
            <FulltextFilterPanel
              fields={this.props.fields}
              filters={this.state.filters}
              changingId={this.state.changingInd}
              filterChange={(filter) => {
                this.setState({
                  filters: filter,
                });
                this.props.filterChange(filter);
              }}
              onClose={() => {
                this.setState({ isFilterEdit: false });
              }}
            />
          )}
        </Grid>
      </React.Fragment>
    );
  }
}

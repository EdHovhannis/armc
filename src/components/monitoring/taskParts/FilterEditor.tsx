import { FormControlLabel, Grid, IconButton, Switch, Theme, Tooltip, Typography, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import * as React from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/github';
import { HtmlTooltip } from '../../../containers/App';
import { DimensionFiltersWithRest, DruidFilter, EMPTY_ARRAY } from '../../../store/monitoring/Types';

import SimpleFilterEditor from './SimpleFilterEditor';

import InfoIcon from '@material-ui/icons/Info';

export interface FilterEditorProps {
  filterChanged(filter: any, isRawEdit: boolean);
  displayError(msg: string);

  isRawEdit: boolean;
  //enableRawEditSwitch: boolean,
  defaultFilter: any;
  canEdit: boolean;
}

export default class FilterEditor extends React.Component<FilterEditorProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      isRawEdit: this.isRawFilter(this.props.defaultFilter) || this.props.isRawEdit,
      canEdit: this.props.canEdit,
      filter: this.props.defaultFilter != null ? this.props.defaultFilter : '',
      druidFilters: this.props.defaultFilter != null ? this.getDimensionFilter(this.props.defaultFilter) : null,
      enableRawEditSwitch: !this.isRawFilter(this.props.defaultFilter),
    };
  }

  createFilterFromString(filter: string): DruidFilter {
    try {
      const inputFilter: DruidFilter = JSON.parse(filter);
      return inputFilter;
    } catch (e) {
      return null;
    }
  }

  isRawFilter(filterIn: string) {
    const filter: DimensionFiltersWithRest = this.splitFilter(this.createFilterFromString(filterIn));
    if (filter.restFilter) return true;

    return false;
  }

  splitFilter(filter: DruidFilter | null): DimensionFiltersWithRest {
    const inputAndFilters: DruidFilter[] = filter ? (filter.type === 'and' && Array.isArray(filter.fields) ? filter.fields : [filter]) : EMPTY_ARRAY;
    const dimensionFilters: DruidFilter[] = inputAndFilters.filter((f) => typeof f.dimension === 'string' || f.type === 'not');
    const restFilters: DruidFilter[] = inputAndFilters.filter((f) => typeof f.dimension !== 'string' && f.type !== 'not');

    return {
      dimensionFilters,
      restFilter: restFilters.length ? (restFilters.length > 1 ? { type: 'and', filters: restFilters } : restFilters[0]) : undefined,
    };
  }

  getDimensionFilter(filterIn: string): DruidFilter[] {
    const filter: DimensionFiltersWithRest = this.splitFilter(this.createFilterFromString(filterIn));
    if (!filter) {
      return null;
    }
    const result = filter.dimensionFilters
      .map((f): DruidFilter | null => {
        const isNot = f.type === 'not';
        const innerFilter = isNot ? f.field : f;

        let type: 'in' | 'not in' | 'regex' | 'not regex' | null = null;
        let values: string = '';

        switch (innerFilter.type) {
          case 'selector':
            type = isNot ? 'not in' : 'in';
            values = innerFilter.value;
            break;
          case 'in':
            type = isNot ? 'not in' : 'in';
            values = innerFilter.values.join(', ');
            break;
          case 'like':
          case 'regex':
            type = isNot ? 'not regex' : 'regex';
            values = innerFilter.pattern;
            break;
          default:
            return null;
        }

        return {
          dimension: innerFilter.dimension,
          type,
          values,
        };
      })
      .filter((f): f is DruidFilter => f !== null);
    return result.length > 0 ? result : EMPTY_ARRAY;
  }

  createFilter(druidFilters: DruidFilter[]) {
    if (druidFilters == null) {
      this.props.filterChanged('', false);
      this.setState({ filter: '' });
      return;
    }
    let res: DruidFilter[] = EMPTY_ARRAY;
    druidFilters.map((filter) => {
      let filt: DruidFilter = null;
      let field: DruidFilter = null;
      const re = /\s*,\s*/;
      switch (filter.type) {
        case 'in':
          filt = {
            type: 'in',
            dimension: filter.dimension,
            values: filter.values?.split(re),
          };
          res = res.concat([filt]);
          break;
        case 'not in':
          field = {
            type: 'in',
            dimension: filter.dimension,
            values: filter.values?.split(re),
          };
          filt = {
            type: 'not',
            field: field,
          };
          res = res.concat([filt]);
          break;
        case 'regex':
          filt = {
            type: 'regex',
            dimension: filter.dimension,
            pattern: filter.values,
          };
          res = res.concat([filt]);
          break;
        case 'not regex':
          field = {
            type: 'regex',
            dimension: filter.dimension,
            pattern: filter.values,
          };
          filt = {
            type: 'not',
            field: field,
          };
          res = res.concat([filt]);
          break;
      }
    });
    res = res.length ? (res.length > 1 ? { type: 'and', fields: res } : res[0]) : this.setState({ filter: JSON.stringify(res, null, 4) });
    this.props.filterChanged(JSON.stringify(res, null, 4), false);
  }

  render() {
    return (
      <React.Fragment>
        <Paper style={{ padding: 12 }}>
          <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%' }} direction={'row'}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.isRawEdit}
                  onChange={(event) => {
                    this.setState({ isRawEdit: event.target.checked });
                  }}
                  disabled={!this.state.canEdit || !this.state.enableRawEditSwitch}
                  name="checkRaw"
                  color="primary"
                />
              }
              label="Raw edit"
            />
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Typography color="primary" variant={'body2'}>
                    <b>Создание фильтров</b>
                  </Typography>
                  <Typography variant={'caption'} color="inherit">
                    {' '}
                    {'Фильтры указывают какие строки данных должны быть включены в вычисление для ' +
                      'запроса. Для создания фильтров Вы можете воспользоваться упрощенной формой создания или перейти в режим RawEdit. \n'}
                  </Typography>
                  <div>
                    <Typography variant={'caption'} color="inherit">
                      {' '}
                      {'С помощью упрощенной формы можно задать фильтры '}
                      <b>{'in'}</b>
                      {', '}
                      <b>{'not in'}</b>
                      {', '}
                      <b>{'regex'}</b>
                      {' и '}
                      <b>{'not regex'}</b>
                      {'. Между собой созданные фильтры будут соединяться с помощью логического '} <b>{'AND. \n'}</b>
                    </Typography>
                  </div>
                  <Typography variant={'caption'} color="inherit">
                    {' '}
                    {'Для создания более сложных фильтров Вам нужно перейти в режим '}
                    <b>{'RawEdit '}</b>
                    {'и написать собственный JSON, описывающий более сложные фильтры. '}
                  </Typography>
                  <div>
                    <Typography style={{ fontSize: 10 }} variant={'caption'} color="inherit">
                      {' '}
                      {'Как правильно написать JSON для более сложных фильтров ' + 'описанов в документации Apache Druid. '}
                    </Typography>
                  </div>
                </React.Fragment>
              }
            >
              <InfoIcon fontSize={'small'} color={'primary'} />
            </HtmlTooltip>
          </Grid>
          {!this.state.isRawEdit ? (
            <SimpleFilterEditor
              displayError={this.props.displayError}
              canEdit={this.state.canEdit}
              filterChanged={(filter) => {
                this.setState({ druidFilters: filter });
                this.createFilter(filter);
              }}
              defaultFilter={this.state.druidFilters}
            />
          ) : (
            <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
              {/*<React.Fragment>*/}
              {/*  <Typography color="inherit" variant={"body2"}> {"С документацией для создания фильтров Вы сможете ознакомиться по ссылке https://druid.apache.org/docs/0.17.0/querying/filters.html"}</Typography>*/}
              {/*</React.Fragment>*/}
              <AceEditor
                readOnly={!this.props.canEdit}
                mode="javascript"
                value={this.state.filter}
                theme="github"
                onChange={(e) => {
                  this.setState({ filter: e });
                  this.setState({ enableRawEditSwitch: !this.isRawFilter(e), druidFilters: this.getDimensionFilter(e) });
                  this.props.filterChanged(e, true);
                }}
                highlightActiveLine
                width={'100%'}
                showPrintMargin
                setOptions={{
                  showLineNumbers: true,
                  tabSize: 4,
                }}
              />
            </Grid>
          )}
        </Paper>
      </React.Fragment>
    );
  }
}

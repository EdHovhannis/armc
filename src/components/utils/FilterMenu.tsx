import { IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { FilterList } from '@material-ui/icons';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import { KafkaTopic } from '../../store/kafka/Types';
import { Project } from '../../store/project/Types';
import { OPERATORS } from '../../utils/Utils';

import { Chips } from './Chips';

type FilterType = {
  values: string[];
  field_type: number;
  fieldName: string;
  operator: string;
  field: string;
  text: string;
};

const ALL_OPERATORS = [OPERATORS.IS, OPERATORS['IS NOT'], OPERATORS.IN, OPERATORS['NOT IN']];
const ZONE_OPERATORS = [OPERATORS.IS, OPERATORS['IS NOT']];

const OVERDRAFT_OPERATORS = [OPERATORS.MORE, OPERATORS.EQUAL, OPERATORS.LESS];

export enum COLUMN_TYPE {
  'TOPIC',
  'PROJECT',
  'NAME',
  'ZONE',
  'OTHER',
}

export interface FilterColumnsItem {
  name: string | Element;
  field: string;
  variants?: Project[] | KafkaTopic[] | any[];
  onlyInOperator?: boolean;
  onlyIsOperator?: boolean;
  comparisonOperators?: boolean;
  disabled?: boolean;
}

export interface FilterMenuItem {
  values: string[];
  operator: string;
  field: string;
  fieldName: string;
  text: string;
  field_type: COLUMN_TYPE;
  onlyIsOperator?: boolean;
  onlyInOperator?: boolean;
  comparisonOperators?: boolean;
}

interface FilterMenuProps {
  onChange(filters: FilterMenuItem[]): any;

  columns: FilterColumnsItem[];
  filter?: FilterMenuItem[] | undefined;
}

interface FilterMenuStat {
  filters: FilterMenuItem[];
  isOpen: boolean;
  isEdit: boolean;
  selectedFieldName: string;
  selectedField: string;
  operator: string;
  operatorSelected: boolean;
  fieldValues: string[];
  error: boolean;
  changingInd: number;
  showButton: boolean;
  operators: OPERATORS[];
  field_type: COLUMN_TYPE;
  onlyIsOperator: boolean;
  onlyInOperator: boolean;
  comparisonOperators: boolean;
}

export default class FilterMenu extends React.Component<FilterMenuProps, FilterMenuStat> {
  constructor(props) {
    super(props);
    this.state = {
      filters: this.props.filter ? this.props.filter : [],
      isOpen: false,
      isEdit: false,
      selectedFieldName: '',
      selectedField: '',
      operator: '',
      operatorSelected: false,
      fieldValues: [''],
      error: false,
      changingInd: -1,
      showButton: true,
      field_type: COLUMN_TYPE.NAME,
      operators: ALL_OPERATORS,
      onlyIsOperator: false,
      onlyInOperator: false,
      comparisonOperators: false,
    };
    this.handleClickAway = this.handleClickAway.bind(this);
  }

  getName(data: any[] | undefined, selectedField: string, value, needProjectKey?: boolean) {
    if (data) {
      return needProjectKey
        ? data.filter((item) => item[this.state.selectedField] === value)[0].name +
            ' (' +
            data.filter((item) => item[this.state.selectedField] === value)[0].shortName +
            ')'
        : data.filter((item) => item[this.state.selectedField] === value)[0].name;
    } else {
      return value;
    }
  }

  createTxt(): string {
    let txt = '';
    switch (this.state.operator) {
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        txt = 'NOT ' + this.state.selectedFieldName + ' : ';
        break;
      default:
        txt = this.state.selectedFieldName + ' : ';
        break;
    }
    switch (this.state.field_type) {
      case COLUMN_TYPE.PROJECT:
        txt += this.state.fieldValues
          .map((value) => {
            return this.getName(this.props.columns.filter((column) => column.name === 'Проект')[0].variants, this.state.selectedField, value, true);
          })
          .join(', ');
        break;
      case COLUMN_TYPE.TOPIC:
        txt += this.state.fieldValues
          .map((value) => {
            return this.getName(
              this.props.columns.filter((column) => column.name === 'Топик' || column.name === 'Источник данных')[0].variants,
              this.state.selectedField,
              value,
            );
          })
          .join(', ');
        break;
      default:
        txt += this.state.fieldValues.join(', ');
        break;
    }
    return txt;
  }

  handleClickAway(e: any) {
    if (e.target.className === 'MuiChip-label') {
      this.setState({ showButton: !this.state.isOpen });
      return;
    }
    if (e.target.className?.animVal === 'MuiSvgIcon-root MuiSvgIcon-colorPrimary') {
      this.setState({ isOpen: false, showButton: true });
      return;
    }
    if (e.target.id === 'select') return;
    if (this.state.isEdit) {
      this.setState({
        fieldValues: [''],
        selectedField: '',
        selectedFieldName: '',
        operator: '',
        isOpen: false,
        showButton: true,
        isEdit: false,
      });
    } else {
      this.setState({ isOpen: false, showButton: true });
    }
  }

  isNeedTextField() {
    let res = false;
    if (this.state.selectedField !== '') {
      if (this.props.columns.filter((column) => column.name === this.state.selectedFieldName).length > 0) {
        res =
          res ||
          (!this.props.columns.filter((column) => column.name === this.state.selectedFieldName)[0]?.variants &&
            this.state.field_type === COLUMN_TYPE.OTHER);
      }
    }
    res = res || this.state.field_type === COLUMN_TYPE.NAME;

    return res;
  }

  getOtherOptions(): string[] {
    const { columns } = this.props;
    const filteredColumns = columns.filter((column) => column.name === this.state.selectedFieldName);
    if (filteredColumns.length > 0) {
      return filteredColumns[0]?.variants
        ?.filter((data) => !this.state.fieldValues.some((value) => value === data))
        .map((d) => d.toString()) as string[];
    } else {
      return [];
    }
  }

  render() {
    const isEmptyFields =
      this.state.selectedFieldName === '' ||
      this.state.operator === '' ||
      this.state.operator === undefined ||
      !this.state.fieldValues.every((el) => el !== '' && el != null && `${el}` !== '-1');

    const arraysEqual = (a: string[] | undefined, b: string[] | undefined): boolean => {
      if (!a || !b) return false;
      return a.length === b.length && a.every((val, idx) => val === b[idx]);
    };
    const extractTextValue = (filter: FilterType): string => {
      const textParts = filter.text?.split(':');
      const valuePart = textParts?.length > 1 ? textParts[1]?.trim() : '';
      if (filter.fieldName === 'Проект' && valuePart) {
        const match = valuePart.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          const PROJECT_KEY = 2;
          return match[PROJECT_KEY].trim();
        }
        return valuePart.trim();
      }
      return valuePart || '';
    };
    const isFilterDuplicate = (filters: FilterType[], fieldValues: string[], operator: string, selectedFieldName: string): boolean => {
      if (!filters?.length || !fieldValues?.length) return false;
      return filters.some((filter) => {
        const isSameField = filter.fieldName === selectedFieldName;
        const isSameOperator = filter.operator === operator;
        const isSameText = fieldValues.every((value) => {
          const extractedValue = extractTextValue(filter);
          if (typeof value === 'number') {
            return extractedValue !== undefined && value !== -1;
          }
          return extractedValue !== undefined && extractedValue === value.trim();
        });
        const isSameValues = arraysEqual(filter.values, fieldValues);
        return isSameField && isSameOperator && isSameText && isSameValues;
      });
    };
    return (
      <React.Fragment>
        <Grid container direction={'row'} style={{ marginTop: 6 }} alignContent={'center'}>
          <Grid item style={{ width: 'calc(100% - 54px)', marginTop: 6 }}>
            <Chips
              data={this.state.filters}
              greenOperators={[OPERATORS.IN, OPERATORS.IS]}
              onChange={(ind: number) => {
                const selectedFilterValues = [...this.state.filters[ind].values];
                this.setState({
                  isEdit: ind === this.state.changingInd ? !this.state.isEdit : true,
                  isOpen: ind === this.state.changingInd ? !this.state.isOpen : true,
                  changingInd: ind,
                  field_type: this.state.filters[ind].field_type,
                  selectedField: this.state.filters[ind].field,
                  selectedFieldName: this.state.filters[ind].fieldName,
                  operator: this.state.filters[ind].operator,
                  fieldValues: selectedFilterValues,
                  showButton: ind === this.state.changingInd ? this.state.isOpen : false,
                  onlyInOperator: this.state.filters[ind].onlyInOperator || false,
                  onlyIsOperator: this.state.filters[ind].onlyIsOperator || false,
                  comparisonOperators: this.state.filters[ind].comparisonOperators || false,
                  operators: this.state.filters[ind].comparisonOperators
                    ? OVERDRAFT_OPERATORS
                    : this.state.filters[ind].onlyInOperator
                      ? [OPERATORS.IN]
                      : this.state.filters[ind].onlyIsOperator
                        ? [OPERATORS.IS]
                        : this.state.filters[ind].field === 'zone'
                          ? ZONE_OPERATORS
                          : ALL_OPERATORS,
                });
              }}
              onDelete={(ind: number) => {
                const newFilters = [...this.state.filters];
                newFilters.splice(ind, 1);
                this.setState({ filters: newFilters });
                this.props.onChange(newFilters);
              }}
            />
          </Grid>
          <Grid item style={{ width: 48, marginLeft: 6 }}>
            {this.state.showButton && (
              <Grid container direction={'row'}>
                <IconButton
                  onClick={() => {
                    this.setState({
                      isOpen: !this.state.isOpen,
                      changingInd: -1,
                    });
                  }}
                >
                  <FilterList id={'filterButton'} color={'primary'} />
                </IconButton>
              </Grid>
            )}
          </Grid>
          <ClickAwayListener onClickAway={this.handleClickAway} mouseEvent={'onMouseUp'}>
            <Grid
              container
              direction={'row'}
              style={{ width: '100%' }}
              alignItems="flex-start"
              justifyContent={this.state.isEdit ? 'flex-start' : 'flex-end'}
            >
              <Grid
                item
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '40%',
                }}
              >
                {this.state.isOpen && (
                  <Grid
                    container
                    direction={'column'}
                    style={{
                      display: 'block',
                      position: 'absolute',
                      zIndex: 12,
                      backgroundColor: 'white',
                      border: '1px solid green',
                      padding: 16,
                      borderRadius: 10,
                      width: '100%',
                    }}
                  >
                    <Grid container style={{ width: '100%' }} direction={'row'}>
                      <Grid item direction={'column'} style={{ width: '60%' }}>
                        <FormControl variant="outlined" style={{ width: '100%' }}>
                          <InputLabel htmlFor="outline-age-simple">Поле</InputLabel>
                          <Select
                            id={'field-select'}
                            error={this.state.selectedFieldName === ''}
                            value={this.state.selectedFieldName}
                            fullWidth
                            style={{ marginRight: 6 }}
                            onChange={(e: any, n) => {
                              let type: COLUMN_TYPE;
                              let fieldValues: any[] = [''];
                              switch (e.target.value) {
                                case 'Источник данных':
                                case 'Топик':
                                  type = COLUMN_TYPE.TOPIC;
                                  if (n.props.field === 'id') {
                                    fieldValues = [-1];
                                  }
                                  break;
                                case 'Проект':
                                  type = COLUMN_TYPE.PROJECT;
                                  if (n.props.field === 'id') {
                                    fieldValues = [-1];
                                  }
                                  break;
                                case 'Название':
                                  if (this.props.columns.filter((column) => column.name === 'Название')[0].variants) {
                                    type = COLUMN_TYPE.OTHER;
                                  } else {
                                    type = COLUMN_TYPE.NAME;
                                  }
                                  break;
                                case 'Зона':
                                  if (this.props.columns.filter((column) => column.name === 'Зона')[0].variants) {
                                    type = COLUMN_TYPE.OTHER;
                                  } else {
                                    type = COLUMN_TYPE.ZONE;
                                  }
                                  break;
                                default:
                                  if (n.props.field === 'id') {
                                    fieldValues = [-1];
                                  }
                                  type = COLUMN_TYPE.OTHER;
                              }
                              if (n.props.onlyInOperator) {
                                this.setState({
                                  selectedFieldName: e.target.value,
                                  selectedField: n.props.field,
                                  field_type: type,
                                  fieldValues: [...fieldValues],
                                  operators: [OPERATORS.IN],
                                  operator: OPERATORS.IN,
                                  onlyInOperator: true,
                                  onlyIsOperator: false,
                                  comparisonOperators: false,
                                });
                              } else if (n.props.onlyIsOperator) {
                                this.setState({
                                  selectedFieldName: e.target.value,
                                  selectedField: n.props.field,
                                  field_type: type,
                                  fieldValues: [...fieldValues],
                                  operators: [OPERATORS.IS],
                                  operator: OPERATORS.IS,
                                  onlyIsOperator: true,
                                  onlyInOperator: false,
                                  comparisonOperators: false,
                                });
                              } else if (n.props.comparisonOperators) {
                                this.setState({
                                  selectedFieldName: e.target.value,
                                  selectedField: n.props.field,
                                  field_type: type,
                                  fieldValues: [...fieldValues],
                                  operators: OVERDRAFT_OPERATORS,
                                  operator: OPERATORS.MORE,
                                  onlyIsOperator: false,
                                  onlyInOperator: false,
                                  comparisonOperators: true,
                                });
                              } else {
                                this.setState({
                                  selectedFieldName: e.target.value,
                                  selectedField: n.props.field,
                                  field_type: type,
                                  fieldValues: [...fieldValues],
                                  operators:
                                    n.props.field === 'overdraft' ? OVERDRAFT_OPERATORS : n.props.field === 'zone' ? ZONE_OPERATORS : ALL_OPERATORS,
                                  operator: '',
                                  onlyIsOperator: false,
                                  onlyInOperator: false,
                                  comparisonOperators: false,
                                });
                              }
                            }}
                            input={<OutlinedInput labelWidth={40} name="топик" id="outlined-age-simple" />}
                          >
                            {this.props.columns.map((field, ind) => {
                              return (
                                <MenuItem
                                  disabled={field?.disabled}
                                  value={field.name}
                                  field={field.field}
                                  key={ind}
                                  onlyInOperator={field.onlyInOperator}
                                  onlyIsOperator={field.onlyIsOperator}
                                  comparisonOperators={field.comparisonOperators}
                                  id={'select'}
                                >
                                  {field.name === 'Топик' ? 'Источник данных' : field.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item direction={'column'} style={{ width: '40%' }}>
                        <FormControl variant="outlined" style={{ width: '100%' }}>
                          <InputLabel htmlFor="outline-age-simple">Оператор</InputLabel>
                          <Select
                            id={'operator-select'}
                            style={{ marginLeft: 6, width: 'calc(100% - 6px)' }}
                            error={this.state.operator === ''}
                            value={this.state.operator}
                            onChange={(e: any) => {
                              if (e.target.value === OPERATORS.IS || e.target.value === OPERATORS['IS NOT']) {
                                this.setState({
                                  fieldValues: [this.state.fieldValues[0]],
                                });
                              }
                              this.setState({
                                operator: e.target.value,
                                operatorSelected: true,
                              });
                            }}
                            input={<OutlinedInput labelWidth={60} name="топик" id="outlined-age-simple" />}
                          >
                            {this.state.operators.map((type, ind) => {
                              return (
                                <MenuItem value={type} key={ind} id={'select'}>
                                  {type}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container direction={'column'} alignItems={'center'}>
                      {this.state.fieldValues.map((value, ind) => {
                        return (
                          <Grid key={ind} container direction={'row'} alignItems={'center'}>
                            {this.isNeedTextField() && (
                              <TextField
                                id={`filter-field-value-${ind}`}
                                error={this.state.fieldValues[ind] === ''}
                                value={this.state.fieldValues[ind]}
                                variant={'outlined'}
                                label={this.state.fieldValues[ind] === '' ? 'Значение не введено' : 'Значение'}
                                style={{
                                  width:
                                    this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']
                                      ? ind === this.state.fieldValues.length - 1 && this.state.fieldValues.length !== 1
                                        ? 'calc(100% - 88px)'
                                        : 'calc(100% - 44px)'
                                      : '100%',
                                  marginTop: 10,
                                }}
                                onChange={(event) => {
                                  const tmp = [...this.state.fieldValues];
                                  tmp[ind] = event.target.value;
                                  this.setState({ fieldValues: tmp });
                                }}
                              ></TextField>
                            )}
                            {!this.isNeedTextField() && this.state.field_type === COLUMN_TYPE.OTHER && (
                              <Autocomplete
                                id={this.state.selectedField}
                                options={this.getOtherOptions()}
                                defaultValue={this.state.selectedField === 'id' ? (value === -1 ? undefined : value.toString()) : value}
                                getOptionLabel={(option: string) => option}
                                renderOption={(option: string) => option}
                                style={{
                                  width:
                                    this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']
                                      ? ind === this.state.fieldValues.length - 1 && this.state.fieldValues.length !== 1
                                        ? 'calc(100% - 88px)'
                                        : 'calc(100% - 44px)'
                                      : '100%',
                                  marginTop: 10,
                                }}
                                onChange={(event, newValue: string) => {
                                  const tmp = [...this.state.fieldValues];
                                  tmp[ind] = this.state.selectedField === 'id' ? parseInt(newValue) : newValue;
                                  this.setState({ fieldValues: tmp });
                                }}
                                value={this.state.fieldValues[ind]?.toString() ?? ''}
                                renderInput={(params) => <TextField {...params} label={this.state.selectedFieldName} variant="outlined" />}
                              />
                            )}

                            {this.state.field_type === COLUMN_TYPE.PROJECT && (
                              <Autocomplete
                                id="project"
                                options={this.props.columns
                                  .filter((column) => column.name === 'Проект')[0]
                                  .variants.filter(
                                    (project: Project) => !this.state.fieldValues.some((value) => value === project[this.state.selectedField]),
                                  )}
                                defaultValue={
                                  this.props.columns
                                    .filter((column) => column.name === 'Проект')[0]
                                    .variants?.filter((project: Project) => project[this.state.selectedField] === value)[0]
                                }
                                getOptionLabel={(option) => option.name + ' (' + option.shortName + ')'}
                                renderOption={(option) => option.name + ' (' + option.shortName + ')'}
                                style={{
                                  width:
                                    this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']
                                      ? ind === this.state.fieldValues.length - 1 && this.state.fieldValues.length !== 1
                                        ? 'calc(100% - 88px)'
                                        : 'calc(100% - 44px)'
                                      : '100%',
                                  marginTop: 10,
                                }}
                                onChange={(event, newValue: Project) => {
                                  const tmp = [...this.state.fieldValues];
                                  tmp[ind] = newValue[this.state.selectedField];
                                  this.setState({ fieldValues: tmp });
                                }}
                                renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
                              />
                            )}
                            {this.state.field_type === COLUMN_TYPE.ZONE && (
                              <Autocomplete
                                id="zone"
                                options={
                                  this.props.columns
                                    .filter((column) => column.name === 'Зона')[0]
                                    .variants?.filter((zone: string) => !this.state.fieldValues.some((value) => value === zone)) || []
                                }
                                defaultValue={
                                  this.props.columns.filter((column) => column.name === 'Зона')[0].variants?.filter((zone: string) => zone)[0]
                                }
                                getOptionLabel={(option) => option.zone}
                                renderOption={(option) => option.zone}
                                style={{
                                  width:
                                    this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']
                                      ? ind === this.state.fieldValues.length - 1 && this.state.fieldValues.length !== 1
                                        ? 'calc(100% - 88px)'
                                        : 'calc(100% - 44px)'
                                      : '100%',
                                  marginTop: 10,
                                }}
                                onChange={(event, newValue: string) => {
                                  const tmp = [...this.state.fieldValues];
                                  tmp[ind] = newValue[this.state.selectedField];
                                  this.setState({ fieldValues: tmp });
                                }}
                                renderInput={(params) => <TextField {...params} label="Зона" variant="outlined" />}
                              />
                            )}
                            {this.state.field_type === COLUMN_TYPE.TOPIC && (
                              <Autocomplete
                                id="project"
                                options={this.props.columns
                                  .filter((column) => column.name === 'Топик' || column.name === 'Источник данных')[0]
                                  .variants.filter(
                                    (topic: KafkaTopic) => !this.state.fieldValues.some((value) => value === topic[this.state.selectedField]),
                                  )}
                                defaultValue={
                                  this.props.columns
                                    .filter((column) => column.name === 'Топик' || column.name === 'Источник данных')[0]
                                    .variants?.filter((topic: KafkaTopic) => topic[this.state.selectedField] === value)[0]
                                }
                                getOptionLabel={(option) => option.name}
                                renderOption={(option) => option.name}
                                style={{
                                  width:
                                    this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']
                                      ? ind === this.state.fieldValues.length - 1 && this.state.fieldValues.length !== 1
                                        ? 'calc(100% - 88px)'
                                        : 'calc(100% - 44px)'
                                      : '100%',
                                  marginTop: 10,
                                }}
                                onChange={(event, newValue: KafkaTopic) => {
                                  const tmp = [...this.state.fieldValues];
                                  tmp[ind] = newValue[this.state.selectedField];
                                  this.setState({ fieldValues: tmp });
                                }}
                                renderInput={(params) => <TextField {...params} label="Источник данных" variant="outlined" />}
                              />
                            )}
                            {(this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']) &&
                            this.state.fieldValues.length !== 1 ? (
                              <IconButton
                                style={{
                                  marginTop: 6,
                                }}
                                onClick={() => {
                                  const tmp = [...this.state.fieldValues];
                                  tmp.splice(ind, 1);
                                  this.setState({ fieldValues: tmp });
                                }}
                              >
                                <DeleteIcon fontSize={'small'} color={'primary'} />
                              </IconButton>
                            ) : null}
                            {(this.state.operator === OPERATORS.IN || this.state.operator === OPERATORS['NOT IN']) &&
                            ind === this.state.fieldValues.length - 1 ? (
                              <IconButton
                                style={{
                                  marginTop: 6,
                                }}
                                onClick={() => {
                                  if (this.state.fieldValues[this.state.fieldValues.length - 1] !== '')
                                    this.setState({
                                      fieldValues: [...this.state.fieldValues, ''],
                                    });
                                }}
                              >
                                <AddIcon color={'primary'} fontSize={'small'} />
                              </IconButton>
                            ) : null}
                          </Grid>
                        );
                      })}
                    </Grid>
                    <Button
                      variant={'outlined'}
                      color={'primary'}
                      style={{ width: '100%', marginTop: 10 }}
                      disabled={
                        isEmptyFields ||
                        isFilterDuplicate(this.state.filters, this.state.fieldValues, this.state.operator, this.state.selectedFieldName)
                      }
                      onClick={() => {
                        const txt = this.createTxt();

                        if (this.state.changingInd === -1) {
                          const prevFieldValues = [...this.state.fieldValues];
                          this.setState({
                            filters: [
                              ...this.state.filters,
                              {
                                values: prevFieldValues,
                                field_type: this.state.field_type,
                                fieldName: this.state.selectedFieldName,
                                operator: this.state.operator,
                                field: this.state.selectedField,
                                text: txt,
                                onlyInOperator: this.state.onlyInOperator,
                                onlyIsOperator: this.state.onlyIsOperator,
                                comparisonOperators: this.state.comparisonOperators,
                              },
                            ],
                            fieldValues: [''],
                            selectedField: '',
                            selectedFieldName: '',
                            operator: '',
                            isOpen: false,
                            isEdit: false,
                          });
                          this.props.onChange([
                            ...this.state.filters,
                            {
                              values: [...this.state.fieldValues],
                              fieldName: this.state.selectedFieldName,
                              operator: this.state.operator,
                              field_type: this.state.field_type,
                              field: this.state.selectedField,
                              text: txt,
                              onlyInOperator: this.state.onlyInOperator,
                              onlyIsOperator: this.state.onlyIsOperator,
                              comparisonOperators: this.state.comparisonOperators,
                            },
                          ]);
                        } else {
                          const tmp = [...this.state.filters];
                          const prevFieldValues = [...this.state.fieldValues];
                          tmp[this.state.changingInd] = {
                            field_type: this.state.field_type,
                            fieldName: this.state.selectedFieldName,
                            values: prevFieldValues,
                            operator: this.state.operator,
                            field: this.state.selectedField,
                            text: txt,
                            onlyInOperator: this.state.onlyInOperator,
                            onlyIsOperator: this.state.onlyIsOperator,
                            comparisonOperators: this.state.comparisonOperators,
                          };
                          this.setState({
                            filters: tmp,
                            fieldValues: [''],
                            selectedField: '',
                            selectedFieldName: '',
                            operator: '',
                            isOpen: false,
                            isEdit: false,
                            showButton: true,
                          });
                          this.props.onChange(tmp);
                        }
                      }}
                    >
                      {this.state.isEdit ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </ClickAwayListener>
        </Grid>
      </React.Fragment>
    );
  }
}

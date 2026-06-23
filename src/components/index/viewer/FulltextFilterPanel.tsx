import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import { Field } from '../../../store/index/Types';

export interface FulltextFilterPanelProps {
  fields: Field[];
  filters: any[];
  changingId: number;

  filterChange(filter: any): any;
  onClose(): any;
}

export interface FulltextFilterPanelStat {
  allOperators: string[];
  filters: any;
  selectedField: string;
  operator: string;
  operatorSelected: boolean;
  fieldValues: Array<string>;
  changingInd: number;
}

export class FulltextFilterPanel extends React.Component<FulltextFilterPanelProps, FulltextFilterPanelStat> {
  constructor(props) {
    super(props);
    this.state = {
      filters: this.props.filters || [],
      selectedField: this.props.changingId === -1 ? '' : this.props.filters[this.props.changingId].field,
      operator: this.props.changingId === -1 ? '' : this.props.filters[this.props.changingId].operator,
      operatorSelected: false,
      fieldValues: this.props.changingId === -1 ? [''] : this.props.filters[this.props.changingId].values,
      changingInd: this.props.changingId,
      allOperators: ['is', 'is not', 'is one of', 'is not one of'],
    };

    this.handleClickAway = this.handleClickAway.bind(this);
  }

  handleClickAway(e: any) {
    if (e.target.id === 'select') return;
    this.props.onClose();
  }

  componentDidMount() {
    if (this.props.changingId !== -1) {
      this.setState({
        selectedField: this.state.filters[this.props.changingId].field,
        operator: this.state.filters[this.props.changingId].operator,
        fieldValues: this.state.filters[this.props.changingId].values,
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <ClickAwayListener onClickAway={this.handleClickAway} mouseEvent={'onMouseUp'}>
          <Grid
            container
            direction={'column'}
            style={{
              display: 'block',
              position: 'absolute',
              zIndex: 12,
              backgroundColor: 'white',
              border: '1px solid grey',
              padding: 16,
              borderRadius: 5,
              width: '40%',
            }}
          >
            <Grid container style={{ width: '100%' }} direction={'row'}>
              <Grid item direction={'column'} style={{ width: '50%' }}>
                <Autocomplete
                  options={this.props.fields}
                  defaultValue={this.props.fields.filter((field) => field.name === this.state.selectedField)[0] || undefined}
                  getOptionLabel={(option) => option.name}
                  renderOption={(option) => option.name}
                  style={{ marginRight: 6 }}
                  onChange={(event, newValue) => {
                    const type = this.props.fields[this.props.fields.map((x) => x.name).indexOf(newValue.name)].type;

                    if (type === 'pint' && this.state.allOperators.indexOf('is in range') === -1) {
                      this.setState({ allOperators: [...this.state.allOperators, 'is in range'] });
                    } else if (type !== 'pint') {
                      this.setState({ allOperators: ['is', 'is not', 'is one of', 'is not one of'] });
                    }

                    this.setState({ selectedField: newValue.name });
                  }}
                  renderInput={(params) => <TextField {...params} label={'Поле'} error={this.state.selectedField === ''} variant="outlined" />}
                />
              </Grid>
              <Grid item direction={'column'} style={{ width: '50%' }}>
                <Autocomplete
                  options={this.state.allOperators}
                  defaultValue={this.state.operator}
                  getOptionLabel={(option) => option}
                  renderOption={(option) => option}
                  style={{ marginRight: 6, marginLeft: 6, width: 'calc(100% - 6px)' }}
                  onChange={(event, newValue: string) => {
                    if (newValue === 'is' || newValue === 'is not') {
                      this.setState({ fieldValues: [this.state.fieldValues[0]] });
                    }
                    this.setState({ operator: newValue, operatorSelected: true });
                  }}
                  renderInput={(params) => <TextField {...params} label={'Оператор'} error={this.state.operator === ''} variant="outlined" />}
                />
              </Grid>
            </Grid>
            <Grid container direction={'column'} alignItems={'center'}>
              {this.state.fieldValues.map((value, ind) => {
                return (
                  <Grid container direction={'row'} alignItems={'center'}>
                    <TextField
                      error={this.state.fieldValues[ind] === ''}
                      value={this.state.fieldValues[ind]}
                      variant={'outlined'}
                      label={this.state.fieldValues[ind] === '' ? 'Значение не введено' : 'Значение'}
                      style={{
                        width:
                          this.state.operator === 'is one of' || this.state.operator === 'is not one of'
                            ? ind === this.state.fieldValues.length - 1 && this.state.fieldValues.length !== 1
                              ? 'calc(100% - 132px)'
                              : 'calc(100% - 66px)'
                            : '100%',
                        marginTop: 10,
                      }}
                      onChange={(event) => {
                        const tmp = this.state.fieldValues;
                        tmp[ind] = event.target.value;
                        this.setState({ fieldsValues: tmp });
                      }}
                    ></TextField>
                    {(this.state.operator === 'is one of' || this.state.operator === 'is not one of') && this.state.fieldValues.length !== 1 ? (
                      <Button
                        variant={'outlined'}
                        style={{
                          height: '56px',
                          marginTop: '8px',
                          marginLeft: 2,
                        }}
                        onClick={() => {
                          const tmp = this.state.fieldValues;
                          tmp.splice(ind, 1);
                          this.setState({ fieldValues: tmp });
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    ) : null}
                    {(this.state.operator === 'is one of' || this.state.operator === 'is not one of') && ind === this.state.fieldValues.length - 1 ? (
                      <Button
                        variant={'outlined'}
                        style={{
                          height: '56px',
                          marginTop: '8px',
                          marginLeft: 2,
                        }}
                        onClick={() => {
                          if (this.state.fieldValues[this.state.fieldValues.length - 1] !== '')
                            this.setState({ fieldValues: [...this.state.fieldValues, ''] });
                        }}
                      >
                        <AddIcon />
                      </Button>
                    ) : null}
                  </Grid>
                );
              })}
            </Grid>
            <Button
              variant={'outlined'}
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                if (this.state.selectedField === '' || this.state.operator === '' || !this.state.fieldValues.every((el) => el !== '')) return;

                const txt = this.state.selectedField + ' ' + this.state.operator + ' ' + this.state.fieldValues.join(', ');

                if (this.state.changingInd === -1) {
                  this.setState({
                    filters: [
                      ...this.state.filters,
                      {
                        values: this.state.fieldValues,
                        operator: this.state.operator,
                        field: this.state.selectedField,
                        text: txt,
                      },
                    ],
                  });
                  this.props.filterChange([
                    ...this.state.filters,
                    {
                      values: this.state.fieldValues,
                      operator: this.state.operator,
                      field: this.state.selectedField,
                      text: txt,
                    },
                  ]);
                  this.props.onClose();
                } else {
                  const tmp = this.state.filters;
                  tmp[this.state.changingInd] = {
                    values: this.state.fieldValues,
                    operator: this.state.operator,
                    field: this.state.selectedField,
                    text: txt,
                  };
                  this.setState({ filters: tmp });
                  this.props.onClose();
                  this.props.filterChange(tmp);
                }
              }}
            >
              Добавить
            </Button>
          </Grid>
        </ClickAwayListener>
      </React.Fragment>
    );
  }
}

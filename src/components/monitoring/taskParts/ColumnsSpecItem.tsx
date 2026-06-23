import MaterialTable, { MTableToolbar } from '@material-table/core';
import {
  Button,
  Chip,
  createTheme,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  ThemeProvider,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import { green } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { createRef } from 'react';

import KafkaService from '../../../services/KafkaService';
import { DimensionItem, FlattenItem, MetricItem } from '../../../store/monitoring/Types';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import ConfirmDialog from '../../ConfirmDialog';
import { Schema } from '../TaskEditor';

export interface ColumnsSpecItemProps {
  dataChanged(data: Array<DimensionItem>);

  schemaChanged(schema: Schema);

  displayError(msg: string);

  dimensionExclusionsChange(dimensionExclusions: Array<string>);

  tagsChanged(tags: Array<string>);

  autoModeChanged(autoMode: boolean);

  data: Array<DimensionItem>;
  flattenTags: Array<string>;
  topic: number;
  autoMode: boolean;
  schema: Schema;
  tags: Array<string>;
  dimensionExclusions: Array<string>;
  isUpdate: boolean;
  canEdit: boolean;
  shouldBeFlattened: boolean;
  metricsData: Array<MetricItem>;
  errorMessage: string;
}

export interface ColumnsSpecItemState {
  canEdit: boolean;
  schema: Schema;
  autoMode: boolean;
  dimensionExclusions: Array<string>;
  tags: Array<string>;
  data: Array<DimensionItem>;
  isLoading: boolean;
  confirmDialogDeleteOpen: boolean;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: green[500],
    },
  },
});

export default class ColumnsSpecItem extends React.Component<ColumnsSpecItemProps, ColumnsSpecItemState> {
  constructor(props) {
    super(props);
    const tags: Array<string> = this.props.tags;
    this.props.flattenTags &&
      this.props.flattenTags.length > 0 &&
      this.props.flattenTags
        .filter((tag) => {
          return !tags.some((tagIn) => tagIn === tag);
        })
        .forEach((tag) => tags.push(tag));
    this.state = {
      canEdit: this.props.canEdit,
      schema: this.props.schema,
      tags: tags,
      isLoading: false,
      autoMode: this.props.autoMode,
      dimensionExclusions: this.props.dimensionExclusions,
      confirmDialogDeleteOpen: false,
      data:
        this.props.data != null
          ? this.props.data.map((data) => {
              return data;
            })
          : [],
    };
    this.handleConfirmDialogDeleteOpen = this.handleConfirmDialogDeleteOpen.bind(this);
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteOpen() {
    this.setState({ confirmDialogDeleteOpen: true });
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDialogDeleteOpen: false });
    if (value === 'Ok') {
      this.setState({ ...this.state, data: [], confirmDialogDeleteOpen: false });
      this.props.dataChanged([]);
    }
  }

  tableRef = createRef();

  handleAddRow = () => {
    this.tableRef.current.state.showAddRow = true;
    const editable = this.state.editable;
    this.setState({
      editable: {
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              this.setState((prevState) => {
                const data = [...prevState.data];
                data.push(newData);
                this.props.dataChanged(data);
                return { ...prevState, data };
              });
              this.setState({ editable: editable });
            }, 600);
          }),
      },
    });
  };

  onTagsChange = (event, values) => {
    this.setState({
      tags: values,
    });
    this.props.tagsChanged(values);
  };

  setNullOnField = (data) => {
    const result = [...data];
    result.map((row) => {
      if (row.type !== 'array' && row.type !== 'sorted_array') row.subType = null;
    });
    return result;
  };

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%' }} direction={'row'}>
          <Grid item style={{ width: '17%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.autoMode}
                  onChange={(event) => {
                    this.setState({ ...this.state, data: [], autoMode: event.target.checked });
                    this.props.dataChanged([]);
                    this.props.autoModeChanged(event.target.checked);
                  }}
                  disabled={!this.state.canEdit}
                  name="checkRaw"
                  color="primary"
                />
              }
              style={{ flexDirection: 'column-reverse', paddingLeft: 20 }}
              label="Динамическая схема"
            />
          </Grid>
          {!this.state.autoMode ? (
            <React.Fragment>
              <Grid item style={{ width: '57%' }}>
                <Autocomplete
                  key={'automode=false'}
                  disabled={!this.props.canEdit}
                  multiple
                  options={this.props.schema?.allFields ? this.props.schema.allFields : []}
                  getOptionLabel={(option) => option}
                  defaultValue={this.state.tags}
                  disableClearable
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip label={option} {...getTagProps({ index })} disabled={this.props.flattenTags.some((tag) => tag === option)} />
                    ))
                  }
                  onChange={this.onTagsChange}
                  fullWidth={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Список полей, которые не нужно хранить"
                      placeholder="Выбрать поле"
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item style={{ alignItems: 'end', width: '15%' }}>
                <Button
                  disabled={!this.props.canEdit}
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{
                    marginTop: 6,
                    marginBottom: 6,
                    marginLeft: 6,
                    marginRight: 6,
                  }}
                  onClick={() => {
                    this.setState({ isLoading: true });
                    const data: Array<DimensionItem> = [];
                    const schema: Schema = {
                      stringFields: [],
                      longFields: [],
                      doubleFields: [],
                      timestampFields: [],
                      flattenFields: [],
                      nonFlattenFields: this.state.schema?.nonFlattenFields,
                      allFields: [],
                    };
                    KafkaService.createSchemaFromTopic(
                      [this.props.topic],
                      this.props.shouldBeFlattened,
                      false,
                      this.state.tags,
                      (fields) => {
                        Object.keys(fields.messageSchemaMap)
                          .filter((key) => {
                            return key.includes('.');
                          })
                          .forEach((field) => {
                            const flattenField: FlattenItem = {
                              type: 'path',
                              name: field,
                              expr: '$.' + field,
                            };
                            schema.flattenFields.push(flattenField);
                          });
                        Object.keys(fields.messageSchemaMap).forEach((key) => {
                          schema.allFields.push(key);
                          const type = fields.messageSchemaMap[key].elementType;
                          switch (type) {
                            case 'LONG':
                              if (!this.state.tags.some((tag) => tag === key)) {
                                const dimensionItem: DimensionItem = {
                                  name: key,
                                  type: 'long',
                                };
                                data.push(dimensionItem);
                              }
                              schema.longFields.push(key);
                              break;
                            case 'DOUBLE':
                              if (!this.state.tags.some((tag) => tag === key)) {
                                const dimensionItem: DimensionItem = {
                                  name: key,
                                  type: 'double',
                                };
                                data.push(dimensionItem);
                              }
                              schema.doubleFields.push(key);
                              break;
                            case 'TIMESTAMP':
                              if (!this.state.tags.some((tag) => tag === key)) {
                                let dimensionItem: DimensionItem;
                                const format: string = fields.messageSchemaMap[key].format;
                                if (format.startsWith('UNIX')) {
                                  dimensionItem = {
                                    name: key,
                                    type: 'long',
                                  };
                                  schema.longFields.push(key);
                                } else {
                                  dimensionItem = {
                                    name: key,
                                    type: 'string',
                                  };
                                  schema.stringFields.push(key);
                                }
                                data.push(dimensionItem);
                              }
                              schema.timestampFields.push(key);
                              break;
                            default:
                              if (!this.state.tags.some((tag) => tag === key)) {
                                const dimensionItem: DimensionItem = {
                                  name: key,
                                  type: 'string',
                                };
                                data.push(dimensionItem);
                              }
                              schema.stringFields.push(key);
                              break;
                          }
                        });
                        this.setState({ ...this.state, data: data, schema: schema, isLoading: false });
                        this.props.dataChanged(data);
                        this.props.schemaChanged(schema);
                      },
                      (msg) => {
                        this.setState({ isLoading: false });
                        this.props.displayError('Ошибка при генерации схемы. Возможно, сообщения в топике не являются валидными JSON.');
                      },
                    );
                  }}
                >
                  Сгенерировать автоматически
                </Button>
              </Grid>
              <Grid item style={{ alignItems: 'end', width: '5%' }}>
                <Button
                  disabled={!this.props.canEdit}
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{
                    marginTop: 6,
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
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Grid item style={{ width: '82%' }}>
                <Autocomplete
                  key={'automode=true'}
                  options={[]}
                  freeSolo
                  multiple
                  defaultValue={this.state.dimensionExclusions}
                  renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)}
                  onChange={(event, value) => {
                    this.setState({ dimensionExclusions: value });
                    this.props.dimensionExclusionsChange(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Список полей, которые не нужно хранить"
                      placeholder="Введите название поля и нажмите Enter"
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </React.Fragment>
          )}
        </Grid>

        {this.state.isLoading && (
          <Grid container style={{ width: '100%', marginTop: 32, paddingBottom: 32 }} justifyContent="center" alignItems="center">
            <Grid item>
              <CircularProgress disableShrink />
            </Grid>
          </Grid>
        )}
        {!this.state.isLoading && (
          <React.Fragment>
            {this.state.canEdit ? (
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                <Paper style={{ width: '100%', marginTop: 16 }}>
                  <ThemeProvider theme={theme}>
                    <MaterialTable
                      tableRef={this.tableRef}
                      icons={tableIconsWithInvisibleAdd}
                      title="Столбцы"
                      components={{
                        Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
                      }}
                      options={{
                        search: true,
                        paging: false,
                        showTitle: false,
                        actionsColumnIndex: -1,
                        header: true,
                      }}
                      columns={[
                        { title: 'Столбец', field: 'name' },
                        {
                          title: 'Тип',
                          field: 'type',
                          lookup: { double: 'double', long: 'long', string: 'string', array: 'array', sorted_array: 'sorted_array' },
                          initialEditValue: 'long',
                          searchable: false,
                        },
                        {
                          title: 'Подтип',
                          field: 'subType',
                          lookup: {
                            STRING: 'string',
                          },
                          initialEditValue: 'STRING',
                          editComponent: (props) => (
                            <Select
                              value={props.rowData.type === 'array' || props.rowData.type === 'sorted_array' ? props.value : ''}
                              disabled={props.rowData.type !== 'array' && props.rowData.type !== 'sorted_array'}
                              style={{ fontSize: '.8rem', minWidth: 60 }}
                              onChange={(e) => {
                                props.onChange(e.target.value);
                              }}
                            >
                              {['string'].map((value) => {
                                return (
                                  <MenuItem key={value} value={value.toUpperCase()}>
                                    {value}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          ),
                        },
                      ]}
                      data={this.state.data.map((data) => {
                        return data;
                      })}
                      editable={{
                        onRowAdd: (newData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              const isDuplicate =
                                this.props.metricsData.length > 0 && this.props.metricsData.some((item) => item.name === newData.name);
                              if (isDuplicate) {
                                this.props.displayError(this.props.errorMessage);
                                return;
                              }
                              resolve();
                              if ((newData.type === 'array' || newData.type === 'sorted_array') && !newData.subType) {
                                this.props.displayError('Подтип не может быть пустым');
                                return;
                              }
                              if (newData.name === undefined || newData.name.trim().length === 0) {
                                this.props.displayError('Название у столбца не может быть пустым');
                                return;
                              }
                              this.setState((prevState) => {
                                let data = [...prevState.data];
                                data.push(newData);
                                data = this.setNullOnField(data);
                                this.props.dataChanged(data);
                                return { ...prevState, data };
                              });
                            }, 300);
                          }),
                        onRowUpdate: (newData, oldData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              const isDuplicate =
                                this.props.metricsData.length > 0 && this.props.metricsData.some((item) => item.name === newData.name);
                              if (isDuplicate) {
                                this.props.displayError(this.props.errorMessage);
                                return;
                              }
                              resolve();
                              if ((newData.type === 'array' || newData.type === 'sorted_array') && !newData.subType) {
                                this.props.displayError('Подтип не может быть пустым');
                                return;
                              }
                              if (newData.name === undefined || newData.name.trim().length === 0) {
                                this.props.displayError('Название у столбца не может быть пустым');
                                return;
                              }
                              if (oldData) {
                                this.setState((prevState) => {
                                  let data = structuredClone(prevState.data || []);
                                  const index = data.findIndex((value) => value.name === oldData.name);
                                  if (index !== -1) {
                                    data[index] = newData;
                                  }
                                  data = this.setNullOnField(data);
                                  this.props.dataChanged(data);
                                  return { ...prevState, data };
                                });
                              }
                            }, 300);
                          }),
                        onRowDelete: (oldData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              resolve();
                              this.setState((prevState) => {
                                const data = [...prevState.data];
                                data.splice(
                                  data.findIndex((d) => d.name === oldData.name),
                                  1,
                                );
                                this.props.dataChanged(data);
                                return { ...prevState, data };
                              });
                            }, 300);
                          }),
                      }}
                      localization={{
                        toolbar: {
                          searchTooltip: 'Поиск',
                          searchPlaceholder: 'Найти нужный столбец',
                        },
                        body: {
                          emptyDataSourceMessage: !this.state.autoMode
                            ? 'Для того, чтобы схема автоматически сформировалась на основании сообщений из топика,' +
                              ' нажмите на кнопку «Сгенерировать автоматически». ' +
                              'Если Вам не нужны какие-то поля, выберите их выше из выпадающего списка «Список полей, которые не нужно хранить»'
                            : 'Все столбцы определятся автоматически и будут иметь тип String.' +
                              ' Если Вам не нужны какие-то поля, введите их выше в «Список полей, которые не нужно хранить»',
                          addTooltip: '',
                          deleteTooltip: 'Удалить',
                          editTooltip: 'Редактировать',
                          editRow: {
                            deleteText: 'Вы уверены, что хотите удалить столбец?',
                            cancelTooltip: 'Отмена',
                            saveTooltip: 'Подтвердить',
                          },
                        },
                        header: {
                          actions: '',
                        },
                      }}
                    />
                  </ThemeProvider>
                </Paper>
                {!this.state.autoMode && (
                  <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                    <IconButton onClick={this.handleAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                      <AddIcon />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%', minHeight: '500px' }} direction="column">
                <Paper style={{ width: '100%', marginTop: 16 }}>
                  <MaterialTable
                    icons={tableIconsWithInvisibleAdd}
                    title="Столбцы"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                    }}
                    columns={[
                      { title: 'Столбец', field: 'name' },
                      {
                        title: 'Тип',
                        field: 'type',
                        lookup: { double: 'double', long: 'long', string: 'string' },
                        initialEditValue: 'long',
                        searchable: false,
                      },
                    ]}
                    data={this.state.data.map((data) => {
                      return data;
                    })}
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужный столбец',
                      },
                      body: {
                        emptyDataSourceMessage: 'Все столбцы определятся автоматически и будут иметь тип String',
                        addTooltip: '',
                      },
                      header: {
                        actions: '',
                      },
                    }}
                  />
                </Paper>
              </Grid>
            )}
          </React.Fragment>
        )}
        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить все?'}
          open={this.state.confirmDialogDeleteOpen}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />
      </React.Fragment>
    );
  }
}

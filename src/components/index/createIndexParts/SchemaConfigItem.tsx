import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Accordion, AccordionDetails, AccordionSummary, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { createRef } from 'react';
import * as React from 'react';

import { Field, ProcessingPipeline, SchemaPipeline, TimestampNode } from '../../../store/pipeline/Types';
import { PipelineUtils } from '../../../utils/PipelineUtils';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import { Loader } from '../../utils/Loader';
import { SchemaIndex, WrongInput } from '../CreateIndexPage';

export interface TimestampValues {
  inputValue?: string;
  title: string;
}

const filter = createFilterOptions<TimestampValues>();

const exprDynamicField = /(^(\*)(?!\*|\s)+)|((?!\s)*[^*]*(\*))$/gi;

interface SchemaConfigItemProps {
  autoSchema: SchemaIndex;
  schema: SchemaPipeline;
  processing: ProcessingPipeline;
  dateFormats: Array<string>;
  timeZones: Array<string>;
  displayError: any;
  isLoadingSchema: boolean;
  loadingContinue: boolean;

  schemaChanged(schema: SchemaPipeline): any;

  processingChanged(processing: ProcessingPipeline): any;

  wrongInputChanged(wrongInput: WrongInput): any;

  deletedSchemaField(deletedItem: Field): any;
}

interface SchemaConfigItemState {
  schema: SchemaPipeline;
  processing: ProcessingPipeline;
  dateFormats: Array<TimestampValues>;
  initSchema: SchemaPipeline;
  initProcessing: ProcessingPipeline;
}

export default class SchemaConfigItem extends React.Component<SchemaConfigItemProps, SchemaConfigItemState> {
  constructor(props) {
    super(props);

    this.state = {
      schema: {
        fields: this.props.schema.fields || [],
        dynamicFields: this.props.schema.dynamicFields,
        primaryTimeField: this.props.schema.primaryTimeField,
      },
      processing: this.props.processing,
      dateFormats: this.props.dateFormats.map((format) => {
        return {
          title: format,
        };
      }),
    };

    this.props.wrongInputChanged(this.checkWrongInput(this.props.processing, this.props.schema));
  }

  static getDerivedStateFromProps(props, state) {
    if (props.schema !== state.initSchema || props.processing !== state.initProcessing) {
      return {
        initProcessing: props.processing,
        initSchema: {
          fields: props.schema.fields || [],
          dynamicFields: props.schema.dynamicFields,
          primaryTimeField: props.schema.primaryTimeField,
        },
        schema: {
          fields: props.schema.fields || [],
          dynamicFields: props.schema.dynamicFields,
          primaryTimeField: props.schema.primaryTimeField,
        },
        processing: props.processing,
      };
    }
  }

  addTimestampNode(name) {
    const timestampNode: TimestampNode = PipelineUtils.createTimestampNode(name, this.props.autoSchema);
    const processing = this.state.processing;
    processing.convertTimestampParams ? processing.convertTimestampParams.push(timestampNode) : (processing.convertTimestampParams = [timestampNode]);
    this.props.wrongInputChanged(this.checkWrongInput(processing));
    this.setState({ processing: processing });
    this.props.processingChanged(processing);
  }

  checkWrongInput(processing: ProcessingPipeline, schema?: SchemaPipeline): WrongInput {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };
    processing.convertTimestampParams?.forEach((timestampNode) => {
      if (timestampNode.inputFormats.length === 0) {
        wrongInput.wrongInput = true;
        wrongInput.message = `В поле "${timestampNode.field}" не введен исходный формат даты`;
        return wrongInput;
      }
      if (timestampNode.inputTimezone === '' || timestampNode.inputTimezone == null) {
        wrongInput.wrongInput = true;
        wrongInput.message = `В поле "${timestampNode.field}" не введна исходная временная зона`;
        return wrongInput;
      }
      if (timestampNode.outputTimezone === '' || timestampNode.outputTimezone == null) {
        wrongInput.wrongInput = true;
        wrongInput.message = `В поле "${timestampNode.field}" не введна требуемая временная зона`;
        return wrongInput;
      }
    });
    if (schema) {
      let length = schema.fields?.length || 0;
      if (schema.dynamicFields) length += schema.dynamicFields.length;
      if (length === 0) {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Нельзя создать индекс с пустой схемой, добавьте нужные Вам поля.';
        return wrongInput;
      }
    }
    return wrongInput;
  }

  tableDataRef = createRef();
  tableDynamicRef = createRef();

  handleDataAddRow = () => {
    this.tableDataRef.current.state.showAddRow = true;
    const editable = this.state.editable;
    this.setState({
      editable: {
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              this.setState({ editable: editable });
            }, 300);
          }),
      },
    });
  };

  handleDynamicAddRow = () => {
    this.tableDynamicRef.current.state.showAddRow = true;
    const editable = this.state.editable;
    this.setState({
      editable: {
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              this.setState({ editable: editable });
            }, 300);
          }),
      },
    });
  };

  render() {
    return (
      <React.Fragment>
        {((this.props.isLoadingSchema && this.props.loadingContinue) || this.props.loadingContinue) && <Loader />}
        {((!this.props.isLoadingSchema && !this.props.loadingContinue) || !this.props.loadingContinue) && this.renderInfo()}
        {this.props.isLoadingSchema && !this.props.loadingContinue && this.props.displayError('Превышен таймаут запроса на генерацию схемы.')}
      </React.Fragment>
    );
  }

  setNullOnField = (data) => {
    const result = [...data];
    result.map((row) => {
      if (row.fieldType !== 'ARRAY') row.subType = null;
    });
    return result;
  };

  renderInfo() {
    return (
      <React.Fragment>
        <Grid style={{ padding: 12 }}>
          <Accordion defaultExpanded={true} style={{ width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Данные</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                <MaterialTable
                  tableRef={this.tableDataRef}
                  icons={tableIconsWithInvisibleAdd}
                  style={{ width: '100%' }}
                  title="Поля данных"
                  components={{
                    Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
                  }}
                  options={{
                    search: true,
                    paging: false,
                    showTitle: false,
                    actionsColumnIndex: -1,
                    header: true,
                    toolbarButtonAlignment: 'left',
                    searchFieldAlignment: 'left',
                  }}
                  columns={[
                    { title: 'Поле', field: 'name' },
                    {
                      title: 'Тип поля',
                      field: 'fieldType',
                      lookup: PipelineUtils.getIndexTypes(),
                      initialEditValue: 'STRING',
                    },
                    {
                      title: 'Подтип',
                      field: 'subType',
                      lookup: PipelineUtils.getIndexSubTypes(),
                      // editable: (columnDef, rowData) => rowData.
                      initialEditValue: 'STRING',
                      editComponent: (props) => (
                        <Select
                          value={props.rowData.fieldType === 'ARRAY' ? props.value : ''}
                          disabled={props.rowData.fieldType !== 'ARRAY'}
                          style={{ fontSize: '.8rem', minWidth: 60 }}
                          onChange={(e) => props.onChange(e.target.value)}
                        >
                          {['string', 'int', 'double', 'long', 'date', 'uuid', 'boolean'].map((value) => {
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
                  data={this.state.schema.fields
                    ?.filter((field) => {
                      return (
                        !this.props.processing.copyFieldParams?.some((node) => node.toFields[0] === field.name) &&
                        !this.props.processing.addCurrentTimeParams?.some((node) => node.toField === field.name) &&
                        !this.props.processing.generateUuidParams?.some((node) => node.toField === field.name)
                      );
                    })
                    .map((data) => {
                      return data;
                    })}
                  editable={{
                    isDeleteHidden: () => false,
                    onRowAdd: (newData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          this.setState((prevState) => {
                            if (newData.name === '' || newData.name == null) {
                              this.props.displayError('Имя поля не может быть пустым');
                              return;
                            }
                            if (newData.fieldType === 'ARRAY' && !newData.subType) {
                              this.props.displayError('Подтип не может быть пустым');
                              return;
                            }
                            const schema = prevState.schema;
                            if (PipelineUtils.isFieldNotUnique(newData.name, schema)) {
                              this.props.displayError('Поле с таким именем уже существует');
                              return;
                            }
                            if (PipelineUtils.isFieldDate(newData)) {
                              this.addTimestampNode(newData.name);
                            }
                            const data = structuredClone(prevState.schema.fields || []).concat([newData]);

                            schema.fields = this.setNullOnField(data);
                            this.props.wrongInputChanged(this.checkWrongInput(this.state.processing));
                            this.props.schemaChanged(schema);
                            return { ...prevState, schema };
                          });
                        }, 300);
                      }),
                    onRowUpdate: (newData, oldData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          if (oldData) {
                            this.setState((prevState) => {
                              if (newData.name === '' || newData.name == null) {
                                this.props.displayError('Имя поля не может быть пустым');
                                return;
                              }
                              if (newData.fieldType === 'ARRAY' && !newData.subType) {
                                this.props.displayError('Подтип не может быть пустым');
                                return;
                              }
                              const schema = prevState.schema;
                              if (newData.name !== oldData.name) {
                                if (PipelineUtils.isFieldNotUnique(newData.name, schema)) {
                                  this.props.displayError('Поле с таким именем уже существует');
                                  return;
                                }
                              }
                              let data = structuredClone(prevState.schema.fields || []);
                              const index = data.findIndex((value) => value.name === oldData.name);
                              if (index !== -1) {
                                data[index] = newData;
                              }

                              if (PipelineUtils.isFieldDate(newData) && !PipelineUtils.isFieldDate(oldData)) {
                                this.addTimestampNode(newData.name);
                              } else if (PipelineUtils.isFieldDate(oldData) && PipelineUtils.isFieldDate(newData)) {
                                const processing = this.props.processing;
                                processing.convertTimestampParams = processing.convertTimestampParams?.map((node) => {
                                  if (node.field === oldData.name) {
                                    node.field = newData.name;
                                  }
                                  return node;
                                });
                                this.setState({ processing: processing });
                                this.props.processingChanged(processing);
                              } else if (oldData.fieldType === 'DATE' && newData.fieldType !== 'DATE') {
                                const processing = this.props.processing;
                                processing.convertTimestampParams = processing.convertTimestampParams?.filter((node) => {
                                  return node.field !== oldData.name;
                                });
                                this.setState({ processing: processing });
                                this.props.processingChanged(processing);
                              } else if (oldData.fieldType !== newData.fieldType) {
                                data = data.map((item) => {
                                  if (item.name === newData.name && item.name === oldData.name) {
                                    return { ...item, ...oldData, ...newData };
                                  }
                                  return item;
                                });
                              }
                              schema.fields = this.setNullOnField(data);
                              this.props.wrongInputChanged(this.checkWrongInput(this.state.processing));
                              this.props.schemaChanged(schema);
                              return { ...prevState, schema };
                            });
                          }
                        }, 300);
                      }),
                    onRowDelete: (oldData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          this.setState((prevState) => {
                            const data = [...prevState.schema.fields];
                            data.splice(
                              data.findIndex((d) => d.name === oldData.name),
                              1,
                            );
                            if (PipelineUtils.isFieldDate(oldData)) {
                              const processing = this.props.processing;
                              processing.convertTimestampParams = processing.convertTimestampParams?.filter((node) => {
                                return node.field !== oldData.name;
                              });
                              this.setState({ processing: processing });
                              this.props.processingChanged(processing);
                            }
                            const schema = prevState.schema;
                            schema.fields = data;
                            this.props.wrongInputChanged(this.checkWrongInput(this.state.processing));
                            this.props.schemaChanged(schema);
                            this.props.deletedSchemaField(oldData);
                            return { ...prevState, schema };
                          });
                        }, 300);
                      }),
                  }}
                  localization={{
                    toolbar: {
                      searchTooltip: 'Поиск',
                      searchPlaceholder: 'Найти нужное поле',
                    },
                    body: {
                      emptyDataSourceMessage: 'Полей в схеме нет',
                      addTooltip: 'Добавить',
                      deleteTooltip: 'Удалить',
                      editTooltip: 'Редактировать',
                      editRow: {
                        deleteText: 'Вы уверены, что хотите удалить поле?',
                        cancelTooltip: 'Отмена',
                        saveTooltip: 'Подтвердить',
                      },
                    },
                    header: {
                      actions: '',
                    },
                  }}
                />
                <IconButton onClick={this.handleDataAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                  <AddIcon />
                </IconButton>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false} style={{ width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Динамические поля</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                <MaterialTable
                  tableRef={this.tableDynamicRef}
                  icons={tableIconsWithInvisibleAdd}
                  style={{ width: '100%' }}
                  title="Динамическе поля"
                  components={{
                    Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
                  }}
                  options={{
                    search: true,
                    paging: false,
                    showTitle: false,
                    actionsColumnIndex: -1,
                    header: true,
                    toolbarButtonAlignment: 'left',
                    searchFieldAlignment: 'left',
                  }}
                  columns={[
                    { title: 'Поле', field: 'name' },
                    {
                      title: 'Тип поля',
                      field: 'fieldType',
                      lookup: {
                        STRING: 'string',
                        TEXT: 'text',
                        INT: 'int',
                        DOUBLE: 'double',
                        LONG: 'long',
                        UUID: 'uuid',
                        BOOLEAN: 'boolean',
                      },
                      initialEditValue: 'TEXT',
                    },
                  ]}
                  data={
                    this.state.schema.dynamicFields
                      ? this.state.schema.dynamicFields.map((data) => {
                          return data;
                        })
                      : []
                  }
                  editable={{
                    isDeleteHidden: (rowData) => false,
                    onRowAdd: (newData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          this.setState((prevState) => {
                            if (newData.name === '' || newData.name == null) {
                              this.props.displayError('Имя динамического поля не может быть пустым');
                              return;
                            }
                            if (newData.name.match(exprDynamicField) == null || newData.name.match(exprDynamicField).length > 1) {
                              this.props.displayError('В имени динамического поля должна быть одна * (в начале или в конце)');
                              return;
                            }
                            const data = prevState.schema.dynamicFields;
                            const schema = prevState.schema;
                            if (PipelineUtils.isFieldNotUnique(newData.name, schema)) {
                              this.props.displayError('Поле с таким именем уже существует');
                              return;
                            }
                            if (data != null) {
                              data.push(newData);
                              schema.dynamicFields = data;
                            } else {
                              schema.dynamicFields = [newData];
                            }
                            this.props.wrongInputChanged(this.checkWrongInput(this.state.processing));
                            this.props.schemaChanged(schema);
                            return { ...prevState, schema };
                          });
                        }, 300);
                      }),
                    onRowUpdate: (newData, oldData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          if (oldData) {
                            this.setState((prevState) => {
                              if (newData.name === '' || newData.name == null) {
                                this.props.displayError('Имя динамического поля не может быть пустым');
                                return;
                              }
                              if (newData.name.match(exprDynamicField) == null || newData.name.match(exprDynamicField).length > 1) {
                                this.props.displayError('В имени динамического поля должна быть одна * (в начале или в конце)');
                                return;
                              }
                              const schema = prevState.schema;
                              if (newData.name !== oldData.name) {
                                if (PipelineUtils.isFieldNotUnique(newData.name, schema)) {
                                  this.props.displayError('Поле с таким именем уже существует');
                                  return;
                                }
                              }
                              const data = structuredClone(prevState.schema.dynamicFields || []);
                              const index = data.findIndex((value) => value.name === oldData.name);
                              if (index !== -1) {
                                data[index] = newData;
                              }

                              schema.dynamicFields = data;
                              this.props.wrongInputChanged(this.checkWrongInput(this.state.processing));
                              this.props.schemaChanged(schema);
                              return { ...prevState, schema };
                            });
                          }
                        }, 300);
                      }),
                    onRowDelete: (oldData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          this.setState((prevState) => {
                            const data = structuredClone(prevState.schema.dynamicFields || []);
                            const index = data.findIndex((value) => value.name === oldData.name);
                            if (index !== -1) {
                              data.splice(index, 1);
                            }

                            const schema = prevState.schema;
                            schema.dynamicFields = data;
                            this.props.wrongInputChanged(this.checkWrongInput(this.state.processing));
                            this.props.schemaChanged(schema);
                            return { ...prevState, schema };
                          });
                        }, 300);
                      }),
                  }}
                  localization={{
                    toolbar: {
                      searchTooltip: 'Поиск',
                      searchPlaceholder: 'Найти нужное поле',
                    },
                    body: {
                      emptyDataSourceMessage: 'Динамических полей в схеме нет',
                      addTooltip: 'Добавить',
                      deleteTooltip: 'Удалить',
                      editTooltip: 'Редактировать',
                      editRow: {
                        deleteText: 'Вы уверены, что хотите удалить поле?',
                        cancelTooltip: 'Отмена',
                        saveTooltip: 'Подтвердить',
                      },
                    },
                    header: {
                      actions: '',
                    },
                  }}
                />
                <IconButton onClick={this.handleDynamicAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                  <AddIcon />
                </IconButton>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={true} style={{ width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Даты</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                <MaterialTable
                  icons={tableIconsWithInvisibleAdd}
                  style={{ width: '100%' }}
                  title="Даты"
                  components={{
                    Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
                  }}
                  options={{
                    search: true,
                    paging: false,
                    showTitle: false,
                    actionsColumnIndex: -1,
                    header: true,
                    toolbarButtonAlignment: 'left',
                    searchFieldAlignment: 'left',
                  }}
                  columns={[
                    { title: 'Поле времени', field: 'field', editable: 'never', width: '10%' },
                    {
                      title: 'Исходный формат времени',
                      field: 'inputFormats',
                      editable: 'always',
                      editComponent: (props) => (
                        <Autocomplete
                          multiple
                          // disabled={!this.props.canEdit}
                          options={this.props.dateFormats}
                          getOptionLabel={(option) => option}
                          defaultValue={props.rowData.inputFormats ? props.rowData.inputFormats : []}
                          onChange={(_, values) => {
                            props.onChange(values);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label="Исходный формат времени"
                              placeholder="Выбрать формат(ы)"
                              margin="normal"
                              fullWidth
                            />
                          )}
                        />
                      ),
                      render: (data) =>
                        data.inputFormats == null || data.inputFormats.length === 0 ? (
                          <Typography style={{ color: 'red' }}> Значение не введено</Typography>
                        ) : (
                          <Typography> {data.inputFormats.join(', ')} </Typography>
                        ),
                    },
                    {
                      title: 'Исходная временная зона',
                      field: 'inputTimezone',
                      type: 'string',
                      editComponent: (props) => (
                        <Autocomplete
                          options={this.props.timeZones}
                          renderOption={(option) => {
                            return option;
                          }}
                          getOptionLabel={(option) => {
                            return option;
                          }}
                          defaultValue={props.rowData.inputTimezone ? props.rowData.inputTimezone : ''}
                          onChange={(event, newValue) => {
                            props.onChange(newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label="Исходная временная зона"
                              placeholder="Выберите временную зону"
                              margin="normal"
                              fullWidth
                            />
                          )}
                        />
                      ),
                      render: (data) => <Typography> {data.inputTimezone ? data.inputTimezone : ''}</Typography>,
                    },
                    {
                      title: 'Требуемая временная зона',
                      field: 'outputTimezone',
                      type: 'string',
                      emptyValue: 'UTC',
                      editable: 'never',
                    },
                    {
                      field: 'outputFormat',
                      hidden: true,
                    },
                  ]}
                  data={
                    this.props.processing.convertTimestampParams
                      ? this.props.processing.convertTimestampParams.map((node) => {
                          return node;
                        })
                      : []
                  }
                  editable={{
                    isDeletable: () => false,
                    isDeleteHidden: () => true,
                    onRowUpdate: (newData, oldData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          if (oldData) {
                            this.setState((prevState) => {
                              if (newData.inputTimezone === '' || newData.inputTimezone == null) {
                                this.props.displayError('Исходная временная зона не выбрана');
                                return;
                              }
                              if (newData.inputFormats.length === 0) {
                                this.props.displayError('Исходный формат времени не выбран');
                                return;
                              }
                              const data = this.props.processing.convertTimestampParams || [];
                              const index = data.findIndex((value) => value.field === oldData.field);

                              if (index !== -1) {
                                data[index] = newData;
                              }

                              const processing = this.state.processing;
                              processing.convertTimestampParams = data;
                              this.props.wrongInputChanged(this.checkWrongInput(processing));
                              this.props.processingChanged(processing);
                              return { ...prevState, processing };
                            });
                          }
                        }, 300);
                      }),
                    onRowDelete: (oldData) =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve();
                          this.setState((prevState) => {
                            const data = structuredClone(this.props.processing.convertTimestampParams || []);
                            const index = data.findIndex((value) => value.field === oldData.field);
                            if (index !== -1) {
                              data.splice(index, 1);
                            }
                            const processing = this.state.processing;
                            processing.convertTimestampParams = data;
                            this.props.wrongInputChanged(this.checkWrongInput(processing));
                            this.props.processingChanged(processing);
                            return { ...prevState, processing };
                          });
                        }, 300);
                      }),
                  }}
                  localization={{
                    toolbar: {
                      searchTooltip: 'Поиск',
                      searchPlaceholder: 'Найти нужное поле',
                    },
                    body: {
                      emptyDataSourceMessage: 'Полей с типом "Дата" в схеме нет',
                      addTooltip: '',
                      editTooltip: 'Редактировать',
                      editRow: {
                        cancelTooltip: 'Отмена',
                        saveTooltip: 'Подтвердить',
                      },
                    },
                    header: {
                      actions: '',
                    },
                  }}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </React.Fragment>
    );
  }
}

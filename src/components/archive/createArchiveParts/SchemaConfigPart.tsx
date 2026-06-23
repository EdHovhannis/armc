import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Accordion, AccordionDetails, AccordionSummary, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Autocomplete } from '@material-ui/lab';
import { createRef } from 'react';
import * as React from 'react';

import { ArchiveProcessing, ArchiveSchema, Field } from '../../../store/archive/Types';
import { ArchiveUtils } from '../../../utils/ArchiveUtils';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import { Loader } from '../../utils/Loader';
import { SchemaArchive, WrongInput } from '../ArchiveEditorForm';

export interface TimestampValues {
  inputValue?: string;
  title: string;
}

const LOCAL = {
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
};

const LOCAL_DATE = {
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
};

interface SchemaConfigPartProps {
  canEdit: boolean;
  autoSchema: SchemaArchive;
  schema: ArchiveSchema;
  processing: ArchiveProcessing;
  dateFormats: Array<string>;
  timeZones: Array<string>;
  isLoadingSchema: boolean;
  loadingContinue: boolean;

  displayError(error: string): any;

  schemaChanged(schema: ArchiveSchema): any;

  wrongInputChanged(wrongInput: WrongInput): any;

  deletedSchemaField(deletedItem: Field): any;
}

interface SchemaConfigPartState {
  schema: ArchiveSchema;
  dateFormats: Array<TimestampValues>;
}

export default class SchemaConfigPart extends React.Component<SchemaConfigPartProps, SchemaConfigPartState> {
  constructor(props) {
    super(props);

    this.state = {
      schema: this.props.schema,
      dateFormats: this.props.dateFormats.map((format) => {
        return {
          title: format,
        };
      }),
    };

    this.props.wrongInputChanged(this.checkWrongInput(this.props.schema));
  }

  checkWrongInput(schema?: ArchiveSchema): WrongInput {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };

    if (schema) {
      const length = schema.fields?.length || 0;
      if (length === 0) {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Нельзя создать архив с пустой схемой, добавьте нужные Вам поля.';
        return wrongInput;
      }
      schema.fields
        .filter((field) => ArchiveUtils.isFieldDate(field))
        .map((field) => {
          if (field.format == null || field.format == '') {
            wrongInput.wrongInput = true;
            wrongInput.message = 'У поля времени ' + field.name + ' не введен формат.';
            return wrongInput;
          }
        });
    }
    return wrongInput;
  }

  tableDataRef = createRef();

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
      if (row.type !== 'ARRAY') row.subType = null;
    });
    return result;
  };

  renderInfo() {
    const dateSchemaFields = this.state.schema.fields.filter((field) => ArchiveUtils.isFieldDate(field));

    return (
      <React.Fragment>
        <Grid style={{ padding: 12 }}>
          <Accordion defaultExpanded={true} style={{ width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Данные</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                {this.props.canEdit ? (
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
                      { field: 'id', hidden: true },
                      { title: 'Поле', field: 'name' },
                      {
                        title: 'Тип поля',
                        field: 'type',
                        lookup: {
                          STRING: 'string',
                          TEXT: 'text',
                          INT: 'int',
                          DOUBLE: 'double',
                          LONG: 'long',
                          DATE: 'date',
                          BOOLEAN: 'boolean',
                          ARRAY: 'array',
                        },
                        initialEditValue: 'STRING',
                      },
                      {
                        title: 'Подтип',
                        field: 'subType',
                        lookup: {
                          STRING: 'string',
                          INT: 'int',
                          DOUBLE: 'double',
                          LONG: 'long',
                          DATE: 'date',
                          BOOLEAN: 'boolean',
                        },
                        initialEditValue: 'STRING',
                        editComponent: (props) => {
                          return (
                            <Select
                              value={props.rowData.type === 'ARRAY' ? props.value : ''}
                              disabled={props.rowData.type !== 'ARRAY'}
                              style={{ fontSize: '.8rem', minWidth: 60 }}
                              onChange={(e) => {
                                props.onChange(e.target.value);
                              }}
                            >
                              {['string', 'int', 'double', 'long', 'date', 'boolean'].map((value) => {
                                return (
                                  <MenuItem key={value} value={value.toUpperCase()}>
                                    {value}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          );
                        },
                      },
                      {
                        title: 'format',
                        field: 'format',
                        hidden: true,
                      },
                    ]}
                    data={this.state.schema.fields
                      ?.filter((field) => {
                        return !this.props.processing.copyField?.some((node) => node.to[0] === field.name);
                      })
                      .map((data, ind) => {
                        return { ...data, id: ind };
                      })}
                    editable={{
                      isDeleteHidden: (rowData) => false,
                      onRowAdd: (newData) =>
                        new Promise((resolve) => {
                          setTimeout(() => {
                            resolve();
                            this.setState((prevState) => {
                              if (newData.name === '' || newData.name == null) {
                                this.props.displayError('Имя поля не может быть пустым');
                                return;
                              }
                              if (newData.type === 'ARRAY' && !newData.subType) {
                                this.props.displayError('Подтип не может быть пустым');
                                return;
                              }
                              const data = [...prevState.schema.fields];
                              data.push(newData);
                              const schema = prevState.schema;
                              if (ArchiveUtils.isFieldNotUnique(newData.name, schema, this.props.processing)) {
                                this.props.displayError('Поле с таким именем уже существует');
                                return;
                              }
                              schema.fields = this.setNullOnField(data);
                              this.props.wrongInputChanged(this.checkWrongInput(schema));
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
                                if (newData.type === 'ARRAY' && !newData.subType) {
                                  this.props.displayError('Подтип не может быть пустым');
                                  return;
                                }
                                const data = [...prevState.schema.fields];
                                data[oldData.id] = newData;
                                const schema = prevState.schema;
                                if (newData.name !== oldData.name) {
                                  if (ArchiveUtils.isFieldNotUnique(newData.name, schema, this.props.processing)) {
                                    this.props.displayError('Поле с таким именем уже существует');
                                    return;
                                  }
                                }
                                schema.fields = this.setNullOnField(data);

                                this.props.wrongInputChanged(this.checkWrongInput(schema));
                                this.props.schemaChanged(schema);
                                return { ...prevState, schema };
                              });
                            }
                          }, 300);
                        }),
                      onRowDelete: (oldData) =>
                        new Promise((resolve) => {
                          setTimeout(() => {
                            resolve(undefined);
                            this.setState((prevState) => {
                              const data = prevState.schema.fields.filter((field) => field.name !== oldData.name);
                              const schema = prevState.schema;
                              schema.fields = data;
                              this.props.wrongInputChanged(this.checkWrongInput(schema));
                              this.props.schemaChanged(schema);
                              this.props.deletedSchemaField(oldData);
                              return { ...prevState, schema };
                            });
                          }, 300);
                        }),
                    }}
                    localization={LOCAL}
                  />
                ) : (
                  <MaterialTable
                    icons={tableIconsWithInvisibleAdd}
                    style={{ width: '100%' }}
                    title="Поля данных"
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
                        field: 'type',
                        lookup: {
                          STRING: 'string',
                          TEXT: 'text',
                          INT: 'int',
                          DOUBLE: 'double',
                          LONG: 'long',
                          DATE: 'date',
                          BOOLEAN: 'boolean',
                        },
                        initialEditValue: 'STRING',
                      },
                      {
                        title: 'format',
                        field: 'format',
                        hidden: true,
                      },
                    ]}
                    data={this.state.schema.fields
                      ?.filter((field) => {
                        return !this.props.processing.copyField?.some((node) => node.to[0] === field.name);
                      })
                      .map((data) => {
                        return data;
                      })}
                    localization={LOCAL}
                  />
                )}
                {this.props.canEdit && (
                  <IconButton onClick={this.handleDataAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                    <AddIcon />
                  </IconButton>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={true} style={{ width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Даты</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                {this.props.canEdit ? (
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
                      { title: 'Поле времени', field: 'name', editable: 'never', width: '10%' },
                      { title: 'type', field: 'type', hidden: true, editable: 'never' },
                      {
                        title: 'Исходный формат времени',
                        field: 'format',
                        editable: 'always',
                        editComponent: (props) => (
                          <Autocomplete
                            // disabled={!this.props.canEdit}
                            options={this.props.dateFormats}
                            getOptionLabel={(option) => option}
                            defaultValue={props.rowData.format ? props.rowData.format : ''}
                            onChange={(event, values) => {
                              props.onChange(values);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                label="Исходный формат времени"
                                placeholder="Выбрать формат"
                                margin="normal"
                                fullWidth
                              />
                            )}
                          />
                        ),
                        render: (data) =>
                          data.format == null || data.format.length === 0 ? (
                            <Typography style={{ color: 'red' }}> Значение не введено</Typography>
                          ) : (
                            <Typography> {data.format} </Typography>
                          ),
                      },
                    ]}
                    data={dateSchemaFields}
                    editable={{
                      isDeletable: (rowData) => false,
                      isDeleteHidden: (rowData) => true,
                      onRowUpdate: (newData, oldData) =>
                        new Promise((resolve) => {
                          setTimeout(() => {
                            resolve();
                            if (oldData) {
                              this.setState((prevState) => {
                                if (newData.format === '' || newData.format == null) {
                                  this.props.displayError('Исходный формат времени не выбран');
                                  return;
                                }
                                const data = [...prevState.schema.fields];
                                const index = data.findIndex((field) => field.name === oldData.name);
                                data[index] = newData;
                                const schema = prevState.schema;
                                schema.fields = data;
                                this.props.wrongInputChanged(this.checkWrongInput(schema));
                                this.props.schemaChanged(schema);
                                return { ...prevState, schema };
                              });
                            }
                          }, 300);
                        }),
                    }}
                    localization={LOCAL_DATE}
                  />
                ) : (
                  <MaterialTable
                    icons={tableIconsWithInvisibleAdd}
                    style={{ width: '100%' }}
                    title="Даты"
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
                      { title: 'Поле времени', field: 'name', editable: 'never', width: '10%' },
                      { title: 'type', field: 'type', hidden: true, editable: 'never' },
                      {
                        title: 'Исходный формат времени',
                        field: 'format',
                        editable: 'always',
                        render: (data) =>
                          data.format == null || data.format.length === 0 ? (
                            <Typography style={{ color: 'red' }}> Значение не введено</Typography>
                          ) : (
                            <Typography> {data.format} </Typography>
                          ),
                      },
                    ]}
                    data={dateSchemaFields}
                    localization={LOCAL_DATE}
                  />
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </React.Fragment>
    );
  }
}

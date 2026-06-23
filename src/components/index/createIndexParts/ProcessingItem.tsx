import MaterialTable, { MTableToolbar } from '@material-table/core';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import { Autocomplete } from '@material-ui/lab';
import * as _ from 'lodash';
import * as React from 'react';
import { createRef } from 'react';

import { HtmlTooltip } from '../../../containers/App';
import ConfigService from '../../../services/ConfigService';
import {
  AddCurrentTimeNode,
  CopyFieldNode,
  Field,
  GenerateUUIDNode,
  MessageFilterCondition,
  MessageFilterType,
  ProcessingPipeline,
  SchemaPipeline,
} from '../../../store/pipeline/Types';
import { PipelineUtils } from '../../../utils/PipelineUtils';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import { FieldCopy } from '../../processing/FieldCopy';
import { TransformArray } from '../../processing/TransformArray';
import { PipelineTransformArrayDates } from '../../processing/TransformArray/Dates/PipelineTransformArrayDates';
import { TransformArrayTooltip } from '../../processing/TransformArray/TransformArrayTooltip';
import * as transformHelpers from '../../processing/TransformArray/functions/index';

export interface ProcessingItemProps {
  processing: ProcessingPipeline;
  schema: SchemaPipeline;
  dateFormats: Array<string>;
  timeZones: Array<string>;

  displayError(msg: string): any;

  processingChanged(processing: ProcessingPipeline): any;

  schemaChanged(schema: SchemaPipeline): any;
}

export interface ProcessingItemState {
  processing: ProcessingPipeline;
  schema: SchemaPipeline;

  maxMessageFilterCount: number;

  filterConditionType: MessageFilterType.OR | MessageFilterType.AND;
  filterDlqEnable: boolean;
  filterDlqLabel: string;
}

export default class ProcessingItem extends React.Component<ProcessingItemProps, ProcessingItemState> {
  constructor(props) {
    super(props);
    this.state = {
      processing: this.props.processing,
      schema: this.props.schema,
      filterConditionType: this.props.processing.messageFilter?.condition?.type || MessageFilterType.AND,
      filterDlqEnable: this.props.processing.messageFilter?.dlqEnabled || false,
      filterDlqLabel: this.props.processing.messageFilter?.dlqEnabled ? 'Отправлять в DLQ' : 'Игнорировать',
      maxMessageFilterCount: 5,
    };
  }

  componentDidMount() {
    ConfigService.getIndexConfig(
      'fulltext',
      (config) => {
        this.setState({
          maxMessageFilterCount: config.maxMessageFilterCount || 5,
        });
      },
      (error) => {
        this.props.displayError('Ошибка при попытке максимального допустимого количества фильтров: ' + error);
      },
    );
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
              this.setState({ editable: editable });
            }, 300);
          }),
      },
    });
  };

  tableUIDRef = createRef();

  handleUIDAddRow = () => {
    this.tableUIDRef.current.state.showAddRow = true;
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

  tableTimeRef = createRef();

  handleTimeAddRow = () => {
    this.tableTimeRef.current.state.showAddRow = true;
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

  tableCopyRef = createRef();

  handleCopyAddRow = () => {
    this.tableCopyRef.current.state.showAddRow = true;
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
        <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Копирование поля</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
              <MaterialTable
                tableRef={this.tableCopyRef}
                icons={tableIconsWithInvisibleAdd}
                style={{ width: '100%', margin: 6 }}
                title="Processing Fields"
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
                  {
                    title: 'Имя поля',
                    field: 'toFields',
                    editComponent: (props) => (
                      <TextField
                        variant="standard"
                        label="Имя поля"
                        placeholder="Введите имя"
                        margin="normal"
                        fullWidth
                        defaultValue={props.rowData.toFields}
                        onChange={(event) => {
                          props.onChange(event.target.value);
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Поле для копирования',
                    field: 'fromField',
                    editComponent: (props) => (
                      <Autocomplete
                        options={this.state.schema.fields
                          .filter((field) => {
                            return (
                              !this.state.processing.copyFieldParams?.some((node) => {
                                return node.toFields[0] === field.name;
                              }) &&
                              !this.state.processing.generateUuidParams?.some((node) => {
                                return node.toField === field.name;
                              }) &&
                              !this.state.processing.addCurrentTimeParams?.some((node) => {
                                return node.toField === field.name;
                              })
                            );
                          })
                          .map((field) => {
                            return field.name;
                          })}
                        renderOption={(option) => {
                          return option;
                        }}
                        getOptionLabel={(option) => {
                          return option;
                        }}
                        defaultValue={props.rowData.fromField ? props.rowData.fromField : ''}
                        onChange={(event, newValue) => {
                          props.onChange(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Поле для копирования"
                            placeholder="Выберите поле, которое Вы хотите скопировать"
                            margin="normal"
                            fullWidth
                          />
                        )}
                      />
                    ),
                    render: (data) => <Typography> {data.fromField ? data.fromField : ''}</Typography>,
                  },
                ]}
                data={
                  this.state.processing.copyFieldParams
                    ? this.state.processing.copyFieldParams.map((data) => {
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
                          if (!newData.toFields || newData.toFields.length === 0) {
                            this.props.displayError('Имя поля не может быть пустым');
                            return;
                          }
                          if (newData.fromField === '' || newData.fromField == null) {
                            this.props.displayError('Поле для копирования не может быть пустым');
                            return;
                          }
                          const processingNode: CopyFieldNode = {
                            toFields: [newData.toFields],
                            fromField: newData.fromField,
                          };
                          const schema = this.state.schema;
                          const addedField: Field = {
                            name: newData.toFields,
                            fieldType: schema.fields
                              .filter((field) => {
                                return field.name === newData.fromField;
                              })
                              .map((field) => {
                                return field.fieldType;
                              })[0],
                          };
                          if (PipelineUtils.isFieldNotUnique(addedField.name, prevState.schema)) {
                            this.props.displayError('Поле с таким именем уже существует');
                            return;
                          }
                          const data = [...prevState.schema.fields];
                          data.push(addedField);
                          schema.fields = data;
                          const processing = this.state.processing;
                          if (processing.copyFieldParams) {
                            processing.copyFieldParams.push(processingNode);
                          } else {
                            processing.copyFieldParams = [processingNode];
                          }
                          this.props.schemaChanged(schema);
                          this.props.processingChanged(processing);
                          return { ...prevState, processing, schema };
                        });
                      }, 300);
                    }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        if (oldData) {
                          this.setState((prevState) => {
                            const destination: string = Array.isArray(newData.toFields) ? newData.toFields[0] || '' : newData.toFields || '';
                            const source = newData.fromField;
                            if (!destination || destination.length === 0) {
                              this.props.displayError('Имя поля не может быть пустым');
                              return;
                            }
                            if (source === '' || source == null) {
                              this.props.displayError('Поле для копирования не может быть пустым');
                              return;
                            }
                            const schema = this.state.schema;
                            const changedField: Field = {
                              name: destination,
                              fieldType: schema.fields
                                .filter((field) => {
                                  return field.name === source;
                                })
                                .map((field) => {
                                  return field.fieldType;
                                })[0],
                            };
                            if (destination !== oldData.toFields[0]) {
                              if (PipelineUtils.isFieldNotUnique(destination, prevState.schema)) {
                                this.props.displayError('Поле с таким именем уже существует');
                                return;
                              }
                            }
                            const updatedFields = prevState.schema.fields
                              .filter((field) => {
                                return field.name !== oldData.toFields[0];
                              })
                              .concat(changedField);

                            const updatedSchema = {
                              ...prevState.schema,
                              fields: updatedFields,
                            };
                            const processingNode: CopyFieldNode = {
                              toFields: [destination],
                              fromField: source,
                            };
                            const updatedProcessing = _.cloneDeep(this.state.processing);
                            updatedProcessing.copyFieldParams = updatedProcessing.copyFieldParams?.map((f) => {
                              return f.fromField === oldData.fromField && f.toFields[0] === oldData.toFields[0] ? processingNode : f;
                            });
                            this.props.schemaChanged(updatedSchema);
                            this.props.processingChanged(updatedProcessing);
                            return { ...prevState, processing: updatedProcessing, schema: updatedSchema };
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
                          const schema = prevState.schema;
                          data.splice(
                            data.findIndex((field) => field.name === oldData.toFields[0]),
                            1,
                          );
                          schema.fields = data;
                          let processing = this.state.processing;
                          processing.copyFieldParams = processing.copyFieldParams?.filter((node) => {
                            return node.toFields !== oldData.toFields;
                          });
                          if (processing.copyFieldParams?.length === 0) {
                            processing = {
                              flattenJsonParam: processing.flattenJsonParam,
                              convertTimestampParams: processing.convertTimestampParams,
                              generateUuidParams: processing.generateUuidParams,
                              addCurrentTimeParams: processing.addCurrentTimeParams,
                            };
                          }
                          this.props.processingChanged(processing);
                          this.props.schemaChanged(schema);
                          return { ...prevState, schema, processing };
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
                    emptyDataSourceMessage: 'Полей, созданных с помощью копирования, в схеме нет',
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
              <IconButton onClick={this.handleCopyAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                <AddIcon />
              </IconButton>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Генерация уникального id</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
              <MaterialTable
                tableRef={this.tableUIDRef}
                icons={tableIconsWithInvisibleAdd}
                style={{ width: '100%', margin: 6 }}
                title="Generate UUID Fields"
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
                  {
                    title: 'Имя поля',
                    field: 'toField',
                    editComponent: (props) => (
                      <TextField
                        variant="standard"
                        label="Имя поля"
                        placeholder="Введите имя"
                        margin="normal"
                        fullWidth
                        defaultValue={props.rowData.toField}
                        onChange={(event) => {
                          props.onChange(event.target.value);
                        }}
                      />
                    ),
                  },
                ]}
                data={
                  this.state.processing.generateUuidParams
                    ? this.state.processing.generateUuidParams.map((data) => {
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
                          if (newData.toField.length === 0) {
                            this.props.displayError('Имя поля не может быть пустым');
                            return;
                          }
                          const processingNode: GenerateUUIDNode = {
                            toField: newData.toField,
                          };
                          const schema = this.state.schema;
                          const addedField: Field = {
                            name: newData.toField,
                            fieldType: 'UUID',
                          };
                          if (PipelineUtils.isFieldNotUnique(newData.toField, prevState.schema)) {
                            this.props.displayError('Поле с таким именем уже существует');
                            return;
                          }
                          const data = [...prevState.schema.fields];
                          data.push(addedField);
                          schema.fields = data;
                          const processing = this.state.processing;
                          if (processing.generateUuidParams) {
                            processing.generateUuidParams.push(processingNode);
                          } else {
                            processing.generateUuidParams = [processingNode];
                          }
                          this.props.schemaChanged(schema);
                          this.props.processingChanged(processing);
                          return { ...prevState, processing, schema };
                        });
                      }, 300);
                    }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        if (oldData) {
                          this.setState((prevState) => {
                            if (newData.toField.length === 0) {
                              this.props.displayError('Имя поля не может быть пустым');
                              return prevState;
                            }
                            const changedField: Field = {
                              name: newData.toField,
                              fieldType: 'UUID',
                            };
                            if (newData.toField !== oldData.toField) {
                              if (PipelineUtils.isFieldNotUnique(newData.toField, prevState.schema)) {
                                this.props.displayError('Поле с таким именем уже существует');
                                return prevState;
                              }
                            }
                            const updatedSchema = {
                              ...prevState.schema,
                              fields: prevState.schema.fields.filter((field) => field.name !== oldData.toField).concat(changedField),
                            };
                            const updatedProcessing = {
                              ...prevState.processing,
                              generateUuidParams: prevState.processing.generateUuidParams.map((node) =>
                                node.toField === oldData.toField ? { toField: newData.toField } : node,
                              ),
                            };
                            this.props.schemaChanged(updatedSchema);
                            this.props.processingChanged(updatedProcessing);
                            return {
                              ...prevState,
                              schema: updatedSchema,
                              processing: updatedProcessing,
                            };
                          });
                        }
                      }, 300);
                    }),
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        this.setState((prevState) => {
                          const updatedSchema = {
                            ...prevState.schema,
                            fields: prevState.schema.fields.filter((field) => field.name !== oldData.toField),
                          };
                          const filteredGenerateUuidParams =
                            prevState.processing.generateUuidParams?.filter((node) => node.toField !== oldData.toField) || [];

                          let updatedProcessing = {
                            ...prevState.processing,
                            generateUuidParams: filteredGenerateUuidParams,
                          };
                          if (filteredGenerateUuidParams?.length === 0) {
                            const { flattenJsonParam, convertTimestampParams, addCurrentTimeParams, copyFieldParams } = prevState.processing;
                            updatedProcessing = {
                              flattenJsonParam,
                              convertTimestampParams,
                              addCurrentTimeParams,
                              copyFieldParams,
                            };
                          }
                          this.props.schemaChanged(updatedSchema);
                          this.props.processingChanged(updatedProcessing);
                          return {
                            ...prevState,
                            schema: updatedSchema,
                            processing: updatedProcessing,
                          };
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
                    emptyDataSourceMessage: 'Сгенерированных id в схеме нет',
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
              <IconButton onClick={this.handleUIDAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                <AddIcon />
              </IconButton>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Добавление времени записи</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
              <MaterialTable
                tableRef={this.tableTimeRef}
                icons={tableIconsWithInvisibleAdd}
                style={{ width: '100%', margin: 6 }}
                title="Generate current time Fields"
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
                  {
                    title: 'Имя поля',
                    field: 'toField',
                    editComponent: (props) => (
                      <TextField
                        variant="standard"
                        label="Имя поля"
                        placeholder="Введите имя"
                        margin="normal"
                        fullWidth
                        defaultValue={props.rowData.toField}
                        onChange={(event) => {
                          props.onChange(event.target.value);
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Требуемый формат времени',
                    field: 'timeFormat',
                    editable: 'never',
                    initialEditValue: "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
                    type: 'string',
                    render: (data) => <Typography> {"yyyy-MM-dd'T'HH:mm:ss.SSSZ"}</Typography>,
                  },
                  {
                    title: 'Требуемая временная зона',
                    field: 'timezone',
                    type: 'string',
                    emptyValue: 'UTC',
                    editable: 'never',
                  },
                ]}
                data={
                  this.state.processing.addCurrentTimeParams
                    ? this.state.processing.addCurrentTimeParams.map((data) => {
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
                          if (newData.toField.length === 0) {
                            this.props.displayError('Имя поля не может быть пустым');
                            return;
                          }
                          if (newData.timeFormat === '' || newData.timeFormat == null) {
                            this.props.displayError('Требуемый формат не выбран');
                            return;
                          }
                          const processingNode: AddCurrentTimeNode = {
                            toField: newData.toField,
                            timeFormat: newData.timeFormat,
                            timezone: 'UTC',
                          };
                          const schema = this.state.schema;
                          const addedField: Field = {
                            name: newData.toField,
                            fieldType: 'DATE',
                          };
                          if (PipelineUtils.isFieldNotUnique(newData.toField, prevState.schema)) {
                            this.props.displayError('Поле с таким именем уже существует');
                            return;
                          }
                          const data = [...prevState.schema.fields];
                          data.push(addedField);
                          schema.fields = data;
                          const processing = this.state.processing;
                          if (processing.addCurrentTimeParams) {
                            processing.addCurrentTimeParams.push(processingNode);
                          } else {
                            processing.addCurrentTimeParams = [processingNode];
                          }
                          this.props.schemaChanged(schema);
                          this.props.processingChanged(processing);
                          return { ...prevState, processing, schema };
                        });
                      }, 300);
                    }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        if (oldData) {
                          this.setState((prevState) => {
                            if (newData.toField.length === 0) {
                              this.props.displayError('Имя поля не может быть пустым');
                              return prevState;
                            }
                            if (newData.timeFormat === '' || newData.timeFormat == null) {
                              this.props.displayError('Требуемый формат не выбран');
                              return prevState;
                            }
                            const changedField: Field = {
                              name: newData.toField,
                              fieldType: 'DATE',
                            };
                            if (newData.toField !== oldData.toField) {
                              if (PipelineUtils.isFieldNotUnique(newData.toField, prevState.schema)) {
                                this.props.displayError('Поле с таким именем уже существует');
                                return prevState;
                              }
                            }
                            const updatedSchema = {
                              ...prevState.schema,
                              fields: prevState.schema.fields.filter((field) => field.name !== oldData.toField).concat(changedField),
                            };
                            const processingNode: AddCurrentTimeNode = {
                              toField: newData.toField,
                              timeFormat: newData.timeFormat,
                              timezone: 'UTC',
                            };
                            const updatedProcessing = {
                              ...prevState.processing,
                              addCurrentTimeParams: prevState.processing.addCurrentTimeParams.map((node) =>
                                node.toField === oldData.toField ? processingNode : node,
                              ),
                            };
                            this.props.schemaChanged(updatedSchema);
                            this.props.processingChanged(updatedProcessing);
                            return {
                              ...prevState,
                              schema: updatedSchema,
                              processing: updatedProcessing,
                            };
                          });
                        }
                      }, 300);
                    }),
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        this.setState((prevState) => {
                          const updatedSchema = {
                            ...prevState.schema,
                            fields: prevState.schema.fields.filter((field) => field.name !== oldData.toField),
                          };
                          const filteredAddCurrentTimeParams =
                            prevState.processing.addCurrentTimeParams?.filter((node) => node.toField !== oldData.toField) || [];
                          let updatedProcessing = {
                            ...prevState.processing,
                            addCurrentTimeParams: filteredAddCurrentTimeParams,
                          };
                          if (filteredAddCurrentTimeParams.length === 0) {
                            const { flattenJsonParam, convertTimestampParams, copyFieldParams, generateUuidParams } = prevState.processing;
                            updatedProcessing = {
                              flattenJsonParam,
                              convertTimestampParams,
                              copyFieldParams,
                              generateUuidParams,
                            };
                          }
                          this.props.schemaChanged(updatedSchema);
                          this.props.processingChanged(updatedProcessing);
                          return {
                            ...prevState,
                            schema: updatedSchema,
                            processing: updatedProcessing,
                          };
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
                    emptyDataSourceMessage: 'Полей, созданных с помощью добавления текущего времени, в схеме нет',
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
              <IconButton onClick={this.handleTimeAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                <AddIcon />
              </IconButton>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center" style={{ width: '100%' }}>
              <Typography>Преобразование массивов</Typography>
              <HtmlTooltip title={<TransformArrayTooltip />}>
                <InfoIcon fontSize={'small'} color={'primary'} />
              </HtmlTooltip>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <TransformArray
              data={this.props.processing?.transformArray}
              displayError={this.props.displayError}
              processing={this.props.processing}
              schema={this.props.schema}
              typesDictionary={transformHelpers.getIndexTypesDictionary()}
              processingChanged={this.props.processingChanged}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center" style={{ width: '100%' }}>
              <Typography>Даты преобразования массивов</Typography>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <PipelineTransformArrayDates
              processingChanged={this.props.processingChanged}
              dateFormats={this.props.dateFormats}
              processing={this.props.processing}
              displayError={this.props.displayError}
              timeZones={this.props.timeZones}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Фильтрация сообщений</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="row">
                <Grid item style={{ width: '50%' }}>
                  <FormControl style={{ marginLeft: '2%', width: '98%' }}>
                    <InputLabel id="select-type-conditions">Логическое объединение фильтров </InputLabel>
                    <Select
                      labelId="select-type-conditions"
                      label={'Логическое объединение фильтров'}
                      value={this.state.filterConditionType}
                      defaultValue={this.state.filterConditionType}
                      fullWidth
                      onChange={(e: any) => {
                        this.setState({ filterConditionType: e.target.value });
                        const processing = _.cloneDeep(this.state.processing);
                        if (processing.messageFilter) {
                          processing.messageFilter.condition.type = e.target.value;
                          this.props.processingChanged(processing);
                          this.setState({
                            processing: processing,
                          });
                        }
                      }}
                      input={<Input />}
                    >
                      {[MessageFilterType.AND, MessageFilterType.OR].map((unit, ind) => {
                        return (
                          <MenuItem value={unit} key={ind}>
                            {unit}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item style={{ width: '50%' }}>
                  <FormControl style={{ marginLeft: '2%', width: '98%' }}>
                    <InputLabel id="select-type-dlq">Обработка сообщений, непрошедших фильтрацию </InputLabel>
                    <Select
                      labelId="select-type-dlq"
                      value={this.state.filterDlqLabel}
                      defaultValue={this.state.filterDlqLabel}
                      fullWidth
                      onChange={(e: any) => {
                        this.setState({
                          filterDlqEnable: e.target.value != 'Игнорировать',
                          filterDlqLabel: e.target.value,
                        });
                        const processing = _.cloneDeep(this.state.processing);
                        if (processing.messageFilter) {
                          processing.messageFilter.dlqEnabled = e.target.value != 'Игнорировать';
                          this.props.processingChanged(processing);
                          this.setState({
                            processing: processing,
                          });
                        }
                      }}
                      input={<Input />}
                    >
                      {['Игнорировать', 'Отправлять в DLQ'].map((unit, ind) => {
                        return (
                          <MenuItem value={unit} key={ind}>
                            {unit}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <MaterialTable
                tableRef={this.tableRef}
                icons={tableIconsWithInvisibleAdd}
                style={{ width: '100%', margin: 6 }}
                title="Processing Fields"
                components={{
                  Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
                }}
                options={{
                  search: false,
                  paging: false,
                  showTitle: false,
                  actionsColumnIndex: -1,
                  header: true,
                  toolbarButtonAlignment: 'left',
                  searchFieldAlignment: 'left',
                }}
                columns={[
                  {
                    title: 'Имя поля',
                    field: 'field',
                    editComponent: (props) => (
                      <TextField
                        variant="standard"
                        label="Имя поля"
                        placeholder="Введите имя"
                        margin="normal"
                        fullWidth
                        defaultValue={props.rowData.field}
                        onChange={(event) => {
                          props.onChange(event.target.value);
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Значение',
                    field: 'value',
                    editComponent: (props) => (
                      <TextField
                        variant="standard"
                        label="Значение"
                        placeholder="Введите значение"
                        margin="normal"
                        fullWidth
                        defaultValue={props.rowData.value}
                        onChange={(event) => {
                          props.onChange(event.target.value);
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Тип проверки',
                    field: 'type',
                    editComponent: (props) => (
                      <Autocomplete
                        options={[MessageFilterType.EQUALS, MessageFilterType.REGEX, MessageFilterType.IS_NULL]}
                        renderOption={(option) => {
                          return option;
                        }}
                        getOptionLabel={(option) => {
                          return option;
                        }}
                        defaultValue={props.rowData.type ? props.rowData.type : ''}
                        onChange={(event, newValue) => {
                          props.onChange(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Тип проверки"
                            placeholder="Выберите тип проверки"
                            margin="normal"
                            fullWidth
                          />
                        )}
                      />
                    ),
                  },
                  {
                    title: 'Инверсия условия',
                    field: 'inverted',
                    editComponent: (props) => (
                      <Checkbox
                        disabled={false}
                        checked={props.rowData.inverted}
                        onChange={(event) => {
                          props.onChange(event.target.checked);
                        }}
                        color={'primary'}
                      />
                    ),
                    render: (data) => {
                      return <Checkbox disabled={true} checked={data.inverted} />;
                    },
                  },
                ]}
                data={
                  this.state.processing.messageFilter
                    ? this.state.processing.messageFilter?.condition.conditions.map((data) => {
                        return data;
                      })
                    : []
                }
                editable={{
                  isDeleteHidden: (rowData) => false,
                  onRowAdd: (newData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        // resolve();
                        this.setState((prevState) => {
                          if (newData.field == null || newData.field == '') {
                            this.props.displayError('Имя поля не может быть пустым');
                            return;
                          }
                          if (
                            (newData.value === '' || newData.value == null) &&
                            newData.type !== MessageFilterType.IS_NULL &&
                            newData.type !== MessageFilterType.EQUALS
                          ) {
                            this.props.displayError('Значение не может быть пустым для выбранного типа проверки');
                            return;
                          }
                          if (newData.type == null) {
                            this.props.displayError('Тип проверки не может быть пустым');
                            return;
                          }
                          if (!PipelineUtils.isFieldNameAvailableForFilter(newData.field, prevState.processing)) {
                            this.props.displayError('Поле с таким именем сгенерировано предпроцессингом, его нельзя использовать для фильтрации');
                            return;
                          }
                          const messageFilterCondition: MessageFilterCondition = {
                            type: newData.type,
                            field: newData.field,
                            value: newData.type === MessageFilterType.IS_NULL ? null : newData.value,
                            inverted: newData.inverted || false,
                          };

                          if (!PipelineUtils.isUniqCondition(messageFilterCondition, prevState.processing)) {
                            this.props.displayError('Такое условие фильтрации уже существует');
                            return;
                          }

                          const processing = _.cloneDeep(this.state.processing);
                          if (processing.messageFilter) {
                            processing.messageFilter.condition.conditions.push(messageFilterCondition);
                          } else {
                            processing.messageFilter = {
                              dlqEnabled: this.state.filterDlqEnable,
                              condition: {
                                type: this.state.filterConditionType,
                                conditions: [messageFilterCondition],
                              },
                            };
                          }
                          this.props.processingChanged(processing);
                          return { ...prevState, processing };
                        });
                        resolve();
                      }, 300);
                    }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        if (oldData) {
                          this.setState((prevState) => {
                            this.setState((prevState) => {
                              if (PipelineUtils.equalConditions(newData, oldData)) {
                                return;
                              }
                              if (newData.field == null || newData.field == '') {
                                this.props.displayError('Имя поля не может быть пустым');
                                return;
                              }
                              if (
                                (newData.value === '' || newData.value == null) &&
                                newData.type !== MessageFilterType.IS_NULL &&
                                newData.type !== MessageFilterType.EQUALS
                              ) {
                                this.props.displayError('Значение не может быть пустым для выбранного типа проверки');
                                return;
                              }
                              if (newData.type == null) {
                                this.props.displayError('Тип проверки не может быть пустым');
                                return;
                              }
                              if (!PipelineUtils.isFieldNameAvailableForFilter(newData.field, prevState.processing)) {
                                this.props.displayError('Поле с таким именем сгенерировано предпроцессингом, его нельзя использовать для фильтрации');
                                return;
                              }
                              const messageFilterCondition: MessageFilterCondition = {
                                type: newData.type,
                                field: newData.field,
                                value: newData.type === MessageFilterType.IS_NULL ? null : newData.value,
                                inverted: newData.inverted || false,
                              };

                              if (!PipelineUtils.isUniqCondition(messageFilterCondition, prevState.processing)) {
                                this.props.displayError('Такое условие фильтрации уже существует');
                                return;
                              }

                              const processing = _.cloneDeep(this.state.processing);
                              if (processing.messageFilter) {
                                let ind = -1;
                                processing.messageFilter.condition.conditions.map((cond, index) => {
                                  if (PipelineUtils.equalConditions(cond, oldData)) {
                                    ind = index;
                                  }
                                });
                                processing.messageFilter.condition.conditions[ind] = messageFilterCondition;
                                this.props.processingChanged(processing);
                                return { ...prevState, processing };
                              }
                              return { ...prevState };
                            });
                          });
                        }
                      }, 300);
                    }),
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        this.setState((prevState) => {
                          const processing = _.cloneDeep(this.state.processing);
                          if (processing.messageFilter) {
                            const index = oldData?.tableData?.id as number;
                            processing.messageFilter.condition.conditions.splice(index, 1);
                            if (processing.messageFilter.condition.conditions.length === 0) {
                              delete processing.messageFilter;
                            }
                            this.props.processingChanged(processing);
                            return { ...prevState, processing };
                          }
                          return { ...prevState };
                        });
                      }, 300);
                    }),
                }}
                localization={{
                  body: {
                    emptyDataSourceMessage: 'Условий фильтрации нет',
                    addTooltip: 'Добавить',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {
                      deleteText: 'Вы уверены, что хотите удалить условие фильтрации?',
                      cancelTooltip: 'Отмена',
                      saveTooltip: 'Подтвердить',
                    },
                  },
                  header: {
                    actions: '',
                  },
                }}
              />
              {(!this.props.processing.messageFilter ||
                (this.props.processing.messageFilter &&
                  this.props.processing.messageFilter.condition.conditions.length < this.state.maxMessageFilterCount)) && (
                <IconButton onClick={this.handleAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                  <AddIcon />
                </IconButton>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
        <FieldCopy processing={this.props.processing} processingChanged={this.props.processingChanged} />
      </React.Fragment>
    );
  }
}

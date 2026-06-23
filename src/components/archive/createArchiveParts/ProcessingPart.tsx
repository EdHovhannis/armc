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
  ArchivalCopyFieldNode,
  ArchiveMessageFilterCondition,
  ArchiveMessageFilterType,
  ArchiveProcessing,
  ArchiveSchema,
  Field,
} from '../../../store/archive/Types';
import { ArchiveUtils } from '../../../utils/ArchiveUtils';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import { FieldCopy } from '../../processing/FieldCopy';
import { TransformArray } from '../../processing/TransformArray';
import { ArchiveTransformArrayDates } from '../../processing/TransformArray/Dates/ArchiveTransformArrayDates';
import { TransformArrayTooltip } from '../../processing/TransformArray/TransformArrayTooltip';
import * as transformHelpers from '../../processing/TransformArray/functions/index';

const LOCALE = {
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
};

export interface ProcessingPartProps {
  processing: ArchiveProcessing;
  schema: ArchiveSchema;
  canEdit: boolean;
  dateFormats: string[];

  displayError(msg: string): any;

  processingChanged(processing: ArchiveProcessing): any;

  schemaChanged(schema: ArchiveSchema): any;
}

export interface ProcessingPartState {
  processing: ArchiveProcessing;
  schema: ArchiveSchema;

  maxMessageFilterCount: number;

  filterConditionType: ArchiveMessageFilterType.OR | ArchiveMessageFilterType.AND;
  filterDlqEnable: boolean;
  filterDlqLabel: string;
}

export default class ProcessingPart extends React.Component<ProcessingPartProps, ProcessingPartState> {
  constructor(props) {
    super(props);
    this.state = {
      processing: this.props.processing,
      schema: this.props.schema,
      filterConditionType: this.props.processing.messageFilter?.condition?.type || ArchiveMessageFilterType.AND,
      filterDlqEnable: this.props.processing.messageFilter?.dlqEnabled || false,
      filterDlqLabel: this.props.processing.messageFilter?.dlqEnabled ? 'Отправлять в DLQ' : 'Игнорировать',
      maxMessageFilterCount: 5,
    };
  }

  componentDidMount() {
    ConfigService.getIndexConfig(
      'archive',
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
        <Accordion style={{ width: '100%', margin: 6 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Копирование поля</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
              {this.props.canEdit ? (
                <React.Fragment>
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
                        field: 'to',
                        editComponent: (props) => (
                          <TextField
                            variant="standard"
                            label="Имя поля"
                            placeholder="Введите имя"
                            margin="normal"
                            error={props.rowData.to == null || props.rowData.to.length == 0}
                            helperText={props.rowData.to == null || props.rowData.to.length == 0 ? 'Имя поля не может быть пустым' : ''}
                            fullWidth
                            defaultValue={props.rowData.to}
                            onChange={(event) => {
                              props.onChange(event.target.value);
                            }}
                          />
                        ),
                        validate: (rowData) => rowData.to != null && rowData.to.length !== 0,
                      },
                      {
                        title: 'Поле для копирования',
                        field: 'from',
                        editComponent: (props) => (
                          <Autocomplete
                            options={this.props.schema.fields
                              .filter((field) => {
                                return !this.state.processing.copyField?.some((node) => {
                                  return node.to[0] === field.name;
                                });
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
                            defaultValue={props.rowData.from ? props.rowData.from : ''}
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
                        render: (data) => <Typography> {data.from ? data.from : ''}</Typography>,
                        validate: (rowData) => rowData.from != null && rowData.from.length != 0,
                      },
                    ]}
                    data={
                      this.state.processing.copyField
                        ? this.state.processing.copyField.map((data) => {
                            return data;
                          })
                        : []
                    }
                    editable={{
                      isDeleteHidden: (rowData) => false,
                      onRowAdd: (newData) =>
                        new Promise((resolve, reject) => {
                          setTimeout(() => {
                            this.setState((prevState) => {
                              if ((newData.to && newData.to.length === 0) || !newData.to) {
                                this.props.displayError('Имя поля не может быть пустым');
                                reject();
                                return;
                              }
                              if (newData.from === '' || newData.from == null) {
                                this.props.displayError('Поле для копирования не может быть пустым');
                                reject();
                                return;
                              }
                              resolve();
                              const processingNode: ArchivalCopyFieldNode = {
                                to: [newData.to],
                                from: newData.from,
                              };
                              const schema = this.state.schema;
                              const addedField: Field = {
                                name: newData.to,
                                type: schema.fields
                                  .filter((field) => {
                                    return field.name === newData.from;
                                  })
                                  .map((field) => {
                                    return field.type;
                                  })[0],
                                format: schema.fields
                                  .filter((field) => {
                                    return field.name === newData.from;
                                  })
                                  .map((field) => {
                                    return field.format;
                                  })[0],
                              };
                              if (ArchiveUtils.isFieldNotUnique(newData.to, this.props.schema, this.state.processing)) {
                                this.props.displayError('Поле с таким именем уже существует');
                                return;
                              }
                              const data = [...prevState.schema.fields];
                              data.push(addedField);
                              schema.fields = data;
                              const processing = this.state.processing;
                              if (processing.copyField) {
                                processing.copyField.push(processingNode);
                              } else {
                                processing.copyField = [processingNode];
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
                              const destination: string = Array.isArray(newData.to) ? newData.to[0] || '' : newData.to || '';
                              const source = newData.from;
                              this.setState((prevState) => {
                                if (!destination || destination.length === 0) {
                                  this.props.displayError('Имя поля не может быть пустым');
                                  return prevState;
                                }
                                if (!source || source.trim().length === 0) {
                                  this.props.displayError('Поле для копирования не может быть пустым');
                                  return prevState;
                                }
                                if (destination !== oldData.to[0]) {
                                  if (ArchiveUtils.isFieldNotUnique(destination, this.props.schema, this.state.processing)) {
                                    this.props.displayError('Поле с таким именем уже существует');
                                    return prevState;
                                  }
                                }
                                const schema = this.state.schema;
                                const originalField: Field | undefined = schema.fields.filter((field) => {
                                  return field.name === source;
                                })[0];
                                if (!originalField) {
                                  this.props.displayError('Поле для копирования не найдено');
                                  return;
                                }
                                const changedField: Field = {
                                  name: destination,
                                  type: originalField.type,
                                  format: originalField.format,
                                };
                                const updatedFields = prevState.schema.fields.filter((field) => field.name !== oldData.to[0]).concat(changedField);

                                const updatedSchema = {
                                  ...prevState.schema,
                                  fields: updatedFields,
                                };
                                const processingNode: ArchivalCopyFieldNode = {
                                  to: [destination],
                                  from: source,
                                };
                                const updatedProcessing = _.cloneDeep(this.state.processing);
                                updatedProcessing.copyField = updatedProcessing.copyField?.map((f) => {
                                  return f.from === oldData.from && f.to[0] === oldData.to[0] ? processingNode : f;
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
                              const toValue = Array.isArray(oldData.to) ? oldData.to[0] : oldData.to;
                              const updatedFields = prevState.schema.fields.filter((field) => field.name !== toValue);
                              const updatedSchema = {
                                ...prevState.schema,
                                fields: updatedFields,
                              };
                              const updatedCopyField =
                                prevState.processing.copyField?.filter((node) => {
                                  const nodeToValue = Array.isArray(node.to) ? node.to[0] : node.to;
                                  return nodeToValue !== toValue;
                                }) || [];
                              let updatedProcessing = {
                                ...prevState.processing,
                                copyField: updatedCopyField,
                              };
                              if (updatedCopyField.length === 0) {
                                updatedProcessing = {
                                  flatten: updatedProcessing.flatten,
                                };
                              }
                              this.props.processingChanged(updatedProcessing);
                              this.props.schemaChanged(updatedSchema);
                              return {
                                ...prevState,
                                schema: updatedSchema,
                                processing: updatedProcessing,
                              };
                            });
                          }, 300);
                        }),
                    }}
                    localization={LOCALE}
                  />
                  <IconButton onClick={this.handleCopyAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                    <AddIcon />
                  </IconButton>
                </React.Fragment>
              ) : (
                <MaterialTable
                  icons={tableIconsWithInvisibleAdd}
                  style={{ width: '100%', margin: 6 }}
                  title="Processing Fields"
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
                      field: 'to',
                    },
                    {
                      title: 'Поле для копирования',
                      field: 'from',
                      render: (data) => <Typography> {data.from ? data.from : ''}</Typography>,
                    },
                  ]}
                  data={
                    this.state.processing.copyField
                      ? this.state.processing.copyField.map((data) => {
                          return data;
                        })
                      : []
                  }
                  localization={LOCALE}
                />
              )}
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
              data={this.props?.processing?.transformArray}
              displayError={this.props.displayError}
              processing={this.props.processing}
              typesDictionary={transformHelpers.getArchiveTypesDictionary()}
              processingChanged={this.props.processingChanged}
              schema={this.props.schema}
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
            <ArchiveTransformArrayDates
              dateFormats={this.props.dateFormats}
              canEdit={this.props.canEdit}
              displayError={this.props.displayError}
              processing={this.props.processing}
              processingChanged={this.props.processingChanged}
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
                      {[ArchiveMessageFilterType.AND, ArchiveMessageFilterType.OR].map((unit, ind) => {
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
                        options={[ArchiveMessageFilterType.EQUALS, ArchiveMessageFilterType.REGEX, ArchiveMessageFilterType.IS_NULL]}
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
                            newData.type !== ArchiveMessageFilterType.IS_NULL &&
                            newData.type !== ArchiveMessageFilterType.EQUALS
                          ) {
                            this.props.displayError('Значение не может быть пустым для выбранного типа проверки');
                            return;
                          }
                          if (newData.type == null) {
                            this.props.displayError('Тип проверки не может быть пустым');
                            return;
                          }
                          if (!ArchiveUtils.isFieldNameAvailableForFilter(newData.field, prevState.processing)) {
                            this.props.displayError('Поле с таким именем сгенерировано предпроцессингом, его нельзя использовать для фильтрации');
                            return;
                          }
                          const messageFilterCondition: ArchiveMessageFilterCondition = {
                            type: newData.type,
                            field: newData.field,
                            value: newData.type === ArchiveMessageFilterType.IS_NULL ? null : newData.value,
                            inverted: newData.inverted || false,
                          };

                          if (!ArchiveUtils.isUniqCondition(messageFilterCondition, prevState.processing)) {
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
                              if (ArchiveUtils.equalConditions(newData, oldData)) {
                                return;
                              }
                              if (newData.field == null || newData.field == '') {
                                this.props.displayError('Имя поля не может быть пустым');
                                return;
                              }
                              if (
                                (newData.value === '' || newData.value == null) &&
                                newData.type !== ArchiveMessageFilterType.IS_NULL &&
                                newData.type !== ArchiveMessageFilterType.EQUALS
                              ) {
                                this.props.displayError('Значение не может быть пустым для выбранного типа проверки');
                                return;
                              }
                              if (newData.type == null) {
                                this.props.displayError('Тип проверки не может быть пустым');
                                return;
                              }
                              if (!ArchiveUtils.isFieldNameAvailableForFilter(newData.field, prevState.processing)) {
                                this.props.displayError('Поле с таким именем сгенерировано предпроцессингом, его нельзя использовать для фильтрации');
                                return;
                              }
                              const messageFilterCondition: ArchiveMessageFilterCondition = {
                                type: newData.type,
                                field: newData.field,
                                value: newData.type === ArchiveMessageFilterType.IS_NULL ? null : newData.value,
                                inverted: newData.inverted || false,
                              };

                              if (!ArchiveUtils.isUniqCondition(messageFilterCondition, prevState.processing)) {
                                this.props.displayError('Такое условие фильтрации уже существует');
                                return;
                              }

                              const processing = _.cloneDeep(this.state.processing);
                              if (processing.messageFilter) {
                                let ind = -1;
                                processing.messageFilter.condition.conditions.map((cond, index) => {
                                  if (ArchiveUtils.equalConditions(cond, oldData)) {
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
        <FieldCopy isArchive processing={this.props.processing} processingChanged={this.props.processingChanged} />
      </React.Fragment>
    );
  }
}

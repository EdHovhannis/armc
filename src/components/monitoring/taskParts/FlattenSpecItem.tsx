import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Button, IconButton, Paper, TextField, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import InfoIcon from '@material-ui/icons/Info';
import { Autocomplete } from '@material-ui/lab';
import { createRef } from 'react';
import * as React from 'react';

import { HtmlTooltip } from '../../../containers/App';
import KafkaService from '../../../services/KafkaService';
import { FlattenItem } from '../../../store/monitoring/Types';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import ConfirmDialog from '../../ConfirmDialog';
import { Schema } from '../TaskEditor';

export interface FlattenSpecItemProps {
  dataChanged(data: Array<FlattenItem>);

  schemaChanged(schema: Schema);

  displayError(msg: string);

  tagsChanged(tags: Array<string>);

  data: Array<FlattenItem>;
  canEdit: boolean;
  tags: Array<string>;
  schema: Schema;
  topic: number;
}

export interface FlattenSpecItemState {
  tags?: Array<string>;
  schema?: Schema;
  isLoading: boolean;
  canEdit: boolean;
  data: Array<FlattenItem>;
  columns: any;
  confirmDialogDeleteOpen: boolean;
}

export default class FlattenSpecItem extends React.Component<FlattenSpecItemProps, FlattenSpecItemState & any> {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags ? props.tags : [],
      schema: props.schema,
      canEdit: this.props.canEdit,
      isLoading: false,
      confirmDialogDeleteOpen: false,
      columns: [
        { title: 'Название столбца', field: 'name' },
        { title: 'Выражение', field: 'expr' },
        {
          title: ' ',
          field: 'type',
          lookup: { path: 'path', jq: 'jq' },
          initialEditValue: 'path',
          searchable: false,
        },
      ],
      data: this.props.data != null ? this.props.data : [],
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

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction={'row'}>
          <Grid container direction="row" style={{ width: 'calc(100% - 480px)' }}>
            <Grid item style={{ width: 'calc(100% - 20px)' }}>
              <Autocomplete
                multiple
                disabled={!this.props.canEdit}
                options={this.props.schema?.nonFlattenFields ? this.props.schema.nonFlattenFields : []}
                getOptionLabel={(option) => option}
                defaultValue={this.state.tags}
                onChange={this.onTagsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Поля, к которым не нужно применять сглаживание"
                    placeholder="Выбрать поле"
                    margin="normal"
                    fullWidth
                    // style={{width: 'calc(100% - 30px)'}}
                  />
                )}
              />
            </Grid>
            <Grid item style={{ marginTop: 32 }}>
              <HtmlTooltip
                title={
                  <React.Fragment>
                    <Typography variant={'caption'} color="primary">
                      {'Аккуратнее, выбранные поля не будут храниться!'}
                    </Typography>
                  </React.Fragment>
                }
              >
                <InfoIcon fontSize={'small'} color={'primary'} />
              </HtmlTooltip>
            </Grid>
          </Grid>
          <Grid item style={{ width: 480, alignItems: 'end' }}>
            <Button
              disabled={!this.props.canEdit}
              type="submit"
              variant="contained"
              color="primary"
              style={{
                marginTop: 12,
                marginBottom: 6,
                marginLeft: 6,
                marginRight: 6,
              }}
              onClick={() => {
                this.setState({ isLoading: true });
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
                  true,
                  true,
                  this.state.tags,
                  (fields) => {
                    Object.keys(fields.messageSchemaMap).forEach((field) => {
                      const flattenField: FlattenItem = {
                        type: 'path',
                        name: field,
                        expr: '$.' + field,
                      };
                      // Добавляем в flattenFields, если не указан в исключениях (this.state.tags)
                      if (!this.state.tags.includes(field)) {
                        schema.flattenFields.push(flattenField);
                      }
                    });
                    let isInTag = false;
                    Object.keys(fields.messageSchemaMap).forEach((key) => {
                      this.state.tags.forEach((tag) => {
                        if (key === tag) isInTag = true;
                      });
                      if (!isInTag) schema.allFields.push(key);
                      const type = fields.messageSchemaMap[key].elementType;
                      switch (type) {
                        case 'LONG':
                          schema.longFields.push(key);
                          break;
                        case 'DOUBLE':
                          schema.doubleFields.push(key);
                          break;
                        case 'TIMESTAMP':
                          schema.timestampFields.push(key);
                          break;
                        default:
                          if (isInTag) {
                            isInTag = false;
                            break;
                          } else {
                            schema.stringFields.push(key);
                            break;
                          }
                      }
                    });
                    this.setState({ ...this.state, data: schema.flattenFields, isLoading: false, schema: schema });
                    this.props.dataChanged(schema.flattenFields);
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
            <Button
              disabled={!this.props.canEdit}
              type="submit"
              variant="contained"
              color="primary"
              style={{
                marginTop: 12,
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
                  <MaterialTable
                    tableRef={this.tableRef}
                    icons={tableIconsWithInvisibleAdd}
                    title="Сглаживание"
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
                      { title: 'Название столбца', field: 'name' },
                      { title: 'Выражение', field: 'expr' },
                      {
                        title: ' ',
                        field: 'type',
                        lookup: { path: 'path', jq: 'jq' },
                        initialEditValue: 'path',
                        searchable: false,
                      },
                    ]}
                    data={this.state.data.map((data) => {
                      return data;
                    })}
                    editable={{
                      onRowAdd: (newData) =>
                        new Promise((resolve) => {
                          setTimeout(() => {
                            resolve();
                            this.setState((prevState) => {
                              if (newData.name == null || newData.expr == null) {
                                this.props.displayError('Поля не могут быть пустыми');
                                return;
                              }
                              const data = [...prevState.data];
                              data.push(newData);
                              this.props.dataChanged(data);
                              return { ...prevState, data };
                            });
                          }, 300);
                        }),
                      onRowUpdate: (newData, oldData) =>
                        new Promise((resolve) => {
                          setTimeout(() => {
                            resolve();
                            if (oldData) {
                              this.setState((prevState) => {
                                if (newData.name == null || newData.expr == null) {
                                  this.props.displayError('Поля не могут быть пустыми');
                                  return;
                                }
                                const data = structuredClone(prevState.data || []);
                                const index = data.findIndex((value) => value.name === oldData.name);
                                if (index !== -1) {
                                  data[index] = newData;
                                }
                                this.props.dataChanged(data);
                                return { ...prevState, data };
                              });
                            }
                          }, 300);
                        }),
                      onRowDelete: (oldData: any) =>
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
                        emptyDataSourceMessage: 'Поля, к которым нужно применять сглаживание, не выбраны',
                        addTooltip: '',
                        deleteTooltip: 'Удалить',
                        editTooltip: 'Редактировать',
                        editRow: {
                          deleteText: 'Вы уверены, что хотите удалить выражение?',
                          cancelTooltip: 'Отмена',
                          saveTooltip: 'Подтвердить',
                        },
                      },
                      header: {
                        actions: '',
                      },
                    }}
                  />
                </Paper>
                <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                  <IconButton onClick={this.handleAddRow} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ) : (
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%', minHeight: '500px' }} direction="column">
                <Paper style={{ width: '100%', marginTop: 16 }}>
                  <MaterialTable
                    icons={tableIconsWithInvisibleAdd}
                    title="Сглаживания"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                    }}
                    columns={[
                      { title: 'Название столбца', field: 'name' },
                      { title: 'Выражение', field: 'expr' },
                      {
                        title: ' ',
                        field: 'type',
                        lookup: { path: 'path', jq: 'jq' },
                        initialEditValue: 'path',
                        searchable: false,
                      },
                    ]}
                    data={this.state.data}
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужный столбец',
                      },
                      body: {
                        emptyDataSourceMessage: 'Полей, к которым нужно применять сглаживание, нет',
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

import { Grid, IconButton, List, ListItem, Paper, Tooltip, Typography, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { createStyles } from '@material-ui/core/styles';
import { GridSelectionModel } from '@material-ui/data-grid';
import { Add, Delete, Edit } from '@material-ui/icons';
import AddIcon from '@material-ui/icons/Add';
import { Autocomplete, ToggleButton } from '@material-ui/lab';
import Papa from 'papaparse';
import * as React from 'react';

import LookupService, { PAPA_CONFIG } from '../../services/LookupService';
import { LOCAL_TEXT, Lookup, ShortInfo } from '../../store/lookup/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { COLUMN_PREFIX, LookupUtils } from '../../utils/LookupUtils';
import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP, Utils } from '../../utils/Utils';
import ConfirmDialog, { DEFAULT_DECISION } from '../ConfirmDialog';
import CustomPagination from '../utils/CustomPagination';

import { DraggableDataGrid } from './DraggableDataGrid';
import AddColumnDialog from './createDictionaryPart/AddColumnDialog';
import DeleteColumnDialog from './createDictionaryPart/DeleteColumnDialog';

const styles = () =>
  createStyles({
    root: {
      '& .key-column-color': {
        backgroundColor: 'rgba(153, 255, 204, 0.55)',
      },
      '& .value-column-color': {
        backgroundColor: 'rgba(153, 204, 255, 0.55)',
      },
    },
  });

export interface DictionaryPageProps {
  editableProjects: EditableProject[];
  dictionary: any[];
  isLookupManager: boolean;
  isDictionaryEditor: boolean;
  lookups: ShortInfo[];
  projects: Project[];
  currentLookup?: Lookup;
  projectShortName: string;
  classes: {
    resizable: string;
    previewChip: string;
    dropZone: string;
  };
  zone: string;
  name: string;
  lookupMenu?: boolean;
  selectedLookup?: ShortInfo;
  editLookup?: boolean;
  currentDictionaryOrder: string[];

  lookupMenuChanged(lookupMenu: boolean): any;

  editLookupChanged(editLookup: boolean): any;

  selectedLookupChanged(selectedLookup?: ShortInfo): any;

  displayError(msg: string): any;

  getDictionary(projectShortName: string, name: string, zone: string, successCallback?: (data: any[]) => void, errorCallback?): any;

  createLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?): any;

  deleteLookup(projectShortName: string, name: string, zone: string, successCallback, errorCallback?): any;

  updateLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?): any;

  getLookup(projectShortName: string, name: string, zone: string, successCallback: (lookup: Lookup) => void, errorCallback?): any;

  fetchListDictionaryLookups(projectShortName: string, dictionary: string, zone: string, okCallback?, errorCallback?): any;

  displaySuccess(message: string): any;
}

export interface DictionaryPageStat {
  onColumnReorder?: (columns: any[]) => void;
  columns: any[];
  initColumns: any[];
  data: any[];
  projectName: string;
  addColumnDialog: boolean;
  deleteColumnDialog: boolean;
  confirmDialogOpen: boolean;
  chosenRows: GridSelectionModel;
  dictionary?: any[];
  editLookup: boolean;
  lookupMenu: boolean;
  createLookupDialog: boolean;
  selectedLookup?: ShortInfo;
  newLookupName?: string;
  valueColumn?: any;
  keyColumn?: any;
  isLookupManager: boolean;
  isDictionaryEditor: boolean;
}

class DictionaryPage extends React.Component<DictionaryPageProps, DictionaryPageStat> {
  constructor(props) {
    super(props);
    let columns: any[] =
      this.props.dictionary.length === 0
        ? []
        : Object.keys(this.props.dictionary[0])
            .sort()
            .filter((columnName) => columnName !== 'id')
            .map((columnName) => {
              return {
                headerName: columnName.split(COLUMN_PREFIX)[1],
                field: columnName,
                editable: this.props.isDictionaryEditor,
                resizable: true,
                flex: 1 / Object.keys(props.dictionary[0]).length,
                // width: LookupUtils.getWidthOfColumnName(columnName)
              };
            });
    let keyColumn: any = undefined;
    let valueColumn: any = undefined;
    if (this.props.currentLookup && this.props.selectedLookup) {
      keyColumn = columns.filter((column) => column.headerName === this.props.currentLookup?.keyColumn)[0];
      valueColumn = columns.filter((column) => column.headerName === this.props.currentLookup?.valueColumn)[0];
      columns = this.setKeyHighlight(columns, keyColumn);
      columns = this.setValueHighlight(columns, valueColumn);
    }
    this.state = {
      columns: columns,
      initColumns: columns,
      keyColumn: keyColumn,
      valueColumn: valueColumn,
      data: this.props.dictionary,
      projectName: this.props.projectShortName,
      addColumnDialog: false,
      deleteColumnDialog: false,
      confirmDialogOpen: false,
      chosenRows: [],
      createLookupDialog: false,
      selectedLookup: this.props.selectedLookup,
      lookupMenu: true,
      editLookup: this.props.editLookup ? this.props.editLookup : false,
      isDictionaryEditor: this.props.isDictionaryEditor,
      isLookupManager: this.props.isLookupManager,
    };

    this.handleConfirmDialogClose = this.handleConfirmDialogClose.bind(this);
  }

  setKeyHighlight(columns: any[], keyColumn: any): any[] {
    if (keyColumn) {
      const index = columns.findIndex((col) => col.field === keyColumn.field);
      if (index > -1) {
        columns[index].headerClassName = 'key-column-color';
        columns[index].cellClassName = 'key-column-color';
      }
    }
    return columns;
  }

  setValueHighlight(columns: any[], valueColumn: any): any[] {
    if (valueColumn) {
      const index = columns.findIndex((col) => col.field === valueColumn.field);
      if (index > -1) {
        columns[index].headerClassName = 'value-column-color';
        columns[index].cellClassName = 'value-column-color';
      }
    }
    return columns;
  }

  deactivateHighlight(columns: any[], columnIn: any): any[] {
    if (columnIn) {
      columns.map((column, index) => {
        if (column.field === columnIn.field) {
          delete columns[index].headerClassName;
          delete columns[index].cellClassName;
        }
      });
    }
    return columns;
  }

  componentDidMount() {
    if (this.props.currentLookup && this.props.selectedLookup) {
      const keyColumn = this.state.columns.filter((column) => column.headerName === this.props.currentLookup?.keyColumn)[0];
      const valueColumn = this.state.columns.filter((column) => column.headerName === this.props.currentLookup?.valueColumn)[0];
      let columns = this.state.columns;
      columns = this.setKeyHighlight(columns, keyColumn);
      columns = this.setValueHighlight(columns, valueColumn);
      this.setState({ columns: columns });
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.dictionary !== state.dictionary ||
      props.isLookupManager !== state.isLookupManager ||
      props.isDictionaryEditor !== state.isDictionaryEditor
    ) {
      return {
        columns:
          props.dictionary.length === 0
            ? []
            : Object.keys(props.dictionary[0])
                .sort()
                .filter((columnName) => columnName !== 'id')
                .map((columnName) => {
                  return {
                    headerName: columnName.split(COLUMN_PREFIX)[1],
                    field: columnName,
                    editable: props.isDictionaryEditor,
                    resizable: true,
                    flex: 1 / Object.keys(props.dictionary[0]).length,
                    // width: LookupUtils.getWidthOfColumnName(columnName)
                  };
                }),
        initColumns:
          props.dictionary.length === 0
            ? []
            : Object.keys(props.dictionary[0])
                .sort()
                .filter((columnName) => columnName !== 'id')
                .map((columnName) => {
                  return {
                    headerName: columnName.split(COLUMN_PREFIX)[1],
                    field: columnName,
                    editable: props.isDictionaryEditor,
                    resizable: true,
                    flex: 1 / Object.keys(props.dictionary[0]).length,
                    // width: LookupUtils.getWidthOfColumnName(columnName)
                  };
                }),
        data: props.dictionary,
        dictionary: props.dictionary,
        isDictionaryEditor: props.isDictionaryEditor,
        isLookupManager: props.isLookupManager,
      };
    }
    return null;
  }

  handleConfirmDialogClose(value: DEFAULT_DECISION) {
    const { chosenRows } = this.state;
    const { displaySuccess } = this.props;
    if (value === 'Ok') {
      const notificationText = chosenRows.length > 1 ? 'Выделенные строки успешно удалены' : 'Выделенная строка успешно удалена';

      this.setState(
        (prevState) => {
          let data = [...prevState.data];
          chosenRows?.forEach((id) => {
            data = data.filter((row) => row.id !== id);
          });
          return { ...prevState, data, chosenRows: [] };
        },
        () => {
          displaySuccess(notificationText);
        },
      );
    }
    this.setState({ confirmDialogOpen: false });
  }

  renderListLookups(list: ShortInfo[]) {
    return list.map((element) => {
      return (
        <React.Fragment key={element.project + element.name}>
          <ListItem>
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Grid item>
                <ToggleButton
                  style={{ textTransform: 'none' }}
                  size={'small'}
                  value="check"
                  selected={this.state.selectedLookup === element}
                  onChange={() => {
                    if (this.state.selectedLookup === element) {
                      this.setState((prevState) => {
                        let columns = [...prevState.columns];
                        columns = this.deactivateHighlight(columns, this.state.keyColumn);
                        columns = this.deactivateHighlight(columns, this.state.valueColumn);
                        this.props.selectedLookupChanged(undefined);
                        this.props.editLookupChanged(false);
                        return {
                          ...prevState,
                          columns,
                          selectedLookup: undefined,
                          editLookup: false,
                          keyColumn: undefined,
                          valueColumn: undefined,
                        };
                      });
                    } else {
                      this.props.getLookup(element.project, element.name, this.props.zone, () => {});
                      this.setState({ selectedLookup: element });
                      this.props.selectedLookupChanged(element);
                    }
                  }}
                >
                  {element.name}
                </ToggleButton>
              </Grid>
              {(this.props.isLookupManager || element.editable) && (
                <Grid item>
                  <IconButton
                    onClick={() => {
                      this.props.getLookup(element.project, element.name, this.props.zone, (lookup) => {});
                      this.setState({ selectedLookup: element, editLookup: true });
                      this.props.selectedLookupChanged(element);
                      this.props.editLookupChanged(true);
                    }}
                    size="small"
                    edge="end"
                    aria-label="delete"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      this.props.deleteLookup(element.project, element.name, this.props.zone, () => {
                        this.props.fetchListDictionaryLookups(this.props.projectShortName, this.props.name, this.props.zone);
                      });
                    }}
                    size="small"
                    edge="end"
                    aria-label="delete"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          </ListItem>
        </React.Fragment>
      );
    });
  }

  render() {
    const order = this.props.currentDictionaryOrder;
    const columnChose = (
      <>
        <Grid container direction="row">
          <Grid item style={{ width: '49%', marginRight: 3, marginLeft: 3 }}>
            <Autocomplete
              options={this.state.columns
                .filter((column) => this.state.initColumns.some((col) => col.headerName === column.headerName))
                .filter((column) => column.headerName != this.state.valueColumn?.headerName)}
              renderOption={(option) => option.headerName}
              getOptionLabel={(option) => option.headerName}
              defaultValue={this.state.keyColumn}
              onChange={(_, newValue) =>
                this.setState((prevState) => {
                  let columns = [...prevState.columns];
                  columns = this.deactivateHighlight(columns, this.state.keyColumn);
                  columns = this.setKeyHighlight(columns, newValue);
                  return { ...prevState, columns, keyColumn: newValue };
                })
              }
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Столбец-ключ" placeholder="Выберите столбец" margin="normal" fullWidth />
              )}
            />
          </Grid>
          <Grid item style={{ width: 'calc(50% - 9px)', marginRight: 3 }}>
            <Autocomplete
              options={this.state.columns
                .filter((column) => this.state.initColumns.some((col) => col.headerName === column.headerName))
                .filter((column) => column.headerName != this.state.keyColumn?.headerName)}
              renderOption={(option) => option.headerName}
              getOptionLabel={(option) => option.headerName}
              defaultValue={this.state.valueColumn}
              onChange={(_, newValue) =>
                this.setState((prevState) => {
                  let columns = [...prevState.columns];
                  columns = this.deactivateHighlight(columns, this.state.valueColumn);
                  columns = this.setValueHighlight(columns, newValue);
                  return { ...prevState, columns, valueColumn: newValue };
                })
              }
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Столбец-значение" placeholder="Выберите столбец" margin="normal" fullWidth />
              )}
            />
          </Grid>
        </Grid>
      </>
    );

    const { classes } = this.props;

    return (
      <>
        <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 12, marginTop: 12 }}>
          Справочник{' '}
          <b>
            {this.state.projectName}/{this.props.name}
          </b>
        </Typography>
        <Typography variant={'h6'} style={{ opacity: 0.84, marginLeft: 12, marginTop: 12 }}>
          Зона: <b>{this.props.zone}</b>
        </Typography>
        <Grid container direction="row">
          <Grid item style={{ width: '70%' }}>
            <Paper style={{ width: '100%', marginTop: 6, paddingBottom: this.props.isDictionaryEditor ? 0 : 6 }}>
              {this.props.isDictionaryEditor && (
                <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%', margin: 6 }} direction="row">
                  <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '80%', marginTop: 12 }} direction="row">
                    <Button variant="contained" color="primary" style={{ marginRight: 6 }} onClick={() => this.setState({ addColumnDialog: true })}>
                      Добавить столбец
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => this.setState({ deleteColumnDialog: true })}>
                      Удалить столбец
                    </Button>
                  </Grid>
                  <Grid container justifyContent="flex-end" alignItems="center" direction="row" style={{ width: '20%', marginTop: 12 }}>
                    <Tooltip title={'Добавить строку'}>
                      <IconButton
                        disabled={this.state.columns.length === 0}
                        onClick={() => {
                          this.setState((prevState) => {
                            const data = [...prevState.data];
                            if (data.length === 0) {
                              data.push({ id: 0 });
                            } else {
                              data.push({ id: data[data.length - 1].id + 1 });
                            }
                            return { ...prevState, data };
                          });
                          this.props.displaySuccess('Новая строчка была добавлена');
                        }}
                        className="add-row-btn"
                        color="primary"
                        style={{ marginTop: 12, marginLeft: -16 }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={'Удалить выбранное'}>
                      <IconButton
                        disabled={this.state.columns.length === 0 || this.state.chosenRows.length === 0}
                        onClick={() => {
                          this.setState({ confirmDialogOpen: true });
                        }}
                        className="delete-row-button"
                        color="primary"
                        style={{ marginTop: 12, marginRight: 20 }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              )}
              <Grid container justifyContent="space-between" alignItems="center" style={{ width: 'auto', margin: 6 }} direction="column">
                <Paper style={{ width: '100%', marginTop: 16 }}>
                  <div style={{ height: this.props.isDictionaryEditor ? 698 : 800, width: '100%' }} className={classes.root}>
                    <DraggableDataGrid
                      localeText={LOCAL_TEXT}
                      pageSize={10}
                      components={{
                        Pagination: CustomPagination,
                      }}
                      checkboxSelection
                      disableSelectionOnClick={true}
                      onSelectionModelChange={(params) => this.setState({ chosenRows: params })}
                      onEditCellPropsChange={(params) =>
                        this.setState((prevState) => {
                          const data = [...prevState.data];
                          const index = data.findIndex((row) => row.id === params.id);
                          if (index === -1) return prevState;
                          if (typeof params?.props?.value === 'string') {
                            data[index] = {
                              ...data[index],
                              [params.field]: params?.props?.value?.split('/r').join('').trim(),
                            };
                          }
                          return { ...prevState, data };
                        })
                      }
                      rowsPerPageOptions={[10, 25, 50]}
                      rows={this.state.data}
                      columns={this.state.columns}
                      onColumnReorder={(newColumns: any) => this.setState({ columns: newColumns })}
                    />
                  </div>
                </Paper>
              </Grid>
              {this.props.isDictionaryEditor && (
                <Grid container direction={'row'} style={{ padding: 16 }} justifyContent={'flex-end'}>
                  <Button
                    color={'primary'}
                    variant={'contained'}
                    onClick={() => {
                      if (this.state.data.length === 0) {
                        this.props.displayError('Справочник не может быть пустым.');
                        return;
                      }
                      let data = Utils.getCopyOfElement(this.state.data);
                      data.map((row) => {
                        delete row.id;
                        Object.keys(row).map((column_name) => {
                          const tmp = row[column_name];
                          delete row[column_name];
                          const index = column_name.split(COLUMN_PREFIX)[1];
                          if (index) {
                            row[index] = tmp;
                          }
                        });
                      });
                      const isEmptyCell = LookupUtils.checkEmptyCell(data);
                      if (isEmptyCell.isEmpty) {
                        this.props.displayError('В колонке ' + isEmptyCell.column + ' пустое значение. В справочнике не может быть пустых значений.');
                        return;
                      }
                      data = Papa.unparse(data, PAPA_CONFIG);

                      LookupService.updateDictionary(
                        this.props.projectShortName,
                        this.props.name,
                        this.props.zone,
                        data,
                        () => {
                          this.props.displaySuccess('Справочник успешно обновлен.');
                          this.props.getDictionary(this.props.projectShortName, this.props.name, this.props.zone);
                        },
                        (msg) => {
                          this.props.displayError(msg);
                        },
                      );
                    }}
                  >
                    Сохранить
                  </Button>
                </Grid>
              )}
            </Paper>
          </Grid>

          <Grid item style={{ width: '30%' }}>
            {this.state.createLookupDialog && (
              <>
                <Paper style={{ width: '100%', margin: 6, height: '20%' }}>
                  <Grid container direction="column">
                    <Grid item>
                      {!NAME_REGEXP.exec(this.state.newLookupName) ? (
                        <Tooltip placement="bottom-start" title={ERROR_NAME_REGEXP_STRING}>
                          <TextField
                            autoFocus
                            error={!NAME_REGEXP.exec(this.state.newLookupName)}
                            label="Имя нового lookup"
                            onChange={(e) => {
                              this.setState({ newLookupName: e.target.value });
                            }}
                            value={this.state.newLookupName}
                            style={{ margin: 6, width: 'calc(100% - 12px)' }}
                          />
                        </Tooltip>
                      ) : (
                        <TextField
                          autoFocus
                          error={!NAME_REGEXP.exec(this.state.newLookupName)}
                          label="Имя нового lookup"
                          onChange={(e) => {
                            this.setState({ newLookupName: e.target.value });
                          }}
                          value={this.state.newLookupName}
                          style={{ margin: 6, width: 'calc(100% - 12px)' }}
                        />
                      )}
                    </Grid>
                    {columnChose}
                  </Grid>
                  <Grid container direction="row" style={{ marginLeft: 6 }}>
                    <Grid item style={{ marginRight: 6 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          if (this.state.newLookupName === '' || this.state.newLookupName == null) {
                            this.props.displayError('Имя lookup не введено.');
                            return;
                          }
                          if (!NAME_REGEXP.exec(this.state.newLookupName)) {
                            this.props.displayError(`В имени lookup'a присутствуют недопустимые символы.`);
                            return;
                          }
                          if (this.state.keyColumn == null) {
                            this.props.displayError('Столбец-ключ не выбран.');
                            return;
                          }
                          if (this.state.valueColumn == null) {
                            this.props.displayError('Столбец-значение не выбран.');
                            return;
                          }
                          const lookup: Lookup = {
                            dictionary: this.props.name,
                            keyColumn: this.state.keyColumn.headerName,
                            valueColumn: this.state.valueColumn.headerName,
                          };

                          if (!this.props.projectShortName) {
                            this.props.displayError('Отсутствует проект у справочника');
                            return;
                          }

                          if (!this.props.zone) {
                            this.props.displayError('Отсутствует зона у справочника');
                            return;
                          }

                          this.props.createLookup(
                            this.props.projectShortName,
                            this.state.newLookupName,
                            this.props.zone,
                            lookup,
                            () => {
                              this.setState((prevState) => {
                                let columns = [...prevState.columns];
                                columns = this.deactivateHighlight(columns, this.state.keyColumn);
                                columns = this.deactivateHighlight(columns, this.state.valueColumn);
                                return {
                                  ...prevState,
                                  columns,
                                  createLookupDialog: false,
                                  newLookupName: undefined,
                                  keyColumn: undefined,
                                  valueColumn: undefined,
                                };
                              });
                              this.props.fetchListDictionaryLookups(this.props.projectShortName, this.props.name, this.props.zone);
                            },
                            (msg) => {
                              this.props.displayError(msg);
                            },
                          );
                        }}
                      >
                        Сохранить
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          this.setState((prevState) => {
                            let columns = [...prevState.columns];
                            columns = this.deactivateHighlight(columns, this.state.keyColumn);
                            columns = this.deactivateHighlight(columns, this.state.valueColumn);
                            return {
                              ...prevState,
                              columns,
                              createLookupDialog: false,
                              newLookupName: undefined,
                              keyColumn: undefined,
                              valueColumn: undefined,
                            };
                          })
                        }
                      >
                        Отмена
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )}
            {this.state.editLookup && (
              <>
                <Paper style={{ width: '100%', margin: 6, height: '20%' }}>
                  <Grid container direction="column">
                    <Grid item>
                      <TextField
                        disabled
                        error={this.state.selectedLookup?.name === ''}
                        label="Имя lookup"
                        value={this.state.selectedLookup?.name}
                        style={{ margin: 6, width: 'calc(100% - 12px)' }}
                      />
                    </Grid>
                    {columnChose}
                  </Grid>
                  <Grid container direction="row" style={{ marginLeft: 6 }}>
                    <Grid item style={{ marginRight: 6 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(event) => {
                          if (this.state.keyColumn == null) {
                            this.props.displayError('Столбец-ключ не выбран.');
                            return;
                          }
                          if (this.state.valueColumn == null) {
                            this.props.displayError('Столбец-значение не выбран.');
                            return;
                          }
                          const lookup: Lookup = {
                            dictionary: this.props.currentLookup?.dictionary,
                            keyColumn: this.state.keyColumn.headerName,
                            valueColumn: this.state.valueColumn.headerName,
                          };
                          this.props.selectedLookupChanged(undefined);
                          this.props.editLookupChanged(false);
                          this.props.updateLookup(
                            this.state.selectedLookup?.project || '',
                            this.state.selectedLookup?.name || '',
                            this.props.zone,
                            lookup,
                            () => {
                              this.setState((prevState) => {
                                const columns = [...prevState.columns];
                                if (this.state.valueColumn) {
                                  columns.map((column, index) => {
                                    if (column.field === this.state.valueColumn.field || column.field === this.state.keyColumn.field) {
                                      delete columns[index].headerClassName;
                                      delete columns[index].cellClassName;
                                    }
                                  });
                                }
                                this.props.selectedLookupChanged(undefined);
                                this.props.editLookupChanged(false);
                                return {
                                  ...prevState,
                                  columns,
                                  selectedLookup: undefined,
                                  editLookup: false,
                                  keyColumn: undefined,
                                  valueColumn: undefined,
                                };
                              });
                              this.props.fetchListDictionaryLookups(this.props.projectShortName, this.props.name, this.props.zone);
                            },
                            (msg) => {
                              this.props.displayError(msg);
                            },
                          );
                        }}
                      >
                        Обновить
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          this.setState((prevState) => {
                            let columns = [...prevState.columns];
                            columns = this.deactivateHighlight(columns, this.state.keyColumn);
                            columns = this.deactivateHighlight(columns, this.state.valueColumn);
                            this.props.selectedLookupChanged(undefined);
                            this.props.editLookupChanged(false);
                            return {
                              ...prevState,
                              columns,
                              editLookup: false,
                              selectedLookup: undefined,
                              keyColumn: undefined,
                              valueColumn: undefined,
                            };
                          })
                        }
                      >
                        Отмена
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )}
            <Paper
              style={{
                width: '100%',
                margin: 6,
                maxHeight: this.state.editLookup || this.state.createLookupDialog ? '687px' : '866px',
                height: this.state.editLookup || this.state.createLookupDialog ? 'calc(80% - 12px)' : 'calc(100% - 6px)',
                overflow: 'auto',
              }}
            >
              <List dense={true}>
                <Grid container direction="row" justifyContent="space-between" alignItems="center">
                  <Grid item style={{ marginLeft: 16 }}>
                    <Typography variant="h6" style={{ opacity: '0.75' }}>
                      Lookup
                    </Typography>
                  </Grid>
                  <Grid item>
                    {this.props.isLookupManager && (
                      <Tooltip title={'Добавить lookup'}>
                        <IconButton
                          color="primary"
                          style={{ marginRight: 6 }}
                          onClick={() =>
                            this.setState((prevState) => {
                              let columns = [...prevState.columns];
                              columns = this.deactivateHighlight(columns, this.state.keyColumn);
                              columns = this.deactivateHighlight(columns, this.state.valueColumn);
                              this.props.selectedLookupChanged(undefined);
                              this.props.editLookupChanged(false);
                              return {
                                ...prevState,
                                columns,
                                createLookupDialog: true,
                                selectedLookup: undefined,
                                editLookup: false,
                                keyColumn: undefined,
                                valueColumn: undefined,
                              };
                            })
                          }
                        >
                          <Add />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
                {this.renderListLookups(this.props.lookups)}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {this.state.addColumnDialog && (
          <AddColumnDialog
            displayError={this.props.displayError}
            displaySuccess={this.props.displaySuccess}
            changeColumnName={(columnName: string) =>
              this.setState((prevState) => {
                const columns = [...prevState.columns];
                if (columns.filter((column) => column.headerName === columnName).length > 0) {
                  this.props.displayError('Такое имя колонки уже есть.');
                  return;
                } else {
                  columns.push({
                    headerName: columnName,
                    field: COLUMN_PREFIX + columnName,
                    editable: this.props.isDictionaryEditor,
                    resizable: true,
                    // width: LookupUtils.getWidthOfColumnName(columnName)
                  });
                  const n = columns.length;
                  columns.map((column) => {
                    column['flex'] = 1 / n;
                  });
                }
                return { ...prevState, columns };
              })
            }
            close={() => this.setState({ addColumnDialog: false })}
          />
        )}

        {this.state.deleteColumnDialog && (
          <DeleteColumnDialog
            displayError={this.props.displayError}
            displaySuccess={this.props.displaySuccess}
            changeColumn={(column) =>
              this.setState((prevState) => {
                const columns = [...prevState.columns];
                const data = [...prevState.data];
                data.map((row) => delete row[column.field]);
                columns.splice(
                  columns.findIndex((col) => col.field === column.field),
                  1,
                );
                return { ...prevState, columns, data };
              })
            }
            columns={this.state.columns}
            close={() => this.setState({ deleteColumnDialog: false })}
          />
        )}

        <ConfirmDialog
          warningText={'Вы уверены что хотите удалить выбранные строки?'}
          open={this.state.confirmDialogOpen}
          okString={'Подтвердить'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogClose}
        />
      </>
    );
  }
}

export default withStyles(styles)(DictionaryPage);

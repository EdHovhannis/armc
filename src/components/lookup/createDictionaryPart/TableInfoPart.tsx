import { Grid, IconButton, Paper, Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { DataGrid } from '@material-ui/data-grid';
import { Delete } from '@material-ui/icons';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';

import { LOCAL_TEXT } from '../../../store/lookup/Types';
import { COLUMN_PREFIX } from '../../../utils/LookupUtils';
import ConfirmDialog from '../../ConfirmDialog';
import CustomPagination from '../../utils/CustomPagination';
import { WrongInput } from '../CreateDictionaryPage';

import AddColumnDialog from './AddColumnDialog';
import DeleteColumnDialog from './DeleteColumnDialog';

interface TableInfoPartProps {
  columns: any[];
  data: any[];

  wrongInputChanged(wrongInput: WrongInput);

  columnsChange(columns: any[]): any;

  displayError(msg: string): void;

  displaySuccess(message: string): void;

  dataChanged(data: any[]): any;
}

interface TableInfoPartStat {
  columns: any[];
  data: any[];
  addColumnDialog: boolean;
  deleteColumnDialog: boolean;
  confirmDialogOpen: boolean;
  chosenRows: number[];
}

export class TableInfoPart extends React.Component<TableInfoPartProps, TableInfoPartStat> {
  constructor(props) {
    super(props);
    this.state = {
      columns: this.props.columns,
      data: this.props.data,
      addColumnDialog: false,
      deleteColumnDialog: false,
      confirmDialogOpen: false,
      chosenRows: [],
    };

    this.handleConfirmDialogClose = this.handleConfirmDialogClose.bind(this);
  }

  handleConfirmDialogClose(value) {
    this.setState({ confirmDialogOpen: false });
    if (value === 'Ok') {
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          this.setState((prevState) => {
            let data = [...prevState.data];
            this.state.chosenRows.map((id) => {
              data = data.filter((row) => row.id !== id);
            });
            this.props.dataChanged(data);
            return { ...prevState, data, chosenRows: [] };
          });
        }, 300);
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%', marginTop: 12 }} direction="row">
          <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '50%', marginTop: 12 }} direction="row">
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: 6 }}
              onClick={() => {
                this.setState({ addColumnDialog: true });
              }}
            >
              Добавить столбец
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                this.setState({ deleteColumnDialog: true });
              }}
            >
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
                    this.props.dataChanged(data);
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
                disabled={this.state.columns.length === 0}
                onClick={(e) => {
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
        <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
          <Paper style={{ width: '100%', marginTop: 16 }}>
            <div style={{ height: 650, width: '100%' }}>
              <DataGrid
                localeText={LOCAL_TEXT}
                pageSize={10}
                checkboxSelection
                disableSelectionOnClick={true}
                onSelectionModelChange={(chosenRows) => {
                  this.setState({ chosenRows });
                }}
                onCellEditCommit={(params) => {
                  this.setState((prevState) => {
                    const data = [...prevState.data];
                    const id = data.findIndex((item) => item.id === params.id);
                    if (id === -1) return prevState;
                    const stringValue = typeof params.value === 'string' ? params.value : '';
                    data[id] = {
                      ...data[id],
                      [params.field]: stringValue.split('/r').join('').trim(),
                    };
                    this.props.dataChanged(data);
                    return { ...prevState, data };
                  });
                }}
                components={{
                  Pagination: CustomPagination,
                }}
                rowsPerPageOptions={[10, 25, 50]}
                rows={this.state.data}
                columns={this.state.columns}
              />
            </div>
          </Paper>
        </Grid>

        {this.state.addColumnDialog && (
          <AddColumnDialog
            displayError={this.props.displayError}
            changeColumnName={(columnName) => {
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  this.setState((prevState) => {
                    const columns = [...prevState.columns];
                    if (columns.filter((column) => column.headerName === columnName).length > 0) {
                      this.props.displayError('Такое имя колонки уже есть.');
                      return;
                    } else {
                      const column = {
                        headerName: columnName,
                        field: COLUMN_PREFIX + columnName,
                        editable: true,
                        resizable: true,
                        // width: LookupUtils.getWidthOfColumnName(columnName)
                      };
                      columns.push(column);
                      const n = columns.length;
                      columns.map((column) => {
                        column['flex'] = 1 / n;
                      });
                    }
                    this.props.columnsChange(columns);
                    return { ...prevState, columns };
                  });
                }, 300);
              });
            }}
            close={() => this.setState({ addColumnDialog: false })}
            displaySuccess={this.props.displaySuccess}
          />
        )}

        {this.state.deleteColumnDialog && (
          <DeleteColumnDialog
            displayError={this.props.displayError}
            changeColumn={(column) => {
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  this.setState((prevState) => {
                    const columns = [...prevState.columns];
                    const data = [...prevState.data];
                    data.map((row) => delete row[column.field]);
                    columns.splice(
                      columns.findIndex((col) => col.field === column.field),
                      1,
                    );
                    this.props.columnsChange(columns);
                    this.props.dataChanged(data);
                    return { ...prevState, columns, data };
                  });
                }, 300);
              });
            }}
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
      </React.Fragment>
    );
  }
}

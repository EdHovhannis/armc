import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Grid, IconButton } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import { createRef } from 'react';
import * as React from 'react';

import { DruidFilter, EMPTY_ARRAY } from '../../../store/monitoring/Types';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';

export interface SimpleFilterEditorProps {
  filterChanged(filters: DruidFilter[]);
  displayError(msg: string);

  defaultFilter: DruidFilter[];
  canEdit: boolean;
}

export default class SimpleFilterEditor extends React.Component<SimpleFilterEditorProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      canEdit: this.props.canEdit,
      filter: this.props.defaultFilter != null ? this.props.defaultFilter : EMPTY_ARRAY,
      data:
        this.props.defaultFilter != null
          ? this.props.defaultFilter.map((filter) => {
              return { dimension: filter.dimension, type: filter.type, values: filter.values };
            })
          : [],
    };
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
                this.props.filterChanged(data);
                return { ...prevState, data };
              });
              this.setState({ editable: editable });
            }, 600);
          }),
      },
    });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.canEdit ? (
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            <Paper style={{ width: '100%', marginTop: 16 }}>
              <MaterialTable
                tableRef={this.tableRef}
                icons={tableIconsWithInvisibleAdd}
                title="Фильтры"
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
                  { title: 'Колонка', field: 'dimension' },
                  {
                    title: 'Тип фильтра',
                    field: 'type',
                    lookup: { in: 'in', regex: 'regex', 'not in': 'not in', 'not regex': 'not regex' },
                    initialEditValue: 'in',
                  },
                  { title: 'Значения', field: 'values' },
                ]}
                data={this.state.data}
                editable={{
                  onRowAdd: (newData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        this.setState((prevState) => {
                          if (newData.dimension == null || newData.values == null) {
                            this.props.displayError('Поля не могут быть пустыми');
                            return;
                          }
                          const data = [...prevState.data];
                          data.push(newData);
                          this.props.filterChanged(data);
                          return { ...prevState, data };
                        });
                      }, 600);
                    }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        if (oldData) {
                          this.setState((prevState) => {
                            if (newData.dimension == null || newData.values == null) {
                              this.props.displayError('Поля не могут быть пустыми');
                              return prevState;
                            }
                            const data = [...prevState.data];
                            const index = data.findIndex(
                              (d) => d.dimension === oldData.dimension && d.type === oldData.type && oldData.values === d.values,
                            );
                            if (index !== -1) {
                              data[index] = newData;
                            }
                            this.props.filterChanged(data);
                            return { ...prevState, data };
                          });
                        }
                      }, 600);
                    }),
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        resolve();
                        this.setState((prevState) => {
                          const data = [...prevState.data];
                          data.splice(
                            data.findIndex((d) => d.type === oldData.type && d.dimension === oldData.dimension && d.values === oldData.values),
                            1,
                          );
                          this.props.filterChanged(data);
                          return { ...prevState, data };
                        });
                      }, 600);
                    }),
                }}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти фильтр',
                  },
                  body: {
                    emptyDataSourceMessage: 'Фильтров еще нет',
                    addTooltip: '',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {
                      deleteText: 'Вы уверены, что хотите удалить фильтр?',
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
                title="Фильтры"
                options={{
                  search: true,
                  paging: false,
                  showTitle: false,
                  actionsColumnIndex: -1,
                  header: true,
                  toolbarButtonAlignment: 'left',
                }}
                columns={[
                  { title: 'Колонка', field: 'dimension' },
                  {
                    title: 'Тип фильтра',
                    field: 'type',
                    lookup: { in: 'in', regex: 'regex', 'not in': 'not in', 'not regex': 'not regex' },
                    initialEditValue: 'in',
                  },
                  { title: 'Значения', field: 'values' },
                ]}
                data={this.state.data}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти фильтр',
                  },
                  body: {
                    emptyDataSourceMessage: 'Фильтров еще нет',
                    addTooltip: 'Добавить фильтр',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {
                      deleteText: 'Вы уверены, что хотите удалить фильтр?',
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
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

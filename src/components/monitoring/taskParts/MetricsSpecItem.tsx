import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Grid, IconButton, Paper } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { createRef } from 'react';
import * as React from 'react';

import { MetricItem, DimensionItem } from '../../../store/monitoring/Types';
import { tableIconsWithInvisibleAdd } from '../../../utils/Utils';

export interface MetricsSpecItemProps {
  dataChanged(data: Array<MetricItem>);
  displayError(msg: string);

  data: Array<MetricItem>;
  canEdit: boolean;
  dimensionData: Array<DimensionItem>;
  errorMessage: string;
}

export interface MetricsSpecItemState {
  canEdit: boolean;
  data: Array<MetricItem>;
}

export default class MetricsSpecItem extends React.Component<MetricsSpecItemProps, MetricsSpecItemState & any> {
  constructor(props) {
    super(props);
    this.state = {
      canEdit: this.props.canEdit,
      data:
        this.props.data != null
          ? this.props.data.map((data) => {
              return data;
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
                this.props.dataChanged(data);
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
                title="Метрики"
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
                  { title: 'Целевая колонка', field: 'name' },
                  { title: 'Исходная колонка', field: 'fieldName' },
                  {
                    title: 'Выражение',
                    field: 'type',
                    lookup: {
                      count: 'count',
                      doubleSum: 'doubleSum',
                      doubleMin: 'doubleMin',
                      doubleMax: 'doubleMax',
                      longSum: 'longSum',
                      longMin: 'longMin',
                      longMax: 'longMax',
                      hyperUnique: 'hyperUnique',
                      thetaSketch: 'thetaSketch',
                      quantilesDoublesSketch: 'quantilesDoublesSketch',
                      arrayOfDoublesSketch: 'arrayOfDoublesSketch',
                      HLLSketchBuild: 'HLLSketchBuild',
                    },
                    initialEditValue: 'count',
                  },
                ]}
                data={this.state.data}
                editable={{
                  onRowAdd: (newData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        const isDuplicate =
                          this.props.dimensionData.length > 0 && this.props.dimensionData.some((item) => item.name === newData.name);
                        if (isDuplicate) {
                          this.props.displayError(this.props.errorMessage);
                          return;
                        }
                        resolve();
                        this.setState((prevState) => {
                          const data = [...prevState.data];
                          if (newData.name == null) {
                            this.props.displayError('Целевая колонка не может быть пустая');
                            return;
                          }
                          data.push(newData);
                          this.props.dataChanged(data);
                          return { ...prevState, data };
                        });
                      }, 600);
                    }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        const isDuplicate =
                          this.props.dimensionData.length > 0 && this.props.dimensionData.some((item) => item.name === newData.name);
                        if (isDuplicate) {
                          this.props.displayError(this.props.errorMessage);
                          return;
                        }
                        resolve();
                        if (oldData) {
                          this.setState((prevState) => {
                            if (newData.name == null) {
                              this.props.displayError('Целевая колонка не может быть пустая');
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
                      }, 600);
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
                      }, 600);
                    }),
                }}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти нужную метрику',
                  },
                  body: {
                    emptyDataSourceMessage: 'Не было создано ни одной метрики',
                    addTooltip: '',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {
                      deleteText: 'Вы уверены, что хотите удалить метрику?',
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
                title="Агрегации"
                options={{
                  search: true,
                  paging: false,
                  showTitle: false,
                  actionsColumnIndex: -1,
                  header: true,
                }}
                columns={[
                  { title: 'Целевая колонка', field: 'name' },
                  { title: 'Исходная колонка', field: 'fieldName' },
                  {
                    title: 'Выражение',
                    field: 'type',
                    lookup: {
                      count: 'count',
                      doubleSum: 'doubleSum',
                      doubleMin: 'doubleMin',
                      doubleMax: 'doubleMax',
                      longSum: 'longSum',
                      longMin: 'longMin',
                      longMax: 'longMax',
                      hyperUnique: 'hyperUnique',
                      thetaSketch: 'thetaSketch',
                      quantilesDoublesSketch: 'quantilesDoublesSketch',
                      arrayOfDoublesSketch: 'arrayOfDoublesSketch',
                      HLLSketchBuild: 'HLLSketchBuild',
                    },
                    initialEditValue: 'count',
                  },
                ]}
                data={this.state.data}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти нужную метрику',
                  },
                  body: {
                    emptyDataSourceMessage: 'Не было создано ни одной метрики',
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
    );
  }
}

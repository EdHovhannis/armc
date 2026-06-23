import MaterialTable from '@material-table/core';
import { createTheme, Grid, IconButton, ThemeProvider } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Delete, Edit, Refresh } from '@material-ui/icons';
import * as React from 'react';

import AddConstraintDialogContainer from '../../containers/constraint/AddConstraintDialogContainer';
import {
  AnalyticConstraint,
  ArchiveConstraint,
  ClusterConstraint,
  ConstraintFilterParams,
  ConstraintShort,
  ConstraintType,
  FulltextConstraint,
  OBJECT_TYPE,
  OBJECT_TYPE_MAP,
  ProjectConstraint,
} from '../../store/constraint/Types';
import { Project } from '../../store/project/Types';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { AddFab } from '../utils/AddFab';
import BackNavigation from '../utils/BackNavigation';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import ConstraintEditDialog from './ConstraintEditDialog';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#4CAF50',
    },
  },
});

interface TableRow extends ConstraintShort {}

export interface OverloadedConstraintsPageProps {
  displayError: (error: string) => void;
  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => void;
  fetchConstraintForProject: (projectShortName: string, okCallback?, errorCallback?) => void;
  updateConstraintOnObject: (
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  updateConstraintOnProject: (
    projectShortName: string,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  clearObjectConstrain: (objectId: number, objectType: OBJECT_TYPE, type: ConstraintType, okCallback, errorCallback) => void;
  refetch: (constraintFilterParams?: ConstraintFilterParams) => void;
  setConstraintFilter: (filter: FilterMenuItem[] | undefined) => void;
  overloadedConstraints: ConstraintShort[];
  defaultConstraint: ClusterConstraint;
  projects: Project[];
  filter?: FilterMenuItem[];
}

export interface OverloadedConstraintsPageStat {
  filter?: FilterMenuItem[];
  openAddDialog: boolean;
  confirmDeleteDialog: boolean;
  chosenId?: number | string;
  chosenObjectType?: OBJECT_TYPE;
  chosenConstraintType?: ConstraintType;
  confirmFewDeleteDialog: boolean;
  fewRowsData?: ConstraintShort[];
  openEditDialog: boolean;
  constraintForEdit?: FulltextConstraint | ArchiveConstraint | ProjectConstraint | AnalyticConstraint;
  editTitle?: any;
  editType?: ConstraintType;
  isSingleDeletion?: boolean;
  waitForDeletion?: boolean;
  completeDeletion?: boolean;
  successDeletion?: boolean;
  errorMessage?: any;
  detailMessage?: any;
  editProject?: string;
  editTaskId?: number;
}

export class OverloadedConstraintsPage extends React.Component<OverloadedConstraintsPageProps & WithNavigationProps, OverloadedConstraintsPageStat> {
  constructor(props) {
    super(props);
    this.state = {
      openAddDialog: false,
      confirmDeleteDialog: false,
      confirmFewDeleteDialog: false,
      openEditDialog: false,
      filter: this.props.filter,
    };
    this.deleteHandler = this.deleteHandler.bind(this);
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
    this.deleteFewConstraintByNamesAndProjectShortNames = this.deleteFewConstraintByNamesAndProjectShortNames.bind(this);
    this.handleConfirmFewConstraintDeleteDialogClose = this.handleConfirmFewConstraintDeleteDialogClose.bind(this);
  }

  deleteHandler(): void {
    this.setState({
      isSingleDeletion: true,
      waitForDeletion: true,
      completeDeletion: false,
    });
    this.props.clearObjectConstrain(
      this.state.chosenId,
      this.state.chosenObjectType,
      this.state.chosenConstraintType,
      () => {
        this.setState({
          completeDeletion: true,
          successDeletion: true,
          chosenConstraintType: undefined,
          chosenId: undefined,
          chosenObjectType: undefined,
        });
      },
      (errorMsg: { message: string; details?: string }) => {
        this.setState({
          completeDeletion: true,
          successDeletion: false,
          chosenConstraintType: undefined,
          chosenId: undefined,
          chosenObjectType: undefined,
          errorMessage: (
            <React.Fragment>
              <b>Произошла ошибка при удалении переопределенных ограничений</b>
              <Typography style={{ marginTop: 2 }}>{errorMsg.message}</Typography>
            </React.Fragment>
          ),
          detailMessage: errorMsg.details,
        });
      },
    );
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDeleteDialog: false });
    if (value === 'Ok') {
      this.deleteHandler();
    }
  }

  deleteFewConstraintByNamesAndProjectShortNames(selectedRows: ConstraintShort[], result: any) {
    this.props.clearObjectConstrain(
      selectedRows[0].objectId,
      selectedRows[0].objectType,
      selectedRows[0].constraintType,
      () => {
        result.success.push(selectedRows[0]);
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          if (result.errors.length > 0) {
            const errorString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>Произошла ошибка при удалении переопределенных ограничений</b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error: { row: ConstraintShort; errorMsg: { message: string; details?: string } }) => {
                    if (error.row.objectName != '-') {
                      return (
                        <div>
                          {error.row.projectKey}/{error.row.objectName} ({error.row.constraintType}): {error.errorMsg.message}
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          {error.row.projectKey} ({error.row.constraintType}): {error.errorMsg.message}
                        </div>
                      );
                    }
                  })}
                </Typography>
              </React.Fragment>
            );
            const detailString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error: { row: ConstraintShort; errorMsg: { message: string; details?: string } }) => {
                    if (error.row.objectName != '-') {
                      return (
                        <React.Fragment>
                          <div>
                            <b>
                              {error.row.projectKey}/{error.row.objectName} ({error.row.constraintType}):
                            </b>
                          </div>
                          <div>{error.errorMsg.details}</div>
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <React.Fragment>
                          <div>
                            <b>
                              {error.row.projectKey} ({error.row.constraintType}):
                            </b>
                          </div>
                          <div>{error.errorMsg.details}</div>
                        </React.Fragment>
                      );
                    }
                  })}
                </Typography>
              </React.Fragment>
            );
            this.setState({
              completeDeletion: true,
              successDeletion: false,
              errorMessage: errorString,
              detailMessage: detailString,
            });
          } else {
            this.setState({
              completeDeletion: true,
              successDeletion: true,
            });
          }
          return result;
        } else {
          return this.deleteFewConstraintByNamesAndProjectShortNames(selectedRows, result);
        }
      },
      (error) => {
        result.errors.push({ row: selectedRows[0], errorMsg: error });
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          const errorString = (
            <React.Fragment>
              <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                <b>Произошла ошибка при удалении переопределенных ограничений</b>
              </Typography>
              <Typography variant="subtitle1">
                {result.errors.map((error: { row: ConstraintShort; errorMsg: { message: string; details?: string } }) => {
                  if (error.row.objectName != '-') {
                    return (
                      <div>
                        {error.row.projectKey}/{error.row.objectName} ({error.row.constraintType}): {error.errorMsg.message}
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        {error.row.projectKey} ({error.row.constraintType}): {error.errorMsg.message}
                      </div>
                    );
                  }
                })}
              </Typography>
            </React.Fragment>
          );
          const detailString = (
            <React.Fragment>
              <Typography variant="body2" color={'error'}>
                {result.errors.map((error: { row: ConstraintShort; errorMsg: { message: string; details?: string } }) => {
                  if (error.row.objectName != '-') {
                    return (
                      <React.Fragment>
                        <div>
                          <b>
                            {error.row.projectKey}/{error.row.objectName} ({error.row.constraintType}):
                          </b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <React.Fragment>
                        <div>
                          <b>
                            {error.row.projectKey} ({error.row.constraintType}):
                          </b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  }
                })}
              </Typography>
            </React.Fragment>
          );
          this.setState({
            completeDeletion: true,
            successDeletion: false,
            errorMessage: errorString,
            detailMessage: detailString,
          });
          return result;
        } else {
          return this.deleteFewConstraintByNamesAndProjectShortNames(selectedRows, result);
        }
      },
    );
  }

  handleConfirmFewConstraintDeleteDialogClose(value) {
    this.setState({ confirmFewDeleteDialog: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: false,
        waitForDeletion: true,
        completeDeletion: false,
        successDeletion: false,
      });
      if (this.state.fewRowsData !== []) {
        const result = {
          success: [],
          errors: [],
        };
        this.deleteFewConstraintByNamesAndProjectShortNames(this.state.fewRowsData, result);
        this.setState({ fewRowsData: [] });
      }
    }
  }

  render() {
    const filterTextField = (
      <Grid
        style={{ width: '100%', alignSelf: 'center', padding: 6, marginTop: -6 }}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Grid item style={{ width: 'calc(100% - 54px)' }}>
          <FilterMenu
            filter={this.props.filter}
            onChange={(filters) => {
              this.setState({ filter: filters });
              this.props.setConstraintFilter(filters);
              if (filters.length > 0) {
                this.props.refetch(Utils.createConstraintFilterParamsFromFilterMenuItem(filters));
              } else {
                this.props.refetch();
              }
            }}
            columns={[
              {
                name: 'Проект',
                field: 'shortName',
                variants: this.props.projects,
                onlyInOperator: true,
              },
              {
                name: 'Тип индекса',
                field: 'constraintType',
                variants: [ConstraintType.archive, ConstraintType.analytic, ConstraintType.fulltext],
              },
              {
                name: 'Уровень ограничений',
                field: 'objectType',
                variants: [OBJECT_TYPE_MAP[OBJECT_TYPE.PROJECT], OBJECT_TYPE_MAP[OBJECT_TYPE.INDEX]],
                onlyIsOperator: true,
              },
            ]}
          />
        </Grid>
        <Grid item style={{ width: '48px', marginTop: 6 }}>
          <IconButton
            onClick={() => {
              if (this.state.filter?.length > 0) {
                this.props.refetch(Utils.createConstraintFilterParamsFromFilterMenuItem(this.state.filter));
              } else {
                this.props.refetch();
              }
            }}
          >
            <Refresh id={'refreshButton'} color={'primary'} />
          </IconButton>
        </Grid>
      </Grid>
    );

    return (
      <React.Fragment>
        <BackNavigation
          backString={'Значения по умолчанию'}
          titleString={'Переопределенные ограничения'}
          goBackClicked={() => {
            this.props.navigate('/constraint');
          }}
        />
        <Grid
          container
          style={{ width: '100%', marginTop: 16, margin: '1px' }}
          justifyContent="center"
          spacing={8}
          alignItems="flex-start"
          direction="column"
        >
          {filterTextField}
          <div style={{ display: 'flex', width: '100%', paddingRight: 60, justifyContent: 'center' }}>
            <Paper style={{ width: '100%', marginTop: 8 }}>
              <ThemeProvider theme={theme}>
                {/*@ts-ignore*/}
                <MaterialTable
                  icons={tableIcons}
                  title={'Объекты с переопределеннымими ограничениями'}
                  options={{
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    emptyRowsWhenPaging: false,
                    padding: 'dense',
                    search: true,
                    paging: true,
                    showTitle: true,
                    header: true,
                    actionsColumnIndex: -1,
                    grouping: true,
                    selection: true,
                    headerStyle: {
                      backgroundColor: 'rgb(76, 175, 80, 0.25)',
                    },
                  }}
                  localization={{
                    toolbar: {
                      searchTooltip: 'Поиск',
                      searchPlaceholder: 'Поиск',
                      nRowsSelected: '{0} строк(-и) выбрано',
                    },
                    body: {
                      emptyDataSourceMessage: 'Список переопределенных объектов пуст',
                      addTooltip: '',
                      deleteTooltip: 'Удалить',
                      editTooltip: 'Редактировать',
                    },
                    grouping: {
                      placeholder: 'Перетащите сюда заголовок(-и) столбца(-ов), по которому(-ым) хотите сгруппировать данные',
                      groupedBy: 'Сгруппировано по ',
                    },
                    header: {
                      actions: '',
                    },
                  }}
                  columns={[
                    {
                      field: 'objectId',
                      hidden: true,
                    },
                    {
                      field: 'constraintType',
                      title: 'Тип индекса',
                    },
                    {
                      field: 'objectType',
                      title: 'Уровень ограничений',
                      lookup: {
                        PROJECT: 'Проект',
                        INDEX: 'Индекс',
                      },
                    },
                    {
                      field: 'projectKey',
                      title: 'Ключ проекта',
                    },
                    {
                      field: 'objectName',
                      title: 'Имя объекта',
                    },
                  ]}
                  data={this.props.overloadedConstraints}
                  actions={[
                    {
                      icon: () => <Edit color={'primary'} />,
                      tooltip: 'Редактировать ограничения',
                      onClick: (event, rowData: ConstraintShort) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (rowData.objectType === OBJECT_TYPE.PROJECT) {
                          this.props.fetchConstraintForProject(
                            rowData.projectKey,
                            (constraint) => {
                              this.setState({
                                openEditDialog: true,
                                editProject: rowData.projectKey,
                                constraintForEdit: constraint,
                                editType: ConstraintType.project,
                                editTitle: (
                                  <React.Fragment>
                                    Ограничения на проект <b>{rowData.projectKey}</b>
                                  </React.Fragment>
                                ),
                              });
                            },
                            (error) => {
                              this.props.displayError(error);
                            },
                          );
                        } else {
                          //@ts-ignore
                          this.props.fetchConstraintForObject(
                            rowData.objectId,
                            rowData.constraintType,
                            (constraint) => {
                              this.setState({
                                openEditDialog: true,
                                editProject: rowData.projectKey,
                                editTaskId: rowData.objectId,
                                constraintForEdit: constraint,
                                editType: rowData.constraintType,
                                editTitle: (
                                  <React.Fragment>
                                    Ограничения на {rowData.constraintType === ConstraintType.archive ? 'архив' : 'индекс'}{' '}
                                    <b>
                                      {rowData.projectKey}/{rowData.objectName}
                                    </b>
                                  </React.Fragment>
                                ),
                              });
                            },
                            (error) => {
                              this.props.displayError(error);
                            },
                          );
                        }
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Delete color={'primary'} />,
                      tooltip: 'Удалить переопределенные значения ограничений для объекта',
                      onClick: (event, rowData: ConstraintShort) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({
                          chosenId: rowData.objectId,
                          chosenObjectType: rowData.objectType,
                          chosenConstraintType: rowData.constraintType,
                          confirmDeleteDialog: true,
                        });
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Delete color={'primary'} />,
                      tooltip: 'Удалить выбранные строки',
                      onClick: (event, rowData: ConstraintShort[]) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({
                          fewRowsData: rowData,
                          confirmFewDeleteDialog: true,
                        });
                      },
                      position: 'toolbarOnSelect',
                    },
                  ]}
                />
              </ThemeProvider>
            </Paper>
          </div>
        </Grid>

        <AddFab title={'Переопределить ограничения на новый объект'} onClick={() => this.setState({ openAddDialog: true })} />

        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить переопределенные значения ограничений для этого объекта?'}
          open={this.state.confirmDeleteDialog}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />

        <WaitingDialog
          title={this.state.isSingleDeletion ? 'Удаление переопределенных ограничений на объект' : 'Удаление переопределенных ограничений на объекты'}
          open={this.state.waitForDeletion}
          onClose={() => {
            this.setState({
              waitForDeletion: false,
            });
            if (this.state.successDeletion) {
              this.props.refetch();
            }
          }}
          complete={this.state.completeDeletion}
          success={this.state.successDeletion}
          successMessage={
            this.state.isSingleDeletion
              ? 'Переопределенные ограничения на объект успешно удалены '
              : 'Переопределенные ограничения на объекты успешно удалены'
          }
          errorMessage={this.state.errorMessage}
          details={this.state.detailMessage}
          needDetailedInfo={true}
        />

        {this.state.openEditDialog && (
          <ConstraintEditDialog
            displayError={this.props.displayError}
            close={() => {
              this.setState({
                openEditDialog: false,
                constraintForEdit: undefined,
                editTitle: undefined,
              });
            }}
            onPatch={(type, patch, constraintResult) => {
              if (this.state.editType !== ConstraintType.project) {
                this.props.updateConstraintOnObject(
                  this.state.editTaskId,
                  type,
                  patch,
                  () => {
                    this.setState({ constraintForEdit: constraintResult });
                  },
                  (error) => {
                    this.props.displayError(error);
                  },
                );
              } else {
                this.props.updateConstraintOnProject(
                  this.state.editProject,
                  type,
                  patch,
                  () => {
                    this.setState({ constraintForEdit: constraintResult });
                  },
                  (error) => {
                    this.props.displayError(error);
                  },
                );
              }
            }}
            type={this.state.editType}
            title={this.state.editTitle}
            constraint={this.state.constraintForEdit}
          />
        )}

        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить переопределенные ограничения с выбранных объектов?'}
          open={this.state.confirmFewDeleteDialog}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewConstraintDeleteDialogClose}
        />

        {this.state.openAddDialog && (
          <AddConstraintDialogContainer
            close={() => {
              this.setState({ openAddDialog: false });
              if (this.state.filter?.length > 0) {
                this.props.refetch(Utils.createConstraintFilterParamsFromFilterMenuItem(this.state.filter));
              } else {
                this.props.refetch();
              }
            }}
            displayError={this.props.displayError}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withNavigation(OverloadedConstraintsPage);

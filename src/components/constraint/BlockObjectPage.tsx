import MaterialTable from '@material-table/core';
import { createTheme, Grid, IconButton, ThemeProvider } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Delete, Refresh } from '@material-ui/icons';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import * as React from 'react';

import AddBlockDialogContainer from '../../containers/constraint/AddBlockDialogContainer';
import { User } from '../../store/auth/Types';
import {
  BlockedInfo,
  BlockedUnit,
  BlockFilterParams,
  BlockingDataDescription,
  Blocks,
  ConstraintType,
  OBJECT_TYPE,
  OBJECT_TYPE_MAP,
} from '../../store/constraint/Types';
import { Group } from '../../store/group/Types';
import { Project } from '../../store/project/Types';
import { Unit, UNIT_MAP } from '../../store/role/Types';
import { ConstraintUtils } from '../../utils/ConstraintUtils';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { AddFab } from '../utils/AddFab';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';

import BlocksInfoDialog from './BlocksInfoDialog';

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

export interface BlockObjectPageProps {
  displayError: (error: string) => void;
  displaySuccess: (message: string) => void;
  deleteBlockFromUserOnObject: (
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    okCallback,
    errorCallback,
  ) => void;
  getBlocksOnProject: (
    projectShortName: string,
    type: ConstraintType,
    okCallback: (blocks: BlockedUnit[]) => void,
    errorCallback: (error: string) => void,
  ) => void;
  getBlocksOnObject: (
    taskId: number,
    type: ConstraintType,
    okCallback: (blocks: BlockedUnit[]) => void,
    errorCallback: (error: string) => void,
  ) => void;
  unblockSubject: (subjectId: number, subjectType: Unit, type: ConstraintType, okCallback, errorCallback) => void;
  blockSubject: (subjectId: number, subjectType: Unit, type: ConstraintType, description: string, okCallback?, errorCallback?) => void;
  blockSubjectOnObject: (
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    description: string,
    okCallback: () => void,
    errorCallback?: (message: string) => void,
  ) => void;
  blocks: Blocks[];
  blockedUnits: BlockedUnit[];
  refetch: (blockFilterParams?: BlockFilterParams) => void;
  setBlocksFilter: (filter: FilterMenuItem[] | undefined) => void;

  users: User[];
  groups: Group[];
  projects: Project[];
  pvmMode: boolean;
  filter?: FilterMenuItem[];
}

export interface BlockObjectPageStat {
  data: BlockedInfo[];
  title?: any;
  overviewType?: ConstraintType;
  overviewIsOpen: boolean;
  overviewBlocks?: BlockingDataDescription;
  openAddDialog: boolean;
  confirmFewDeleteDialog: boolean;
  confirmDeleteDialog: boolean;
  isSingleDeletion: boolean;
  waitForDeletion: boolean;
  completeDeletion: boolean;
  successDeletion: boolean;
  errorMessage?: string;
  errorDetails?: string;
  fewRowsData?: BlockedInfo[];
  objectForDelete?: BlockedInfo;
  filter?: FilterMenuItem[];
}

class BlockObjectPage extends React.Component<BlockObjectPageProps, BlockObjectPageStat> {
  constructor(props) {
    super(props);
    this.state = {
      data: ConstraintUtils.createBlockedInfoFromBlocksAndBlockedObjects(this.props.blocks, this.props.users, this.props.groups, this.props.pvmMode),
      confirmDeleteDialog: false,
      overviewIsOpen: false,
      openAddDialog: false,
      confirmFewDeleteDialog: false,
      isSingleDeletion: false,
      waitForDeletion: false,
      completeDeletion: false,
      successDeletion: false,
    };
    this.handleConfirmFewConstraintDeleteDialogClose = this.handleConfirmFewConstraintDeleteDialogClose.bind(this);
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDeleteDialog: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: true,
        waitForDeletion: true,
        completeDeletion: false,
      });
      const rowData = this.state.objectForDelete;
      if (this.state.objectForDelete?.global) {
        this.props.unblockSubject(
          rowData?.subjectId,
          rowData?.subjectType,
          rowData?.constraintType,
          () => {
            this.setState({
              completeDeletion: true,
              successDeletion: true,
              objectForDelete: undefined,
            });
          },
          (msg: { message: any; details?: string }) => {
            this.setState({
              completeDeletion: true,
              successDeletion: false,
              objectForDelete: undefined,
              errorMessage: msg.message.message,
              errorDetails: msg.details,
            });
          },
        );
      } else {
        this.props.deleteBlockFromUserOnObject(
          rowData?.subjectId,
          rowData?.subjectType,
          rowData?.projectKey,
          rowData?.objectId,
          rowData?.objectType === OBJECT_TYPE.PROJECT,
          rowData?.constraintType,
          () => {
            this.setState({
              completeDeletion: true,
              successDeletion: true,
              objectForDelete: undefined,
            });
          },
          (msg: { message: any; details?: string }) => {
            this.setState({
              completeDeletion: true,
              successDeletion: false,
              objectForDelete: undefined,
              errorMessage: msg.message.message,
              errorDetails: msg.details,
            });
          },
        );
      }
    }
  }

  deleteFewBlockFromUserOnObjectOrUnblockFewObjects(selectedRows: BlockedInfo[], result: any) {
    if (selectedRows[0].global) {
      this.props.unblockSubject(
        selectedRows[0].subjectId,
        selectedRows[0].subjectType,
        selectedRows[0].constraintType,
        () => {
          result.success.push(selectedRows[0]);
          selectedRows.splice(0, 1);
          if (selectedRows.length === 0) {
            if (result.errors.length > 0) {
              const errorTopicString = (
                <React.Fragment>
                  <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                    <b>Произошла ошибка при удалении блокировок </b>
                  </Typography>
                  <Typography variant="subtitle1">
                    {result.errors.map((error) => {
                      if (error.objectType === OBJECT_TYPE.GLOBAL) {
                        return <div>{'c субъекта ' + error.subjectName + ' (' + error.errorMsg.message + ')'}</div>;
                      }
                      if (error.objectName != '-') {
                        return (
                          <div>
                            {'c ' +
                              error.projectKey +
                              '/' +
                              error.objectName +
                              '(' +
                              error.constraintType +
                              ') для субъекта ' +
                              error.subjectName +
                              ' (' +
                              error.errorMsg.message +
                              ')'}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            {'c ' +
                              error.projectKey +
                              '(' +
                              error.constraintType +
                              ') для субъекта ' +
                              error.subjectName +
                              ' (' +
                              error.errorMsg.message +
                              ')'}
                          </div>
                        );
                      }
                    })}
                  </Typography>
                </React.Fragment>
              );
              const errorDetailString = (
                <React.Fragment>
                  <Typography variant="body2" color={'error'}>
                    {result.errors.map((error) => {
                      if (error.objectType === OBJECT_TYPE.GLOBAL) {
                        return (
                          <React.Fragment>
                            <div>
                              <b>{'c субъекта ' + error.subjectName + ':'}</b>
                            </div>
                            <div>{error.errorMsg.details}</div>
                          </React.Fragment>
                        );
                      }
                      if (error.objectName != '-') {
                        return (
                          <React.Fragment>
                            <div>
                              <b>
                                {'c ' +
                                  error.projectKey +
                                  '/' +
                                  error.objectName +
                                  '(' +
                                  error.constraintType +
                                  ') для субъекта ' +
                                  error.subjectName +
                                  ':'}
                              </b>
                            </div>
                            <div>{error.errorMsg.details}</div>
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <React.Fragment>
                            <div>
                              <b>{'c ' + error.projectKey + '(' + error.constraintType + ') для субъекта ' + error.subjectName + ':'}</b>
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
                errorMessage: errorTopicString,
                errorDetails: errorDetailString,
              });
            } else {
              this.setState({
                completeDeletion: true,
                successDeletion: true,
              });
            }
            return result;
          } else {
            return this.deleteFewBlockFromUserOnObjectOrUnblockFewObjects(selectedRows, result);
          }
        },
        (msg: { message: string; details?: string }) => {
          selectedRows[0].errorMsg = msg;
          result.errors.push(selectedRows[0]);
          selectedRows.splice(0, 1);
          if (selectedRows.length === 0) {
            const errorTopicString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>Произошла ошибка при удалении блокировок </b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error) => {
                    if (error.objectType === OBJECT_TYPE.GLOBAL) {
                      return <div>{'c субъекта ' + error.subjectName + ' (' + error.errorMsg.message + ')'}</div>;
                    }
                    if (error.objectName != '-') {
                      return (
                        <div>
                          {'c ' +
                            error.projectKey +
                            '/' +
                            error.objectName +
                            '(' +
                            error.constraintType +
                            ') для субъекта ' +
                            error.subjectName +
                            ' (' +
                            error.errorMsg.message +
                            ')'}
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          {'c ' +
                            error.projectKey +
                            '(' +
                            error.constraintType +
                            ') для субъекта ' +
                            error.subjectName +
                            ' (' +
                            error.errorMsg.message +
                            ')'}
                        </div>
                      );
                    }
                  })}
                </Typography>
              </React.Fragment>
            );
            const errorDetailString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    if (error.objectType === OBJECT_TYPE.GLOBAL) {
                      return (
                        <React.Fragment>
                          <div>
                            <b>{'c субъекта ' + error.subjectName + ':'}</b>
                          </div>
                          <div>{error.errorMsg.details}</div>
                        </React.Fragment>
                      );
                    }
                    if (error.objectName != '-') {
                      return (
                        <React.Fragment>
                          <div>
                            <b>
                              {'c ' +
                                error.projectKey +
                                '/' +
                                error.objectName +
                                '(' +
                                error.constraintType +
                                ') для субъекта ' +
                                error.subjectName +
                                ':'}
                            </b>
                          </div>
                          <div>{error.errorMsg.details}</div>
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <React.Fragment>
                          <div>
                            <b>{'c ' + error.projectKey + '(' + error.constraintType + ') для субъекта ' + error.subjectName + ':'}</b>
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
              errorMessage: errorTopicString,
              errorDetails: errorDetailString,
            });
            return result;
          } else {
            return this.deleteFewBlockFromUserOnObjectOrUnblockFewObjects(selectedRows, result);
          }
        },
      );
    } else {
      this.props.deleteBlockFromUserOnObject(
        selectedRows[0].subjectId,
        selectedRows[0].subjectType,
        selectedRows[0].projectKey,
        selectedRows[0].objectId,
        selectedRows[0].objectType === OBJECT_TYPE.PROJECT,
        selectedRows[0].constraintType,
        () => {
          result.success.push(selectedRows[0]);
          selectedRows.splice(0, 1);
          if (selectedRows.length === 0) {
            if (result.errors.length > 0) {
              const errorTopicString = (
                <React.Fragment>
                  <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                    <b>Произошла ошибка при удалении блокировок </b>
                  </Typography>
                  <Typography variant="subtitle1">
                    {result.errors.map((error) => {
                      if (error.objectType === OBJECT_TYPE.GLOBAL) {
                        return <div>{'c субъекта ' + error.subjectName + ' (' + error.errorMsg.message + ')'}</div>;
                      }
                      if (error.objectName != '-') {
                        return (
                          <div>
                            {'c ' +
                              error.projectKey +
                              '/' +
                              error.objectName +
                              '(' +
                              error.constraintType +
                              ') для субъекта ' +
                              error.subjectName +
                              ' (' +
                              error.errorMsg.message +
                              ')'}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            {'c ' +
                              error.projectKey +
                              '(' +
                              error.constraintType +
                              ') для субъекта ' +
                              error.subjectName +
                              ' (' +
                              error.errorMsg.message +
                              ')'}
                          </div>
                        );
                      }
                    })}
                  </Typography>
                </React.Fragment>
              );
              const errorDetailString = (
                <React.Fragment>
                  <Typography variant="body2" color={'error'}>
                    {result.errors.map((error) => {
                      if (error.objectType === OBJECT_TYPE.GLOBAL) {
                        return (
                          <React.Fragment>
                            <div>
                              <b>{'c субъекта ' + error.subjectName + ':'}</b>
                            </div>
                            <div>{error.errorMsg.details}</div>
                          </React.Fragment>
                        );
                      }
                      if (error.objectName != '-') {
                        return (
                          <React.Fragment>
                            <div>
                              <b>
                                {'c ' +
                                  error.projectKey +
                                  '/' +
                                  error.objectName +
                                  '(' +
                                  error.constraintType +
                                  ') для субъекта ' +
                                  error.subjectName +
                                  ':'}
                              </b>
                            </div>
                            <div>{error.errorMsg.details}</div>
                          </React.Fragment>
                        );
                      } else {
                        return (
                          <React.Fragment>
                            <div>
                              <b>{'c ' + error.projectKey + '(' + error.constraintType + ') для субъекта ' + error.subjectName + ':'}</b>
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
                errorMessage: errorTopicString,
                errorDetails: errorDetailString,
              });
            } else {
              this.setState({
                completeDeletion: true,
                successDeletion: true,
              });
            }
            return result;
          } else {
            return this.deleteFewBlockFromUserOnObjectOrUnblockFewObjects(selectedRows, result);
          }
        },
        (msg: { message: string; details?: string }) => {
          selectedRows[0].errorMsg = msg;
          result.errors.push(selectedRows[0]);
          selectedRows.splice(0, 1);
          if (selectedRows.length === 0) {
            const errorTopicString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>Произошла ошибка при удалении блокировок </b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error) => {
                    if (error.objectType === OBJECT_TYPE.GLOBAL) {
                      return <div>{'c субъекта ' + error.subjectName + ' (' + error.errorMsg.message + ')'}</div>;
                    }
                    if (error.objectName != '-') {
                      return (
                        <div>
                          {'c ' +
                            error.projectKey +
                            '/' +
                            error.objectName +
                            '(' +
                            error.constraintType +
                            ') для субъекта ' +
                            error.subjectName +
                            ' (' +
                            error.errorMsg.message +
                            ')'}
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          {'c ' +
                            error.projectKey +
                            '(' +
                            error.constraintType +
                            ') для субъекта ' +
                            error.subjectName +
                            ' (' +
                            error.errorMsg.message +
                            ')'}
                        </div>
                      );
                    }
                  })}
                </Typography>
              </React.Fragment>
            );
            const errorDetailString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    if (error.objectType === OBJECT_TYPE.GLOBAL) {
                      return (
                        <React.Fragment>
                          <div>
                            <b>{'c субъекта ' + error.subjectName + ':'}</b>
                          </div>
                          <div>{error.errorMsg.details}</div>
                        </React.Fragment>
                      );
                    }
                    if (error.objectName != '-') {
                      return (
                        <React.Fragment>
                          <div>
                            <b>
                              {'c ' +
                                error.projectKey +
                                '/' +
                                error.objectName +
                                '(' +
                                error.constraintType +
                                ') для субъекта ' +
                                error.subjectName +
                                ':'}
                            </b>
                          </div>
                          <div>{error.errorMsg.details}</div>
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <React.Fragment>
                          <div>
                            <b>{'c ' + error.projectKey + '(' + error.constraintType + ') для субъекта ' + error.subjectName + ':'}</b>
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
              errorMessage: errorTopicString,
              errorDetails: errorDetailString,
            });
            return result;
          } else {
            return this.deleteFewBlockFromUserOnObjectOrUnblockFewObjects(selectedRows, result);
          }
        },
      );
    }
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
        this.deleteFewBlockFromUserOnObjectOrUnblockFewObjects(this.state.fewRowsData, result);
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
              this.props.setBlocksFilter(filters);
              if (filters.length > 0) {
                this.props.refetch(Utils.createBlockFilterParamsFromFilterMenuItem(filters));
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
                variants: [OBJECT_TYPE_MAP[OBJECT_TYPE.PROJECT], OBJECT_TYPE_MAP[OBJECT_TYPE.INDEX], OBJECT_TYPE_MAP[OBJECT_TYPE.GLOBAL]],
                onlyIsOperator: true,
              },
              {
                name: 'Тип субъекта',
                field: 'subjectType',
                variants: [UNIT_MAP[Unit.USER], UNIT_MAP[Unit.GROUP]],
                onlyIsOperator: true,
              },
            ]}
          />
        </Grid>
        <Grid item style={{ width: '48px', marginTop: 6 }}>
          <IconButton
            onClick={() => {
              if (this.state.filter?.length > 0) {
                this.props.refetch(Utils.createBlockFilterParamsFromFilterMenuItem(this.state.filter));
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
        <Grid container direction={'row'} style={{ marginTop: 8 }} justifyContent={'space-between'}>
          <Grid item>
            <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 12 }}>
              Блокировки
            </Typography>
          </Grid>
        </Grid>
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
                <MaterialTable
                  icons={tableIcons}
                  title={'Блокировки, установленные на объекты'}
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
                      emptyDataSourceMessage: 'Список блокировок пуст',
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
                      field: 'subjectType',
                      title: 'Тип субъекта',
                      width: '1%',
                      lookup: {
                        GROUP: 'Группа',
                        USER: 'Пользователь',
                      },
                    },
                    {
                      field: 'subjectName',
                      title: 'Имя субъекта',
                    },
                    {
                      field: 'constraintType',
                      title: 'Тип объекта',
                    },
                    {
                      field: 'objectType',
                      title: 'Тип объекта',
                      // hidden: true,
                      lookup: OBJECT_TYPE_MAP,
                    },
                    {
                      field: 'projectKey',
                      title: 'Ключ проекта',
                    },
                    {
                      field: 'objectName',
                      title: 'Имя объекта',
                    },
                    // {
                    //   field: 'user',
                    //   title: 'Пользователь'
                    // },
                    {
                      field: 'description',
                      title: 'Причина блокировки',
                      // grouping: false
                      hidden: true,
                    },
                    {
                      title: 'Глобальная блокировка',
                      field: 'global',
                      hidden: true,
                      type: 'boolean',
                    },
                    {
                      field: 'subjectId',
                      hidden: true,
                    },
                    {
                      field: 'objectId',
                      hidden: true,
                    },
                  ]}
                  data={this.state.data}
                  actions={[
                    {
                      icon: () => <InfoOutlinedIcon color={'primary'} />,
                      tooltip: 'Просмотр блокировок',
                      onClick: (event, rowData: BlockedInfo) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (rowData.global) {
                          const title =
                            'Причина блокировки ' +
                            (rowData.subjectType === Unit.USER ? ' пользователя ' : ' группы ') +
                            rowData.subjectName +
                            ' на все объекты типа ' +
                            rowData.constraintType;
                          this.setState({
                            overviewIsOpen: true,
                            overviewBlocks: {
                              description: this.props.blockedUnits
                                .filter(
                                  (unit) =>
                                    unit.constraintType === rowData.constraintType &&
                                    unit.subjectType === rowData.subjectType &&
                                    unit.subjectId === rowData.subjectId,
                                )
                                .map((unit) => unit.description)[0],
                            },
                            title: title,
                            overviewType: rowData.objectType,
                          });
                        } else {
                          if (rowData.objectType === OBJECT_TYPE.PROJECT) {
                            this.props.getBlocksOnProject(
                              rowData.projectKey,
                              rowData.constraintType,
                              (blocks) => {
                                const title =
                                  'Причина блокировки ' +
                                  (rowData.subjectType === Unit.USER ? ' пользователя ' : ' группы ') +
                                  rowData.subjectName +
                                  ' на проект ' +
                                  rowData.projectKey;
                                const description = blocks
                                  .filter((block) => block.subjectId === rowData.subjectId && block.subjectType === rowData.subjectType)
                                  .map((block) => block.description)[0];
                                //+ (rowData.objectName !== '-' ? '/' + rowData.objectName : '')
                                this.setState({
                                  overviewIsOpen: true,
                                  overviewBlocks: { description: description },
                                  title: title,
                                  overviewType: rowData.objectType,
                                });
                              },
                              (errorMsg) => {
                                this.props.displayError(errorMsg);
                              },
                            );
                          } else {
                            this.props.getBlocksOnObject(
                              rowData.objectId,
                              rowData.constraintType,
                              (blocks) => {
                                const title =
                                  'Причина блокировки ' +
                                  (rowData.subjectType === Unit.USER ? ' пользователя ' : ' группы ') +
                                  rowData.subjectName +
                                  ' на объект ' +
                                  rowData.projectKey +
                                  '/' +
                                  rowData.objectName;
                                const description = blocks
                                  .filter((block) => block.subjectId === rowData.subjectId && block.subjectType === rowData.subjectType)
                                  .map((block) => block.description)[0];
                                //+ (rowData.objectName !== '-' ? '/' + rowData.objectName : '')
                                this.setState({
                                  overviewIsOpen: true,
                                  overviewBlocks: { description: description },
                                  title: title,
                                  overviewType: rowData.objectType,
                                });
                              },
                              (errorMsg) => {
                                this.props.displayError(errorMsg);
                              },
                            );
                          }
                        }
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Delete color={'primary'} />,
                      tooltip: 'Удалить блокировку',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({
                          objectForDelete: rowData,
                          confirmDeleteDialog: true,
                        });
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Delete color={'primary'} />,
                      tooltip: 'Удалить выбранные строки',
                      onClick: (event, rowData) => {
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

        <AddFab title={'Добавить блокировку на объект'} onClick={() => this.setState({ openAddDialog: true })} />

        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить блокировки с этого объекта?'}
          open={this.state.confirmDeleteDialog}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />

        <WaitingDialog
          title={this.state.isSingleDeletion ? 'Удаление блокировки с объекта' : 'Удаление блокировок с объектов'}
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
          successMessage={this.state.isSingleDeletion ? 'Блокировки успешно удалены с объекта' : 'Блокировки успешно удалены с объектов'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.errorDetails}
        />

        {this.state.overviewIsOpen && (
          <BlocksInfoDialog
            title={this.state.title}
            description={this.state.overviewBlocks}
            close={() => {
              this.setState({ overviewIsOpen: false });
            }}
          />
        )}

        {this.state.openAddDialog && (
          <AddBlockDialogContainer
            close={() => {
              this.setState({
                openAddDialog: false,
              });
            }}
            onClose={(
              value: string,
              constraintType?: ConstraintType,
              isGlobal?: boolean,
              description?: string,
              subjectType?: Unit,
              subject?: User | Group,
              objectId?: number,
              projectId?: string,
              isProject?: boolean,
            ) => {
              if (value === 'Ok') {
                if (isGlobal) {
                  this.props.blockSubject(
                    subject?.id,
                    subjectType,
                    constraintType,
                    description,
                    () => {
                      if (this.state.filter?.length > 0) {
                        this.props.refetch(Utils.createBlockFilterParamsFromFilterMenuItem(this.state.filter));
                      } else {
                        this.props.refetch();
                      }
                      this.props.displaySuccess('Блокировка создана успешно');
                    },
                    (error) => {
                      this.props.displayError(error);
                    },
                  );
                } else {
                  this.props.blockSubjectOnObject(
                    subject?.id,
                    subjectType,
                    projectId,
                    objectId,
                    isProject,
                    constraintType,
                    description,
                    () => {
                      if (this.state.filter?.length > 0) {
                        this.props.refetch(Utils.createBlockFilterParamsFromFilterMenuItem(this.state.filter));
                      } else {
                        this.props.refetch();
                      }
                    },
                    (error) => {
                      this.props.displayError(error);
                    },
                  );
                }
              }
            }}
            groups={this.props.groups}
            users={this.props.users}
          />
        )}

        <ConfirmDialog
          warningText={'Вы уверены, что хотите удалить блокировки с выбранных объектов?'}
          open={this.state.confirmFewDeleteDialog}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewConstraintDeleteDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default BlockObjectPage;

import MaterialTable, { MTableBodyRow, MTableHeader } from '@material-table/core';
import { createTheme, IconButton, ThemeProvider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Delete, FileCopy, Refresh, SyncProblem } from '@material-ui/icons';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import * as React from 'react';

import GenerateAPIKeyDialogView from '../../containers/apiKeys/GenerateAPIKeyDialogView';
import UpdateAPIKeyDialogView from '../../containers/apiKeys/UpdateAPIKeyDialogView';
import { APIkeyInfo, APIkeyParameters } from '../../store/apiKeys/Types';
import { ApiKeysUtils } from '../../utils/ApiKeysUtils';
import { TitleWithNotify } from '../../utils/TitleNotify';
import { tableIcons } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { AddFab } from '../utils/AddFab';
import { Loader } from '../utils/Loader';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

const themeHeader = createTheme({
  palette: {
    background: {
      paper: 'rgb(76, 175, 80, 0.25)',
    },
  },
});

const themeActions = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#ea9313',
    },
  },
});

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

export interface ApiKeysOverviewProps {
  isLoading: boolean;
  apiKeysInfo: APIkeyInfo[];
  isLegacyMode: boolean;
  generateKey: (user: string, apiKeyParams: APIkeyParameters, okCallback, errorCallback) => void;
  updateKey: (user: string, parameters: APIkeyParameters | null, okCallback, errorCallback) => void;
  deleteKey: (user: string, okCallback, errorCallback) => void;
  displayError: (error: string) => void;
  displayInfo: (info: string) => void;
  refetch: () => void;
}

export interface ApiKeysOverviewStat {
  createDialogOpen: boolean;
  selectedRow?: APIkeyInfo;
  confirmDelete: boolean;
  confirmDeleteFew: boolean;
  selectedRows?: APIkeyInfo[];
  openUpdate: boolean;

  isSingleDeletion: boolean;
  errorMessage: string;
  detailsMessage?: string;
  successMessage?: any;

  waitForGenerateKey: boolean;
  completeGenerateKey: boolean;
  successGenerateKey: boolean;

  waitForDeletion: boolean;
  completeDeletion: boolean;
  successDeletion: boolean;

  waitForUpdate: boolean;
  completeUpdate: boolean;
  successUpdate: boolean;
}

class ApiKeysOverview extends React.Component<ApiKeysOverviewProps & WithNavigationProps, ApiKeysOverviewStat> {
  constructor(props) {
    super(props);
    this.state = {
      createDialogOpen: false,
      confirmDelete: false,
      confirmDeleteFew: false,
      openUpdate: false,
      errorMessage: '',
      isSingleDeletion: true,
      waitForGenerateKey: false,
      completeGenerateKey: false,
      successGenerateKey: false,
      waitForDeletion: false,
      successDeletion: false,
      completeDeletion: false,
      waitForUpdate: false,
      completeUpdate: false,
      successUpdate: false,
    };
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
    this.handleConfirmFewDeleteClose = this.handleConfirmFewDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmDelete: false });
    if (value === 'Ok' && this.state.selectedRow) {
      this.setState({
        isSingleDeletion: true,
        waitForDeletion: true,
        completeDeletion: false,
        successDeletion: false,
      });
      this.props.deleteKey(
        this.state.selectedRow.user,
        () => {
          this.setState({
            completeDeletion: true,
            successDeletion: true,
            selectedRow: undefined,
          });
        },
        (errorMsg: { message: string; details?: string }) => {
          this.setState({
            completeDeletion: true,
            successDeletion: false,
            selectedRow: undefined,
            errorMessage: 'При удалении ключа произошла ошибка: ' + errorMsg.message,
            detailsMessage: errorMsg.details,
          });
        },
      );
    }
  }

  handleConfirmFewDeleteClose(value) {
    this.setState({ confirmDeleteFew: false });
    if (value === 'Ok') {
      this.setState({
        isSingleDeletion: false,
        waitForDeletion: true,
        completeDeletion: false,
        successDeletion: false,
      });
      if (this.state.selectedRows !== []) {
        const result = {
          success: [],
          errors: [],
        };
        ApiKeysUtils.recursiveFunction(
          this.state.selectedRows,
          result,
          'Произошла ошибка при удалении ключа(-ей) ',
          this.props.deleteKey,
          (endData) => {
            if (endData.success) {
              this.setState({
                completeDeletion: true,
                successDeletion: true,
              });
            } else {
              this.setState({
                completeDeletion: true,
                successDeletion: false,
                errorMessage: endData.error,
                detailsMessage: endData.details,
              });
            }
          },
        );
        this.setState({ selectedRows: [] });
      }
    }
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    const notify = 'В режиме авторизации AUTZ(ОСА) данный функционал используется только для обратной совместимости';
    return (
      <React.Fragment>
        <Grid container direction="row">
          <Grid item style={{ display: 'flex', width: 'calc(100% - 62px)', justifyContent: 'flex-start' }}>
            <Grid item style={{ width: '100%' }}>
              <ThemeProvider theme={theme}>
                <MaterialTable
                  icons={tableIcons}
                  columns={[
                    {
                      title: 'Пользователь',
                      field: 'user',
                      cellStyle: {
                        paddingTop: '10px',
                      },
                    },
                    {
                      title: 'API key',
                      field: 'key',
                    },
                    {
                      title: 'Описание',
                      field: 'description',
                    },
                    {
                      title: 'Дата создания',
                      field: 'createdAt',
                    },
                    {
                      title: 'Действителен до',
                      field: 'expiredAt',
                    },
                  ]}
                  localization={{
                    toolbar: {
                      searchTooltip: 'Поиск',
                      searchPlaceholder: 'Поиск',
                      nRowsSelected: '{0} ключа(-ей) выбрано',
                    },
                    grouping: {
                      placeholder: 'Перетащите сюда заголовок столбца, по которому хотите сгруппировать данные',
                      groupedBy: 'Сгруппировано по ',
                    },
                    body: {
                      emptyDataSourceMessage: 'Список API ключей пуст',
                    },
                    header: {
                      actions: '',
                    },
                  }}
                  data={this.props.apiKeysInfo}
                  title={TitleWithNotify('Список API ключей', !this.props.isLegacyMode && notify)}
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
                  }}
                  actions={[
                    (rowData) => ({
                      icon: () => {
                        return Date.parse(rowData.expiredAt) < Date.now() ? (
                          <ThemeProvider theme={themeActions}>
                            <SyncProblem color={'secondary'} />
                          </ThemeProvider>
                        ) : (
                          <div style={{ marginLeft: 24 }} />
                        );
                      },
                      tooltip: Date.parse(rowData.expiredAt) < Date.now() ? 'API ключ устарел' : '',
                      disabled: Date.parse(rowData.expiredAt) > Date.now(),
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({ selectedRow: rowData, openUpdate: true });
                      },
                      position: 'row',
                    }),
                    {
                      icon: () => <FileCopyOutlinedIcon fontSize={'small'} color={'primary'} />,
                      tooltip: 'Скопировать API ключ в буффер обмена',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigator.clipboard.writeText(rowData.key);
                        this.props.displayInfo(`API ключ для пользователя ${rowData.user} скопирован в буфер обмена`);
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Refresh fontSize={'small'} color={'primary'} />,
                      tooltip: 'Обновить',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({ selectedRow: rowData, openUpdate: true });
                      },
                      position: 'row',
                    },
                    {
                      icon: () => <Delete fontSize={'small'} color={'primary'} />,
                      tooltip: 'Удалить API ключ',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({ selectedRow: rowData, confirmDelete: true });
                      },
                    },
                    {
                      icon: () => <Delete color={'primary'} />,
                      tooltip: 'Удалить выбранные строки',
                      onClick: (event, rowData) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.setState({ selectedRows: rowData, confirmDeleteFew: true });
                      },
                      position: 'toolbarOnSelect',
                    },
                  ]}
                  components={{
                    Row: (props) => (
                      <MTableBodyRow
                        {...{
                          ...props,
                          options: {
                            ...props.options,
                            selection: true,
                          },
                        }}
                        // onDoubleClick={e => {
                        //   this.props.redirect(`/index/search/${props.data.name}&${props.data.projectShortName}`)
                        // }}
                      />
                    ),
                    Header: (props) => (
                      <ThemeProvider theme={themeHeader}>
                        <MTableHeader
                          {...{
                            ...props,
                            hasSelection: true,
                          }}
                        />
                      </ThemeProvider>
                    ),
                  }}
                />
              </ThemeProvider>
            </Grid>
          </Grid>
          <Grid item style={{ width: '62px', justifyContent: 'flex-end' }}>
            <IconButton
              style={{ marginLeft: 7 }}
              onClick={() => {
                this.props.refetch();
              }}
            >
              <Refresh id={'refreshButton'} color={'primary'} />
            </IconButton>
          </Grid>
        </Grid>

        <AddFab title={'Сгенерировать API ключ'} onClick={() => this.setState({ createDialogOpen: true })} />

        {this.state.createDialogOpen && (
          <GenerateAPIKeyDialogView
            close={() => {
              this.setState({ createDialogOpen: false });
            }}
            onChange={(apiKeyParams) => {
              this.setState({
                waitForGenerateKey: true,
                successGenerateKey: false,
                completeGenerateKey: false,
              });
              this.props.generateKey(
                apiKeyParams.user,
                apiKeyParams.params,
                (apiKey) => {
                  this.setState({
                    successGenerateKey: true,
                    completeGenerateKey: true,
                    successMessage: (
                      <React.Fragment>
                        <Grid container direction="row" justifyContent="center" alignItems="center" style={{ width: '100%', margin: 10 }}>
                          <Grid item style={{ width: 'calc(100% - 36px)' }}>
                            <Typography variant="subtitle1">
                              API ключ: <b>{apiKey}</b>
                            </Typography>
                          </Grid>
                          <Grid item style={{ width: '30px', marginLeft: 6 }}>
                            <IconButton
                              onClick={() => {
                                navigator.clipboard.writeText(apiKey);
                                this.props.displayInfo(`API ключ для пользователя ${apiKeyParams.user} скопирован в буфер обмена`);
                              }}
                              color="primary"
                              size={'small'}
                            >
                              <FileCopy />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </React.Fragment>
                    ),
                  });
                },
                (errorMsg: { message: string; details?: string }) => {
                  this.setState({
                    completeGenerateKey: true,
                    successGenerateKey: false,
                    errorMessage: 'При создании ключа произошла ошибка: ' + errorMsg.message,
                    detailsMessage: errorMsg.details,
                  });
                },
              );
            }}
            displayError={this.props.displayError}
          />
        )}

        <WaitingDialog
          customFormat={true}
          customSuccessMessage={true}
          title={'Генерация API ключа'}
          open={this.state.waitForGenerateKey}
          onClose={() => {
            this.setState({ waitForGenerateKey: false, errorMessage: '', detailsMessage: undefined, successMessage: undefined });
            if (this.state.successGenerateKey) {
              this.props.refetch();
            }
          }}
          complete={this.state.completeGenerateKey}
          success={this.state.successGenerateKey}
          successMessage={this.state.successMessage}
          errorMessage={this.state.errorMessage}
          details={this.state.detailsMessage}
          needDetailedInfo={true}
        />

        <WaitingDialog
          customFormat={false}
          title={'Обновление API ключа'}
          open={this.state.waitForUpdate}
          onClose={() => {
            this.setState({ waitForUpdate: false, errorMessage: '', detailsMessage: undefined });
            if (this.state.successUpdate) {
              this.props.refetch();
            }
          }}
          complete={this.state.completeUpdate}
          success={this.state.successUpdate}
          successMessage={'API ключ успешно обновлен'}
          errorMessage={this.state.errorMessage}
          needDetailedInfo={true}
          details={this.state.detailsMessage}
        />

        {this.state.waitForDeletion && (
          <WaitingDialog
            customFormat={false}
            title={this.state.isSingleDeletion ? 'Удаление API ключа' : 'Удаление API ключей'}
            open={this.state.waitForDeletion}
            onClose={() => {
              this.setState({ waitForDeletion: false, errorMessage: '', detailsMessage: undefined });
            }}
            complete={this.state.completeDeletion}
            success={this.state.successDeletion}
            successMessage={this.state.isSingleDeletion ? 'API ключ успешно удален' : 'API ключи успешно удалены'}
            errorMessage={this.state.errorMessage}
            needDetailedInfo={true}
            details={this.state.detailsMessage}
          />
        )}

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить API ключ для пользователя ' + this.state.selectedRow?.user + '? ' + 'Его будет невозможно восстановить.'
          }
          open={this.state.confirmDelete}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDialogDeleteClose}
        />

        <ConfirmDialog
          warningText={
            'Вы уверены, что хотите удалить API ключи для пользователей ' +
            this.state.selectedRows?.map((apiKey) => apiKey.user).join(', ') +
            '? ' +
            'Их будет невозможно восстановить.'
          }
          open={this.state.confirmDeleteFew}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmFewDeleteClose}
        />

        {this.state.openUpdate && (
          <UpdateAPIKeyDialogView
            user={this.state.selectedRow?.user}
            displayError={this.props.displayError}
            close={() => {
              this.setState({ openUpdate: false });
            }}
            onChange={(needTimeToLive, timeToLive, description) => {
              let param: APIkeyParameters = null;
              if (needTimeToLive) {
                param = {
                  description: description,
                  timeToLive: timeToLive,
                };
              }
              this.setState({
                waitForUpdate: true,
                successUpdate: false,
                completeUpdate: false,
              });
              this.props.updateKey(
                this.state.selectedRow?.user,
                param,
                () => {
                  this.setState({
                    successUpdate: true,
                    completeUpdate: true,
                  });
                },
                (errorMsg: { message: string; details?: string }) => {
                  this.setState({
                    completeUpdate: true,
                    successUpdate: false,
                    errorMessage: 'При обновлении ключа произошла ошибка: ' + errorMsg.message,
                    detailsMessage: errorMsg.details,
                  });
                },
              );
            }}
            description={this.state.selectedRow?.description}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withNavigation(ApiKeysOverview);

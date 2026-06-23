import MaterialTable from '@material-table/core';
import { IconButton } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Delete, Refresh } from '@material-ui/icons';
import * as React from 'react';

import { LocalUsersViewProps } from '../../../containers/users/pvm/LocalUsersView';
import { TitleWithNotify } from '../../../utils/TitleNotify';
import { tableIcons } from '../../../utils/Utils';
import ConfirmDialog from '../../ConfirmDialog';
import { AddFab } from '../../utils/AddFab';
import { Loader } from '../../utils/Loader';

import AddLocalUserDialog from './AddLocalUserDialog';

interface LocalUserFormProps extends LocalUsersViewProps {
  refetch: () => void;
  isLegacyMode: boolean;
  displayError: (error: string) => void;
  addUser: (userName: string, okCallback?, errorCallback?) => void;
  deleteUser: (userName: string, okCallback?, errorCallback?) => void;
}

interface LocalUserFormStat {
  confirmRemoveLocalUser: boolean;
  createOpen: boolean;
  selectedRow?: any;
}

export class LocalUserForm extends React.Component<LocalUserFormProps, LocalUserFormStat> {
  constructor(props) {
    super(props);
    this.state = {
      confirmRemoveLocalUser: false,
      createOpen: false,
    };
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmRemoveLocalUser: false });
    if (value === 'Ok') {
      this.props.deleteUser(this.state.selectedRow?.name, () => {
        this.props.refetch();
      });
    }
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderUsersList();
    }
  }

  renderUsersList() {
    const notify = 'В режиме авторизации AUTZ(ОСА) данный функционал используется только для API Ключей и их обратной совместимости';
    return (
      <React.Fragment>
        <Grid container direction="row">
          <Grid item style={{ display: 'flex', width: 'calc(100% - 62px)', justifyContent: 'flex-start' }}>
            <Grid item style={{ width: '100%' }}>
              <MaterialTable
                icons={tableIcons}
                title={TitleWithNotify('Локальные пользователи', !this.props.isLegacyMode && notify)}
                options={{
                  showTitle: true,
                  actionsColumnIndex: -1,
                  header: true,
                  pageSize: 20,
                  pageSizeOptions: [20, 50, 100],
                  emptyRowsWhenPaging: false,
                  padding: 'dense',
                  search: true,
                  paging: true,
                }}
                columns={[{ title: 'Имя пользователя', field: 'name' }]}
                data={this.props.users.map((user) => {
                  return { name: user.id };
                })}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти пользователя',
                  },
                  body: {
                    emptyDataSourceMessage: 'Список пользователей пуст',
                    addTooltip: '',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {},
                  },
                  header: {
                    actions: '',
                  },
                }}
                actions={[
                  {
                    icon: () => <Delete color={'primary'} />,
                    tooltip: 'Удалить локального пользователя',
                    onClick: (event, rowData) => {
                      event.preventDefault();
                      event.stopPropagation();
                      this.setState({ selectedRow: rowData, confirmRemoveLocalUser: true });
                    },
                  },
                ]}
              />
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
        <AddFab title={'Добавить локального пользователя'} onClick={() => this.setState({ createOpen: true })} />

        {this.state.confirmRemoveLocalUser && (
          <ConfirmDialog
            warningText={'Вы уверены, что хотите удалить локального пользователя ' + this.state.selectedRow?.name + '?'}
            open={this.state.confirmRemoveLocalUser}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogDeleteClose}
          />
        )}

        {this.state.createOpen && (
          <AddLocalUserDialog
            close={() => {
              this.setState({ createOpen: false });
            }}
            displayError={this.props.displayError}
            addLocalUser={(userName) => {
              this.props.addUser(userName, () => {
                this.props.refetch();
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

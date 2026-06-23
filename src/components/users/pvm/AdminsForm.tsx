import MaterialTable from '@material-table/core';
import { IconButton } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import {
  Add,
  ArrowDownward,
  Check,
  ChevronLeft,
  ChevronRight,
  Clear,
  Delete,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Refresh,
  Remove,
  Search,
} from '@material-ui/icons';
import * as React from 'react';
import { forwardRef } from 'react';

import CreateAdminDialogContainer from '../../../containers/users/pvm/CreateAdminDialogContainer';
import { User } from '../../../store/auth/Types';
import ConfirmDialog from '../../ConfirmDialog';
import { AddFab } from '../../utils/AddFab';
import { Loader } from '../../utils/Loader';

const tableIcons = {
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <Delete {...props} ref={ref} />),
  Add: forwardRef((props, ref) => <Add {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList fontSize="small" {...props} ref={ref} />),
};

export interface AdminsFormProps {
  admins: string[];
  isLoading: boolean;
  setAdmin: (userId: string, isAdmin: boolean, okCallback?) => void;
  displayError: (msg: string) => void;
  refetch: () => void;
}

export interface AdminsFormState {
  selectedRow?: User;
  confirmRemoveAdmin: boolean;
  createOpen: boolean;
}

export class AdminsForm extends React.Component<AdminsFormProps, AdminsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      confirmRemoveAdmin: false,
      createOpen: false,
    };
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmRemoveAdmin: false });
    if (value === 'Ok') {
      this.props.setAdmin(this.state.selectedRow?.name, false, () => {
        this.props.refetch();
      });
    }
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return this.renderAdminsList();
  }

  renderAdminsList() {
    return (
      <React.Fragment>
        <Grid container direction="row">
          <Grid item style={{ display: 'flex', width: 'calc(100% - 62px)', justifyContent: 'flex-start' }}>
            <Grid item style={{ width: '100%' }}>
              <MaterialTable
                icons={tableIcons}
                title="Администраторы"
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
                data={this.props.admins.map((admin) => {
                  return { name: admin };
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
                    tooltip: 'Лишить пользователя админских прав',
                    onClick: (event, rowData) => {
                      event.preventDefault();
                      event.stopPropagation();
                      this.setState({ selectedRow: rowData, confirmRemoveAdmin: true });
                      // this.props.history.push("/kafka/topics/" + rowData.name + "&" + rowData.project)
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
        <AddFab title={'Добавить администратора'} onClick={() => this.setState({ createOpen: true })} />

        {this.state.confirmRemoveAdmin && (
          <ConfirmDialog
            warningText={'Вы уверены, что хотите снять права администратора с пользователя ' + this.state.selectedRow?.name + ' ?'}
            open={this.state.confirmRemoveAdmin}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogDeleteClose}
          />
        )}

        {this.state.createOpen && (
          <CreateAdminDialogContainer
            close={() => {
              this.setState({ createOpen: false });
            }}
            displayError={this.props.displayError}
            onChange={(user) => {
              this.props.setAdmin(user.id, true, () => {
                this.props.refetch();
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

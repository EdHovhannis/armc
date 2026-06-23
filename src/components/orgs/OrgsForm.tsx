import MaterialTable from '@material-table/core';
import { Typography, Card, CardContent, Grid, Chip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Delete } from '@material-ui/icons';
import * as React from 'react';
import { RouterProps } from 'react-router';

import { Org } from '../../store/orgs/Types';
import { tableIcons } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import { AddFab } from '../utils/AddFab';
import { Loader } from '../utils/Loader';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import CreateOrgDialog from './CreateOrgDialog';
export interface OrgsFormProps {
  isAdmin: boolean;
  orgs: Array<Org>;
  isLoading: boolean;
  refetch: () => void;
  createOrg: (orgName: string, projectId: string, okCallback?) => void;
  deleteOrg: (orgId: number, okCallback?) => void;
}

export interface OrgsFormState {
  opened: boolean;
  confirmRemoveOrg: boolean;
  selectedRow?: Org;
  confirmStartMigration: boolean;
}

class OrgsForm extends React.Component<OrgsFormProps & WithNavigationProps, OrgsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      confirmRemoveOrg: false,
      confirmStartMigration: false,
    };
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
    this.handleConfirmDialogStartMigrationClose = this.handleConfirmDialogStartMigrationClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmRemoveOrg: false });
    if (value === 'Ok' && this.state.selectedRow?.id) {
      this.props.deleteOrg(this.state.selectedRow?.id, () => {
        this.props.refetch();
      });
    }
  }

  handleConfirmDialogStartMigrationClose(value) {
    this.setState({ confirmStartMigration: false });
    if (value === 'Ok') {
      this.props.startMigration(() => {
        this.props.refetchStatusMegration();
      });
    }
  }

  render(): React.ReactNode {
    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderGroups();
    }
  }

  renderGroups() {
    return (
      <React.Fragment>
        <MaterialTable
          icons={tableIcons}
          title="Организации в Индикаторе"
          options={{
            search: true,
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            emptyRowsWhenPaging: false,
            paging: true,
            showTitle: true,
            actionsColumnIndex: -1,
            header: true,
          }}
          columns={[
            { title: 'id', field: 'id' },
            {
              title: 'Название организации',
              field: 'name',
              render: (data) => <Typography> {data.name} </Typography>,
            },
            {
              title: 'projectId',
              field: 'projectId',
              render: (data) => <Typography> {data.projectId} </Typography>,
            },
          ]}
          data={this.props.orgs ?? []}
          localization={{
            toolbar: {
              searchTooltip: 'Поиск',
              searchPlaceholder: 'Найти организацию',
            },
            body: {
              emptyDataSourceMessage: 'Список пуст',
              addTooltip: '',
              deleteTooltip: 'Удалить',
              editTooltip: 'Редактировать',
              editRow: {
                deleteText: 'Вы уверены, что хотите удалить организацию?',
                cancelTooltip: 'Отмена',
                saveTooltip: 'Подтвердить',
              },
            },
            header: {
              actions: '',
            },
          }}
          onRowClick={(event, rowData: any) => {
            this.props.navigate('/settings/orgs/' + rowData.id);
          }}
          actions={[
            {
              icon: () => <Delete color={'primary'} />,
              tooltip: 'Удалить организацию',
              onClick: (event, rowData) => {
                event.preventDefault();
                event.stopPropagation();
                this.setState({ selectedRow: rowData, confirmRemoveOrg: true });
              },
            },
          ]}
        />

        <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent style={{ paddingBottom: '16px' }}>
                <Grid container spacing={3} direction="row" justifyContent="flex-start" alignItems="center">
                  <Grid
                    item
                    sm
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                      }}
                    >
                      <p>Миграция пользователей из индикатора в сервис авторизации</p>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginLeft: '15px',
                        }}
                        title={
                          this.props.statusMigration.migration_users_cnt &&
                          this.props.statusMigration.migration_error_cnt &&
                          this.props.statusMigration.auth_filter
                            ? 'Количество смигрированных пользователей: ' +
                              this.props.statusMigration.migration_users_cnt +
                              ', Количество ошибок: ' +
                              this.props.statusMigration.migration_error_cnt +
                              ', Auth filter: ' +
                              this.props.statusMigration.auth_filter.join(',')
                            : 'Детальные данные не получены'
                        }
                      >
                        <p>Статус:</p>
                        <Chip label={this.props.statusMigration.migration_state} variant={'outlined'} />
                      </div>
                    </div>
                    <Button
                      size="small"
                      color="primary"
                      onClick={(e: any) => {
                        this.setState({ confirmStartMigration: true });
                      }}
                    >
                      {' '}
                      Запустить миграцию{' '}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {this.state.confirmRemoveOrg && (
          <ConfirmDialog
            warningText={'Вы уверены, что хотите удалить организацию ' + this.state.selectedRow?.name + ' ?'}
            open={this.state.confirmRemoveOrg}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogDeleteClose}
          />
        )}

        {this.state.confirmStartMigration && (
          <ConfirmDialog
            warningText={'Вы уверены, что хотите запустить миграцию пользователей?'}
            open={this.state.confirmStartMigration}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogStartMigrationClose}
          />
        )}

        {this.props.isAdmin && <AddFab title={'Создать организацию'} onClick={() => this.setState({ opened: true })} />}
        <CreateOrgDialog
          open={this.state.opened}
          handleClose={() => this.setState({ opened: false })}
          handleOrgCreate={(orgName, projectId) => {
            this.props.createOrg(orgName, projectId, () => {
              this.props.refetch();
            });
            this.setState({ opened: false });
          }}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(OrgsForm);

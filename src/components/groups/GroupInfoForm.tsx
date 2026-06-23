import MaterialTable, { MTableBodyRow } from '@material-table/core';
import { Card, CardActions, CardContent, Grid, IconButton, Paper, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { RouteProps } from 'react-router';

import CheckPVMUserContainer from '../../containers/users/pvm/CheckPVMUserContainer';
import { User } from '../../store/auth/Types';
import { Group } from '../../store/group/Types';
import { tableIcons, Utils } from '../../utils/Utils';

const sberLogo = require('../../images/sberbank_logo.png');

export interface GroupInfoFormProps extends RouteProps {
  pvmMode: boolean;

  group: Group;
  groupUsers: Array<User>;
  users: Array<User>;
  isAdmin: boolean;
}

export interface GroupInfoFormDispatchProps {
  removeCurrentTeam();

  addUserToCurrentTeam(user: User);

  removeUserFromCurrentTeam(user_id: number);
}

export interface GroupInfoFormState {
  selectedUser?: User;
}

export default class GroupInfoForm extends React.Component<GroupInfoFormProps & GroupInfoFormDispatchProps, GroupInfoFormState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: undefined,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Grid container spacing={3} direction="row" justifyContent="flex-start" alignItems="center">
                  <Grid item sm>
                    <TextField label="Имя группы" fullWidth defaultValue={this.props.group.name} disabled={true} />
                  </Grid>
                </Grid>
              </CardContent>
              {this.props.isAdmin && (
                <CardActions>
                  <Button size="small" color="primary" onClick={this.props.removeCurrentTeam}>
                    Удалить
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        </Grid>
        <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Paper style={{ overflow: 'auto', padding: 12 }}>
              <Grid container justifyContent="flex-start" alignItems="flex-start" direction="row">
                <Grid item xs={8}>
                  {this.props.pvmMode ? (
                    <CheckPVMUserContainer
                      choseUser={(user) => {
                        this.setState({ selectedUser: user });
                      }}
                    />
                  ) : (
                    <Autocomplete
                      id="add-user-to-group"
                      style={{ width: '80%' }}
                      options={this.props.users.map((option) => option)}
                      getOptionLabel={(option) => option.name}
                      renderOption={(option) => option.name}
                      onChange={(e, newValue) => {
                        if (newValue) {
                          this.setState({
                            selectedUser: newValue,
                          });
                        }
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  )}
                </Grid>
                <Grid
                  item
                  style={{
                    marginTop: this.props.pvmMode ? 23 : 0,
                    marginLeft: 16,
                  }}
                >
                  <Button
                    size="small"
                    color="primary"
                    disabled={!this.state.selectedUser}
                    onClick={(e: any) => {
                      if (this.state.selectedUser) {
                        this.props.addUserToCurrentTeam(this.state.selectedUser);
                      }
                    }}
                  >
                    Добавить пользователя
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Grid
          container
          // style={{ width: "100%", marginTop: "1vw" }}
          justifyContent="center"
          alignItems="center"
        >
          <Paper style={{ overflow: 'auto', width: '100%', marginTop: '11px' }}>
            <MaterialTable
              icons={tableIcons}
              title=""
              columns={Utils.getColumns(
                [
                  {
                    title: 'id',
                    field: 'id',
                    grouping: false,
                    render: (user) => {
                      return <>{user.id}</>;
                    },
                  },
                  {
                    title: 'Имя пользователя',
                    field: 'name',
                    render: (user) => {
                      return <>{user.id}</>;
                    },
                  },
                  {
                    title: 'Исключить из группы',
                    field: 'name',
                    render: (user) => {
                      return (
                        <>
                          <IconButton
                            style={{ marginTop: 0 }}
                            onClick={() => {
                              this.props.removeUserFromCurrentTeam(user.id);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      );
                    },
                  },
                ],
                [],
              )}
              localization={{
                body: {
                  emptyDataSourceMessage: 'Список пользователей пуст',
                },
              }}
              data={this.props.groupUsers}
              options={{
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                emptyRowsWhenPaging: false,
                padding: 'dense',
                paging: true,
                search: false,
                toolbar: false,
                showTitle: true,
                actionsColumnIndex: -1,
                header: true,
              }}
              components={{
                Row: (props) => <MTableBodyRow id={props.id} {...props} />,
              }}
            />
          </Paper>
        </Grid>
      </React.Fragment>
    );
  }
}

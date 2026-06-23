import MaterialTable, { MTableBodyRow } from '@material-table/core';
import {
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Tab,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { TabContext, TabList, TabPanel, Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { RouteProps } from 'react-router';

import CheckPVMUserContainer from '../../containers/users/pvm/CheckPVMUserContainer';
import { User } from '../../store/auth/Types';
import { Org, IndicatorUser, IndicatorDatasource } from '../../store/orgs/Types';
import { Project } from '../../store/project/Types';
import { tableIcons, Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';

export interface OrgPageFormProps extends RouteProps {
  pvmMode: boolean;
  users: Array<User>;
  isAdmin: boolean;
  orgUsers: Array<IndicatorUser>;
  org: Org;
  orgDatasources: Array<IndicatorDatasource>;
  projects: Array<Project>;
}

export interface OrgPageFormDispatchProps {
  saveCurrentOrg();

  addUserToCurrentOrg(user: User, role: string);

  removeUserFromCurrentOrg(sub: string);

  updateRoleForUser(user: IndicatorUser, newRole: string | null);
}

export interface OrgPageFormState {
  selectedUser?: User;
  roleNewUser?: string;
  tabValue: string;
  confirmRemoveUser: boolean;
  selectedRemoveUserId?: string;
  datasourceName: string;
  urlSettings: string;
  selectedProjectNewDatasource?: string;
}

export default class OrgPageForm extends React.Component<OrgPageFormProps & OrgPageFormDispatchProps, OrgPageFormState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: undefined,
      roleNewUser: 'Viewer',
      tabValue: '1',
      confirmRemoveUser: false,
      selectedRemoveUserId: undefined,
      datasourceName: '',
      urlSettings: '',
      selectedProjectNewDatasource: '',
    };
    this.handleConfirmDialogDeleteClose = this.handleConfirmDialogDeleteClose.bind(this);
  }

  handleConfirmDialogDeleteClose(value) {
    this.setState({ confirmRemoveUser: false });
    if (value === 'Ok' && this.state.selectedRemoveUserId) {
      this.props.removeUserFromCurrentOrg(this.state.selectedRemoveUserId);
    }
  }

  render() {
    const optionsRole = ['Admin', 'Editor', 'Viewer'];

    // const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    //   this.setState({ tabValue: newValue });
    // };

    return (
      <React.Fragment>
        <Grid container style={{ width: '100%' }} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Grid container spacing={3} direction="row" justifyContent="flex-start" alignItems="center">
                  <Grid item sm>
                    <TextField
                      label="Имя организации"
                      fullWidth
                      defaultValue={this.props.org.name}
                      onChange={(e) => {
                        this.props.org.name = e.target.value;
                      }}
                    />
                    <TextField
                      label="ProjectId"
                      fullWidth
                      defaultValue={this.props.org.projectId}
                      onChange={(e) => {
                        this.props.org.projectId = e.target.value;
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              {this.props.isAdmin && (
                <CardActions>
                  <Button size="small" color="primary" onClick={this.props.saveCurrentOrg}>
                    Сохранить
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ width: '100%', bgcolor: '#fff', mt: 4 }}>
          <TabContext value={this.state.tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(e, value) => this.setState({ tabValue: value })} aria-label="lab API tabs example">
                <Tab label="Пользователи" value="1" />
                <Tab label="Датасорсы" value="2" />
              </TabList>
            </Box>
            <TabPanel style={{ padding: '0 24px 24px 24px' }} value="1">
              {this.props.isAdmin && (
                <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
                  <Grid item xs={12}>
                    <Paper style={{ overflow: 'auto', padding: 12 }}>
                      <Grid container justifyContent="flex-start" alignItems="center" direction="row">
                        <Grid item xs={6}>
                          {this.props.pvmMode ? (
                            <CheckPVMUserContainer
                              choseUser={(user) => {
                                this.setState({ selectedUser: user });
                              }}
                            />
                          ) : (
                            <Autocomplete
                              id="add-user-to-org"
                              options={this.props.users.map((option) => option)}
                              getOptionLabel={(option) => option.name}
                              renderOption={(option) => option.name}
                              onChange={(e, newValue) => {
                                this.setState({
                                  //@ts-ignore
                                  selectedUser: newValue,
                                });
                              }}
                              renderInput={(params) => <TextField {...params} />}
                            />
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Select
                            value={this.state.roleNewUser}
                            onChange={(e: any) => {
                              this.setState({
                                roleNewUser: e.target.value,
                              });
                            }}
                            input={<OutlinedInput labelWidth={0} name="Роль" id="roleNewUser" />}
                          >
                            {optionsRole.map((method, ind) => {
                              return (
                                <MenuItem value={method} key={ind}>
                                  {method}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          <Button
                            size="small"
                            color="primary"
                            onClick={(e: any) => {
                              this.state.selectedUser && this.state.roleNewUser
                                ? this.props.addUserToCurrentOrg(this.state.selectedUser, this.state.roleNewUser)
                                : null;
                            }}
                          >
                            {' '}
                            Добавить пользователя{' '}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              )}
              <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
                <Grid item xs={12}>
                  <Paper style={{ overflow: 'auto', width: '100%' }}>
                    <MaterialTable
                      icons={tableIcons}
                      title=""
                      columns={Utils.getColumns(
                        [
                          {
                            title: 'Login',
                            field: 'login',
                            grouping: false,
                            render: (user) => {
                              return <span>{user.sub}</span>;
                            },
                          },
                          {
                            title: 'Role',
                            field: 'role',
                            grouping: false,
                            render: (user) => {
                              return (
                                <Select
                                  value={user.role}
                                  onChange={(e: any) => {
                                    this.props.updateRoleForUser(user, e.target.value);
                                  }}
                                >
                                  {optionsRole.map((method, ind) => {
                                    return (
                                      <MenuItem value={method} key={ind}>
                                        {method}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              );
                            },
                          },
                          {
                            title: 'Исключить',
                            field: 'delete_user',
                            grouping: false,
                            render: (user) => {
                              return (
                                <IconButton
                                  style={{ marginTop: 0, padding: 0 }}
                                  onClick={() => {
                                    this.setState({
                                      selectedRemoveUserId: user.sub,
                                      confirmRemoveUser: true,
                                    });
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
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
                      data={this.props.orgUsers}
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
              </Grid>
            </TabPanel>
            <TabPanel style={{ padding: '0 24px 24px 24px' }} value="2">
              <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
                <Grid item xs={12}>
                  <Paper style={{ overflow: 'auto', padding: 12 }}>
                    <Grid container justifyContent="flex-start" alignItems="center" style={{ justifyContent: 'space-between' }} direction="row">
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          variant={'standard'}
                          defaultValue={this.state.datasourceName}
                          value={this.state.datasourceName}
                          label="Имя датасорса"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(e) => {
                            this.setState({ datasourceName: e.target.value });
                          }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          variant={'standard'}
                          defaultValue={this.state.urlSettings}
                          value={this.state.urlSettings}
                          label="URL"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(e) => {
                            this.setState({ urlSettings: e.target.value });
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={3}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Select
                          fullWidth
                          value={this.state.selectedProjectNewDatasource}
                          onChange={(e: any) => {
                            this.setState({
                              selectedProjectNewDatasource: e.target.value,
                            });
                          }}
                          label="project"
                          // input={<OutlinedInput labelWidth={0} name="project" id="projectNewDatasource" />}
                        >
                          {this.props.projects.map((project) => {
                            return (
                              <MenuItem value={project.shortName} key={project.id}>
                                {project.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e: any) => {
                            this.state.datasourceName != '' && this.state.urlSettings != '' && this.state.selectedProjectNewDatasource != ''
                              ? this.props.addDatasourceToOrg(
                                  this.state.datasourceName,
                                  this.state.urlSettings,
                                  //@ts-ignore
                                  this.state.selectedProjectNewDatasource,
                                )
                              : null;
                          }}
                        >
                          Добавить датасорс
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
              <Grid container style={{ width: '100%', marginTop: '1vw' }} justifyContent="center" alignItems="center">
                <Grid item xs={12}>
                  <Paper style={{ overflow: 'auto', width: '100%' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>URL</TableCell>
                          <TableCell>Project</TableCell>
                          {/* {this.props.isAdmin && <TableCell>Удалить</TableCell>} */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.props.orgDatasources &&
                          this.props.orgDatasources
                            .filter(
                              (datasource) =>
                                datasource.type == 'sbt-datasource-abyss' &&
                                datasource.jsonData.work_mode &&
                                datasource.jsonData.work_mode == 'abyss',
                            )
                            .map((datasource) => {
                              return (
                                <TableRow key={datasource.id}>
                                  <TableCell>{datasource.name}</TableCell>
                                  <TableCell>{datasource.url}</TableCell>
                                  <TableCell>
                                    {datasource.jsonData && datasource.jsonData.project ? datasource.jsonData.project : 'Не задан'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </Box>

        {this.state.confirmRemoveUser && (
          <ConfirmDialog
            warningText={'Вы уверены, что хотите удалить пользователя из организации?'}
            open={this.state.confirmRemoveUser}
            okString={'Да'}
            cancelString={'Отмена'}
            onClose={this.handleConfirmDialogDeleteClose}
          />
        )}
      </React.Fragment>
    );
  }
}

import { Grid, Paper, Select, TablePagination, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { RouteProps } from 'react-router';

import CheckPVMUserContainer from '../../containers/users/pvm/CheckPVMUserContainer';
import { User } from '../../store/auth/Types';
import { Group } from '../../store/group/Types';
import { Role, Unit, UnitRole } from '../../store/role/Types';

export interface PermissionUserFormProps extends RouteProps {
  allUsers: Array<User>;
  allGroups: Array<Group>;
  unitRoles: Array<UnitRole>;
  isShared: boolean;
  pvmMode: boolean;
  isLocalUserEnabled: boolean;
}

export interface ParentProps {
  canEditAccess: boolean;
  showSharedToggle: boolean;
  roles: Array<Role>;
}

export interface PermissionUserFormDispatchProps {
  addRoleToUnit: (unit: Unit, unitId: number, role: Role) => void;
  removeRoleFromUnit: (unit: Unit, unitId: number, role: Role) => void;
  removeAllRolesFromUnit: (unit: Unit, unitId: number) => void;
  addUnit: (unit: Unit, unitId: number) => void;
  setShared: (shared: boolean) => void;
  displayError: (msg: string) => void;
}

interface PermissionFormState {
  unitType: Unit;
  selectedUnit: User | Group;
  rowsPerPage: number;
  page: number;
}

export class PermissionForm extends React.Component<PermissionUserFormProps & PermissionUserFormDispatchProps & ParentProps, PermissionFormState> {
  constructor(props) {
    super(props);
    this.state = {
      unitType: Unit.USER,
      selectedUnit: { id: -1, name: '', admin: false },
      rowsPerPage: 10,
      page: 0,
    };
  }

  getOptions(): User[] | Group[] {
    if (this.state.unitType === Unit.USER) {
      return this.props.allUsers;
    } else {
      return this.props.allGroups;
    }
  }

  getUnitById(unit: Unit, unitId: number): User | Group {
    if (unit === Unit.USER) {
      if (!this.props.pvmMode) {
        return this.props.allUsers.filter((user) => user.id === unitId)[0];
      }
    } else {
      return this.props.allGroups.filter((group) => group.id === unitId)[0];
    }
  }

  getSeparateRolesArray(roles: Role[]) {
    const n = roles.length / 3;
    const res: any[] = [];
    res.push(roles.filter((role, ind) => ind < n));
    res.push(roles.filter((role, ind) => ind >= n && ind < 2 * n));
    const subRes: Role[] = roles.filter((role, ind) => ind >= 2 * n);
    if (roles.length % 3 > 0) {
      let i = Math.ceil(n) - subRes.length;
      for (i; i > 0; i--) {
        subRes.push('NON');
      }
    }
    res.push(subRes);
    return res;
  }
  handleChangePage = (event, value) => {
    this.setState({ page: value });
  };
  handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
    this.setState({ page: 0 });
  };
  render() {
    return (
      <div>
        {this.props.showSharedToggle && this.renderSharedResourceSwitch()}
        {this.renderUserSelector()}
        {this.props.roles.length > 9 ? this.renderRolesReadableTable() : this.renderRolesTable()}
      </div>
    );
  }

  renderSharedResourceSwitch() {
    return (
      <Paper>
        <Grid container style={{ width: '100%', padding: 12 }} alignContent="space-between">
          <Grid item xs>
            <Typography style={{ padding: 6 }}>Данный ресурс является публичным</Typography>
          </Grid>
          <Grid item>
            <Switch
              disabled={!this.props.canEditAccess}
              defaultChecked={this.props.isShared}
              onChange={(event) => {
                this.props.setShared(event.target.checked);
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  renderUserSelector() {
    if (!this.props.canEditAccess) {
      return null;
    }
    return (
      <Paper style={{ overflow: 'auto', padding: 12, marginTop: 12 }}>
        <Grid container justifyContent="space-between" alignItems="flex-start" direction="row">
          <Grid item xs={3}>
            <Select
              value={this.state.unitType === Unit.USER ? 'user' : 'group'}
              style={{
                marginBottom: 4,
                marginTop: this.props.pvmMode && this.state.unitType === Unit.USER ? 23 : 0,
                width: '100%',
              }}
              onChange={(e: any) => {
                this.setState({
                  unitType: e.target.value === 'user' ? Unit.USER : Unit.GROUP,
                });
              }}
              //variant={"standard"}
            >
              <MenuItem value={'user'}>Пользователь</MenuItem>
              <MenuItem value={'group'}>Группа</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6}>
            {this.props.pvmMode && this.state.unitType === Unit.USER ? (
              <CheckPVMUserContainer
                choseUser={(user) => {
                  this.setState({ selectedUnit: user });
                }}
              />
            ) : (
              <Autocomplete
                id="add-permission-to-user-or-group"
                style={{ width: '100%' }}
                options={this.getOptions().map((option) => option)}
                getOptionLabel={(option) => option.name}
                renderOption={(option) => option.name}
                onChange={(e, newValue) => {
                  this.setState({
                    selectedUnit: newValue,
                  });
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            )}
          </Grid>
          <Grid item xs={2}>
            <Button
              size="small"
              color="primary"
              style={{
                marginTop: this.props.pvmMode && this.state.unitType === Unit.USER ? 23 : 4,
              }}
              onClick={(e: any) => {
                if (this.state.selectedUnit == null) {
                  this.props.displayError(this.state.unitType === Unit.GROUP ? 'Группа не выбрана' : 'Пользовтель не выбран');
                  return;
                }
                if (this.state.selectedUnit.id === -1) {
                  this.props.displayError(this.state.unitType === Unit.GROUP ? 'Группа не выбрана' : 'Пользовтель не выбран');
                  return;
                }
                const exist =
                  this.props.unitRoles.filter(
                    (unit) =>
                      unit.unit == this.state.unitType &&
                      (((this.props.isLocalUserEnabled || this.state.unitType === Unit.GROUP) && unit.unitId == this.state.selectedUnit.id) ||
                        (!this.props.isLocalUserEnabled &&
                          this.state.unitType === Unit.USER &&
                          unit.unitId.toLowerCase() == this.state.selectedUnit.id.toLowerCase())),
                  ).length > 0;
                if (exist) {
                  this.props.displayError('Пользователь уже добавлен');
                  return;
                }
                if (this.state.selectedUnit.id === -1) {
                  this.props.displayError(this.state.unitType === Unit.GROUP ? 'Группа не выбрана' : 'Пользовтель не выбран');
                  return;
                }
                this.props.addUnit(this.state.unitType, this.state.selectedUnit.id);
              }}
            >
              {' '}
              Добавить{' '}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  renderRolesTable() {
    return (
      <Paper style={{ overflow: 'auto', width: '100%', marginTop: 12 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell size="small">Тип</TableCell>
              <TableCell size="small">id</TableCell>
              {!this.props.pvmMode && <TableCell size="small">Имя</TableCell>}
              {this.props.roles.map((role) => (
                <TableCell>{role.toString()}</TableCell>
              ))}
              {this.props.canEditAccess && <TableCell>Снять все права</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.unitRoles &&
              this.props.unitRoles
                .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                .map((unitRole) => {
                  return (
                    <TableRow key={unitRole.unitId}>
                      <TableCell style={{ color: 'rgba(0,0,0,0.54' }} size="small">
                        {unitRole.unit == Unit.USER && <PersonIcon />}
                        {unitRole.unit == Unit.GROUP && <GroupIcon />}
                      </TableCell>
                      <TableCell size="small">{unitRole.unitId}</TableCell>
                      {!this.props.pvmMode && (
                        <TableCell size="small">
                          {this.getUnitById(unitRole.unit, unitRole.unitId) ? this.getUnitById(unitRole.unit, unitRole.unitId).name : ''}
                        </TableCell>
                      )}
                      {this.props.roles.map((role) => {
                        return (
                          <TableCell padding="checkbox" size="small">
                            <Checkbox
                              disabled={!this.props.canEditAccess}
                              defaultChecked={unitRole.roles.includes(role)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  this.props.addRoleToUnit(unitRole.unit, unitRole.unitId, role);
                                } else {
                                  this.props.removeRoleFromUnit(unitRole.unit, unitRole.unitId, role);
                                }
                              }}
                            />
                          </TableCell>
                        );
                      })}
                      {
                        <TableCell size="small">
                          <IconButton
                            style={{ marginTop: 0 }}
                            onClick={() => {
                              this.props.removeAllRolesFromUnit(unitRole.unit, unitRole.unitId);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      }
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={this.props.unitRoles.length}
          rowsPerPage={this.state.rowsPerPage}
          page={this.state.page}
          onPageChange={this.handleChangePage}
          onRowsPerPageChange={this.handleChangeRowsPerPage}
          SelectProps={{
            inputProps: { 'aria-label': 'пользователей на странице' },
            native: true,
          }}
        />
      </Paper>
    );
  }

  renderRolesReadableTable() {
    return (
      <Paper style={{ overflow: 'auto', width: '100%', marginTop: 12 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell size="small">Тип</TableCell>
              <TableCell size="small">id</TableCell>
              {!this.props.pvmMode && <TableCell size="small">Имя</TableCell>}
              {/*{this.props.roles.map(role => <TableCell>{role.toString()}</TableCell>)}*/}
              <TableCell colSpan={Math.round(this.props.roles.length / 3) - 2}>Роли</TableCell>
              {this.props.canEditAccess && <TableCell>Снять все права</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.unitRoles &&
              this.props.unitRoles
                .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                .map((unitRole) => {
                  return (
                    <TableRow key={unitRole.unitId}>
                      <TableCell style={{ color: 'rgba(0,0,0,0.54' }} size="small">
                        {unitRole.unit == Unit.USER && <PersonIcon />}
                        {unitRole.unit == Unit.GROUP && <GroupIcon />}
                      </TableCell>
                      <TableCell size="small">{unitRole.unitId}</TableCell>
                      {!this.props.pvmMode && (
                        <TableCell size="small">
                          {this.getUnitById(unitRole.unit, unitRole.unitId) ? this.getUnitById(unitRole.unit, unitRole.unitId).name : ''}
                        </TableCell>
                      )}
                      {this.getSeparateRolesArray(this.props.roles).map((roles, index) => {
                        return (
                          <React.Fragment key={index}>
                            <TableRow>
                              {roles.map((role) => (
                                <TableCell key={role}>{role === 'NON' ? '' : role.toString()}</TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              {roles.map((role) => {
                                if (role === 'NON') {
                                  return <TableCell key={role} />;
                                }
                                return (
                                  <TableCell padding="checkbox" size="small" key={role}>
                                    <Checkbox
                                      disabled={!this.props.canEditAccess}
                                      defaultChecked={unitRole.roles.includes(role)}
                                      onChange={(event) => {
                                        if (event.target.checked) {
                                          this.props.addRoleToUnit(unitRole.unit, unitRole.unitId, role);
                                        } else {
                                          this.props.removeRoleFromUnit(unitRole.unit, unitRole.unitId, role);
                                        }
                                      }}
                                    />
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                            {index === 2 && (
                              <TableRow>
                                {roles.map((role) => {
                                  return <TableCell key={role} />;
                                })}
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {this.props.canEditAccess && (
                        <TableCell size="small">
                          <IconButton
                            style={{ marginTop: 0 }}
                            onClick={() => {
                              this.props.removeAllRolesFromUnit(unitRole.unit, unitRole.unitId);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={this.props.unitRoles.length}
          rowsPerPage={this.state.rowsPerPage}
          page={this.state.page}
          onPageChange={this.handleChangePage}
          onRowsPerPageChange={this.handleChangeRowsPerPage}
          SelectProps={{
            inputProps: { 'aria-label': 'пользователей на странице' },
            native: true,
          }}
        />
      </Paper>
    );
  }
}

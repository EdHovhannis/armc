import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { ReactRouterProps } from 'react-router';

import { PermissionForm, PermissionUserFormProps } from '../../components/permissions/PermissionForm';
import { Loader } from '../../components/utils/Loader';
import * as configSelectors from '../../store/config/Reducer';
import * as groupActions from '../../store/group/Actions';
import * as groupSelectors from '../../store/group/Reducer';
import * as notificationActions from '../../store/notification/Actions';
import * as roleActions from '../../store/role/Actions';
import * as roleSelectors from '../../store/role/Reducer';
import { PVMRole, Resource, Role, Unit } from '../../store/role/Types';
import * as userActions from '../../store/user/Actions';
import * as userSelectors from '../../store/user/Reducer';

export interface PermissionUserViewProps extends PermissionUserFormProps {
  isLoading: boolean;
}

export interface ParentProps {
  resourceId: number;
  resource: Resource;
  canEditAccess: boolean;
  roles: Array<Role> | undefined;
  // список ролей, который необходимо исключать, работает, только если roles = undefined
  excludedRoles: Array<Role> | undefined;
  showSharedToggle: boolean;
  skipUsersFetch: boolean;
  skipGroupsFetch: boolean;
}

export interface PermissionUserViewDProps {
  addUnitRoleToResource: (unit: Unit, unitId: number, role: Role, resource: Resource, resourceId: number, okCallback?, errorCallback?) => void;
  removeUnitRoleFromResource: (unit: Unit, unitId: number, role: Role, resource: Resource, resourceId: number, okCallback?, errorCallback?) => void;
  removeAllUnitRolesFromResource: (unit: Unit, unitId: number, resource: Resource, resourceId: number, okCallback?, errorCallback?) => void;
  fetchUnitRolesForResource: (resource: Resource, resourceId: number) => void;
  addUnitToResource: (unit: Unit, unitId: number) => void;
  fetchAllUsers: () => void;
  fetchAllGroups: () => void;
  fetchSharedStatus: (resource: Resource, resource_id: number) => void;
  setSharedStatus: (resource: Resource, resource_id: number, shared: boolean) => void;
  displayError: (msg: string) => void;
}

export class PermissionUserView extends React.Component<ParentProps & PermissionUserViewProps & PermissionUserViewDProps & ReactRouterProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchUnitRolesForResource(this.props.resource, this.props.resourceId);
    this.props.fetchSharedStatus(this.props.resource, this.props.resourceId);
    if (!this.props.skipUsersFetch && !this.props.pvmMode) this.props.fetchAllUsers();
    if (!this.props.skipGroupsFetch) this.props.fetchAllGroups();
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    } else {
      return this.renderPermissions();
    }
  }

  renderPermissions() {
    let roles: Array<Role>;

    if (this.props.roles === undefined) {
      roles = new Array<Role>();
      for (const role in Role) {
        if (this.props.excludedRoles) {
          const excludedRoles = [...this.props.excludedRoles];

          // убираем все исключенные роли
          if (excludedRoles.includes(role as Role)) continue;
        }
        if (!this.props.pvmMode) roles.push(role as Role);
        else if (role !== Role.GROUP_MANAGER) {
          roles.push(role as Role);
        }
      }
      if (this.props.pvmMode) {
        for (const role in PVMRole) {
          roles.push(role as Role);
        }
      }
    } else {
      roles = this.props.roles;
    }
    return (
      <PermissionForm
        displayError={this.props.displayError}
        pvmMode={this.props.pvmMode}
        canEditAccess={this.props.canEditAccess}
        showSharedToggle={this.props.showSharedToggle}
        roles={roles.filter((role) => role !== Role.ACCESS_MANAGER)}
        allUsers={this.props.allUsers}
        allGroups={this.props.allGroups.filter((group) => !group.virtual)}
        unitRoles={this.props.unitRoles}
        isShared={this.props.isShared}
        addRoleToUnit={(unit, unitId, role) => {
          this.props.addUnitRoleToResource(
            unit,
            unitId,
            role,
            this.props.resource,
            this.props.resourceId,
            () => {},
            () => {
              this.props.fetchUnitRolesForResource(this.props.resource, this.props.resourceId);
            },
          );
        }}
        removeRoleFromUnit={(unit, unitId, role, name) => {
          this.props.removeUnitRoleFromResource(
            unit,
            unitId,
            role,
            this.props.resource,
            this.props.resourceId,
            () => {},
            () => {
              this.props.fetchUnitRolesForResource(this.props.resource, this.props.resourceId);
            },
          );
        }}
        removeAllRolesFromUnit={(unit, unitId, name) => {
          this.props.removeAllUnitRolesFromResource(
            unit,
            unitId,
            this.props.resource,
            this.props.resourceId,
            () => {},
            () => {
              this.props.fetchUnitRolesForResource(this.props.resource, this.props.resourceId);
            },
          );
        }}
        addUnit={(unit, unitId) => {
          this.props.addUnitToResource(unit, unitId);
        }}
        setShared={(shared) => {
          this.props.setSharedStatus(this.props.resource, this.props.resourceId, shared);
        }}
        isLocalUserEnabled={this.props.isLocalUserEnabled}
      />
    );
  }
}

function mapStateToProps(state, props): PermissionUserViewProps {
  return {
    allUsers: userSelectors.getAllUsers(state),
    allGroups: groupSelectors.getGroups(state),
    isLoading: roleSelectors.getRolesIsLoading(state) || userSelectors.usersIsFetching(state) || groupSelectors.isGroupsLoading(state),
    unitRoles: roleSelectors.getUnitRoles(state),
    isShared: roleSelectors.isResourceShared(state, props.resource, props.resourceId),
    pvmMode: configSelectors.isPvmModeEnabled(state),
    isLocalUserEnabled: configSelectors.isLocalUsersEnabled(state),
  };
}

function mapDispatchToProps(dispatch: any): PermissionUserViewDProps {
  return {
    addUnitRoleToResource(unit: Unit, unitId: number, role: Role, resource: Resource, resourceId: number, okCallback?, errorCallback?) {
      dispatch(roleActions.addUnitRoleToResource(unit, unitId, role, resource, resourceId, okCallback, errorCallback));
    },
    removeAllUnitRolesFromResource(unit: Unit, unitId: number, resource: Resource, resourceId: number, okCallback?, errorCallback?) {
      dispatch(roleActions.removeAllUserRolesFromResource(unit, unitId, resource, resourceId, okCallback, errorCallback));
    },
    removeUnitRoleFromResource(unit: Unit, unitId: number, role: Role, resource: Resource, resourceId: number, okCallback?, errorCallback?) {
      dispatch(roleActions.removeUnitRoleFromResource(unit, unitId, role, resource, resourceId, okCallback, errorCallback));
    },
    fetchUnitRolesForResource(resource: Resource, resourceId: number) {
      dispatch(roleActions.fetchUnitRolesForResource(resource, resourceId));
    },
    addUnitToResource(unit: Unit, unitId: number) {
      dispatch(roleActions.addUnitActions([unit, unitId]));
    },
    fetchAllGroups() {
      dispatch(groupActions.fetchGroups());
    },
    fetchAllUsers() {
      dispatch(userActions.fetchUsers());
    },
    fetchSharedStatus(resource: Resource, resource_id: number) {
      dispatch(roleActions.fetchSharingStatusForResource(resource, resource_id));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    setSharedStatus(resource: Resource, resource_id: number, shared: boolean) {
      dispatch(roleActions.setSharedStatusForResource(resource, resource_id, shared));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermissionUserView);

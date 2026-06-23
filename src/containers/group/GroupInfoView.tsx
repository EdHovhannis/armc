import { Grid, Paper, Typography } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

import GroupInfoForm, { GroupInfoFormProps } from '../../components/groups/GroupInfoForm';
import { Loader } from '../../components/utils/Loader';
import { withNavigation, WithNavigationProps } from '../../components/utils/withNavigation';
import { withParams, WithParamsProps } from '../../components/utils/withParams';
import * as authSelectors from '../../store/auth/Reducer';
import { User } from '../../store/auth/Types';
import * as configSelectors from '../../store/config/Reducer';
import * as groupActions from '../../store/group/Actions';
import * as groupSelectors from '../../store/group/Reducer';
import * as notificationActions from '../../store/notification/Actions';
import { Resource, Role } from '../../store/role/Types';
import * as userActions from '../../store/user/Actions';
import * as userSelectors from '../../store/user/Reducer';
import PermissionUserView from '../permissions/PermissionUserView';

interface GroupInfoViewProps extends GroupInfoFormProps {
  isAdmin: boolean;
  isGroupLoading: boolean;
  isUsersLoading: boolean;
}

interface GroupInfoViewDispatchProps {
  fetchGroup(group_id: string | undefined): void;

  fetchUsersInGroup(group_id: string | undefined): void;

  fetchAllUsers(): void;

  addUserToGroup(user: User, group_id: number): void;

  removeUserFromGroup(user_id: number, group_id: number): void;

  removeGroupById(group_id: number, callback: () => void): void;

  displayError(msg: string): any;
}

class GroupInfoView extends React.Component<GroupInfoViewProps & GroupInfoViewDispatchProps & WithNavigationProps & WithParamsProps, any> {
  componentDidMount() {
    const groupId = this?.props?.id;
    this.props.fetchUsersInGroup(groupId);
    this.props.fetchGroup(groupId);
    if (!this.props.pvmMode) {
      this.props.fetchAllUsers();
    }
  }

  render() {
    if (this.props.isGroupLoading || this.props.isUsersLoading) {
      return <Loader />;
    } else {
      return (
        <>
          <Grid container style={{ width: '100%', marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={8}>
              <GroupInfoForm
                pvmMode={this.props.pvmMode}
                isAdmin={this.props.isAdmin}
                group={this.props.group}
                groupUsers={this.props.groupUsers}
                users={this.props.users}
                addUserToCurrentTeam={(user) => {
                  this.props.addUserToGroup(user, this.props.group.id);
                }}
                removeUserFromCurrentTeam={(user_id) => {
                  this.props.removeUserFromGroup(user_id, this.props.group.id);
                }}
                removeCurrentTeam={() => {
                  this.props.removeGroupById(this.props.group.id, () => this.props.navigate('/groups'));
                }}
              />
            </Grid>
          </Grid>
          {!this.props.pvmMode && (
            <>
              <Grid container style={{ width: '100%', marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
                <Grid item xs={8}>
                  <Paper style={{ width: '100%', height: 64 }}>
                    <Typography variant="h6" style={{ width: '100%', padding: 16, color: 'rgba(0.0,0.0,0.0,0.54)' }}>
                      Права на редактирование группы
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Grid container style={{ width: '100%', marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
                <Grid item xs={8}>
                  <div>
                    <PermissionUserView
                      canEditAccess={this.props.isAdmin || this.props.group.canManageAccess}
                      skipUsersFetch
                      skipGroupsFetch
                      roles={[Role.GROUP_MANAGER, Role.ACCESS_MANAGER]}
                      resourceId={this.props.group.id}
                      resource={Resource.GROUP}
                      showSharedToggle={false}
                    />
                  </div>
                </Grid>
              </Grid>
            </>
          )}
        </>
      );
    }
  }
}

function mapStateToProps(state: any): GroupInfoViewProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    group: groupSelectors.getCurrentTeam(state) || {
      id: 0,
      name: '',
      canManageAccess: false,
      canManageUsers: false,
      virtual: false,
    },
    groupUsers: groupSelectors.getUsersInGroup(state),
    users: userSelectors.getAllUsers(state),
    isGroupLoading: groupSelectors.isGroupLoading(state),
    isUsersLoading: groupSelectors.isUsersLoading(state),
    pvmMode: configSelectors.isPvmModeEnabled(state),
  };
}

function mapDispatchToProps(dispatch: any): GroupInfoViewDispatchProps {
  return {
    fetchGroup: (team_id: string) => {
      dispatch(groupActions.getByID(team_id));
    },
    removeUserFromGroup(user_id: number, team_id: number) {
      dispatch(groupActions.removeUserFromTeam(team_id, user_id));
    },
    addUserToGroup(user: User, team_id: number) {
      dispatch(groupActions.addUserToTeam(team_id, user));
    },
    fetchUsersInGroup(team_id: string) {
      dispatch(groupActions.fetchGroupMembers(team_id));
    },
    fetchAllUsers() {
      dispatch(userActions.fetchUsers());
    },
    removeGroupById(team_id: number, callback: () => void) {
      dispatch(groupActions.removeTeam(team_id, callback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default withNavigation(withParams(connect(mapStateToProps, mapDispatchToProps)(GroupInfoView)));

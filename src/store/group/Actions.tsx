import { createAsyncAction } from 'typesafe-actions';

import GroupService from '../../services/GroupService';
import { User } from '../auth/Types';
import * as notificationActions from '../notification/Actions';

import { Group } from './Types';

export const fetchAllGroupsAction = createAsyncAction('@group/FETCH_GROUPS', '@group/FETCH_GROUPS_SUCC', '@group/FETCH_GROUPS_FAIL')<
  void,
  Group[],
  void
>();

export const fetchUserGroupsAction = createAsyncAction('@group/FETCH_USER_GROUPS', '@group/FETCH_USER_GROUPS_SUCC', '@group/FETCH_USER_GROUPS_FAIL')<
  void,
  Group[],
  string
>();

export const fetchUsersInGroupAction = createAsyncAction(
  '@group/FETCH_USERS_IN_GROUP',
  '@group/FETCH_USERS_IN_GROUP_SUCC',
  '@group/FETCH_USERS_IN_GROUP_FAIL',
)<void, User[], string>();

export const fetchGroupByIdAction = createAsyncAction('@group/GET_BY_ID', '@group/GET_BY_ID_SUCC', '@group/GET_BY_ID_FAIL')<void, Group, void>();

export const fetchGroupByNameAction = createAsyncAction('@group/GET_BY_NAME', '@group/GET_BY_NAME_SUCC', '@group/GET_BY_NAME_FAIL')<
  void,
  Group,
  void
>();

export const createGroupAction = createAsyncAction('@group/CREATE_GROUP', '@group/CREATE_GROUP_SUCC', '@group/CREATE_GROUP_FAIL')<
  void,
  Group,
  void
>();

export const addUserToGroupAction = createAsyncAction('@group/USER_ADD', '@group/USER_ADD_SUCC', '@group/USER_ADD_FAIL')<void, User, void>();

export const removeUserFromGroupAction = createAsyncAction('@group/USER_REMOVE', '@group/USER_REMOVE_SUCC', '@group/USER_REMOVE_FAIL')<
  void,
  number,
  void
>();

export const removeTeamAction = createAsyncAction('@group/GROUP_REMOVE', '@group/GROUP_REMOVE_SUCC', '@group/GROUP_REMOVE_FAIL')<void, void, void>();

export function fetchGroups() {
  return (dispatch, getState) => {
    dispatch(fetchAllGroupsAction.request());
    GroupService.fetchGroups(
      (teams: Group[]) => {
        dispatch(fetchAllGroupsAction.success(teams));
      },
      (error) => {
        dispatch(fetchAllGroupsAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}
export function fetchGroupMembers(team_id: number, okCallback?: (users: User[]) => void) {
  return (dispatch, getState) => {
    dispatch(fetchUsersInGroupAction.request());
    GroupService.fetchGroupMembers(
      team_id,
      (users: User[]) => {
        dispatch(fetchUsersInGroupAction.success(users));
        if (okCallback) okCallback(users);
      },
      (error) => {
        dispatch(fetchUsersInGroupAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getByName(name) {
  return (dispatch, getState) => {
    dispatch(fetchGroupByNameAction.request());
    GroupService.getGroupByName(
      name,
      (team: Group) => {
        dispatch(fetchGroupByNameAction.success(team));
      },
      (error) => {
        dispatch(fetchGroupByNameAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getByID(teamId: string) {
  return (dispatch, getState) => {
    dispatch(fetchGroupByIdAction.request());
    GroupService.fetchGroupById(
      teamId,
      (team: Group) => {
        dispatch(fetchGroupByIdAction.success(team));
      },
      (error) => {
        dispatch(fetchGroupByIdAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function createNewTeam(team_name: string, okCallback?) {
  return (dispatch, getState) => {
    dispatch(createGroupAction.request());
    GroupService.createNewGroup(
      team_name,
      () => {
        const team: Group = {
          name: team_name,
          canManageAccess: false,
          canManageUsers: false,
        };
        if (okCallback) {
          okCallback(team);
        }
        dispatch(createGroupAction.success(team));
        dispatch(notificationActions.success('Группа создана'));
      },
      (error) => {
        dispatch(createGroupAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function addUserToTeam(team_id: number, user: User) {
  return (dispatch, getState) => {
    dispatch(addUserToGroupAction.request());
    GroupService.addUserToGroup(
      team_id,
      user.id,
      () => {
        dispatch(addUserToGroupAction.success(user));
        dispatch(notificationActions.success('Пользователь добавлен в группу'));
      },
      (error) => {
        dispatch(addUserToGroupAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function removeUserFromTeam(team_id: number, user_id: number) {
  return (dispatch, getState) => {
    dispatch(removeUserFromGroupAction.request());
    GroupService.removeUserFromGroup(
      team_id,
      user_id,
      () => {
        dispatch(removeUserFromGroupAction.success(user_id));
        dispatch(notificationActions.success('Пользователь исключен из группы'));
      },
      (error) => {
        dispatch(removeUserFromGroupAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function removeTeam(team_id: number, callback: () => void) {
  return (dispatch, getState) => {
    dispatch(removeTeamAction.request());
    GroupService.removeGroup(
      team_id,
      () => {
        dispatch(removeTeamAction.success());
        dispatch(notificationActions.success('Группа удалена'));
        callback();
      },
      (error) => {
        dispatch(removeTeamAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

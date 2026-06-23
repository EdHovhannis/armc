import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { User } from '../auth/Types';

import * as actions from './Actions';
import { Group } from './Types';

export interface GroupStoreState {
  groups: Array<Group>;
  actionInProgress: boolean;
  groupsIsLoading: boolean;
  groupIsLoading: boolean;
  usersIsLoading: boolean;
  selectedGroup?: Group;
  selectedGroupUsers: Array<User>;
  groupLoading: boolean;
}

const initialState: GroupStoreState = {
  groups: [],
  groupsIsLoading: false,
  groupIsLoading: false,
  actionInProgress: false,
  usersIsLoading: false,
  groupLoading: false,
  selectedGroup: undefined,
  selectedGroupUsers: [],
};

export type Actions = ActionType<typeof actions>;

function updateGroup(teams: Group[], team: Group): Group[] {
  const findedTeams = teams.filter((e_team) => team.id === e_team.id);

  if (findedTeams.length > 0) {
    findedTeams[0] = team;
  } else teams.push(team);

  return teams;
}

export const reducer: Reducer<GroupStoreState> = (state: GroupStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchAllGroupsAction.request):
      return { ...state, groupsIsLoading: true };

    case getType(actions.fetchAllGroupsAction.success):
      return { ...state, groupsIsLoading: false, groups: action.payload };

    case getType(actions.fetchAllGroupsAction.failure):
      return { ...state, groupsIsLoading: false };

    case getType(actions.fetchUsersInGroupAction.request):
      return { ...state, usersIsLoading: true };

    case getType(actions.fetchUsersInGroupAction.success):
      return { ...state, usersIsLoading: false, selectedGroupUsers: action.payload };

    case getType(actions.fetchUsersInGroupAction.failure):
      return { ...state, usersIsLoading: false };

    // fetch by i
    case getType(actions.fetchGroupByIdAction.request):
      return { ...state, groupLoading: true };

    case getType(actions.fetchGroupByIdAction.success):
      return {
        ...state,
        groups: updateGroup(state.groups, action.payload),
        selectedGroup: action.payload,
        groupLoading: false,
      };

    case getType(actions.fetchGroupByIdAction.failure):
      return { ...state, groupLoading: true };

    // fetch by name
    case getType(actions.fetchGroupByNameAction.request):
      return { ...state, groupLoading: false };

    case getType(actions.fetchGroupByNameAction.success):
      return {
        ...state,
        groups: updateGroup(state.groups, action.payload),
        selectedGroup: action.payload,
        groupLoading: false,
      };

    case getType(actions.fetchGroupByNameAction.failure):
      return { ...state, groupLoading: false };

    case getType(actions.createGroupAction.success):
      return { ...state, groups: [...state.groups, action.payload], actionInProgress: false };

    case getType(actions.removeUserFromGroupAction.success): {
      const newUsers = state.selectedGroupUsers.filter((user) => user.id !== action.payload);
      return { ...state, selectedGroupUsers: newUsers };
    }
    case getType(actions.addUserToGroupAction.success):
      return { ...state, selectedGroupUsers: [...state.selectedGroupUsers, action.payload] };

    default:
      return state;
  }
};

export function getGroups(state: ApplicationState): Group[] {
  return state.team.groups;
}

export function getCurrentTeam(state: ApplicationState): Group | undefined {
  return state.team.selectedGroup;
}

export function getUsersInGroup(state): User[] {
  return state.team.selectedGroupUsers;
}

export function isGroupLoading(state: ApplicationState) {
  return state.team.groupLoading;
}

export function isGroupsLoading(state: ApplicationState) {
  return state.team.groupsIsLoading;
}

export function isUsersLoading(state: ApplicationState) {
  return state.team.usersIsLoading;
}

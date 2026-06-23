import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { SearchUsers, User } from '../auth/Types';

import * as actions from './Actions';

export interface UsersStoreState {
  users: User[];
  searchedUsers: User[];
  usersIsLoading: boolean;
  admins: string[];
  localUsers: User[];
  isLocalUsersLoading: boolean;
  selectedUser: User | undefined;
  isAdminsLoading: boolean;
  actionInProgress: boolean;
  userLoadInProgress: boolean;
}

const initialState: UsersStoreState = {
  users: [],
  searchedUsers: [],
  usersIsLoading: false,
  admins: [],
  isAdminsLoading: false,
  localUsers: [],
  isLocalUsersLoading: true,
  selectedUser: undefined,
  actionInProgress: false,
  userLoadInProgress: false,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<UsersStoreState> = (state: UsersStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchUsersAction.request):
      return { ...state, actionInProgress: true };

    case getType(actions.fetchUsersAction.success):
      return { ...state, users: action.payload, actionInProgress: false };

    case getType(actions.fetchUsersAction.failure):
      return { ...state, actionInProgress: false };

    case getType(actions.fetchAdminsAction.request):
      return { ...state, isAdminsLoading: true };

    case getType(actions.fetchAdminsAction.success):
      return { ...state, admins: action.payload, isAdminsLoading: false };

    case getType(actions.fetchAdminsAction.failure):
      return { ...state, isAdminsLoading: false };

    case getType(actions.fetchLocalUsersAction.request):
      return { ...state, isLocalUsersLoading: true };

    case getType(actions.fetchLocalUsersAction.success):
      return { ...state, localUsers: action.payload, isLocalUsersLoading: false };

    case getType(actions.fetchLocalUsersAction.failure):
      return { ...state, isLocalUsersLoading: false };

    case getType(actions.searchUsersByMaskAction.request):
      return { ...state, usersIsLoading: true };

    case getType(actions.searchUsersByMaskAction.success):
      return { ...state, searchedUsers: action.payload, usersIsLoading: false };

    case getType(actions.searchUsersByMaskAction.failure):
      return { ...state, usersIsLoading: false };

    case getType(actions.fetchUserAction.request):
      return { ...state, userLoadInProgress: true };

    case getType(actions.fetchUserAction.success):
      return { ...state, selectedUser: action.payload, userLoadInProgress: false };

    case getType(actions.fetchUserAction.failure):
      return { ...state, userLoadInProgress: false };

    default:
      return state;
  }
};

export function getAllUsers(state: ApplicationState): User[] {
  return state.user.users;
}

export function getSearchedUsers(state: ApplicationState): User[] {
  return state.user.searchedUsers || [];
}

export function usersIsLoading(state: ApplicationState): boolean {
  return state.user.usersIsLoading;
}

export function getAdmins(state: ApplicationState): string[] {
  return state.user.admins;
}

export function getLocalUsers(state: ApplicationState): User[] {
  return state.user.localUsers;
}

export function getSelectedUser(state: ApplicationState): User | undefined {
  return state.user.selectedUser;
}

export function usersIsFetching(state: ApplicationState): boolean {
  return state.user.actionInProgress;
}

export function adminsIsFetching(state: ApplicationState): boolean {
  return state.user.isAdminsLoading;
}

export function isLocalUsersLoading(state: ApplicationState): boolean {
  return state.user.isLocalUsersLoading;
}

export function isUserLoadInProgress(state: ApplicationState): boolean {
  return state.user.userLoadInProgress;
}

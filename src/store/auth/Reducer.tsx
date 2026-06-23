import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { AuthType, User } from './Types';

export interface AuthStoreState {
  authPerformed: boolean;
  authenticated: boolean;
  username: string | undefined;
  user: User | undefined;
  authType?: AuthType;
  isLoading: boolean;
}

export const initialState: AuthStoreState = {
  authPerformed: false,
  username: undefined,
  authenticated: false,
  user: undefined,
  authType: undefined,
  isLoading: false,
};

export type NotificationActions = ActionType<typeof actions>;

export const reducer: Reducer<AuthStoreState> = (state: AuthStoreState = initialState, action: NotificationActions) => {
  switch (action.type) {
    case getType(actions.authActions.success):
      return {
        ...state,
        authenticated: true,
        user: action.payload.user,
        username: action.payload.username,
      };

    case getType(actions.authTypeActions.request):
      return {
        ...state,
        isLoading: true,
      };

    case getType(actions.authTypeActions.success):
      return {
        ...state,
        isLoading: false,
        authType: action.payload,
      };

    case getType(actions.authTypeActions.failure):
      return {
        ...state,
        isLoading: false,
        authType: undefined,
      };

    case getType(actions.checkAuthAction.request):
      return {
        ...state,
        isLoading: true,
      };

    case getType(actions.checkAuthAction.success):
      return {
        ...state,
        authenticated: true,
        isLoading: false,
        username: action.payload.name,
        user: action.payload,
        authPerformed: true,
      };

    case getType(actions.checkAuthAction.failure):
      return {
        ...state,
        authenticated: false,
        isLoading: false,
        authPerformed: true,
      };

    case getType(actions.logoutAction.success):
      return {
        ...state,
        authenticated: false,
        username: undefined,
      };

    default:
      return state;
  }
};

export function isAuthPerformed(state: ApplicationState): boolean {
  return state.auth.authPerformed;
}

export function isLoading(state: ApplicationState): boolean {
  return state.auth.isLoading;
}

export function isAuthenticated(state: ApplicationState): boolean {
  return state.auth.authenticated;
}

export function username(state: ApplicationState): string {
  return state.auth.username || '';
}

export function user(state: ApplicationState): User | undefined {
  return state.auth.user;
}

export function authType(state: ApplicationState): AuthType | undefined {
  return state.auth.authType;
}

export function isAdmin(state: ApplicationState): boolean {
  if (state.auth.user) return state.auth.user.admin || false;
  else return false;
}

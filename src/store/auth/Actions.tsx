import { Dispatch } from 'redux';
import { createAsyncAction } from 'typesafe-actions';

import AuthService from '../../services/AuthService';
import * as notificationActions from '../notification/Actions';

import { AuthResult, AuthType, User } from './Types';

export const logoutAction = createAsyncAction('@auth/LOGOUT_REQ', '@auth/LOGOUT_SUCC', '@auth/LOGOUT_FAIL')<void, void, void>();

export const authActions = createAsyncAction('@auth/REGISTER_REQ', '@auth/REGISTER_SUCC', '@auth/REGISTER_FAIL')<void, AuthResult, void>();

export const authTypeActions = createAsyncAction('@auth/AUTHTYPE_REQ', '@auth/AUTHTYPE_SUCC', '@auth/AUTHTYPE_FAIL')<void, AuthType, void>();

export const checkAuthAction = createAsyncAction('@auth/CHECK_REQ', '@auth/CHECK_SUCC', '@auth/CHECK_FAIL')<void, User, void>();

export const register = (username: string, password: string) => {
  return (dispatch, getState) => {
    dispatch(authActions.request());
    AuthService.register(
      username,
      password,
      (data: any, redirect) => {
        dispatch(authActions.success({ user: data, username: username }));
        dispatch(notificationActions.success('Добро пожаловать!'));
        if (redirect) {
          // @ts-ignore
          window.location.href = redirect;
        }
      },
      (error: string) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
};

export const checkAuthType = (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
  return (dispatch: Dispatch) => {
    dispatch(authTypeActions.request());
    AuthService.checkAuthType(
      (type: AuthType) => {
        dispatch(authTypeActions.success(type));
        if (okCallback) {
          okCallback(type);
        }
      },
      (errorMessage: string) => {
        dispatch(authTypeActions.failure());
        notificationActions.error('Something unexpected happen');
        if (errorCallback) {
          errorCallback(errorMessage);
        }
      },
    );
  };
};

export const logout = () => {
  return (dispatch, getState) => {
    dispatch(logoutAction.request());
    AuthService.logout(
      () => {
        dispatch(logoutAction.success());
      },
      () => {
        dispatch(logoutAction.success());
        notificationActions.error('Something unexpected happen');
      },
    );
  };
};

export const checkAuth = () => {
  return (dispatch, getState) => {
    dispatch(checkAuthAction.request());
    AuthService.checkAuth(
      (user: User) => {
        dispatch(checkAuthAction.success(user));
      },
      () => {
        dispatch(checkAuthAction.failure());
        notificationActions.error('Something unexpected happen');
      },
    );
  };
};

export const authorize = (username: string, password: string) => {
  return (dispatch, getState) => {
    dispatch(authActions.request());
    AuthService.auth(
      username,
      password,
      (data: User, redirect: string | null) => {
        dispatch(authActions.success({ user: data, username: username }));
        dispatch(notificationActions.success('Добро пожаловать!'));
        if (redirect) {
          // @ts-ignore
          window.location.href = redirect;
        }
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
};

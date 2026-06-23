import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import UserService from '../../services/UserService';
import { SearchUsers, User } from '../auth/Types';
import * as notificationActions from '../notification/Actions';

export const reqStart = createStandardAction('@user/REQ_START')<void>();
export const reqFinished = createStandardAction('@user/REQ_FINISH')<void>();

export const fetchUsersAction = createAsyncAction('@user/FETCH_USERS', '@user/FETCH_USERS_SUCC', '@user/FETCH_USERS_FAIL')<void, User[], void>();

export const fetchAdminsAction = createAsyncAction('@user/FETCH_ADMINS', '@user/FETCH_ADMINS_SUCC', '@user/FETCH_ADMINS_FAIL')<
  void,
  string[],
  void
>();

export const searchUsersByMaskAction = createAsyncAction('@user/SEARCH_REQ', '@user/SEARCH_SUCC', '@user/SEARCH_FAIL')<void, User[], void>();

// export const searchUsersByMaskAction = createAsyncAction(
//     '@user/SEARCH_USERS_BY_MASK',
//     '@user/SEARCH_USERS_BY_MASK_SUCC',
//     '@user/SEARCH_USERS_BY_MASK_FAIL'
// )<void, SearchUsers, void>();

export const fetchUserAction = createAsyncAction('@user/FETCH_USER', '@user/FETCH_USER_SUCC', '@user/FETCH_USER_FAIL')<void, User, void>();

export const fetchLocalUsersAction = createAsyncAction('@user/FETCH_LOCAL_USERS', '@user/FETCH_LOCAL_USERS_SUCC', '@user/FETCH_LOCAL_USERS_FAIL')<
  void,
  User[],
  void
>();

export const addLocalUserAction = createAsyncAction('@user/ADD_LOCAL_USER', '@user/ADD_LOCAL_USER_SUCC', '@user/ADD_LOCAL_USER_FAIL')<
  void,
  void,
  void
>();

export const deleteLocalUserAction = createAsyncAction('@user/DELETE_LOCAL_USER', '@user/DELETE_LOCAL_USER_SUCC', '@user/DELETE_LOCAL_USER_FAIL')<
  void,
  void,
  void
>();

export function fetchUsers() {
  return (dispatch, getState) => {
    dispatch(fetchUsersAction.request());
    UserService.fetchUsers(
      (users: User[]) => {
        dispatch(reqFinished());
        dispatch(fetchUsersAction.success(users));
      },
      (error) => {
        dispatch(fetchUsersAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchAllAdmins(okCallback?: (users: string[]) => void, errorCallback?: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchAdminsAction.request());
    UserService.fetchAllAdmins(
      (users) => {
        dispatch(reqFinished());
        dispatch(fetchAdminsAction.success(users));
        if (okCallback) okCallback(users);
      },
      (error) => {
        dispatch(fetchAdminsAction.failure());
        dispatch(notificationActions.error(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function fetchLocalUsers(okCallback?: (users: User[]) => void, errorCallback?: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchLocalUsersAction.request());
    UserService.fetchUsers(
      (users) => {
        dispatch(reqFinished());
        dispatch(fetchLocalUsersAction.success(users));
        if (okCallback) okCallback(users);
      },
      (error) => {
        dispatch(fetchLocalUsersAction.failure());
        dispatch(notificationActions.error(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function deleteLocalUser(userName: string, okCallback?: () => void, errorCallback?: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(deleteLocalUserAction.request());
    UserService.deleteLocalUser(
      userName,
      () => {
        dispatch(reqFinished());
        dispatch(deleteLocalUserAction.success());
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(deleteLocalUserAction.failure());
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function addLocalUser(userName: string, okCallback?: () => void, errorCallback?: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(addLocalUserAction.request());
    UserService.addLocalUser(
      userName,
      () => {
        dispatch(reqFinished());
        dispatch(addLocalUserAction.success());
        dispatch(notificationActions.success('Локальный пользователь добавлен успешно'));
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(addLocalUserAction.failure());
        dispatch(notificationActions.error(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function searchUsersByMask(mask: string, okCallback: (users: User[]) => void, errorCallback: (message: string) => void) {
  return (dispatch, getState) => {
    dispatch(searchUsersByMaskAction.request());
    UserService.searchUsersByMask(
      mask,
      (users) => {
        dispatch(reqFinished());
        dispatch(searchUsersByMaskAction.success(users));
      },
      (error) => {
        dispatch(searchUsersByMaskAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchUser(user_id, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchUserAction.request());
    UserService.fetchUserById(
      user_id,
      (user: User) => {
        dispatch(fetchUserAction.success(user));
        if (okCallback) okCallback(user);
      },
      (error: any) => {
        dispatch(fetchUserAction.failure());
        if (errorCallback) errorCallback(error.message);
        dispatch(notificationActions.error({ ...error, message: 'Произошла ошибка при поиске пользователя: ' + error.message }));
      },
    );
  };
}

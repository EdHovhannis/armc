import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import ProjectService from '../../services/ProjectService';
import RoleService from '../../services/RoleService';
import * as notificationActions from '../notification/Actions';

import { Resource, Role, Unit, UnitRole } from './Types';

export const fetchUnitRolesActions = createAsyncAction('@role/FETCH_UNIT_ROLES_REQ', '@role/FETCH_UNIT_ROLES_SUCC', '@role/FETCH_UNIT_ROLES_FAIL')<
  void,
  Array<UnitRole>,
  string
>();

export const checkUserRoleOnResourceWithParentActions = createAsyncAction(
  '@role/CHECK_ROLE_PARENT_REQ',
  '@role/CHECK_ROLES_PARENT_SUCC',
  '@role/CHECK_ROLE_PARENT_FAIL',
)<void, void, string>();

export const fetchResourceSharingStatusAction = createAsyncAction(
  '@role/FETCH_SHARING_STATUS_REQ',
  '@role/FETCH_SHARING_STATUS_SUCC',
  '@role/FETCH_SHARING_STATUS_FAIL',
)<void, [Resource, number, boolean], string>();

export const setResourceSharingStatusAction = createAsyncAction(
  '@role/SET_SHARING_STATUS_REQ',
  '@role/SET_SHARING_STATUS_SUCC',
  '@role/SET_SHARING_STATUS_FAIL',
)<void, [Resource, number, boolean], string>();

export const addUnitRoleActions = createAsyncAction('@role/ADD_UNIT_ROLE_REQ', '@role/ADD_UNIT_ROLE_SUCC', '@role/ADD_UNIT_ROLE_FAIL')<
  void,
  [Unit, number, Role],
  string
>();

export const removeUnitRoleActions = createAsyncAction('@role/REM_UNIT_ROLE_REQ', '@role/REM_UNIT_ROLE_SUCC', '@role/REM_UNIT_ROLE_FAIL')<
  void,
  [Unit, number, Role],
  string
>();

export const removeAllUnitRolesActions = createAsyncAction(
  '@role/REM_ALL_UNIT_ROLE_REQ',
  '@role/REM_ALL_UNIT_ROLE_SUCC',
  '@role/REM_ALL_UNIT_ROLE_FAIL',
)<void, [Unit, number], string>();

export const addUnitActions = createStandardAction('@role/ADD_UNIT')<[Unit, number]>();

export const setAdminAction = createAsyncAction('@role/SET_ADMIN_REQ', '@role/SET_ADMIN_SUCC', '@role/SET_ADMIN_FAIL')<
  void,
  [number, boolean],
  string
>();

export function fetchUnitRolesForResource(resource: Resource, resource_id: number, okCallback?: (roles: UnitRole[]) => void) {
  return (dispatch, getState) => {
    dispatch(fetchUnitRolesActions.request());
    RoleService.fetchUnitRolesForResource(
      resource,
      resource_id,
      (unitRoles: UnitRole[]) => {
        dispatch(fetchUnitRolesActions.success(unitRoles));
        if (okCallback) okCallback(unitRoles);
      },
      (error) => {
        dispatch(fetchUnitRolesActions.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function checkUserHasRoleForResourceWithParent(
  userId: string,
  resource: Resource,
  resourceId: number,
  projectShortName: string,
  role: Role,
  okCallback: (isRole: boolean) => void,
  errorCallback?: (message: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(checkUserRoleOnResourceWithParentActions.request());
    ProjectService.fetchProjectByName(
      projectShortName,
      (project) => {
        RoleService.checkUserHasRoleForResourceWithParent(
          userId,
          resource,
          resourceId,
          Resource.PROJECT,
          project.id,
          role,
          (isRole) => {
            dispatch(checkUserRoleOnResourceWithParentActions.success());
            if (okCallback) okCallback(isRole);
          },
          (error) => {
            dispatch(checkUserRoleOnResourceWithParentActions.failure(error));
            dispatch(notificationActions.error(error));
          },
        );
      },
      (error) => {
        dispatch(checkUserRoleOnResourceWithParentActions.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchSharingStatusForResource(resource: Resource, resource_id: number) {
  return (dispatch, getState) => {
    dispatch(fetchResourceSharingStatusAction.request());
    RoleService.fetchResourceIsSharedFlag(
      resource,
      resource_id,
      (isShared: boolean) => {
        dispatch(fetchResourceSharingStatusAction.success([resource, resource_id, isShared]));
      },
      (error) => {
        dispatch(fetchResourceSharingStatusAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function setSharedStatusForResource(resource: Resource, resource_id: number, shared: boolean) {
  return (dispatch, getState) => {
    dispatch(setResourceSharingStatusAction.request());
    RoleService.setShared(
      resource,
      resource_id,
      shared,
      () => {
        dispatch(setResourceSharingStatusAction.success([resource, resource_id, shared]));
        // dispatch(notificationActions.success("Статус ресурса был обновлён"))
      },
      (error) => {
        dispatch(setResourceSharingStatusAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function addUnitRoleToResource(unit: Unit, unitId: number, role: Role, resource: Resource, resourceId: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(addUnitRoleActions.request());
    RoleService.addUnitRoleToResource(
      unit,
      unitId,
      role,
      resource,
      resourceId,
      () => {
        dispatch(addUnitRoleActions.success([unit, unitId, role]));
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(addUnitRoleActions.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function removeUnitRoleFromResource(
  unit: Unit,
  unitId: number,
  role: Role,
  resource: Resource,
  resourceId: number,
  okCallback?,
  errorCallback?,
) {
  return (dispatch, getState) => {
    dispatch(removeUnitRoleActions.request());
    RoleService.removeUnitRoleFromResource(
      unit,
      unitId,
      role,
      resource,
      resourceId,
      () => {
        dispatch(removeUnitRoleActions.success([unit, unitId, role]));
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(removeUnitRoleActions.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function removeAllUserRolesFromResource(unit: Unit, unitId: number, resource: Resource, resourceId: number, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(removeAllUnitRolesActions.request());
    RoleService.removeAllUnitRolesFromResource(
      unit,
      unitId,
      resource,
      resourceId,
      () => {
        dispatch(removeAllUnitRolesActions.success([unit, unitId]));
        if (okCallback) okCallback();
      },
      (error) => {
        dispatch(removeAllUnitRolesActions.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) errorCallback(error);
      },
    );
  };
}

export function setAdmin(userId, isAdmin: boolean, okCallback?) {
  return (dispatch, getState) => {
    dispatch(setAdminAction.request());
    RoleService.setAdmin(
      userId,
      isAdmin,
      () => {
        dispatch(setAdminAction.success([userId, isAdmin]));
        if (okCallback) okCallback();
        // if (isAdmin)
        dispatch(notificationActions.success(isAdmin ? 'Права администратора начислены.' : 'Права администратора сняты.'));
        // else
        //   dispatch(notificationActions.success("Пользователь " + userName + " перестал быть админом"))
      },
      (error) => {
        dispatch(setAdminAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

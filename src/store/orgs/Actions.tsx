import { createAsyncAction } from 'typesafe-actions';

import OrgsService from '../../services/OrgsService';
import { submitConfig } from '../monitoring/Actions';
import * as notificationActions from '../notification/Actions';

import { Org, IndicatorUser, IndicatorDatasource, MigrateStatus } from './Types';

export const fetchAllOrgsAction = createAsyncAction('@orgs/FETCH_ORGS', '@orgs/FETCH_ORGS_SUCC', '@orgs/FETCH_ORGS_FAIL')<void, Org[], void>();

export const createOrgAction = createAsyncAction('@orgs/CREATE_ORG', '@orgs/CREATE_ORG_SUCC', '@orgs/CREATE_ORG_FAIL')<void, Org, void>();

export const deleteOrgAction = createAsyncAction('@orgs/DELETE_ORG', '@orgs/DELETE_ORG_SUCC', '@orgs/DELETE_ORG_FAIL')<void, string, void>();

export const fetchOrgByIdAction = createAsyncAction('@orgs/GET_BY_ID', '@orgs/GET_BY_ID_SUCC', '@orgs/GET_BY_ID_FAIL')<void, Org, void>();

export const updateOrgAction = createAsyncAction('@orgs/UPDATE_ORG', '@orgs/UPDATE_ORG_SUCC', '@orgs/UPDATE_ORG_FAIL')<void, Org, void>();

export const updateRoleForUserAction = createAsyncAction(
  '@orgs/UPDATE_ROLE_FOR_USER',
  '@orgs/UPDATE_ROLE_FOR_USER_SUCC',
  '@orgs/UPDATE_ROLE_FOR_USER_FAIL',
)<void, string, void>();

export const fetchUsersInOrgAction = createAsyncAction('@orgs/FETCH_USERS_IN_ORG', '@orgs/FETCH_USERS_IN_ORG_SUCC', '@orgs/FETCH_USERS_IN_ORG_FAIL')<
  void,
  IndicatorUser[],
  string
>();

export const fetchDatasourcesInOrgAction = createAsyncAction(
  '@orgs/FETCH_DATASOURCES_IN_ORG',
  '@orgs/FETCH_DATASOURCES_IN_ORG_SUCC',
  '@orgs/FETCH_DATASOURCES_IN_ORG_FAIL',
)<void, IndicatorDatasource[], string>();

export const removeUserFromOrgAction = createAsyncAction('@orgs/USER_REMOVE', '@orgs/USER_REMOVE_SUCC', '@orgs/USER_REMOVE_FAIL')<
  void,
  string,
  void
>();

export const addUserToOrgAction = createAsyncAction('@orgs/USER_ADD', '@orgs/USER_ADD_SUCC', '@orgs/USER_ADD_FAIL')<void, IndicatorUser, void>();

export const addDatasourceToOrgAction = createAsyncAction('@orgs/DATASOURCE_ADD', '@orgs/DATASOURCE_ADD_SUCC', '@orgs/DATASOURCE_ADD_FAIL')<
  void,
  IndicatorDatasource,
  void
>();

export const fetchStatusMigration = createAsyncAction(
  '@orgs/FETCH_STATUS_MIGRATE',
  '@orgs/FETCH_STATUS_MIGRATE_SUCC',
  '@orgs/FETCH_STATUS_MIGRATE_FAIL',
)<void, MigrateStatus, void>();

export const startMigrationAction = createAsyncAction('@orgs/START_MIGRATE', '@orgs/START_MIGRATE_SUCC', '@orgs/START_MIGRATE_FAIL')<
  void,
  string,
  void
>();

export function fetchOrgs() {
  return (dispatch, getState) => {
    dispatch(fetchAllOrgsAction.request());
    OrgsService.fetchOrgs(
      (orgs: Org[]) => {
        dispatch(fetchAllOrgsAction.success(orgs));
      },
      (error) => {
        dispatch(fetchAllOrgsAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function createOrg(orgName: string, projectId: string, okCallback?) {
  return (dispatch, getState) => {
    dispatch(createOrgAction.request());
    OrgsService.createOrg(
      orgName,
      projectId,
      (org: Org) => {
        dispatch(createOrgAction.success(org));
        dispatch(notificationActions.success('Организация создана'));
        okCallback();
      },
      (error) => {
        dispatch(createOrgAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function deleteOrg(orgId: number, okCallback?) {
  return (dispatch, getState) => {
    dispatch(deleteOrgAction.request());
    OrgsService.deleteOrg(
      orgId,
      (message: string) => {
        dispatch(deleteOrgAction.success(message));
        dispatch(notificationActions.success('Организация удалена'));
        okCallback();
      },
      (error) => {
        dispatch(deleteOrgAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchUsersInOrg(orgId: number, okCallback: (users: IndicatorUser[]) => void) {
  return (dispatch, getState) => {
    dispatch(fetchUsersInOrgAction.request());
    OrgsService.fetchUsersInOrg(
      orgId,
      (users: IndicatorUser[]) => {
        dispatch(fetchUsersInOrgAction.success(users));
        if (okCallback) okCallback(users);
      },
      (error) => {
        dispatch(fetchUsersInOrgAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function removeUserFromOrg(sub: string, orgId: number) {
  return (dispatch, getState) => {
    dispatch(removeUserFromOrgAction.request());
    OrgsService.removeUserFromOrg(
      sub,
      orgId,
      () => {
        dispatch(removeUserFromOrgAction.success(sub));
        dispatch(notificationActions.success('Пользователь исключен из организации'));
      },
      (error) => {
        dispatch(removeUserFromOrgAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchOrgById(orgId: number) {
  return (dispatch, getState) => {
    dispatch(fetchOrgByIdAction.request());
    OrgsService.fetchOrgById(
      orgId,
      (org: Org) => {
        dispatch(fetchOrgByIdAction.success(org));
      },
      (error) => {
        dispatch(fetchOrgByIdAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateOrgById(org: Org) {
  return (dispatch, getState) => {
    dispatch(updateOrgAction.request());
    OrgsService.updateOrgById(
      org.id || -1,
      org,
      () => {
        dispatch(updateOrgAction.success(org));
        dispatch(notificationActions.success('Организация обновлена'));
      },
      (error) => {
        dispatch(updateOrgAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateRoleForUser(user: IndicatorUser, newRole: string, orgId: number, okCallback: () => void) {
  return (dispatch, getState) => {
    dispatch(updateRoleForUserAction.request());
    OrgsService.updateRoleForUser(
      user,
      newRole,
      orgId,
      () => {
        dispatch(updateRoleForUserAction.success('ok'));
        dispatch(notificationActions.success('Роль изменена'));
        okCallback();
      },
      (error) => {
        dispatch(updateRoleForUserAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function addUserToCurrentOrg(userLogin: string, orgId: number, role: string) {
  return (dispatch, getState) => {
    dispatch(addUserToOrgAction.request());
    OrgsService.addUserToCurrentOrg(
      userLogin,
      orgId,
      role,
      (res) => {
        dispatch(
          addUserToOrgAction.success({
            orgId: orgId,
            role: role,
            sub: userLogin,
            name: '',
          }),
        );
        dispatch(notificationActions.success('Пользователь добавлен в организацию'));
      },
      (error) => {
        dispatch(addUserToOrgAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchDatasourcesInOrg(orgId: number, okCallback: (datasources: IndicatorDatasource[]) => void) {
  return (dispatch, getState) => {
    dispatch(fetchDatasourcesInOrgAction.request());
    OrgsService.fetchDatasourcesInOrg(
      orgId,
      (datasources: IndicatorDatasource[]) => {
        dispatch(fetchDatasourcesInOrgAction.success(datasources));
        if (okCallback) okCallback(datasources);
      },
      (error) => {
        dispatch(fetchDatasourcesInOrgAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function addDatasourceToOrg(datasourceName: string, urlSettings: string, selectedProjectNewDatasource: string, orgId: number) {
  return (dispatch, getState) => {
    dispatch(addDatasourceToOrgAction.request());
    OrgsService.addDatasourceToOrg(
      datasourceName,
      urlSettings,
      selectedProjectNewDatasource,
      orgId,
      (res) => {
        dispatch(
          addDatasourceToOrgAction.success({
            id: res.id,
            uid: '',
            orgId: res.datasource.orgId,
            name: res.name,
            type: res.datasource.type,
            typeName: '',
            typeLogoUrl: '',
            access: res.datasource.access,
            url: res.datasource.url,
            password: '',
            user: '',
            database: '',
            basicAuth: res.datasource.basicAuth,
            isDefault: res.datasource.isDefault,
            jsonData: res.datasource.jsonData,
            readOnly: res.datasource.readOnly,
          }),
        );
        dispatch(notificationActions.success('Датасорс добавлен в организацию'));
      },
      (error) => {
        dispatch(addDatasourceToOrgAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getStatusMigration() {
  return (dispatch, getState) => {
    dispatch(fetchStatusMigration.request());
    OrgsService.getStatusMigration(
      (data: MigrateStatus) => {
        dispatch(fetchStatusMigration.success(data));
      },
      (error) => {
        dispatch(fetchStatusMigration.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function startMigration(okCallback: () => void) {
  return (dispatch, getState) => {
    dispatch(startMigrationAction.request());
    OrgsService.startMigration(
      (data) => {
        dispatch(startMigrationAction.success(data));
        okCallback();
        dispatch(notificationActions.success('Миграция запущена'));
      },
      (error) => {
        dispatch(startMigrationAction.failure());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

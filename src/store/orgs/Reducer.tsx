import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { Org, IndicatorUser, IndicatorDatasource, MigrateStatus } from './Types';

export interface OrgStoreState {
  orgs: Array<Org>;
  orgsIsLoading: boolean;
  usersIsLoading: boolean;
  selectedOrgUsers: Array<IndicatorUser>;
  orgLoading: boolean;
  selectedOrg?: Org;
  isDatasourcesLoading: boolean;
  selectedOrgDatasources: Array<IndicatorDatasource>;
  statusMigration: MigrateStatus;
}

const initialState: OrgStoreState = {
  orgs: [],
  orgsIsLoading: false,
  usersIsLoading: false,
  selectedOrgUsers: [],
  orgLoading: false,
  selectedOrg: undefined,
  isDatasourcesLoading: false,
  selectedOrgDatasources: [],
  statusMigration: { migration_state: 'unknown' },
};

export type Actions = ActionType<typeof actions>;

function updateOrg(orgs: Org[], org: Org): Org[] {
  const findedOrgs = orgs.filter((e_org) => org.id === e_org.id);

  if (findedOrgs.length > 0) {
    findedOrgs[0] = org;
  } else orgs.push(org);

  return orgs;
}

export const reducer: Reducer<OrgStoreState> = (state: OrgStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchAllOrgsAction.request):
      return { ...state, orgsIsLoading: true };

    case getType(actions.fetchAllOrgsAction.success):
      return { ...state, orgsIsLoading: false, orgs: action.payload };

    case getType(actions.fetchAllOrgsAction.failure):
      return { ...state, orgsIsLoading: false };

    case getType(actions.fetchUsersInOrgAction.request):
      return { ...state, usersIsLoading: true };

    case getType(actions.fetchUsersInOrgAction.success):
      return {
        ...state,
        usersIsLoading: false,
        selectedOrgUsers: action.payload,
      };

    case getType(actions.fetchUsersInOrgAction.failure):
      return { ...state, usersIsLoading: false };

    case getType(actions.removeUserFromOrgAction.success): {
      const newUsers = state.selectedOrgUsers.filter((user) => user.sub !== action.payload);
      return { ...state, selectedOrgUsers: newUsers };
    }

    case getType(actions.fetchOrgByIdAction.request):
      return { ...state, orgLoading: true };

    case getType(actions.fetchOrgByIdAction.success):
      return {
        ...state,
        orgs: updateOrg(state.orgs, action.payload),
        selectedOrg: action.payload,
        orgLoading: false,
      };

    case getType(actions.fetchOrgByIdAction.failure):
      return { ...state, orgLoading: true };

    case getType(actions.addUserToOrgAction.success):
      return {
        ...state,
        selectedOrgUsers: [...state.selectedOrgUsers, action.payload],
      };

    case getType(actions.fetchDatasourcesInOrgAction.request):
      return { ...state, isDatasourcesLoading: true };

    case getType(actions.fetchDatasourcesInOrgAction.success):
      return {
        ...state,
        isDatasourcesLoading: false,
        selectedOrgDatasources: action.payload,
      };

    case getType(actions.fetchDatasourcesInOrgAction.failure):
      return { ...state, isDatasourcesLoading: false };

    case getType(actions.addDatasourceToOrgAction.success):
      return {
        ...state,
        selectedOrgDatasources: [...state.selectedOrgDatasources, action.payload],
      };

    case getType(actions.fetchStatusMigration.success):
      return { ...state, statusMigration: action.payload };

    default:
      return state;
  }
};

export function getOrgs(state: ApplicationState): Org[] {
  return state.orgs.orgs;
}

export function isOrgsLoading(state: ApplicationState) {
  return state.orgs.orgsIsLoading;
}

export function getUsersInOrg(state): IndicatorUser[] {
  return state.orgs.selectedOrgUsers;
}

export function isUsersLoading(state: ApplicationState) {
  return state.orgs.usersIsLoading;
}

export function getCurrentOrg(state: ApplicationState): Org | undefined {
  return state.orgs.selectedOrg;
}

export function isOrgLoading(state: ApplicationState) {
  return state.orgs.orgLoading;
}

export function isDatasourcesLoading(state: ApplicationState) {
  return state.orgs.isDatasourcesLoading;
}

export function getDatasourcesInOrg(state): IndicatorDatasource[] {
  return state.orgs.selectedOrgDatasources;
}

export function getDataStatusMigration(state: ApplicationState): MigrateStatus {
  return state.orgs.statusMigration;
}

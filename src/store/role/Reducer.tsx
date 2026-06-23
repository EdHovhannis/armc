import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { Resource, Role, UnitRole } from './Types';

export interface RoleStoreState {
  unitRoles: Array<UnitRole>;
  projectSharingStatus: Map<any, boolean>;
  rolesLoading: boolean;
  sharedStatusLoading: boolean;
  version: Versions[] | string | undefined;
}

const initialState: RoleStoreState = {
  unitRoles: [],
  projectSharingStatus: new Map<[Resource, number], boolean>(),
  rolesLoading: false,
  sharedStatusLoading: false,
  version: [],
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<RoleStoreState> = (state: RoleStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchUnitRolesActions.success): {
      return { ...state, unitRoles: action.payload, rolesLoading: false };
    }

    case getType(actions.addUnitRoleActions.success): {
      const ur: UnitRole = state.unitRoles.filter((unitRole: UnitRole) => {
        return unitRole.unitId === action.payload[1] && unitRole.unit == action.payload[0];
      })[0];
      ur.roles.push(action.payload[2]);
      return { ...state };
    }

    case getType(actions.removeUnitRoleActions.success): {
      const ur: UnitRole = state.unitRoles.filter((unitRole: UnitRole) => {
        return unitRole.unitId === action.payload[1] && unitRole.unit == action.payload[0];
      })[0];
      ur.roles = ur.roles.filter((role: Role) => role != action.payload[2]);
      return { ...state };
    }

    case getType(actions.removeAllUnitRolesActions.success): {
      const gr: UnitRole[] = state.unitRoles.filter((unitRole: UnitRole) => {
        return !(unitRole.unit == action.payload[0] && unitRole.unitId === action.payload[1]);
      });
      return { ...state, unitRoles: gr };
    }

    case getType(actions.fetchUnitRolesActions.request):
      return { ...state, rolesLoading: true };

    case getType(actions.fetchUnitRolesActions.failure):
      return { ...state, rolesLoading: false };

    case getType(actions.addUnitActions):
      return {
        ...state,
        unitRoles: [...state.unitRoles, { unit: action.payload[0], unitId: action.payload[1], roles: [] }],
      };
    // fetching shared status
    case getType(actions.fetchResourceSharingStatusAction.request):
      return { ...state, sharedStatusLoading: true };

    case getType(actions.fetchResourceSharingStatusAction.success): {
      state.projectSharingStatus.set(action.payload[0] + action.payload[1], action.payload[2]);
      return { ...state, sharedStatusLoading: false, projectSharingStatus: state.projectSharingStatus };
    }

    case getType(actions.fetchResourceSharingStatusAction.failure):
      return { ...state, sharedStatusLoading: false };

    // updating shared status
    case getType(actions.setResourceSharingStatusAction.success): {
      state.projectSharingStatus.set(action.payload[0] + action.payload[1], action.payload[2]);
      return { ...state, projectSharingStatus: state.projectSharingStatus };
    }

    default:
      return state;
  }
};

export function getUnitRoles(state: ApplicationState): UnitRole[] {
  return state.role.unitRoles;
}

export function getRolesIsLoading(state: ApplicationState): boolean {
  return state.role.rolesLoading || state.role.sharedStatusLoading;
}

export function isResourceShared(state: ApplicationState, resource: Resource, resource_id: number): boolean {
  const val = state.role.projectSharingStatus.get(resource + resource_id);
  return val || false;
}

import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { Zone } from './Types';

export interface ZoneState {
  zones: Zone;
  isLoading: boolean;
}

const initialState: ZoneState = {
  zones: {
    availableZones: [],
    defaultZone: '',
  },
  isLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<ZoneState> = (state: ZoneState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchZoneAction.success):
      return {
        ...state,
        zones: action.payload,
        isLoading: false,
      };

    case getType(actions.fetchZoneAction.request):
      return {
        ...state,
        isLoading: true,
      };

    case getType(actions.fetchZoneAction.failure):
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

export function getZones(state: ApplicationState): Zone {
  return state.zone.zones;
}

export function isLoading(state: ApplicationState): boolean {
  return state.zone.isLoading;
}

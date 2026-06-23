import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';

export type NotificationActions = ActionType<typeof actions>;

export interface NotificationState {
  readonly message: string;
  readonly variant: string;
  readonly isOpen: boolean;
}

export const initialState: NotificationState = {
  message: '',
  variant: 'info',
  isOpen: false,
};

export const reducer: Reducer<NotificationState> = (state: NotificationState = initialState, action: NotificationActions) => {
  switch (action.type) {
    case getType(actions.error):
      return { ...state, isOpen: true, message: action.payload, variant: 'error' };

    case getType(actions.success):
      return { ...state, isOpen: true, message: action.payload, variant: 'success' };

    case getType(actions.info):
      return { ...state, isOpen: true, message: action.payload, variant: 'info' };

    case getType(actions.warning):
      return { ...state, isOpen: true, message: action.payload, variant: 'warning' };

    case getType(actions.close):
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

export function message(state: ApplicationState): any {
  return state.notification.message;
}

export function isOpen(state: ApplicationState) {
  return state.notification.isOpen;
}

export function variant(state: ApplicationState) {
  return state.notification.variant;
}

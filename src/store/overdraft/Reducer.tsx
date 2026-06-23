import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { OverdraftConfig } from './Types';

export interface OverdraftStoreState {
  fulltextOverdraftConfig?: OverdraftConfig;
  archiveOverdraftConfig?: OverdraftConfig;
  isFulltextOverdraftConfigLoading: boolean;
  isArchiveOverdraftConfigLoading: boolean;
}

const initialState: OverdraftStoreState = {
  isArchiveOverdraftConfigLoading: true,
  isFulltextOverdraftConfigLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<OverdraftStoreState> = (state: OverdraftStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.getArchiveOverdraftStateAction.request): {
      return {
        ...state,
        isArchiveOverdraftConfigLoading: true,
      };
    }

    case getType(actions.getArchiveOverdraftStateAction.success): {
      return {
        ...state,
        archiveOverdraftConfig: action.payload,
        isArchiveOverdraftConfigLoading: false,
      };
    }

    case getType(actions.getArchiveOverdraftStateAction.failure): {
      return {
        ...state,
        isArchiveOverdraftConfigLoading: false,
      };
    }

    case getType(actions.getFulltextOverdraftStateAction.request): {
      return {
        ...state,
        isFulltextOverdraftConfigLoading: true,
      };
    }

    case getType(actions.getFulltextOverdraftStateAction.success): {
      return {
        ...state,
        fulltextOverdraftConfig: action.payload,
        isFulltextOverdraftConfigLoading: false,
      };
    }

    case getType(actions.getFulltextOverdraftStateAction.failure): {
      return {
        ...state,
        isFulltextOverdraftConfigLoading: false,
      };
    }

    case getType(actions.setFulltextOverdraftStateAction.success): {
      return {
        ...state,
        fulltextOverdraftConfig: action.payload,
        isFulltextOverdraftConfigLoading: false,
      };
    }

    case getType(actions.setArchiveOverdraftStateAction.success): {
      return {
        ...state,
        archiveOverdraftConfig: action.payload,
        isArchiveOverdraftConfigLoading: false,
      };
    }

    default:
      return state;
  }
};

export function getArchiveOverdraftConfig(state: ApplicationState): OverdraftConfig | undefined {
  return state.overdraft.archiveOverdraftConfig;
}

export function getFulltextOverdraftConfig(state: ApplicationState): OverdraftConfig | undefined {
  return state.overdraft.fulltextOverdraftConfig;
}

export function isFulltextOverdraftConfigLoading(state: ApplicationState): boolean {
  return state.overdraft.isFulltextOverdraftConfigLoading;
}

export function isArchiveOverdraftConfigLoading(state: ApplicationState): boolean {
  return state.overdraft.isArchiveOverdraftConfigLoading;
}

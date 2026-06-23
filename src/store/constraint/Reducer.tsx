import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ConstraintUtils } from '../../utils/ConstraintUtils';
import { ApplicationState } from '../Store';
import * as actions from '../constraint/Actions';
import { fetchBlockedUsersAction, fetchBlocksAction } from '../constraint/Actions';

import { BlockedUnit, Blocks, ClusterConstraint, ConstraintShort, FulltextConstraint } from './Types';

export interface ConstraintStoreState {
  clusterConstraintIsLoading: boolean;
  clusterConstraint?: ClusterConstraint;
  blockedUnits: BlockedUnit[];
  blocks: Blocks[];
  isBlocksLoading: boolean;
  isBlockedUnitsLoading: boolean;
  overloadedConstraintObjects?: ConstraintShort[];
  overloadedConstraintObjectIsLoading: boolean;
  constraintFilter: FilterMenuItem[] | undefined;
  blockFilter: FilterMenuItem[] | undefined;
  currentConstraint?: FulltextConstraint;
  isCurrentConstraintLoading: boolean;
}

const initialState: ConstraintStoreState = {
  blockedUnits: [],
  blocks: [],
  isBlockedUnitsLoading: true,
  isBlocksLoading: true,
  clusterConstraintIsLoading: true,
  overloadedConstraintObjectIsLoading: true,
  constraintFilter: [],
  blockFilter: [],
  isCurrentConstraintLoading: true,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<ConstraintStoreState> = (state: ConstraintStoreState = initialState, action: Actions) => {
  switch (action.type) {
    //получение ограничения на кластер по умолчанию
    case getType(actions.fetchConstraintForClusterAction.request):
      return { ...state, clusterConstraintIsLoading: true };

    case getType(actions.fetchConstraintForClusterAction.success):
      return { ...state, clusterConstraintIsLoading: false, clusterConstraint: action.payload };

    case getType(actions.fetchConstraintForClusterAction.failure):
      return { ...state, clusterConstraintIsLoading: false };

    // получение ограничений на текущий индекс
    case getType(actions.fetchConstraintForObjectAction.request):
      return { ...state, isCurrentConstraintLoading: true };

    case getType(actions.fetchConstraintForObjectAction.success):
      return { ...state, isCurrentConstraintLoading: false, currentConstraint: action.payload };

    case getType(actions.fetchConstraintForObjectAction.failure):
      return { ...state, isCurrentConstraintLoading: false };

    //получения списка всех объектов, на которые ограничения перегружены
    case getType(actions.fetchConstraintAction.request):
      return { ...state, overloadedConstraintObjectIsLoading: true };

    case getType(actions.fetchConstraintAction.success):
      return { ...state, overloadedConstraintObjectIsLoading: false, overloadedConstraintObjects: action.payload };

    case getType(actions.fetchConstraintAction.failure):
      return { ...state, overloadedConstraintObjectIsLoading: false };

    //получение всех заблокированных пользователей/групп
    case getType(actions.fetchBlockedUsersAction.request):
      return { ...state, isBlockedUnitsLoading: true };

    case getType(actions.fetchBlockedUsersAction.success):
      return { ...state, isBlockedUnitsLoading: false, blockedUnits: action.payload };

    case getType(actions.fetchBlockedUsersAction.failure):
      return { ...state, isBlockedUnitsLoading: false };

    //получение всех блокировок
    case getType(actions.fetchBlocksAction.request):
      return { ...state, isBlocksLoading: true };

    case getType(actions.fetchBlocksAction.success):
      return { ...state, isBlocksLoading: false, blocks: action.payload };

    case getType(actions.fetchBlocksAction.failure):
      return { ...state, isBlocksLoading: false };

    case getType(actions.setConstraintFilterAction): {
      return { ...state, constraintFilter: action.payload };
    }

    case getType(actions.setBlockFilterAction):
      return { ...state, blockFilter: action.payload };

    default:
      return state;
  }
};

export function isClusterConstraintLoading(state: ApplicationState): boolean {
  return state.constraint.clusterConstraintIsLoading;
}

export function getClusterConstraint(state: ApplicationState): ClusterConstraint {
  return state.constraint.clusterConstraint || ConstraintUtils.defaultClusterConstraint();
}

export function getOverloadedConstraintObjects(state: ApplicationState): ConstraintShort[] {
  return state.constraint.overloadedConstraintObjects || [];
}

export function isOverloadedConstraintObjectsLoading(state: ApplicationState): boolean {
  return state.constraint.overloadedConstraintObjectIsLoading;
}

export function getBlockedUnits(state: ApplicationState): BlockedUnit[] {
  return state.constraint.blockedUnits;
}

export function isBlockedUnitsLoading(state: ApplicationState): boolean {
  return state.constraint.isBlockedUnitsLoading;
}

export function getBlocks(state: ApplicationState): Blocks[] {
  return state.constraint.blocks;
}

export function isBlocksLoading(state: ApplicationState): boolean {
  return state.constraint.isBlocksLoading;
}

export function getConstraintFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.constraint.constraintFilter;
}

export function getBlockFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.constraint.blockFilter;
}

export function getCurrentConstraint(state: ApplicationState): FulltextConstraint | undefined {
  return state.constraint.currentConstraint;
}

export function isCurrentConstraintLoading(state: ApplicationState): boolean {
  return state.constraint.isCurrentConstraintLoading;
}

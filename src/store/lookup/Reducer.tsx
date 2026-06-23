import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { DictionaryQuota, Lookup, LookupQuota, ShortInfo, Dictionary } from './Types';

export interface LookupStoreState {
  actionInProgress: boolean;
  lookups: ShortInfo[];
  dictionaries: Dictionary[];
  currentLookup: Lookup | undefined;
  dictionaryLookups: ShortInfo[] | undefined;
  currentDictionary: any[] | undefined;
  isDictionaryQuotasLoading: boolean;
  isLookupQuotasLoading: boolean;
  dictionaryQuotas: any;
  lookupQuotas: any;
  filter: FilterMenuItem[] | undefined;
  currentDictionaryOrder: string[];
}

const initialState: LookupStoreState = {
  actionInProgress: false,
  lookups: [],
  dictionaries: [],
  currentLookup: undefined,
  currentDictionary: undefined,
  isDictionaryQuotasLoading: false,
  isLookupQuotasLoading: false,
  dictionaryQuotas: {},
  lookupQuotas: {},
  dictionaryLookups: undefined,
  filter: undefined,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<LookupStoreState> = (state: LookupStoreState = initialState, action: Actions) => {
  switch (action.type) {
    //get lookup
    case getType(actions.fetchLookupAction.request):
      return { ...state, actionInProgress: true };

    case getType(actions.fetchLookupAction.success):
      return { ...state, actionInProgress: false, currentLookup: action.payload };

    case getType(actions.fetchLookupAction.failure):
      return { ...state, actionInProgress: false };

    //get dictionary
    case getType(actions.fetchDictionaryAction.request):
      return { ...state, actionInProgress: true };

    case getType(actions.fetchDictionaryAction.success):
      return { ...state, actionInProgress: false, currentDictionary: action.payload };

    case getType(actions.fetchDictionaryOrderAction.success):
      return { ...state, actionInProgress: false, currentDictionaryOrder: action.payload };

    case getType(actions.fetchDictionaryAction.failure):
      return { ...state, actionInProgress: false };

    //get lookups
    case getType(actions.listLookupsAction.request):
      return { ...state, actionInProgress: true };

    case getType(actions.listLookupsAction.success):
      return { ...state, actionInProgress: false, lookups: action.payload };

    case getType(actions.listLookupsAction.failure):
      return { ...state, actionInProgress: false };

    //get dictionary lookups
    case getType(actions.listDictionaryLookupsAction.request):
      return { ...state, actionInProgress: true };

    case getType(actions.listDictionaryLookupsAction.success):
      return { ...state, actionInProgress: false, dictionaryLookups: action.payload };

    case getType(actions.listDictionaryLookupsAction.failure):
      return { ...state, actionInProgress: false };

    //get dictionaries
    case getType(actions.listDictionariesAction.request):
      return { ...state, actionInProgress: true };

    case getType(actions.listDictionariesAction.success):
      return { ...state, actionInProgress: false, dictionaries: action.payload };

    case getType(actions.listDictionariesAction.failure):
      return { ...state, actionInProgress: false };

    //get quotas for dictionary
    case getType(actions.listDictionaryQuotasAction.request):
      return { ...state, isDictionaryQuotasLoading: true };

    case getType(actions.listDictionaryQuotasAction.failure):
      return { ...state, isDictionaryQuotasLoading: false };

    case getType(actions.listDictionaryQuotasAction.success): {
      const quotaMap = state.dictionaryQuotas;
      action.payload.forEach((quota: DictionaryQuota) => {
        quotaMap[quota.projectShortName] = quota;
      });
      return { ...state, dictionaryQuotas: quotaMap, isDictionaryQuotasLoading: false };
    }

    //get single dictionary quota
    case getType(actions.fetchDictionaryQuotaAction.request):
      return { ...state, isDictionaryQuotasLoading: true };

    case getType(actions.fetchDictionaryQuotaAction.failure):
      return { ...state, isDictionaryQuotasLoading: false };

    case getType(actions.fetchDictionaryQuotaAction.success): {
      const quotaMap = state.dictionaryQuotas;
      quotaMap[action.payload.projectShortName] = action.payload;
      return { ...state, dictionaryQuotas: quotaMap, isDictionaryQuotasLoading: false };
    }

    //fetchLookupQuotaAction
    //get single lookup quota
    case getType(actions.fetchLookupQuotaAction.request):
      return { ...state, isLookupQuotasLoading: true };

    case getType(actions.fetchLookupQuotaAction.failure):
      return { ...state, isLookupQuotasLoading: false };

    case getType(actions.fetchLookupQuotaAction.success): {
      const quotaMap = state.lookupQuotas;
      quotaMap[action.payload.projectShortName] = action.payload;
      return { ...state, lookupQuotas: quotaMap, isLookupQuotasLoading: false };
    }

    //get quotas for lookup
    case getType(actions.listLookupQuotasAction.request):
      return { ...state, isLookupQuotasLoading: true };

    case getType(actions.listLookupQuotasAction.failure):
      return { ...state, isLookupQuotasLoading: false };

    case getType(actions.listLookupQuotasAction.success): {
      const quotaMap = {};
      action.payload.forEach((quota: LookupQuota) => {
        quotaMap[quota.projectShortName] = quota;
      });
      return { ...state, lookupQuotas: quotaMap, isLookupQuotasLoading: false };
    }

    case getType(actions.setDictionaryFilterAction):
      return { ...state, filter: action.payload };

    default:
      return state;
  }
};

export function isLoading(state: ApplicationState): any {
  return state.lookup.actionInProgress;
}

export function getLookup(state: ApplicationState): Lookup | undefined {
  return state.lookup.currentLookup;
}

export function getLookups(state: ApplicationState): ShortInfo[] | undefined {
  return state.lookup.lookups;
}

export function getDictionaryLookups(state: ApplicationState): ShortInfo[] {
  return state.lookup.dictionaryLookups || [];
}

export function getDictionary(state: ApplicationState): any[] | undefined {
  return state.lookup.currentDictionary;
}
export function getDictionaryOrder(state: ApplicationState): any[] | undefined {
  return state.lookup.currentDictionaryOrder;
}

export function getDictionaries(state: ApplicationState): Dictionary[] | undefined {
  return state.lookup.dictionaries;
}

export function getDictionariesWithRoles(state: ApplicationState): Dictionary[] {
  return state.lookup.dictionaries;
}

export function getDictionaryQuotas(state: ApplicationState): any {
  return state.lookup.dictionaryQuotas;
}

export function getLookupQuotas(state: ApplicationState): any {
  return state.lookup.lookupQuotas;
}

export function isDictionaryQuotasLoading(state: ApplicationState): boolean {
  return state.lookup.isDictionaryQuotasLoading;
}

export function isLookupQuotasLoading(state: ApplicationState): boolean {
  return state.lookup.isLookupQuotasLoading;
}

export function getLookupQuota(state: ApplicationState, projectShortName: string): LookupQuota {
  return state.lookup.lookupQuotas[projectShortName] || { projectShortName: projectShortName, currentCount: 0, maxCount: 0 };
}

export function getDictionaryQuota(state: ApplicationState, projectShortName: string): DictionaryQuota {
  return state.lookup.dictionaryQuotas[projectShortName] || { projectShortName: projectShortName, currentSize: 0, maxSize: 0 };
}

export function getDictionaryFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.lookup.filter;
}

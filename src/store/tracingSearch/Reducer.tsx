import * as moment from 'moment';
import { Moment } from 'moment';
import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';
import { TracingSupervisorDescription } from '../tracingDatasources/Types';

import * as actions from './Actions';
import TraceUtils from './TraceUtils';
import { Lookbacks, SearchResult, Span, Trace, TraceQueryFilter, TraceTree, TracingTimeSort } from './Types';

export interface TracingStoreState {
  datasources: Array<TracingSupervisorDescription> | undefined;
  services: Array<string> | undefined;
  spans: Array<string> | undefined;
  keys: Array<string> | undefined;

  selectedDatasource: TracingSupervisorDescription | undefined;
  selectedServices: Array<string>;
  selectedSpans: Array<string>;
  filters: Array<TraceQueryFilter>;
  limit: number;
  lookback: number;
  rootOnlyMatch: boolean;
  timeSortEnabled: boolean;
  timeSort: TracingTimeSort;
  startTime: Moment;
  endTime: Moment;

  searchResult: SearchResult | undefined;
  fetchedTraces: Map<string, Array<Span>> | undefined;

  selectedTrace: Trace | undefined;
  selectedTraceTree: TraceTree | undefined;
  selectedTraceTreeId: string | undefined;

  datasourcesLoading: boolean;
  servicesLoading: boolean;
  spansLoading: boolean;
  keysLoading: boolean;
  searchInProgress: boolean;
  traceFetchInProgress: boolean;
}

const initialState: TracingStoreState = {
  datasources: undefined,
  services: undefined,
  spans: undefined,
  keys: undefined,

  selectedDatasource: undefined,
  selectedServices: [],
  selectedSpans: [],

  selectedTrace: undefined,
  selectedTraceTreeId: undefined,
  selectedTraceTree: undefined,

  filters: [],
  limit: 10,
  lookback: Lookbacks[0].value,
  rootOnlyMatch: false,
  timeSortEnabled: false,
  timeSort: TracingTimeSort.ORDER_TIME_DESC,
  startTime: moment(),
  endTime: moment(),

  datasourcesLoading: false,
  servicesLoading: false,
  spansLoading: false,
  keysLoading: false,
  searchInProgress: false,
  traceFetchInProgress: false,

  searchResult: undefined,
  fetchedTraces: undefined,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<TracingStoreState> = (state: TracingStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchDatasourcesAction.request): {
      return {
        ...state,
        datasourcesLoading: true,
        datasources: undefined,
        services: undefined,
        spans: undefined,
        keys: undefined,
      };
    }

    case getType(actions.fetchDatasourcesAction.success): {
      return { ...state, datasourcesLoading: false, datasources: action.payload, services: undefined, spans: undefined };
    }

    case getType(actions.fetchDatasourcesAction.failure): {
      return { ...state, datasourcesLoading: false };
    }

    case getType(actions.fetchServicesAction.request): {
      return { ...state, servicesLoading: true };
    }

    case getType(actions.fetchServicesAction.success): {
      const needToClear = action.payload;
      return {
        ...state,
        services: action.payload,
        servicesLoading: false,
        selectedServices: state.selectedServices.filter((service) => {
          return action.payload.includes(service);
        }),
      };
    }

    case getType(actions.fetchServicesAction.failure): {
      return { ...state, servicesLoading: false };
    }

    case getType(actions.fetchSpansAction.request): {
      return { ...state, spansLoading: true };
    }

    case getType(actions.fetchSpansAction.success): {
      return {
        ...state,
        spansLoading: false,
        spans: action.payload,
        selectedSpans: state.selectedSpans.filter((selectedSpan) => {
          return action.payload.includes(selectedSpan);
        }),
      };
    }

    case getType(actions.fetchSpansAction.failure): {
      return { ...state, spansLoading: false };
    }

    case getType(actions.fetchKeysAction.request): {
      return { ...state, keysLoading: true };
    }

    case getType(actions.fetchKeysAction.success): {
      return { ...state, keys: action.payload, keysLoading: false };
    }

    case getType(actions.fetchKeysAction.failure): {
      return { ...state, keysLoading: false };
    }

    case getType(actions.selectedDatasourceChangedAction): {
      return { ...state, selectedDatasource: action.payload };
    }

    case getType(actions.selectedServicesChangedAction): {
      return { ...state, selectedServices: action.payload };
    }

    case getType(actions.limitChangedAction): {
      return { ...state, limit: action.payload };
    }

    case getType(actions.lookbackChangedAction): {
      return { ...state, lookback: action.payload };
    }

    case getType(actions.rootOnlyMatchChangedAction): {
      return { ...state, rootOnlyMatch: action.payload };
    }

    case getType(actions.timeSortEnabledChangedAction): {
      return { ...state, timeSortEnabled: action.payload };
    }

    case getType(actions.timeSortChangedAction): {
      return { ...state, timeSort: action.payload };
    }

    case getType(actions.startTimeChangedAction): {
      return { ...state, startTime: action.payload };
    }

    case getType(actions.endTimeChangedAction): {
      return { ...state, endTime: action.payload };
    }

    case getType(actions.filterChangedAction): {
      return { ...state, filters: action.payload };
    }

    case getType(actions.filterAddedAction): {
      return { ...state, filters: [...state.filters, action.payload] };
    }

    case getType(actions.filterRemovedAction): {
      const filters = state.filters.filter((filter) => !(filter.key === action.payload.key && filter.value === action.payload.value));
      return { ...state, filters: filters };
    }

    case getType(actions.filtersClearedAction): {
      return { ...state, filters: [] };
    }

    case getType(actions.searchTracesAction.request): {
      return { ...state, searchInProgress: true };
    }

    case getType(actions.searchTracesAction.success): {
      return { ...state, searchResult: action.payload[0], fetchedTraces: action.payload[1], searchInProgress: false };
    }

    case getType(actions.searchTracesAction.failure): {
      return { ...state, searchInProgress: false };
    }

    case getType(actions.selectedSpansChangedAction): {
      return { ...state, selectedSpans: action.payload };
    }

    case getType(actions.fetchTraceAction.request): {
      return { ...state, traceFetchInProgress: true };
    }

    case getType(actions.fetchTraceAction.success): {
      return {
        ...state,
        traceFetchInProgress: false,
        selectedTrace: action.payload.trace,
        selectedTraceTree: action.payload.traceTree,
        selectedTraceTreeId: action.payload.traceTree.summary.traceId,
      };
    }

    case getType(actions.fetchTraceAction.failure): {
      return { ...state, traceFetchInProgress: false };
    }

    case getType(actions.selectTraceById): {
      if (state.selectedTraceTree && state.selectedTraceTree.summary.traceId === action.payload) {
        return state;
      }

      if (!state.fetchedTraces || !state.fetchedTraces.has(action.payload)) {
        return { ...state, selectedTraceTree: undefined, selectedTraceTreeId: undefined };
      }
      const target: Array<Span> = state.fetchedTraces.get(action.payload)!;
      return {
        ...state,
        selectedTrace: target as Trace,
        selectedTraceTree: TraceUtils.processTraceToTree({ spans: target }),
        selectedTraceTreeId: target[0].traceId,
      };
    }

    default:
      return state;
  }
};

export function getDatasources(state: ApplicationState): Array<TracingSupervisorDescription> | undefined {
  return state.tracing.datasources;
}

export function getServices(state: ApplicationState): string[] | undefined {
  return state.tracing.services;
}

export function getSpans(state: ApplicationState): string[] | undefined {
  return state.tracing.spans;
}

export function getKeys(state: ApplicationState): string[] | undefined {
  return state.tracing.keys;
}

export function getSelectedDatasource(state: ApplicationState): TracingSupervisorDescription | undefined {
  return state.tracing.selectedDatasource;
}

export function getSelectedServices(state: ApplicationState): string[] {
  return state.tracing.selectedServices;
}

export function getSelectedSpans(state: ApplicationState): string[] {
  return state.tracing.selectedSpans;
}

export function getFilters(state: ApplicationState): TraceQueryFilter[] {
  return state.tracing.filters;
}

export function getLimit(state: ApplicationState): number {
  return state.tracing.limit;
}

export function getLookBack(state: ApplicationState): number {
  return state.tracing.lookback;
}

export function timeSortEnabled(state: ApplicationState): boolean {
  return state.tracing.timeSortEnabled;
}

export function timeSort(state: ApplicationState): TracingTimeSort {
  return state.tracing.timeSort;
}

export function rootOnlyMatch(state: ApplicationState): boolean {
  return state.tracing.rootOnlyMatch;
}

export function getStartTime(state: ApplicationState): Moment {
  return state.tracing.startTime;
}

export function getEndTime(state: ApplicationState): Moment {
  return state.tracing.endTime;
}

export function keysLoading(state: ApplicationState) {
  return state.tracing.keysLoading;
}

export function spansLoading(state: ApplicationState) {
  return state.tracing.spansLoading;
}

export function datasourcesLoading(state: ApplicationState) {
  return state.tracing.datasourcesLoading;
}

export function servicesLoading(state: ApplicationState) {
  return state.tracing.servicesLoading;
}

export function isLoading(state: ApplicationState) {
  return state.tracing.datasourcesLoading || state.tracing.keysLoading || state.tracing.servicesLoading;
}

export function getSearchResult(state: ApplicationState): SearchResult | undefined {
  return state.tracing.searchResult;
}

export function searchInProgress(state: ApplicationState): boolean {
  return state.tracing.searchInProgress;
}

export function fetchedTrace(state: ApplicationState): Trace | undefined {
  return state.tracing.selectedTrace;
}

export function fetchedTraceTree(state: ApplicationState): TraceTree | undefined {
  return state.tracing.selectedTraceTree;
}

export function selectedTraceTreeId(state: ApplicationState): string | undefined {
  return state.tracing.selectedTraceTreeId;
}

export function traceFetchInProgress(state: ApplicationState): boolean {
  return state.tracing.traceFetchInProgress;
}

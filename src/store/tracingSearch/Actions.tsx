import { Moment } from 'moment';
import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import TracingSearchService from '../../services/TracingSearchService';
import * as notificationActions from '../notification/Actions';
import { TracingSupervisorDescription } from '../tracingDatasources/Types';

import { SearchResult, Span, Trace, TraceQueryFilter, TraceTree, TracingTimeSort } from './Types';

export const fetchDatasourcesAction = createAsyncAction(
  '@TRACING_SEARCH/FETCH_DS_REQ',
  '@TRACING_SEARCH/FETCH_DS_SUCC',
  '@TRACING_SEARCH/FETCH_DS_FAIL',
)<void, Array<TracingSupervisorDescription>, string>();

export const fetchServicesAction = createAsyncAction(
  '@TRACING_SEARCH/FETCH_SERVICES_REQ',
  '@TRACING_SEARCH/FETCH_SERVICES_SUCC',
  '@TRACING_SEARCH/FETCH_SERVICES_FAIL',
)<void, Array<string>, string>();

export const fetchSpansAction = createAsyncAction(
  '@TRACING_SEARCH/FETCH_SPANS_REQ',
  '@TRACING_SEARCH/FETCH_SPANS_SUCC',
  '@TRACING_SEARCH/FETCH_SPANS_FAIL',
)<void, Array<string>, string>();

export const fetchKeysAction = createAsyncAction(
  '@TRACING_SEARCH/FETCH_KEYS_REQ',
  '@TRACING_SEARCH/FETCH_KEYS_SUCC',
  '@TRACING_SEARCH/FETCH_KEYS_FAIL',
)<void, Array<string>, string>();

export const searchTracesAction = createAsyncAction(
  '@TRACING_SEARCH/SEARCH_TRACES_REQ',
  '@TRACING_SEARCH/SEARCH_TRACES_SUCC',
  '@TRACING_SEARCH/SEARCH_TRACES_FAIL',
)<void, [SearchResult, Map<string, Array<Span>>], string>();

export const fetchTraceAction = createAsyncAction(
  '@TRACING_SEARCH/FETCH_TRACE_REQ',
  '@TRACING_SEARCH/FETCH_TRACE_SUCC',
  '@TRACING_SEARCH/FETCH_TRACE_FAIL',
)<void, { trace: Trace; traceTree: TraceTree }, string>();

export const selectedDatasourceChangedAction = createStandardAction('@TRACING_SEARCH/SELECTED_DS_CHANGED')<TracingSupervisorDescription>();

export const selectedServicesChangedAction = createStandardAction('@TRACING_SEARCH/SELECTED_SERVICES_CHANGED')<string[]>();

export const selectedSpansChangedAction = createStandardAction('@TRACING_SEARCH/SELECTED_SPANS_CHANGED')<string[]>();

export const limitChangedAction = createStandardAction('@TRACING_SEARCH/LIMIT_CHANGED')<number>();

export const filterAddedAction = createStandardAction('@TRACING_SEARCH/FILTER_ADDED')<TraceQueryFilter>();

export const filterChangedAction = createStandardAction('@TRACING_SEARCH/FILTER_CHANGED')<TraceQueryFilter[]>();

export const filterRemovedAction = createStandardAction('@TRACING_SEARCH/FILTER_REMOVED')<TraceQueryFilter>();

export const filtersClearedAction = createStandardAction('@TRACING_SEARCH/FILTERS_CLEARED')<void>();

export const lookbackChangedAction = createStandardAction('@TRACING_SEARCH/LOOKBACK_CHANGED')<number>();

export const rootOnlyMatchChangedAction = createStandardAction('@TRACING_SEARCH/ROOT_ONLY_MATCH_CHANGED')<boolean>();

export const timeSortEnabledChangedAction = createStandardAction('@TRACING_SEARCH/TIME_SORT_ENABLED_CHANGED')<boolean>();

export const timeSortChangedAction = createStandardAction('@TRACING_SEARCH/TIME_SORT_CHANGED')<TracingTimeSort>();

export const startTimeChangedAction = createStandardAction('@TRACING_SEARCH/START_TIME_CHANGED')<Moment>();

export const endTimeChangedAction = createStandardAction('@TRACING_SEARCH/END_TIME_CHANGED')<Moment>();

export const selectTraceById = createStandardAction('@TRACING_SEARCH/SELECT_TRACE')<string>();

export function fetchServices(datasource: TracingSupervisorDescription, startTs: number, endTs: number) {
  return (dispatch, getState) => {
    dispatch(fetchServicesAction.request());
    TracingSearchService.fetchServices(
      datasource.id,
      startTs,
      endTs,
      (services: string[]) => {
        dispatch(fetchServicesAction.success(services));
      },
      (error) => {
        dispatch(notificationActions.error(error));
        dispatch(fetchServicesAction.failure(error));
      },
    );
  };
}

export function fetchSpans(datasource: TracingSupervisorDescription, services: string[], startTs: number, endTs: number) {
  return (dispatch, getState) => {
    dispatch(fetchSpansAction.request());
    TracingSearchService.fetchSpans(
      datasource.id,
      services,
      startTs,
      endTs,
      (spans: string[]) => {
        dispatch(fetchSpansAction.success(spans));
      },
      (error) => {
        dispatch(notificationActions.error(error));
        dispatch(fetchSpansAction.failure(error));
      },
    );
  };
}

export function fetchKeys(datasource: TracingSupervisorDescription) {
  return (dispatch, getState) => {
    dispatch(fetchKeysAction.request());
    TracingSearchService.fetchKeys(
      datasource.id,
      (keys: string[]) => {
        dispatch(fetchKeysAction.success(keys));
      },
      (error) => {
        dispatch(notificationActions.error(error));
        dispatch(fetchKeysAction.failure(error));
      },
    );
  };
}

export function fetchTrace(datasource: string, traceId: string, startTs?: number, endTs?: number, navigate?: (path: string) => void) {
  return (dispatch, getState) => {
    dispatch(fetchTraceAction.request());
    TracingSearchService.fetchTrace(
      datasource,
      traceId,
      (traces: { trace: Trace; traceTree: TraceTree }) => {
        dispatch(fetchTraceAction.success(traces));
      },
      (error) => {
        dispatch(notificationActions.error(error));
        dispatch(fetchTraceAction.failure(error));
        if (navigate) {
          navigate('/tracing/search');
        }
      },
      startTs,
      endTs,
    );
  };
}

export function searchTraces(
  datasource: TracingSupervisorDescription,
  services: Array<string>,
  spans: Array<string>,
  filters: TraceQueryFilter[],
  rootOnlyMatch: boolean,
  timeSort: TracingTimeSort | undefined,
  limit: number,
  startTs: number,
  endTs: number,
) {
  return (dispatch, getState) => {
    dispatch(searchTracesAction.request());
    TracingSearchService.searchTraces(
      datasource.id,
      services,
      spans,
      filters,
      rootOnlyMatch,
      timeSort,
      limit,
      startTs,
      endTs,
      (searchResult, traces) => {
        dispatch(searchTracesAction.success([searchResult, traces]));
      },
      (error) => {
        dispatch(notificationActions.error(error ?? 'Во время поиска трейсов произошла ошибка'));
        dispatch(searchTracesAction.failure(error));
      },
    );
  };
}

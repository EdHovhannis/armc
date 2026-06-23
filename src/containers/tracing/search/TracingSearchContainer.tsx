import * as React from 'react';
import { connect } from 'react-redux';

import TraceSearchForm, { TraceSearchDispatchFormProps, TraceSearchFormProps } from '../../../components/tracing/search/TraceSearchForm';
import * as notificationActions from '../../../store/notification/Actions';
import * as tracingDatasourceActions from '../../../store/tracingDatasources/Actions';
import * as tracingDatasourceSelectors from '../../../store/tracingDatasources/Reducer';
import { TracingSupervisorDescription } from '../../../store/tracingDatasources/Types';
import * as tracingSearchActions from '../../../store/tracingSearch/Actions';
import * as tracingSearchSelectors from '../../../store/tracingSearch/Reducer';
import { TraceQueryFilter, TracingTimeSort } from '../../../store/tracingSearch/Types';

function mapStateToProps(state): TraceSearchFormProps {
  return {
    isLoading: tracingSearchSelectors.datasourcesLoading(state),
    datasources: tracingDatasourceSelectors.getDatasources(state),
    spans: tracingSearchSelectors.getSpans(state),
    keys: tracingSearchSelectors.getKeys(state),
    services: tracingSearchSelectors.getServices(state),

    datasourcesLoading: tracingSearchSelectors.datasourcesLoading(state),
    spansLoading: tracingSearchSelectors.spansLoading(state),
    keysLoading: tracingSearchSelectors.keysLoading(state),
    servicesLoading: tracingSearchSelectors.servicesLoading(state),

    selectedDatasource: tracingSearchSelectors.getSelectedDatasource(state),
    selectedServices: tracingSearchSelectors.getSelectedServices(state),
    selectedSpans: tracingSearchSelectors.getSelectedSpans(state),
    startTime: tracingSearchSelectors.getStartTime(state),
    endTime: tracingSearchSelectors.getEndTime(state),
    filters: tracingSearchSelectors.getFilters(state),
    rootOnlyMatch: tracingSearchSelectors.rootOnlyMatch(state),
    timeSortEnabled: tracingSearchSelectors.timeSortEnabled(state),
    timeSort: tracingSearchSelectors.timeSort(state),
    limit: tracingSearchSelectors.getLimit(state),
    lookBack: tracingSearchSelectors.getLookBack(state),
    searchResult: tracingSearchSelectors.getSearchResult(state),
    searchInProgress: tracingSearchSelectors.searchInProgress(state),
  };
}

function mapDispatchToProps(dispatch: any): TraceSearchDispatchFormProps {
  return {
    displayError: (error: string) => {
      dispatch(notificationActions.error(error));
    },
    fetchDatasources: () => {
      dispatch(tracingDatasourceActions.fetchDatasources());
    },
    fetchServices: (datasource: TracingSupervisorDescription, startTs: number, endTs: number) => {
      dispatch(tracingSearchActions.fetchServices(datasource, startTs, endTs));
    },
    fetchSpans: (datasource: TracingSupervisorDescription, services: string[], startTs: number, endTs: number) => {
      dispatch(tracingSearchActions.fetchSpans(datasource, services, startTs, endTs));
    },
    fetchKeys: (datasource: TracingSupervisorDescription) => {
      dispatch(tracingSearchActions.fetchKeys(datasource));
    },
    endTimeChanged: (date) => {
      dispatch(tracingSearchActions.endTimeChangedAction(date));
    },
    startTimeChanged: (date) => {
      dispatch(tracingSearchActions.startTimeChangedAction(date));
    },
    filterAdded: (filter) => {
      dispatch(tracingSearchActions.filterAddedAction(filter));
    },
    filterChange: (filters: TraceQueryFilter[]) => {
      dispatch(tracingSearchActions.filterChangedAction(filters));
    },
    filterRemoved: (filter) => {
      dispatch(tracingSearchActions.filterRemovedAction(filter));
    },
    filtersCleared: () => {
      dispatch(tracingSearchActions.filtersClearedAction());
    },
    limitChanged: (limit) => {
      dispatch(tracingSearchActions.limitChangedAction(limit));
    },
    rootOnlyMatchChanged: (rootOnlyMatch) => {
      dispatch(tracingSearchActions.rootOnlyMatchChangedAction(rootOnlyMatch));
    },
    timeSortEnabledChanged: (timeSortEnabled) => {
      dispatch(tracingSearchActions.timeSortEnabledChangedAction(timeSortEnabled));
    },
    timeSortChanged: (timeSort) => {
      dispatch(tracingSearchActions.timeSortChangedAction(timeSort));
    },
    lookBackChanged: (lookback) => {
      dispatch(tracingSearchActions.lookbackChangedAction(lookback));
    },
    datasourceSelected: (datasource) => {
      dispatch(tracingSearchActions.selectedDatasourceChangedAction(datasource));
    },
    servicesSelected: (services) => {
      dispatch(tracingSearchActions.selectedServicesChangedAction(services));
    },
    spansSelected: (spans) => {
      dispatch(tracingSearchActions.selectedSpansChangedAction(spans));
    },
    searchRequested: (
      datasource: TracingSupervisorDescription,
      services,
      spans,
      filters,
      rootOnlyMatch,
      timeSortEnabled,
      timeSort: TracingTimeSort,
      limit,
      startTs,
      endTs,
    ) => {
      dispatch(
        tracingSearchActions.searchTraces(
          datasource,
          services,
          spans,
          filters,
          rootOnlyMatch,
          timeSortEnabled ? timeSort : undefined,
          limit,
          startTs,
          endTs,
        ),
      );
    },
    traceSelected: (traceId) => {
      dispatch(tracingSearchActions.selectTraceById(traceId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TraceSearchForm);

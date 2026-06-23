import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';

export interface KafkaViewerStoreState {
  topicId: number;
  filterValue: string;
  filterType: string;
  maxRowsToScan: number;
  maxRows: number;
  offsetType: string;
  recordsIsFetching: boolean;
}

const initialState: KafkaViewerStoreState = {
  topicId: -1,
  filterValue: '',
  filterType: 'contain',
  maxRowsToScan: 10000,
  maxRows: 100,
  offsetType: 'EARLIEST',
  recordsIsFetching: false,
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<KafkaViewerStoreState> = (state: KafkaViewerStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.fetchRecordsActions.request):
      return { ...state, recordsIsFetching: true };

    case getType(actions.fetchRecordsActions.success):
      return { ...state, recordsIsFetching: false };

    case getType(actions.fetchRecordsActions.failure):
      return { ...state, recordsIsFetching: false };

    case getType(actions.topicChanged):
      return { ...state, topicId: action.payload };

    case getType(actions.offsetChanged):
      return { ...state, offsetType: action.payload };

    case getType(actions.maxRowsChanged):
      return { ...state, maxRows: action.payload };

    case getType(actions.maxRowsToScanChanged):
      return { ...state, maxRowsToScan: action.payload };

    case getType(actions.filterValueChanged):
      return { ...state, filterValue: action.payload };

    case getType(actions.filterTypeChanged):
      return { ...state, filterType: action.payload };

    default:
      return state;
  }
};

export function getTopicId(state: ApplicationState): number {
  return state.kafkaViewer.topicId;
}

export function getRecordsIsFetching(state: ApplicationState): boolean {
  return state.kafkaViewer.recordsIsFetching;
}

export function getFilterValue(state: ApplicationState): string {
  return state.kafkaViewer.filterValue;
}

export function getFilterType(state: ApplicationState): string {
  return state.kafkaViewer.filterType;
}

export function getOffsetType(state: ApplicationState): string {
  return state.kafkaViewer.offsetType;
}

export function getMaxRows(state: ApplicationState): number {
  return state.kafkaViewer.maxRows;
}

export function getMaxRowsToScan(state: ApplicationState): number {
  return state.kafkaViewer.maxRowsToScan;
}

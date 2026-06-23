import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import KafkaService from '../../services/KafkaService';
import * as notificationActions from '../notification/Actions';

import { KafkaQuery, KafkaRecord } from './Types';

export const topicChanged = createStandardAction('@kafka/VIEWER_TOPIC_CHANGED')<number>();
export const filterValueChanged = createStandardAction('@kafka/VIEWER_FILTER_VALUE_CHANGED')<string>();
export const filterTypeChanged = createStandardAction('@kafka/VIEWER_FILTER_TYPE_CHANGED')<string>();
export const offsetChanged = createStandardAction('@kafka/VIEWER_OFFSET_CHANGED')<string>();
export const maxRowsChanged = createStandardAction('@kafka/VIEWER_MAX_ROWS_CHANGED')<number>();
export const maxRowsToScanChanged = createStandardAction('@kafka/VIEWER_MAX_ROWS_TO_SCAN_CHANGED')<number>();

export const fetchRecordsActions = createAsyncAction('@kafka/FETCH_RECORDS_REQ', '@kafka/FETCH_RECORDS_SUCC', '@kafka/FETCH_RECORDS_FAIL')<
  void,
  void,
  void
>();

export function fetchRecords(topicId: number, query: KafkaQuery, okCallback: (records: KafkaRecord[]) => void) {
  return (dispatch, getState) => {
    dispatch(fetchRecordsActions.request());
    KafkaService.fetchRecords(
      topicId,
      query,
      (records) => {
        dispatch(fetchRecordsActions.success());
        okCallback(records);
      },
      (error) => {
        dispatch(fetchRecordsActions.failure());
        dispatch(notificationActions.error({ ...error, message: `Ошибка при получении данных из кафки : ${error.message}` }));
      },
    );
  };
}

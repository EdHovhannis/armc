import { createStore, createEvent, sample } from 'effector';
import { DataGridRowSelectionState } from '@sds-eng/data-grid';

import { TableViewType } from './types';

export const $tableView = createStore<TableViewType>('configurations');
export const $rowId = createStore<number | string>('');
export const $selectedRowIds = createStore<DataGridRowSelectionState>({});
export const setRowSelection = createEvent<DataGridRowSelectionState>();

export const onChangeTableView = createEvent<TableViewType>();
export const setRowId = createEvent<number | string>();

sample({
  clock: onChangeTableView,
  target: $tableView,
});

sample({
  clock: setRowId,
  target: $rowId,
});

sample({
  clock: setRowSelection,
  target: $selectedRowIds,
});

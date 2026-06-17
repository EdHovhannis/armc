import { createStore, createEvent, sample } from 'effector';

import { TableViewType } from './types';

export const $tableView = createStore<TableViewType>('configurations');
export const $rowId = createStore<number | string>('');
export const $selectedRowIds = createStore<Record<number, boolean>>({});
export const setRowSelection = createEvent<number | string>();

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

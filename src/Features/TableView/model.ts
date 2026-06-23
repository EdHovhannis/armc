import { DataGridPaginationState, DataGridRowSelectionState, DataGridUpdater } from '@sds-eng/data-grid';
import { createStore, createEvent, sample } from 'effector';

import { TableViewType } from './types';

export const $tableView = createStore<TableViewType>('configurations');
export const $selectedRowIds = createStore<DataGridRowSelectionState>({});
export const $pagination = createStore<DataGridPaginationState>({ pageIndex: 0, pageSize: 20 });
export const setRowSelection = createEvent<DataGridRowSelectionState>();
export const setPagination = createEvent<DataGridUpdater<DataGridPaginationState>>();
export const resetPaginationPage = createEvent();

export const onChangeTableView = createEvent<TableViewType>();

sample({
  clock: onChangeTableView,
  target: $tableView,
});

sample({
  clock: setRowSelection,
  target: $selectedRowIds,
});

$pagination
  .on(setPagination, (state, updater) => (typeof updater === 'function' ? updater(state) : updater))
  .on(resetPaginationPage, (state) => (state.pageIndex === 0 ? state : { ...state, pageIndex: 0 }));

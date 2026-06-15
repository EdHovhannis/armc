import { createStore, createEvent } from 'effector';

import { TableViewType } from './types';

export const $tableView = createStore<TableViewType>('instances');
export const onChangeTableView = createEvent<TableViewType>();
$tableView.on(onChangeTableView, (_, payload) => payload);

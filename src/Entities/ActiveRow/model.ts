import { createStore, createEvent } from 'effector';

export const $activeTableRow = createStore<number | null>(null, { name: '$activeTableRow' });
export const onChangeActiveTableRow = createEvent<number | null>('onChangeActiveTableRow');
$activeTableRow.on(onChangeActiveTableRow, (_, payload) => payload);

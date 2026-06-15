import { createEvent, createStore } from 'effector';

import { RestrictionTab } from './types';

export const $restrictionTab = createStore<RestrictionTab>('byIndex');
export const onChangeRestrictionTab = createEvent<RestrictionTab>();
$restrictionTab.on(onChangeRestrictionTab, (_, payload) => payload);

// Строка, ожидающая подтверждения удаления (null — модалка закрыта).
export const $restrictionDeleteRow = createStore<{ index: number; label: string } | null>(null);
export const onOpenRestrictionDelete = createEvent<{ index: number; label: string }>();
export const onCloseRestrictionDelete = createEvent();
$restrictionDeleteRow.on(onOpenRestrictionDelete, (_, payload) => payload).reset(onCloseRestrictionDelete);

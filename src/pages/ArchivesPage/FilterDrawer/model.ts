import { createEvent, createStore } from 'effector';

import { ArchiveFilter } from '@src/Entities/Archives/api';

export const $filterDrawerOpen = createStore(false);
export const onChangeFilterDrawerOpen = createEvent<boolean>();
$filterDrawerOpen.on(onChangeFilterDrawerOpen, (_, payload) => payload);

// применённый фильтр уровня 1 живёт здесь, чтобы таблица могла его прочитать и слать в запрос
export const $appliedArchiveFilters = createStore<ArchiveFilter[]>([]);
export const onApplyArchiveFilters = createEvent<ArchiveFilter[]>();
export const onResetArchiveFilters = createEvent();
$appliedArchiveFilters.on(onApplyArchiveFilters, (_, payload) => payload).reset(onResetArchiveFilters);

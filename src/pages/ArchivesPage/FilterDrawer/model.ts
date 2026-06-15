import { createEvent, createStore } from 'effector';

export const $filterDrawerOpen = createStore(false);
export const onChangeFilterDrawerOpen = createEvent<boolean>();
$filterDrawerOpen.on(onChangeFilterDrawerOpen, (_, payload) => payload);

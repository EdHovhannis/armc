import { createStore, createEvent } from 'effector';

export const $headerOpenRestrictionDrawer = createStore(false);
export const onChangeHeaderOpenRestrictionDrawer = createEvent<boolean>();
$headerOpenRestrictionDrawer.on(onChangeHeaderOpenRestrictionDrawer, (_, payload) => payload);

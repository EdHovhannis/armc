import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { resetZoneOverdraftFx } from '@src/Entities/Instance/api';

export const $resetZoneOverdraftOpen = createStore(false);

export const onOpenResetZoneOverdraftModal = createEvent();
export const onCloseResetZoneOverdraftModal = createEvent();

$resetZoneOverdraftOpen.on(onOpenResetZoneOverdraftModal, () => true).reset(onCloseResetZoneOverdraftModal, resetZoneOverdraftFx.done);

const showZoneOverdraftResetFx = createEffect(() => {
  notification({ title: 'Овердрафт сброшен', status: 'success' });
});

sample({ clock: resetZoneOverdraftFx.done, target: showZoneOverdraftResetFx });

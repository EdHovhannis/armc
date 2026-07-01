import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { resetOffsetFx } from '@src/Entities/Instance/api';

export const $resetOffsetModalRow = createStore<ArchiveInstanceView | null>(null);

export const onOpenResetOffsetModal = createEvent<ArchiveInstanceView>();
export const onCloseResetOffsetModal = createEvent();

$resetOffsetModalRow.on(onOpenResetOffsetModal, (_, row) => row).reset(onCloseResetOffsetModal, resetOffsetFx.done);

const showOffsetResetFx = createEffect(() => {
  notification({ title: 'Офсет сброшен', status: 'success' });
});

sample({ clock: resetOffsetFx.done, target: showOffsetResetFx });

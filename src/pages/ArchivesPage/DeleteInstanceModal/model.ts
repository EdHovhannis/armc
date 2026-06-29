import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { deleteInstanceFx } from '@src/Entities/Instance/api';

export const $deleteInstanceModalRow = createStore<ArchiveInstanceView | null>(null);

export const onOpenDeleteInstanceModal = createEvent<ArchiveInstanceView>();
export const onCloseDeleteInstanceModal = createEvent();

$deleteInstanceModalRow.on(onOpenDeleteInstanceModal, (_, row) => row).reset(onCloseDeleteInstanceModal, deleteInstanceFx.done);

const showInstanceDeletedFx = createEffect(() => {
  notification({ title: 'Экземпляр удалён', status: 'success' });
});

sample({ clock: deleteInstanceFx.done, target: showInstanceDeletedFx });

import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { deleteArchiveFx } from '@src/Entities/Archives/api';
import { ArchiveConfigView } from '@src/Entities/Archives/types';

export const $deleteConfigModalRow = createStore<ArchiveConfigView | null>(null);

export const onOpenDeleteConfigModal = createEvent<ArchiveConfigView>();
export const onCloseDeleteConfigModal = createEvent();

$deleteConfigModalRow.on(onOpenDeleteConfigModal, (_, row) => row).reset(onCloseDeleteConfigModal, deleteArchiveFx.done);

const showConfigDeletedFx = createEffect(() => {
  notification({ title: 'Архив удалён', status: 'success' });
});

sample({ clock: deleteArchiveFx.done, target: showConfigDeletedFx });

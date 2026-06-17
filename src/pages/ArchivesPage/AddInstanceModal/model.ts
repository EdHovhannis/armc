import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveConfigView } from '@src/Entities/Archives/types';
import { addInstanceFx } from '@src/Entities/Instance/api';

// строка-конфигурация, для которой открыта модалка добавления экземпляра (null - закрыта)
export const $addInstanceModalRow = createStore<ArchiveConfigView | null>(null);

export const onOpenAddInstanceModal = createEvent<ArchiveConfigView>();
export const onCloseAddInstanceModal = createEvent();

$addInstanceModalRow.on(onOpenAddInstanceModal, (_, row) => row).reset(onCloseAddInstanceModal, addInstanceFx.done);

const showInstanceAddedFx = createEffect(() => {
  notification({ title: 'Экземпляр добавлен', status: 'success' });
});

sample({ clock: addInstanceFx.done, target: showInstanceAddedFx });

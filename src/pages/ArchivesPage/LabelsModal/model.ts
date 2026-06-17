import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveConfigView } from '@src/Entities/Archives/types';
import { saveLabelsFx } from '@src/Entities/Label/api';

// строка-конфигурация, для которой открыта модалка меток (null - закрыта)
export const $labelsModalRow = createStore<ArchiveConfigView | null>(null);

export const onOpenLabelsModal = createEvent<ArchiveConfigView>();
export const onCloseLabelsModal = createEvent();

$labelsModalRow.on(onOpenLabelsModal, (_, row) => row).reset(onCloseLabelsModal, saveLabelsFx.done);

const showLabelsSavedFx = createEffect(() => {
  notification({ title: 'Метки сохранены', status: 'success' });
});

sample({ clock: saveLabelsFx.done, target: showLabelsSavedFx });

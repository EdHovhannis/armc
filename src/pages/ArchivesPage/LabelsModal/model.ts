import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { refetchArchivesList } from '@src/Entities/Archives/model';
import { ArchiveConfigView } from '@src/Entities/Archives/types';
import { addLabelFx, deleteLabelFx } from '@src/Entities/Label/api';

export const $labelsModalRow = createStore<ArchiveConfigView | null>(null);

export const onOpenLabelsModal = createEvent<ArchiveConfigView>();
export const onCloseLabelsModal = createEvent();

$labelsModalRow.on(onOpenLabelsModal, (_, row) => row).reset(onCloseLabelsModal, addLabelFx.done);

const $labelsDeleted = createStore(false)
  .on(deleteLabelFx.done, () => true)
  .reset(onOpenLabelsModal, onCloseLabelsModal);

sample({
  clock: onCloseLabelsModal,
  source: $labelsDeleted,
  filter: Boolean,
  target: refetchArchivesList,
});

const showLabelAddedFx = createEffect(() => {
  notification({ title: 'Метка добавлена', status: 'success' });
});

sample({ clock: addLabelFx.done, target: showLabelAddedFx });

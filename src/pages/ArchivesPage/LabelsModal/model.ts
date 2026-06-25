import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { labelsModalClosed, labelsModalOpened } from '@src/Entities/Archives/model';
import { ArchiveConfigView } from '@src/Entities/Archives/types';
import { addLabelFx } from '@src/Entities/Label/api';

export const $labelsModalRow = createStore<ArchiveConfigView | null>(null);

export const onOpenLabelsModal = createEvent<ArchiveConfigView>();
export const onCloseLabelsModal = createEvent();

$labelsModalRow.on(onOpenLabelsModal, (_, row) => row).reset(onCloseLabelsModal, addLabelFx.done);

sample({ clock: onOpenLabelsModal, target: labelsModalOpened });
sample({ clock: onCloseLabelsModal, target: labelsModalClosed });

const showLabelAddedFx = createEffect(() => {
  notification({ title: 'Метка добавлена', status: 'success' });
});

sample({ clock: addLabelFx.done, target: showLabelAddedFx });

import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { changeInstancesOverdraftFx, resetInstancesOverdraftFx } from '@src/Entities/Instance/api';
import { fetchOverdraftConfigFx } from '@src/Entities/Overdraft/api';

import { setRowSelection } from '@src/Features/TableView/model';

export const $overDraftModalRows = createStore<ArchiveInstanceView[] | null>(null);

export const onOpenOverDraftModal = createEvent<ArchiveInstanceView[]>();
export const onCloseOverDraftModal = createEvent();

$overDraftModalRows
  .on(onOpenOverDraftModal, (_, rows) => rows)
  .reset(onCloseOverDraftModal, changeInstancesOverdraftFx.done, resetInstancesOverdraftFx.done);

// потолок процента берём из конфига овердрафта - подтягиваем при открытии
sample({ clock: onOpenOverDraftModal, target: fetchOverdraftConfigFx });

// после применения/сброса снимаем выделение чекбоксов
sample({ clock: [changeInstancesOverdraftFx.done, resetInstancesOverdraftFx.done], fn: () => ({}), target: setRowSelection });

const showOverdraftChangedFx = createEffect(() => {
  notification({ title: 'Скорость обработки изменена', status: 'success' });
});

const showOverdraftResetFx = createEffect(() => {
  notification({ title: 'Овердрафт сброшен', status: 'success' });
});

sample({ clock: changeInstancesOverdraftFx.done, target: showOverdraftChangedFx });
sample({ clock: resetInstancesOverdraftFx.done, target: showOverdraftResetFx });

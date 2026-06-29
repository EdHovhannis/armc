import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { changeInstanceOverdraftFx, resetInstanceOverdraftFx } from '@src/Entities/Instance/api';
import { fetchOverdraftConfigFx } from '@src/Entities/Overdraft/api';

export const $instanceOverdraftModalRow = createStore<ArchiveInstanceView | null>(null);

export const onOpenInstanceOverdraftModal = createEvent<ArchiveInstanceView>();
export const onCloseInstanceOverdraftModal = createEvent();

$instanceOverdraftModalRow
  .on(onOpenInstanceOverdraftModal, (_, row) => row)
  .reset(onCloseInstanceOverdraftModal, changeInstanceOverdraftFx.done, resetInstanceOverdraftFx.done);

// потолок процента берём из конфига овердрафта - подтягиваем при открытии диалога
sample({ clock: onOpenInstanceOverdraftModal, target: fetchOverdraftConfigFx });

const showOverdraftChangedFx = createEffect(() => {
  notification({ title: 'Скорость обработки изменена', status: 'success' });
});

const showOverdraftResetFx = createEffect(() => {
  notification({ title: 'Овердрафт сброшен', status: 'success' });
});

sample({ clock: changeInstanceOverdraftFx.done, target: showOverdraftChangedFx });
sample({ clock: resetInstanceOverdraftFx.done, target: showOverdraftResetFx });

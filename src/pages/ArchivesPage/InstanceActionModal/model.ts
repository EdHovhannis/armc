import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveInstanceView, IndexingStatus } from '@src/Entities/Archives/types';
import { fetchInstanceStatusFx, resumeInstanceFx, suspendInstanceFx } from '@src/Entities/Instance/api';

export type InstanceAction = 'resume' | 'suspend';

export type InstanceActionTarget = {
  row: ArchiveInstanceView;
  action: InstanceAction;
};

export const $instanceActionModal = createStore<InstanceActionTarget | null>(null);

export const onOpenInstanceActionModal = createEvent<InstanceActionTarget>();
export const onCloseInstanceActionModal = createEvent();

$instanceActionModal
  .on(onOpenInstanceActionModal, (_, target) => target)
  .reset(onCloseInstanceActionModal, resumeInstanceFx.done, suspendInstanceFx.done);

const notifyInstanceActionResultFx = createEffect(({ action, status }: { action: InstanceAction; status: IndexingStatus }) => {
  const expected = action === 'resume' ? 'RUNNING' : 'STOPPED';

  if (status === expected) {
    notification({ title: action === 'resume' ? 'Экземпляр запущен' : 'Экземпляр остановлен', status: 'success' });
    return;
  }

  if (status === 'FAILED') {
    notification({ title: action === 'resume' ? 'Не удалось запустить экземпляр' : 'Не удалось остановить экземпляр', status: 'error' });
    return;
  }

  notification({
    title: action === 'resume' ? 'Команда на запуск отправлена' : 'Команда на остановку отправлена',
    description: `Статус экземпляра: ${status}`,
    status: 'warning',
  });
});

sample({
  clock: fetchInstanceStatusFx.done,
  filter: ({ params }) => params.notifyAction !== undefined,
  fn: ({ params, result }) => ({ action: params.notifyAction as InstanceAction, status: result.status }),
  target: notifyInstanceActionResultFx,
});

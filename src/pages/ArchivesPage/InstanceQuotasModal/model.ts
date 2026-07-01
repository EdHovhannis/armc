import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { fetchArchiveConfigFx } from '@src/Entities/Archives/api';
import { KafkaSource, ArchiveInstanceView } from '@src/Entities/Archives/types';
import { saveInstanceQuotasFx } from '@src/Entities/Instance/api';
import { fetchCurrentProjectLimitsFx } from '@src/Entities/Limits/api';

export const $instanceQuotasModalRow = createStore<ArchiveInstanceView | null>(null);
export const $instanceQuotasTopics = createStore<KafkaSource[]>([]);

export const onOpenInstanceQuotasModal = createEvent<ArchiveInstanceView>();
export const onCloseInstanceQuotasModal = createEvent();

$instanceQuotasModalRow.on(onOpenInstanceQuotasModal, (_, row) => row).reset([onCloseInstanceQuotasModal, saveInstanceQuotasFx.done]);

$instanceQuotasTopics.on(fetchArchiveConfigFx.doneData, (_, response) => response.data.source.kafka).reset(onCloseInstanceQuotasModal);

sample({
  clock: onOpenInstanceQuotasModal,
  fn: (row) => ({ project: row.projectName, taskName: row.configName }),
  target: fetchArchiveConfigFx,
});

sample({
  clock: onOpenInstanceQuotasModal,
  fn: (row) => row.projectName,
  target: fetchCurrentProjectLimitsFx,
});

const showQuotasSavedFx = createEffect(() => {
  notification({ title: 'Квоты обновлены', status: 'success' });
});

sample({ clock: saveInstanceQuotasFx.done, target: showQuotasSavedFx });

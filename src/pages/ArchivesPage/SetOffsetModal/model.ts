import { notification } from '@sds-eng/base';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { fetchOffsetDataFx, setOffsetsFx } from '@src/Entities/Instance/api';
import { OffsetTopicData } from '@src/Entities/Instance/types';

export const $setOffsetModalRow = createStore<ArchiveInstanceView | null>(null);
export const $offsetData = createStore<OffsetTopicData[]>([]);

export const onOpenSetOffsetModal = createEvent<ArchiveInstanceView>();
export const onCloseSetOffsetModal = createEvent();

$setOffsetModalRow.on(onOpenSetOffsetModal, (_, row) => row).reset(onCloseSetOffsetModal, setOffsetsFx.done);
$offsetData.on(fetchOffsetDataFx.doneData, (_, { data }) => data).reset(onCloseSetOffsetModal);

sample({
  clock: onOpenSetOffsetModal,
  fn: (row) => ({ project: row.projectName, taskName: row.configName, zoneId: row.zoneId }),
  target: fetchOffsetDataFx,
});

const showNoSourcesFx = createEffect(() => {
  notification({ title: 'Отсутствуют источники данных для offset', status: 'error' });
});

// если данные пришли пустые или у топика нет consumerGroups - закрыть и показать ошибку
sample({
  clock: fetchOffsetDataFx.doneData,
  filter: ({ data }) => !data.length || !data.every((item) => item.consumerGroups.length > 0),
  target: [onCloseSetOffsetModal, showNoSourcesFx],
});

// закрываем при ошибке загрузки (тост покажет handleErrorFx из api.ts)
sample({ clock: fetchOffsetDataFx.fail, target: onCloseSetOffsetModal });

const showOffsetSetFx = createEffect(() => {
  notification({ title: 'Offset успешно установлен', status: 'success' });
});

sample({ clock: setOffsetsFx.done, target: showOffsetSetFx });

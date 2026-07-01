import { AxiosError } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { RestrictionAllItem, RestrictionObjectItem, RestrictionObjectResponse, RestrictionObjectType } from './types';

type AxiosErr = AxiosError<AxiosResponseError>;

type OverviewRaw = Omit<RestrictionObjectItem, 'maxSearchTimeIntervalSec'>;

// путь к ограничению объекта - полный, чтобы грепался по хвосту (index vs project ветвим явно)
const objectUrl = (type: RestrictionObjectType, id: string): string =>
  type === 'INDEX'
    ? `/v1/internal/index/archive/restrictions/index/${encodeURIComponent(id)}`
    : `/v1/internal/index/archive/restrictions/project/${encodeURIComponent(id)}`;

// список ограничений + догрузка значения по каждому объекту.
// TODO(restrictions-api): N запросов за значениями - попросить бэк отдавать их прямо в overview, чтобы не дудосить
export const fetchRestrictionsTableFx = createEffect<void, RestrictionObjectItem[], AxiosErr>(async () => {
  const { data: overview } = await axios.get<OverviewRaw[]>('/v1/internal/index/archive/restrictions/overview');
  return Promise.all(
    overview.map(async (item) => {
      const { data } = await axios.get<RestrictionObjectResponse>(objectUrl(item.objectType, item.objectId));
      return { ...item, maxSearchTimeIntervalSec: data.mergedRestrictions?.maxSearchTimeIntervalSec ?? null };
    }),
  );
});

// текущее ограничение объекта (префилл при выборе в выпадашке). берём merged - эффективное значение
export const fetchObjectRestrictionFx = createEffect<{ type: RestrictionObjectType; id: string }, number | null, AxiosErr>(async ({ type, id }) => {
  const { data } = await axios.get<RestrictionObjectResponse>(objectUrl(type, id));
  return data.mergedRestrictions?.maxSearchTimeIntervalSec ?? null;
});

export const saveRestrictionsFx = createEffect<
  { type: RestrictionObjectType; items: { id: string; maxSearchTimeIntervalSec: number }[] },
  void,
  AxiosErr
>(async ({ type, items }) => {
  const results = await Promise.allSettled(
    items.map(({ id, maxSearchTimeIntervalSec }) => axios.patch(objectUrl(type, id), { maxSearchTimeIntervalSec })),
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
});

export const deleteRestrictionFx = createEffect<{ type: RestrictionObjectType; id: string }, void, AxiosErr>(async ({ type, id }) => {
  await axios.delete(objectUrl(type, id));
});

export const fetchRestrictionAllFx = createEffect<void, RestrictionAllItem, AxiosErr>(async () => {
  const { data } = await axios.get<RestrictionAllItem>('/v1/internal/index/archive/restrictions');
  return data;
});

export const saveRestrictionAllFx = createEffect<RestrictionAllItem, RestrictionAllItem, AxiosErr>(async (item) => {
  await axios.patch('/v1/internal/index/archive/restrictions', item);
  return item;
});

sample({
  clock: [fetchRestrictionsTableFx.failData, fetchObjectRestrictionFx.failData, fetchRestrictionAllFx.failData],
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить ограничения', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

sample({
  clock: [saveRestrictionsFx.failData, deleteRestrictionFx.failData, saveRestrictionAllFx.failData],
  fn: ({ response, status }) => ({ title: 'Не удалось сохранить ограничения', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

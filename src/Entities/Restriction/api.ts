import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';

import { projectOptionsMock, restrictionAllMock, restrictionsOverviewMock } from './mock';
import { RestrictionAllItem, RestrictionObjectItem, RestrictionObjectResponse, RestrictionObjectType } from './types';

// Эффекты шлют реальные запросы, при ошибке тихо откатываются на моки (dev-бэк недоступен).
// При интеграции: убрать fallback и mock.ts, повесить sample({ clock: fx.failData, target: handleErrorFx }).

// overview без значений (как отдаёт бэк)
type OverviewRaw = Omit<RestrictionObjectItem, 'maxSearchTimeIntervalSec'>;

// путь к ограничению объекта - полный, чтобы грепался по хвосту (index vs project ветвим явно)
const objectUrl = (type: RestrictionObjectType, id: string): string =>
  type === 'INDEX'
    ? `/v1/internal/index/archive/restrictions/index/${encodeURIComponent(id)}`
    : `/v1/internal/index/archive/restrictions/project/${encodeURIComponent(id)}`;

// список ограничений + догрузка значения по каждому объекту.
// TODO(restrictions-api): N запросов за значениями - попросить бэк отдавать их прямо в overview, чтобы не дудосить
export const fetchRestrictionsTableFx = createEffect<void, RestrictionObjectItem[]>(async () => {
  try {
    const { data: overview } = await axios.get<OverviewRaw[]>('/v1/internal/index/archive/restrictions/overview');
    return Promise.all(
      overview.map(async (item) => {
        try {
          const { data } = await axios.get<RestrictionObjectResponse>(objectUrl(item.objectType, item.objectId));
          return { ...item, maxSearchTimeIntervalSec: data.mergedRestrictions?.maxSearchTimeIntervalSec ?? null };
        } catch {
          return { ...item, maxSearchTimeIntervalSec: null };
        }
      }),
    );
  } catch {
    return restrictionsOverviewMock;
  }
});

// текущее ограничение объекта (префилл при выборе в выпадашке). берём merged - эффективное значение
export const fetchObjectRestrictionFx = createEffect<{ type: RestrictionObjectType; id: string }, number | null>(async ({ type, id }) => {
  try {
    const { data } = await axios.get<RestrictionObjectResponse>(objectUrl(type, id));
    return data.mergedRestrictions?.maxSearchTimeIntervalSec ?? null;
  } catch {
    return null;
  }
});

// дифф-сохранение активной вкладки: PATCH только новых/изменённых строк, построчно
export const saveRestrictionsFx = createEffect<{ type: RestrictionObjectType; items: { id: string; maxSearchTimeIntervalSec: number }[] }, void>(
  async ({ type, items }) => {
    await Promise.allSettled(items.map(({ id, maxSearchTimeIntervalSec }) => axios.patch(objectUrl(type, id), { maxSearchTimeIntervalSec })));
  },
);

export const deleteRestrictionFx = createEffect<{ type: RestrictionObjectType; id: string }, void>(async ({ type, id }) => {
  await axios.delete(objectUrl(type, id)).catch(() => undefined);
});

export const fetchProjectOptionsFx = createEffect<void, { name: string; shortName: string }[]>(async () => {
  try {
    const { data } = await axios.get<{ name: string; shortName: string }[]>('/v1/internal/project/list');
    return data.map(({ name, shortName }) => ({ name, shortName }));
  } catch {
    return projectOptionsMock;
  }
});

export const fetchRestrictionAllFx = createEffect<void, RestrictionAllItem>(async () => {
  try {
    const { data } = await axios.get<RestrictionAllItem>('/v1/internal/index/archive/restrictions');
    return typeof data?.maxSearchTimeIntervalSec === 'number' ? data : restrictionAllMock;
  } catch {
    return restrictionAllMock;
  }
});

export const saveRestrictionAllFx = createEffect<RestrictionAllItem, RestrictionAllItem>(async (item) => {
  // бэка ограничений в dev нет - глушим ошибку, чтобы .done сработал и сейв не ронял UI (см. TODO выше)
  await axios.patch('/v1/internal/index/archive/restrictions', item).catch(() => undefined);
  return item;
});

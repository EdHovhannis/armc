import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';

import { indexOptionsMock, projectOptionsMock, restrictionAllMock, restrictionsByIndexMock, restrictionsByProjectMock } from './mock';
import { RestrictionAllItem, RestrictionByIndexItem, RestrictionByProjectItem } from './types';

// TODO(restrictions-api): бэкенд ограничений ещё не реализован — в контракте
// (docs/api/coordinator-internal.openapi.json) эндпоинтов /archive/restrictions* нет.
// Эффекты уже шлют реальные запросы по путям из постановки (видны в Network),
// но при любой ошибке тихо откатываются на моки, чтобы UI оставался рабочим.
// При интеграции с бэком:
//   1) убрать fallback на моки и mock.ts;
//   2) повесить sample({ clock: fx.failData, target: handleErrorFx }) на каждый эффект;
//   3) уточнить форму ответа overview и источник списка индексов (вопросы бэку);
//   4) в save-эффектах слать PATCH только по изменённым строкам и DELETE по удалённым.

// предполагаемая форма ответа overview - уточнить при интеграции
type RestrictionsOverview = {
  byIndex: RestrictionByIndexItem[];
  byProject: RestrictionByProjectItem[];
};

const delay = <T>(data: T, ms = 400): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const fetchIndexOptionsFx = createEffect<void, string[]>(async () => {
  // Эндпоинт списка индексов в контракте отсутствует — запрос не шлём, только мок.
  return delay(indexOptionsMock);
});

export const fetchProjectOptionsFx = createEffect<void, string[]>(async () => {
  try {
    const { data } = await axios.get<{ shortName: string }[]>('/v1/internal/project/list');
    return data.map((project) => project.shortName);
  } catch {
    return projectOptionsMock;
  }
});

export const fetchRestrictionsOverviewFx = createEffect<void, RestrictionsOverview>(async () => {
  try {
    const { data } = await axios.get<Partial<RestrictionsOverview>>('/v1/internal/index/archive/restrictions/overview');
    return {
      byIndex: data.byIndex ?? restrictionsByIndexMock,
      byProject: data.byProject ?? restrictionsByProjectMock,
    };
  } catch {
    return { byIndex: restrictionsByIndexMock, byProject: restrictionsByProjectMock };
  }
});

export const fetchRestrictionAllFx = createEffect<void, RestrictionAllItem>(async () => {
  try {
    const { data } = await axios.get<RestrictionAllItem>('/v1/internal/index/archive/restrictions');
    return typeof data?.value === 'number' ? data : restrictionAllMock;
  } catch {
    return restrictionAllMock;
  }
});

export const saveRestrictionsByIndexFx = createEffect<RestrictionByIndexItem[], RestrictionByIndexItem[]>(async (items) => {
  await Promise.allSettled(
    items.map(({ indexId, value, unit }) =>
      axios.patch(`/v1/internal/index/archive/restrictions/index/${encodeURIComponent(indexId)}`, { value, unit }),
    ),
  );
  return items;
});

export const saveRestrictionsByProjectFx = createEffect<RestrictionByProjectItem[], RestrictionByProjectItem[]>(async (items) => {
  await Promise.allSettled(
    items.map(({ project, value, unit }) =>
      axios.patch(`/v1/internal/index/archive/restrictions/project/${encodeURIComponent(project)}`, { value, unit }),
    ),
  );
  return items;
});

export const saveRestrictionAllFx = createEffect<RestrictionAllItem, RestrictionAllItem>(async (item) => {
  // бэка ограничений ещё нет, в dev/prod летит 404 - глушим ошибку, чтобы .done сработал и сейв не ронял UI.
  // аналог allSettled в соседних save-эффектах. снять вместе с fallback при интеграции (см. TODO выше)
  await axios.patch('/v1/internal/index/archive/restrictions', item).catch(() => undefined);
  return item;
});

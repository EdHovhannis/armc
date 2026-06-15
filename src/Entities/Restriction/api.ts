import { createEffect } from 'effector';

import { indexOptionsMock, projectOptionsMock, restrictionAllMock, restrictionsByIndexMock, restrictionsByProjectMock } from './mock';
import { RestrictionAllItem, RestrictionByIndexItem, RestrictionByProjectItem } from './types';

// TODO: заменить моки на реальные запросы при интеграции с бэком.
// Реальные эндпоинты (см. CLAUDE.md, раздел «Форма управления Ограничениями»):
//   GET   /api/gateway/v1/internal/index/archive/restrictions            — все индексы
//   GET   /api/gateway/v1/internal/index/archive/restrictions/overview   — по индексу / по проекту
//   GET   /api/gateway/v1/internal/project/list                          — список проектов
//   PATCH /api/gateway/v1/internal/index/archive/restrictions/index/{indexId}
//   PATCH /api/gateway/v1/internal/index/archive/restrictions/project/{project}
// Все effect'ы при переходе на axios должны слать ошибку в handleErrorFx (src/Shared/api/model).

const delay = <T>(data: T, ms = 400): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const fetchIndexOptionsFx = createEffect<void, string[]>(async () => delay(indexOptionsMock));

export const fetchProjectOptionsFx = createEffect<void, string[]>(async () => delay(projectOptionsMock));

export const fetchRestrictionsByIndexFx = createEffect<void, RestrictionByIndexItem[]>(async () => delay(restrictionsByIndexMock));

export const fetchRestrictionsByProjectFx = createEffect<void, RestrictionByProjectItem[]>(async () => delay(restrictionsByProjectMock));

export const fetchRestrictionAllFx = createEffect<void, RestrictionAllItem>(async () => delay(restrictionAllMock));

export const saveRestrictionsByIndexFx = createEffect<RestrictionByIndexItem[], RestrictionByIndexItem[]>(async (items) => delay(items));

export const saveRestrictionsByProjectFx = createEffect<RestrictionByProjectItem[], RestrictionByProjectItem[]>(async (items) => delay(items));

export const saveRestrictionAllFx = createEffect<RestrictionAllItem, RestrictionAllItem>(async (item) => delay(item));

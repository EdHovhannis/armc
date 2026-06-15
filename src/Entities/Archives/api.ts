import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ArchiveConfiguration } from './types';

export const DEFAULT_ARCHIVES_PAGE_SIZE = 20;

export interface FetchArchivesParams {
  pageSize: number;
  pageNumber: number;
}

export const fetchArchivesFx = createEffect<
  FetchArchivesParams,
  AxiosResponse<ArchiveConfiguration[]>,
  AxiosError<AxiosResponseError>
>(async (params) =>
  axios.get('/v1/internal/index/archive/list/paginated', {
    params,
  }),
);

sample({
  clock: fetchArchivesFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить архивы.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

export const fetchArchivesPageCountFx = createEffect<void, number, AxiosError<AxiosResponseError>>(async () => {
  const response = await axios.get<number | { pageCount?: number; totalPages?: number }>('/v1/internal/index/archive/page-count', {
    params: { pageSize: 1, pageNumber: 1 },
  });

  const data = response.data;

  if (typeof data === 'number' && Number.isFinite(data)) {
    return Math.max(1, data);
  }

  if (data && typeof data === 'object') {
    const normalizedCount = data.pageCount ?? data.totalPages;
    if (typeof normalizedCount === 'number' && Number.isFinite(normalizedCount)) {
      return Math.max(1, normalizedCount);
    }
  }

  return 1;
});

sample({
  clock: fetchArchivesPageCountFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить количество страниц архивов.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

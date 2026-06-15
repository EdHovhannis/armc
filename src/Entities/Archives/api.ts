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

const extractPageCount = (data: unknown): number | null => {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return Math.max(1, data);
  }

  if (typeof data === 'string') {
    const normalized = Number(data);
    if (Number.isFinite(normalized)) {
      return Math.max(1, normalized);
    }
    return null;
  }

  if (data && typeof data === 'object') {
    const objectData = data as Record<string, unknown>;
    const possibleFields = [
      objectData.pageCount,
      objectData.totalPages,
      objectData.pagesCount,
      objectData.count,
      objectData.total,
      objectData.totalElements,
    ];

    for (const field of possibleFields) {
      const extracted = extractPageCount(field);
      if (extracted !== null) {
        return extracted;
      }
    }
  }

  return null;
};

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
  const response = await axios.get<unknown>('/v1/internal/index/archive/page-count', {
    params: { pageSize: 1, pageNumber: 1 },
  });

  return extractPageCount(response.data) ?? 1;
});

sample({
  clock: fetchArchivesPageCountFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить количество страниц архивов.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

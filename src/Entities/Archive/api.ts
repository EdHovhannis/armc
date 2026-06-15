import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';
import qs from 'qs';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ArchiveConfiguration } from './types';

export type ArchiveListFilter = {
  field: 'nameLike';
  op: 'like';
  values: string[];
};

export type FetchArchivesParams = {
  pageSize: number;
  pageNumber: number;
  filters?: ArchiveListFilter[];
};

export type FetchArchivesPageCountParams = {
  filters?: ArchiveListFilter[];
};

const serializeArchiveListParams = (params: Record<string, unknown>) =>
  qs.stringify(params, { arrayFormat: 'indices', encode: true });

export const createNameLikeFilter = (search: string): ArchiveListFilter[] | undefined => {
  const trimmed = search.trim();

  if (!trimmed) {
    return undefined;
  }

  return [{ field: 'nameLike', op: 'like', values: [`%${trimmed}%`] }];
};

export const fetchArchivesFx = createEffect<
  FetchArchivesParams,
  AxiosResponse<ArchiveConfiguration[]>,
  AxiosError<AxiosResponseError>
>(async ({ pageSize, pageNumber, filters }) =>
  axios.get('/v1/internal/index/archive/list/paginated', {
    params: {
      pageSize,
      pageNumber,
      ...(filters?.length ? { filters } : {}),
    },
    paramsSerializer: serializeArchiveListParams,
  }),
);

export const fetchArchivesPageCountFx = createEffect<
  FetchArchivesPageCountParams,
  AxiosResponse<number>,
  AxiosError<AxiosResponseError>
>(async ({ filters } = {}) =>
  axios.get('/v1/internal/index/archive/list/page-count', {
    params: {
      pageSize: 1,
      pageNumber: 1,
      ...(filters?.length ? { filters } : {}),
    },
    paramsSerializer: serializeArchiveListParams,
  }),
);

sample({
  clock: fetchArchivesFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить архивы.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

sample({
  clock: fetchArchivesPageCountFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось загрузить количество архивов.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

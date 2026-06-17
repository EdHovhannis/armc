import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ArchiveConfiguration } from './types';

export interface FetchArchivesParams {
  pageNumber: number;
  pageSize: number;
  filters?: ArchiveFilter[];
}

export interface ArchiveFilter {
  field: string;
  op: string;
  values: string[];
}

const getArchiveListParams = ({ pageNumber, pageSize, filters }: FetchArchivesParams) => ({
  pageSize,
  pageNumber,
  ...(filters?.length ? { filters: JSON.stringify(filters) } : {}),
});

export const fetchArchivesFx = createEffect<FetchArchivesParams, AxiosResponse<ArchiveConfiguration[]>, AxiosError<AxiosResponseError>>(
  async (params) => axios.get('/v1/internal/index/archive/list/paginated', { params: getArchiveListParams(params) }),
);

export const fetchArchivesCountFx = createEffect<Pick<FetchArchivesParams, 'filters'> | void, AxiosResponse<number>, AxiosError<AxiosResponseError>>(
  async (params) =>
    axios.get('/v1/internal/index/archive/list/page-count', {
      params: getArchiveListParams({ pageSize: 1, pageNumber: 1, filters: params?.filters }),
    }),
);

export const deleteArchivesFx = createEffect<string[], AxiosResponse<unknown>[], AxiosError<AxiosResponseError>>(async (urls) =>
  Promise.all(urls.map((url) => axios.delete(url))),
);

sample({
  clock: fetchArchivesFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить архивы.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

sample({
  clock: fetchArchivesCountFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось загрузить количество архивов.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

sample({
  clock: deleteArchivesFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось удалить архивы.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

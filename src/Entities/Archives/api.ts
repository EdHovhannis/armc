import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ArchiveConfiguration } from './types';

export interface FetchArchivesParams {
  pageNumber: number;
  pageSize: number;
}

export const fetchArchivesFx = createEffect<FetchArchivesParams, AxiosResponse<ArchiveConfiguration[]>, AxiosError<AxiosResponseError>>(
  async ({ pageNumber, pageSize }) => axios.get('/v1/internal/index/archive/list/paginated', { params: { pageSize, pageNumber } }),
);

export const fetchArchivesCountFx = createEffect<void, AxiosResponse<number>, AxiosError<AxiosResponseError>>(async () =>
  axios.get('/v1/internal/index/archive/list/page-count', { params: { pageSize: 1, pageNumber: 1 } }),
);

sample({
  clock: fetchArchivesFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить архивы.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

sample({
  clock: fetchArchivesCountFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить количество архивов.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ArchiveConfiguration, FilterItems } from './types';

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

export interface DeleteArchiveParams {
  project: string;
  taskName: string;
}

export interface ExportArchiveConfigParams {
  project: string;
  taskName: string;
}

// тело конфигурации для экспорта. форму не типизируем - скачиваем ответ как есть в json-файл
export const exportArchiveConfigFx = createEffect<ExportArchiveConfigParams, AxiosResponse<unknown>, AxiosError<AxiosResponseError>>(
  async ({ project, taskName }) =>
    axios.get(`/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/config`),
);

const getArchiveConfigUrl = ({ project, taskName }: DeleteArchiveParams) =>
  `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/config`;

const deleteByUrl = (url: string) => axios.delete<unknown>(url);

const deleteByUrls = (urls: string[]) => Promise.all(urls.map(deleteByUrl));

export const deleteArchiveFx = createEffect<DeleteArchiveParams, DeleteArchiveParams, AxiosError<AxiosResponseError>>(async (params) => {
  await deleteByUrl(getArchiveConfigUrl(params));
  return params;
});

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

export const deleteArchivesFx = createEffect<string[], AxiosResponse<unknown>[], AxiosError<AxiosResponseError>>(deleteByUrls);

export const deleteArchivesInstancesFx = createEffect<string[], AxiosResponse<unknown>[], AxiosError<AxiosResponseError>>(deleteByUrls);

export const fetchArchivesFiltersFx = createEffect<
  Pick<FetchArchivesParams, 'filters'> | void,
  AxiosResponse<FilterItems>,
  AxiosError<AxiosResponseError>
>(async () => axios.get('/v1/internal/index/archive/list/filter-values'));

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
  clock: exportArchiveConfigFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось выгрузить конфигурацию.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

sample({
  clock: deleteArchiveFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось удалить архив.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

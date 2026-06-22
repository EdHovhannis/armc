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

export interface DeleteArchiveParams {
  project: string;
  taskName: string;
}

// eslint-disable-next-line import/export
export interface ExportArchiveConfigParams {
  project: string;
  taskName: string;
}

// тело конфигурации для экспорта. форму не типизируем - скачиваем ответ как есть в json-файл

export const exportArchiveConfigFx = createEffect<ExportArchiveConfigParams, AxiosResponse<unknown>, AxiosError<AxiosResponseError>>(
  async ({ project, taskName }) =>
    axios.get(`/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/config`),
);

// eslint-disable-next-line import/export
export interface ExportArchiveConfigParams {
  project: string;
  taskName: string;
}

const getArchiveConfigUrl = ({ project, taskName }: DeleteArchiveParams) =>
  `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/config`;

const deleteByUrl = (url: string) => axios.delete<unknown>(url);

const deleteByUrls = (urls: string[]) => Promise.all(urls.map(deleteByUrl));

export const deleteArchiveFx = createEffect<DeleteArchiveParams, DeleteArchiveParams>(async (params) => {
  await deleteByUrl(getArchiveConfigUrl(params)).catch(() => undefined);
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

// полный список конфигураций (без фильтра) для выпадашек фильтра - они должны показывать
// весь исходный набор, а не то, что осталось на текущей отфильтрованной странице.
// отдельного справочника имён/меток бэк не даёт, поэтому тянем весь список разом большим pageSize.
// TODO(archives-filter-api): заменить на справочник имён/меток, когда бэк его предоставит
const ARCHIVE_OPTIONS_PAGE_SIZE = 10000;

export const fetchArchiveOptionsFx = createEffect<void, AxiosResponse<ArchiveConfiguration[]>, AxiosError<AxiosResponseError>>(async () =>
  axios.get('/v1/internal/index/archive/list/paginated', { params: { pageSize: ARCHIVE_OPTIONS_PAGE_SIZE, pageNumber: 1 } }),
);

// page-count при pageSize=1 возвращает число страниц == общему числу конфигураций,
// поэтому шлём pageSize:1 и читаем ответ как total count для пагинации. не менять pageSize - сломает счётчик
export const fetchArchivesCountFx = createEffect<Pick<FetchArchivesParams, 'filters'> | void, AxiosResponse<number>, AxiosError<AxiosResponseError>>(
  async (params) =>
    axios.get('/v1/internal/index/archive/list/page-count', {
      params: getArchiveListParams({ pageSize: 1, pageNumber: 1, filters: params?.filters }),
    }),
);

export const deleteArchivesFx = createEffect<string[], AxiosResponse<unknown>[], AxiosError<AxiosResponseError>>(deleteByUrls);

export const deleteArchivesInstancesFx = createEffect<string[], AxiosResponse<unknown>[], AxiosError<AxiosResponseError>>(deleteByUrls);

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
  clock: fetchArchiveOptionsFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось загрузить список значений для фильтра.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ProjectEstimateItem, ProjectLimitItem, QuotaEstimateRequestParams } from './types';

export const fetchCurrentProjectLimitsFx = createEffect<string, AxiosResponse<ProjectLimitItem>, AxiosError<AxiosResponseError>>(async (project) =>
  axios.get(`/v1/index/archive/quota/project/${project}`),
);

export const fetchCurrentEstimateFx = createEffect<QuotaEstimateRequestParams, AxiosResponse<ProjectEstimateItem>, AxiosError<AxiosResponseError>>(
  async ({ project, name, maxDataRateBytesPerSec, maxStoreDurationSec, maxSizeBytes, sources }) =>
    axios.post(`/v2/index/archive/task/project/${project}/quota/estimate`, {
      name,
      quotaEstimateRequestClientDto: {
        maxDataRateBytesPerSec,
        maxStoreDurationSec,
        maxSizeBytes,
        sources,
      },
    }),
);

sample({
  clock: fetchCurrentProjectLimitsFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить лимиты по проекту.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

sample({
  clock: fetchCurrentEstimateFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось рассчитать лимиты по проекту.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

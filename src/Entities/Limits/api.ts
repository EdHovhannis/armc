import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { EstimateOverdraftItem, ProjectEstimateItem, ProjectLimitItem, QuotaEstimateRequestParams } from './types';

export const fetchCurrentProjectLimitsFx = createEffect<string, AxiosResponse<ProjectLimitItem>, AxiosError<AxiosResponseError>>(async (project) =>
  axios.get(`/v1/index/archive/quota/project/${project}`),
);

export const fetchCurrentEstimateFx = createEffect<
  QuotaEstimateRequestParams,
  AxiosResponse<ProjectEstimateItem>,
  AxiosError<AxiosResponseError>
>(async ({ project, name, maxDataRateBytesPerSec, maxStoreDurationSec, maxSizeBytes, sources }) =>
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

const MOCK_OVERDRAFT = {
  maxDataRateBytesPerSec: 100,
  maxSizeBytes: 1048576,
  maxStorageTimeSec: 10485,
};

export const fetchCurrentOverdraftEstimateFx = createEffect<void, AxiosResponse<EstimateOverdraftItem>, AxiosError<AxiosResponseError>>(async () =>
  axios.post('/v1/internal/index/archive/task/overdraft/estimate', MOCK_OVERDRAFT),
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

sample({
  clock: fetchCurrentOverdraftEstimateFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось рассчитать овердрафт скорости.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

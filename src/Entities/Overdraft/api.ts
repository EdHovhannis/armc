import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { OverdraftConfig } from './types';

export const fetchOverdraftConfigFx = createEffect<void, AxiosResponse<OverdraftConfig>, AxiosError<AxiosResponseError>>(async () =>
  axios.get('/v1/internal/index/archive/task/overdraft/config'),
);

sample({
  clock: fetchOverdraftConfigFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось загрузить настройки овердрафта',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

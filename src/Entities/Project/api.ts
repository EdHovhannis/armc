import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { ProjectItem } from './types';

export const fetchProjectsFx = createEffect<void, AxiosResponse<ProjectItem[]>, AxiosError<AxiosResponseError>>(async () =>
  axios.get('/internal/project/list'),
);

sample({
  clock: fetchProjectsFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить проекты.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

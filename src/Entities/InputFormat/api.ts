import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

export const fetchDateFormatsFx = createEffect<void, AxiosResponse<string[]>, AxiosError<AxiosResponseError>>(async () =>
  axios.get('/v1/internal/source/kafka/available_datetime_formats'),
);

sample({
  clock: fetchDateFormatsFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось получить доступные форматы дат.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { TopicItem } from './types';

export const fetchTopicsFx = createEffect<void, AxiosResponse<TopicItem[]>, AxiosError<AxiosResponseError>>(async () =>
  axios.get('/v1/internal/source/kafka/topics'),
);

sample({
  clock: fetchTopicsFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить топики.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

const MOCK_DATA = {
  maxRowsInResult: 10,
  maxRowsToScan: 10,
  offset: 'LATEST',
  filter: {
    type: 'true',
  },
};

export const fetchCurrentTopicInfoFx = createEffect<number, AxiosResponse<Array<unknown>>, AxiosError<AxiosResponseError>>(async (topicId) =>
  axios.post(`/v1/internal/source/kafka/topics/${topicId}/fetch`, MOCK_DATA),
);

import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { TopicItem, TopicMessageItem } from './types';

export const fetchTopicsFx = createEffect<void, AxiosResponse<TopicItem[]>, AxiosError<AxiosResponseError>>(
  async () => axios.get('/v1/internal/source/kafka/topics'),
  axios.get('/v1/internal/source/kafka/topics'),
);

sample({
  clock: fetchTopicsFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось загрузить топики.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

export const fetchCurrentTopicInfoFx = createEffect<number, AxiosResponse<Array<TopicMessageItem>>, AxiosError<AxiosResponseError>>(async (topicId) =>
  // TODO: в дальнейшем надо либо убрать тело из запроса, либо понять как его менять и нужно ли его менять
  axios.post(`/v1/internal/source/kafka/topics/${topicId}/fetch`, {
    maxRowsInResult: 10,
    maxRowsToScan: 10,
    offset: 'LATEST',
    filter: {
      type: 'true',
    },
  }),
);

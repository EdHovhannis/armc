import { AxiosError, AxiosResponse } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

const MOCK = {
  kafkaQuery: {
    filter: {
      type: 'contain',
      pattern: '',
    },
    maxRowsInResult: 500,
    maxRowsToScan: 500,
    topicId: [123],
    offset: 'LATEST',
  },
  shouldBeFlattened: false,
  returnOnlyFlattened: false,
  excludedFromFlatteningFields: ['name'],
  topicIds: [123],
};

export const createSchemaFx = createEffect(async () => axios.post('/v1/internal/source/kafka/topics/create_schema', MOCK));

export interface FetchArchiveIdParams {
  project: string;
  name: string;
}

export const fetchArchiveIdFx = createEffect<FetchArchiveIdParams, AxiosResponse<unknown>, AxiosError<AxiosResponseError>>(
  async ({ project, name }) => axios.get(`/v1/index/archive/project/${encodeURIComponent(project)}/name/${encodeURIComponent(name)}/id`),
);

sample({
  clock: fetchArchiveIdFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось проверить имя индекса.', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

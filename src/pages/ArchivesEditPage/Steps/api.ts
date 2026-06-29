import { AxiosError, AxiosResponse } from 'axios';
import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';
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
  async ({ project, name }) => axios.get(`/v1/internal/index/archive/project/${encodeURIComponent(project)}/name/${encodeURIComponent(name)}/id`),
);

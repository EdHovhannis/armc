import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';

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

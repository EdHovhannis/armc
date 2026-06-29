import { INIT_PROJECT_LIMITS } from '@src/Entities/Limits/constants';

import { ArchiveEditFormValues } from './types';

export const ARCHIVE_EDIT_DEFAULT_VALUES: ArchiveEditFormValues = {
  name: '',
  projectName: '',
  projectShortName: '',
  source: {
    kafka: [{ project: null, name: null }],
    format: { type: 'JSON', schemaName: null },
  },
  processing: {
    copyField: [],
  },
  schema: { fields: [] },
  quota: {
    maxDataRateBytesPerSec: 0,
    maxSizeBytes: 0,
  },
  flatten: false,
  exclude: [],
  incorrectInputItem: {
    incorrectInput: false,
    message: '',
  },
  availableQuota: { ...INIT_PROJECT_LIMITS },
  topicId: -1,
  dateFormats: [],
  samples: [],
  transformArrayDates: [],
  selectedSourceIds: [],
  defaultLateMessageRejectionPeriod: 'P1D',
  defaultEarlyMessageRejectionPeriod: 'P1D',
  maxCount: 5,
  deletedSchemaData: [],
  autoSchema: { allFields: [] },
};

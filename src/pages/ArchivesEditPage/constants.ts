import { INIT_PROJECT_LIMITS } from '@src/Entities/Limits/constants';
import { SCHEMA_CONDITION_FIELDS, SCHEMA_DLQ_FIELDS } from '@src/Shared/constants/options';

import { ArchiveEditFormValues } from './types';

export const ARCHIVE_EDIT_DEFAULT_VALUES: ArchiveEditFormValues = {
  name: '',
  project: '',
  projectName: '',
  projectShortName: '',
  source: {
    kafka: [{ project: null, name: null }],
    format: { type: 'JSON', schemaName: null },
  },
  processing: {
    copyField: [],
    messageFilter: {
      condition: { type: SCHEMA_CONDITION_FIELDS[0].value, conditions: [] },
      dlqField: SCHEMA_DLQ_FIELDS[0].value,
    },
    copyAuditParams: {
      copyAuditParamsSpecs: [],
    },
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

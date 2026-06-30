import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';

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
  quotaUnits: {
    speed: SPEED_LIMITS_UNIT_OPTIONS[0].value,
    size: SIZE_LIMITS_UNIT_OPTIONS[0].value,
    date: DATE_LIMITS_UNIT_OPTIONS[5].value,
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
  primaryTimeField: {
    type: 'AUTOGENERATE',
    field: '',
    lateMessageRejectionPeriod: 'P1D',
    earlyMessageRejectionPeriod: 'P1D',
  },
  deadLetterQueue: null,
  labelsText: '',
};

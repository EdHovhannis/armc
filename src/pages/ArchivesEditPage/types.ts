import { ProjectLimitItem } from '@src/Entities/Limits/types';

export type ArchiveEditKafkaSource = {
  project: string | null;
  name: string | null;
};

export type ArchiveEditFormValues = {
  name: string;
  projectName: string;
  projectShortName: string;
  source: {
    kafka: ArchiveEditKafkaSource[];
    format: {
      type: string;
      schemaName: string | null;
    };
  };
  processing: {
    copyField: Array<{ from: string; to: string[] }>;
  };
  schema: {
    fields: Array<{ name: string; type: string; subType?: string; format?: string }>;
  };
  quota: {
    maxDataRateBytesPerSec: number;
    maxSizeBytes: number;
    maxStorageTimeSec?: number;
  };
  flatten: boolean;
  exclude: string[];
  incorrectInputItem: {
    incorrectInput: boolean;
    message: string;
  };
  availableQuota: ProjectLimitItem;
  topicId: number;
  dateFormats: string[];
  samples: unknown[];
  transformArrayDates: unknown[];
  selectedSourceIds: unknown[];
  defaultLateMessageRejectionPeriod: string;
  defaultEarlyMessageRejectionPeriod: string;
  maxCount: number;
  deletedSchemaData: unknown[];
  autoSchema: {
    allFields: unknown[];
  };
};

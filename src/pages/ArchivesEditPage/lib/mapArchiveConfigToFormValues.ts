import { bytesToSizeUnit, bytesToSpeedUnit, secondsToDateUnit } from '@src/Shared/lib/format/quotaUnits';

import { ArchiveConfigPayload, PrimaryTimeFieldType } from '@src/Entities/Archives/types';

import { ARCHIVE_EDIT_DEFAULT_VALUES } from '../constants';
import { ArchiveEditFormValues } from '../types';

type ProcessingPayload = ArchiveConfigPayload['processing'] & {
  copyField?: Array<{ from: string; to: string[] }>;
  flatten?: { exclude?: string[] };
};

type DeadLetterQueuePayload = {
  target?: {
    kafka?: {
      name?: string;
    };
  };
};

const toPrimaryTimeFieldType = (type: string | undefined): PrimaryTimeFieldType => (type === 'CUSTOM' ? 'CUSTOM' : 'AUTOGENERATE');

const getDeadLetterQueueValue = (deadLetterQueue: unknown): string | null => {
  if (!deadLetterQueue || typeof deadLetterQueue !== 'object') return null;

  const queue = deadLetterQueue as DeadLetterQueuePayload;
  return queue.target?.kafka?.name ?? null;
};

export const mapArchiveConfigToFormValues = (config: ArchiveConfigPayload, projectShortName: string): ArchiveEditFormValues => {
  const processing = config.processing as ProcessingPayload;
  const speed = bytesToSpeedUnit(config.quota.maxDataRateBytesPerSec);
  const size = bytesToSizeUnit(config.quota.maxSizeBytes);
  const date = secondsToDateUnit(config.quota.maxStorageTimeSec);

  return {
    ...ARCHIVE_EDIT_DEFAULT_VALUES,
    name: config.name,
    projectName: projectShortName,
    projectShortName,
    source: {
      kafka: config.source.kafka.map((source) => ({ project: source.project, name: source.name })),
      format: {
        type: config.source.format.type,
        schemaName: config.source.format.schemaName,
      },
    },
    processing: {
      copyField: processing.copyField ?? [],
    },
    schema: {
      fields: config.schema.fields.map((field) => ({
        name: field.name,
        type: field.type,
        subType: field.subType ?? undefined,
        format: field.format,
      })),
    },
    quota: {
      maxDataRateBytesPerSec: speed.value,
      maxSizeBytes: size.value,
      maxStorageTimeSec: date.value,
    },
    quotaUnits: {
      speed: speed.unit,
      size: size.unit,
      date: date.unit,
    },
    flatten: Boolean(processing.flatten),
    exclude: processing.flatten?.exclude ?? [],
    primaryTimeField: {
      type: toPrimaryTimeFieldType(config.primaryTimeField.type),
      field: config.primaryTimeField.field ?? '',
      lateMessageRejectionPeriod: config.primaryTimeField.lateMessageRejectionPeriod ?? 'P1D',
      earlyMessageRejectionPeriod: config.primaryTimeField.earlyMessageRejectionPeriod ?? 'P1D',
    },
    deadLetterQueue: getDeadLetterQueueValue(config.deadLetterQueue),
    labelsText: config.labels?.join(', ') ?? '',
  };
};

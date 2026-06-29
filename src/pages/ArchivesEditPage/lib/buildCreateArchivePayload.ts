import { dateUnitToSeconds, sizeUnitToBytes, speedUnitToBytesPerSec } from '@src/Shared/lib/format/quotaUnits';

import { CreateArchiveConfigPayload } from '@src/Entities/Archives/types';

import { ArchiveEditFormValues } from '../types';

const isFilledKafkaSource = (source: { project: string | null; name: string | null }) => Boolean(source.project?.trim() && source.name?.trim());

type ProcessingFormValue = ArchiveEditFormValues['processing'] & {
  messageFilter?: {
    condition?: {
      type?: string;
      conditions?: Array<{ type: string; field: string; value: string; inverted: boolean }>;
    };
    dlqField?: boolean;
  };
  copyAuditParams?: {
    copyAuditParamsSpecs?: unknown[];
  };
};

const buildProcessingPayload = (values: ArchiveEditFormValues): Record<string, unknown> => {
  const processing: Record<string, unknown> = {
    copyField: values.processing.copyField ?? [],
  };

  if (values.flatten) {
    processing.flatten = { exclude: values.exclude };
  }

  const extra = values.processing as ProcessingFormValue;
  const messageFilterConditions = extra.messageFilter?.condition?.conditions ?? [];
  const messageFilterType = extra.messageFilter?.condition?.type;

  if (messageFilterType && messageFilterConditions.length > 0) {
    processing.messageFilter = {
      condition: {
        type: messageFilterType,
        conditions: messageFilterConditions,
      },
      dlqField: extra.messageFilter?.dlqField ?? false,
    };
  }

  const auditSpecs = extra.copyAuditParams?.copyAuditParamsSpecs ?? [];
  if (auditSpecs.length > 0) {
    processing.copyAuditParams = { copyAuditParamsSpecs: auditSpecs };
  }

  return processing;
};

export const buildCreateArchivePayload = (values: ArchiveEditFormValues): CreateArchiveConfigPayload => {
  const processing = buildProcessingPayload(values);

  const labels = values.labelsText
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);

  return {
    name: values.name.trim(),
    processing,
    schema: {
      fields: values.schema.fields.map((field) => ({
        name: field.name,
        type: field.type,
        subType: field.subType ?? null,
        ...(field.format ? { format: field.format } : {}),
      })),
    },
    source: {
      kafka: values.source.kafka.filter(isFilledKafkaSource).map((source) => ({
        project: source.project!.trim(),
        name: source.name!.trim(),
      })),
      format: {
        type: values.source.format.type,
        schemaName: values.source.format.schemaName,
      },
    },
    quota: {
      maxDataRateBytesPerSec: speedUnitToBytesPerSec(values.quota.maxDataRateBytesPerSec, values.quotaUnits.speed),
      maxSizeBytes: sizeUnitToBytes(values.quota.maxSizeBytes, values.quotaUnits.size),
      maxStorageTimeSec: dateUnitToSeconds(values.quota.maxStorageTimeSec ?? 0, values.quotaUnits.date),
    },
    primaryTimeField: {
      type: values.primaryTimeField.type,
      field: values.primaryTimeField.field,
      lateMessageRejectionPeriod: values.primaryTimeField.lateMessageRejectionPeriod,
      earlyMessageRejectionPeriod: values.primaryTimeField.earlyMessageRejectionPeriod,
    },
    deadLetterQueue: values.deadLetterQueue,
    ...(labels.length > 0 ? { labels } : {}),
  };
};

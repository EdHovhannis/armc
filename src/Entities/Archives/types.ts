export type IndexingStatus = 'RUNNING' | 'STOPPED' | 'FAILED' | 'UNDEFINED' | 'WITHOUT_RESPONSE';

export type ZoneId = 'PRIMARY' | 'SECONDARY' | 'PRIMARY-SDP' | 'SECONDARY-SDP';

export type Action = 'VIEW' | 'EDIT' | 'DATA_EXPORT';

export interface InstanceMetadata {
  maxAvailableOverdraft: number;
}

export interface StorageStatus {
  currentSizeBytes: number;
  maxSizeBytes: number;
}

export interface IndexingStatusInfo {
  status: IndexingStatus;
}

export interface InstanceStatus {
  storage: StorageStatus;
  indexing: IndexingStatusInfo;
}

export interface ArchiveInstance {
  id: number;
  zoneId: ZoneId;
  version: string;
  processingRate: number;
  maxSizeBytes: number;
  maxDataRateBytesPerSec: number;
  maxStorageTimeSec: number | null;
  overdraftPercent: number;
  metadata: InstanceMetadata;
  status: InstanceStatus;
}

export type ArchiveInstanceView = ArchiveInstance & {
  configName: string;
  projectName: string;
  configVersion: string;
  instanceStatus: IndexingStatus;
  currentSizeBytes: number;
  maxSizeBytes: number;
  maxIndexSize: number;
  maxWriteSpeed: number;
  maxRetention: number | null;
  hasVersionMismatch?: boolean;
  instanceVersion?: string;
};

export interface ArchiveConfigView {
  id: number | string;
  configuration: string;
  projectKey: string;
  instancesCount: number;
  maxWriteSpeed: number;
  maxIndexSize: number;
  maxRetention: number | null;
  labels?: string[];
  instances?: ArchiveInstance[];
  indexActions?: Action[];
  flowActions?: Action[];
}

export interface ArchiveConfiguration {
  id: number | string;
  name: string;
  project: string;
  version: string;
  maxSizeBytes: number;
  maxDataRateBytesPerSec: number;
  maxStorageTimeSec: number | null;
  labels?: string[];
  instances?: ArchiveInstance[];
  indexActions: Action[];
  flowActions: Action[];
}

export interface FilterItems {
  names: string[];
  projects: string[];
  labels: string[];
  zones: string[];
}

export type PrimaryTimeFieldType = 'CUSTOM' | 'AUTOGENERATE';

export type CreateArchiveConfigPayload = {
  name: string;
  processing: Record<string, unknown>;
  schema: {
    fields: Array<{
      name: string;
      type: string;
      subType: string | null;
      format?: string;
    }>;
  };
  source: {
    kafka: Array<{ project: string; name: string }>;
    format: { type: string; schemaName: string | null };
  };
  quota: {
    maxStorageTimeSec: number;
    maxSizeBytes: number;
    maxDataRateBytesPerSec: number;
  };
  primaryTimeField: {
    type: PrimaryTimeFieldType;
    field: string;
    lateMessageRejectionPeriod?: string;
    earlyMessageRejectionPeriod?: string;
  };
  deadLetterQueue?: string | null;
  labels?: string[];
};

export interface CreateArchiveParams {
  project: string;
  body: CreateArchiveConfigPayload;
}

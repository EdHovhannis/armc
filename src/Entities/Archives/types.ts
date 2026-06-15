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
  configVersion: string;
  instanceStatus: string;
  currentSizeBytes: number;
  maxSizeBytes: number;
};

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

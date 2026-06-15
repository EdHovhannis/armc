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
  name: string;
  configVersion: string;
};

export interface ArchiveConfiguration {
  id: number;
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

// export interface ArchiveConfigurationRow {
//   id: string;
//   name: string;
//   project: string;
//   version: string;
//   maxSizeBytes: string;
//   maxDataRateBytesPerSec: string;
//   maxStorageTimeSec: string;
//   instancesCount: number;
//   labels: string[];
//   indexActions: Action[];
//   flowActions: Action[];
// }

// export interface ArchiveIndexRow {
//   id: string;
//   configuration: string;
//   zone: ZoneId;
//   status: IndexingStatus;
//   memoryUsed: string;
//   memoryAllocated: string;
//   maxWriteSpeed: string;
//   maxIndexSize: string;
//   maxRetention: string;
//   hasVersionMismatch?: boolean;
//   configVersion?: string;
//   instanceVersion?: string;
// }

import { ArchiveInstanceView } from '@src/Entities/Archive/types';

import { formatBytes, formatRetention, formatSpeed } from '../formatters';
import { ArchiveIndexRow } from '../types';

export const getArchiveInstances = (data: ArchiveInstanceView[]): ArchiveIndexRow[] =>
  data.map((item) => ({
    id: String(item.id),
    configuration: item.name,
    zone: item.zoneId,
    status: item.status.indexing.status,
    memoryUsed: formatBytes(item.status.storage.currentSizeBytes),
    memoryAllocated: formatBytes(item.status.storage.maxSizeBytes),
    maxWriteSpeed: formatSpeed(item.maxDataRateBytesPerSec),
    maxIndexSize: formatBytes(item.maxSizeBytes),
    maxRetention: formatRetention(item.maxStorageTimeSec),
    hasVersionMismatch: item.configVersion !== item.version,
    configVersion: item.configVersion,
    instanceVersion: item.version,
  }));

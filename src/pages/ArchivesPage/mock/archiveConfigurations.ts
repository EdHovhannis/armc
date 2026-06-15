import { ArchiveConfiguration } from '@src/Entities/Archive/types';

import { formatBytes, formatRetention, formatSpeed } from '../formatters';
import { ArchiveConfigurationRow } from '../types';

export const getArchiveConfigurations = (data: ArchiveConfiguration[]): ArchiveConfigurationRow[] =>
  data.map((item) => ({
    id: String(item.id),
    configuration: item.name,
    projectKey: item.project,
    instancesCount: item.instances?.length ?? 0,
    maxWriteSpeed: formatSpeed(item.maxDataRateBytesPerSec),
    maxIndexSize: formatBytes(item.maxSizeBytes),
    maxRetention: formatRetention(item.maxStorageTimeSec),
    labels: item.labels ?? [],
  }));

import { combine, createStore } from 'effector';

import { fetchArchivesFx } from './api';
import { ArchiveConfiguration, ArchiveInstanceView } from './types';

export const $archives = createStore<ArchiveConfiguration[]>([]);
$archives.on(fetchArchivesFx.doneData, (_, payload) => payload.data);

export const $archiveInstances = combine($archives, (archives): ArchiveInstanceView[] =>
  archives
    .filter((arch) => arch.instances?.length)
    .flatMap((item) =>
      (item.instances ?? []).map((instance) => ({
        ...instance,
        configName: item.name,
        configVersion: item.version,
        instanceStatus: instance.status.indexing.status,
        currentSizeBytes: instance.status.storage.currentSizeBytes,
        maxSizeBytes: instance.status.storage.maxSizeBytes,
        maxIndexSize: item.maxSizeBytes,
        maxWriteSpeed: item.maxDataRateBytesPerSec,
        maxRetention: item.maxStorageTimeSec,
      })),
    ),
);

export const $archiveConfigs = combine($archives, (archives) =>
  archives.map((item) => {
    return {
      id: item.id,
      configuration: item.name,
      projectKey: item.project,
      instancesCount: item.instances?.length ?? 0,
      maxWriteSpeed: item.maxDataRateBytesPerSec,
      maxIndexSize: item.maxSizeBytes,
      maxRetention: item.maxStorageTimeSec,
      labels: item.labels,
    };
  }),
);

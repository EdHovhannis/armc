import { combine, createEvent, createStore, sample } from 'effector';

import { addLabelFx, deleteLabelFx } from '@src/Entities/Label/api';

import { FetchArchivesParams, deleteArchiveFx, fetchArchivesCountFx, fetchArchivesFiltersFx, fetchArchivesFx } from './api';
import { ArchiveConfigView, ArchiveConfiguration, ArchiveInstanceView, FilterItems } from './types';

export const $archives = createStore<ArchiveConfiguration[]>([]);
$archives.on(fetchArchivesFx.doneData, (_, payload) => payload.data);

const $lastFetchArchivesParams = createStore<FetchArchivesParams | null>(null).on(fetchArchivesFx, (_, params) => params);
const $lastFetchCountFilters = createStore<Pick<FetchArchivesParams, 'filters'>>({}).on(fetchArchivesCountFx, (_, params) => params ?? {});

const refetchLastArchives = createEvent();

sample({
  clock: refetchLastArchives,
  source: $lastFetchArchivesParams,
  filter: (params): params is FetchArchivesParams => params !== null,
  fn: (params) => params!,
  target: fetchArchivesFx,
});

export const labelsModalOpened = createEvent();
export const labelsModalClosed = createEvent();

const $labelsDirty = createStore(false)
  .on(deleteLabelFx.done, () => true)
  .reset(labelsModalOpened);

sample({ clock: deleteArchiveFx.done, target: refetchLastArchives });
sample({ clock: addLabelFx.done, target: refetchLastArchives });

sample({
  clock: labelsModalClosed,
  source: $labelsDirty,
  filter: Boolean,
  target: refetchLastArchives,
});

sample({
  clock: deleteArchiveFx.done,
  source: $lastFetchCountFilters,
  target: fetchArchivesCountFx,
});

export const $archivesTotalCount = createStore<number>(0);
$archivesTotalCount.on(fetchArchivesCountFx.doneData, (_, payload) => payload.data);

export const $optionsArchiveConfig = combine($archives, (archives) =>
  archives.map((item) => ({ value: String(item.id), label: `${item.project} / ${item.name}` })),
);

export const $archiveFilterValues = createStore<FilterItems>({
  names: [],
  projects: [],
  labels: [],
  zones: [],
});
$archiveFilterValues.on(fetchArchivesFiltersFx.doneData, (_, payload) => payload.data);

export const $archiveInstances = combine($archives, (archives): ArchiveInstanceView[] =>
  archives
    .filter((arch) => arch.instances?.length)
    .flatMap((item) =>
      (item.instances ?? []).map((instance) => ({
        ...instance,
        configName: item.name,
        projectName: item.project,
        configVersion: item.version,
        instanceVersion: instance.version,
        hasVersionMismatch: instance.version !== item.version,
        instanceStatus: instance.status.indexing.status,
        currentSizeBytes: instance.status.storage.currentSizeBytes,
        maxSizeBytes: instance.status.storage.maxSizeBytes,
        maxIndexSize: item.maxSizeBytes,
        maxWriteSpeed: item.maxDataRateBytesPerSec,
        maxRetention: item.maxStorageTimeSec,
      })),
    ),
);

export const $archiveConfigs = combine($archives, (archives): ArchiveConfigView[] =>
  archives.map((item) => {
    return {
      ...item,
      id: item.id,
      configuration: item.name,
      projectKey: item.project,
      instancesCount: item.instances?.length ?? 0,
      maxWriteSpeed: item.maxDataRateBytesPerSec,
      maxIndexSize: item.maxSizeBytes,
      maxRetention: item.maxStorageTimeSec,
      labels: item.labels,
      instances: item.instances,
    };
  }),
);

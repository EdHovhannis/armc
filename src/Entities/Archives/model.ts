import { combine, createStore, sample } from 'effector';

import {
  changeInstanceOverdraftFx,
  changeInstancesOverdraftFx,
  deleteInstanceFx,
  fetchInstanceStatusFx,
  resetInstanceOverdraftFx,
  resetInstancesOverdraftFx,
  resetZoneOverdraftFx,
  resumeInstancesFx,
  suspendInstancesFx,
} from '@src/Entities/Instance/api';

import { FetchArchivesParams, deleteArchiveFx, fetchArchiveOptionsFx, fetchArchivesCountFx, fetchArchivesFiltersFx, fetchArchivesFx } from './api';
import { ArchiveConfigView, ArchiveConfiguration, ArchiveInstanceView, FilterItems } from './types';

export const $archives = createStore<ArchiveConfiguration[]>([]);
$archives
  .on(fetchArchivesFx.doneData, (_, payload) => payload.data)
  .on(fetchInstanceStatusFx.doneData, (archives, { instanceId, status }) =>
    archives.map((arch) => ({
      ...arch,
      instances: arch.instances?.map((instance) =>
        instance.id === instanceId ? { ...instance, status: { ...instance.status, indexing: { status } } } : instance,
      ),
    })),
  );

const $lastFetchArchivesParams = createStore<FetchArchivesParams | null>(null).on(fetchArchivesFx, (_, params) => params);
const $lastFetchCountFilters = createStore<Pick<FetchArchivesParams, 'filters'>>({}).on(fetchArchivesCountFx, (_, params) => params ?? {});

sample({
  clock: deleteArchiveFx.done,
  source: $lastFetchArchivesParams,
  filter: (params): params is FetchArchivesParams => params !== null,
  target: fetchArchivesFx,
});

sample({
  clock: deleteArchiveFx.done,
  source: $lastFetchCountFilters,
  target: fetchArchivesCountFx,
});

sample({
  clock: deleteInstanceFx.done,
  source: $lastFetchArchivesParams,
  filter: (params): params is FetchArchivesParams => params !== null,
  target: fetchArchivesFx,
});

sample({
  clock: [
    changeInstanceOverdraftFx.done,
    resetInstanceOverdraftFx.done,
    changeInstancesOverdraftFx.done,
    resetInstancesOverdraftFx.done,
    resetZoneOverdraftFx.done,
  ],
  source: $lastFetchArchivesParams,
  filter: (params): params is FetchArchivesParams => params !== null,
  target: fetchArchivesFx,
});

sample({
  clock: [resumeInstancesFx.done, suspendInstancesFx.done],
  source: $lastFetchArchivesParams,
  filter: (params): params is FetchArchivesParams => params !== null,
  target: fetchArchivesFx,
});

export const $archivesTotalCount = createStore<number>(0);
$archivesTotalCount.on(fetchArchivesCountFx.doneData, (_, payload) => payload.data);

export const $archiveOptionsSource = createStore<ArchiveConfiguration[]>([]);
$archiveOptionsSource.on(fetchArchiveOptionsFx.doneData, (_, payload) => payload.data);

export const $optionsArchiveName = combine($archiveOptionsSource, (archives) => archives.map((item) => ({ value: item.name, label: item.name })));

export const $optionsArchiveConfig = combine($archiveOptionsSource, (archives) =>
  archives.map((item) => ({ value: String(item.id), label: `${item.project} / ${item.name}` })),
);

export const $archiveFilterValues = createStore<FilterItems>({
  names: [],
  projects: [],
  labels: [],
  zones: [],
});
$archiveFilterValues.on(fetchArchivesFiltersFx.doneData, (_, payload) => payload.data);

export const $optionsArchiveLabel = combine($archiveOptionsSource, (archives) =>
  Array.from(new Set(archives.flatMap((item) => item.labels ?? []))).map((label) => ({ value: label, label })),
);

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

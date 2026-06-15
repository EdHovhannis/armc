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
        name: item.name,
        configVersion: item.version,
      })),
    ),
);

export const $archiveConfigs = combine($archives, (archives) => archives);

import { createEvent, createStore } from 'effector';

import { ArchiveConfigPayload } from '@src/Entities/Archives/types';

export const $archiveEditName = createStore<string>('');
export const $archiveEditProjectShortName = createStore<string>('');
export const $archiveEditImportedConfig = createStore<ArchiveConfigPayload | null>(null);

export const onChangeArchiveEditName = createEvent<string>();
export const onChangeArchiveEditProjectShortName = createEvent<string>();
export const onImportArchiveEditConfig = createEvent<ArchiveConfigPayload>();
export const onResetArchiveEditImportedConfig = createEvent();

$archiveEditName.on(onChangeArchiveEditName, (_, value) => value);
$archiveEditProjectShortName.on(onChangeArchiveEditProjectShortName, (_, value) => value);
$archiveEditImportedConfig.on(onImportArchiveEditConfig, (_, value) => value).reset(onResetArchiveEditImportedConfig);

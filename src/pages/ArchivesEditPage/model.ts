import { createEvent, createStore } from 'effector';

export const $archiveEditName = createStore<string>('');
export const $archiveEditProjectShortName = createStore<string>('');

export const onChangeArchiveEditName = createEvent<string>();
export const onChangeArchiveEditProjectShortName = createEvent<string>();

$archiveEditName.on(onChangeArchiveEditName, (_, value) => value);
$archiveEditProjectShortName.on(onChangeArchiveEditProjectShortName, (_, value) => value);

import { createEvent, createStore } from 'effector';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';

export const $overDraftModalRows = createStore<ArchiveInstanceView[] | null>(null);

export const onOpenOverDraftModal = createEvent<ArchiveInstanceView[]>();
export const onCloseOverDraftModal = createEvent();

$overDraftModalRows.on(onOpenOverDraftModal, (_, rows) => rows).reset(onCloseOverDraftModal);

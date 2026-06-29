import { createStore } from 'effector';

import { fetchOverdraftConfigFx } from './api';
import { OverdraftConfig } from './types';

export const $overdraftConfig = createStore<OverdraftConfig | null>(null).on(fetchOverdraftConfigFx.doneData, (_, response) => response.data);

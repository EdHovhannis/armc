import { createStore } from 'effector';

import { fetchDateFormatsFx } from './api';

export const $inputFormats = createStore<Array<string>>(['JSON', 'AVRO']);

export const $dateFormats = createStore<Array<string>>([]);
$dateFormats.on(fetchDateFormatsFx.doneData, (_, payload) => payload.data);

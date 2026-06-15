import { createStore } from 'effector';

export const $inputFormats = createStore<Array<string>>(['JSON', 'AVRO']);

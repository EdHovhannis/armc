import { createStore, createEvent } from 'effector';

export const $stepperIndex = createStore<number>(5);
export const onChangeStepperIndex = createEvent<number>();
$stepperIndex.on(onChangeStepperIndex, (_, payload) => payload);

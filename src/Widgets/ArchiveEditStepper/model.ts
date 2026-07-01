import { createStore, createEvent } from 'effector';

export const $stepperIndex = createStore<number>(0);
export const onChangeStepperIndex = createEvent<number>();
export const onResetStepperIndex = createEvent();

$stepperIndex.on(onChangeStepperIndex, (_, payload) => payload).reset(onResetStepperIndex);

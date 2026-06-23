import { createAction, createStandardAction } from 'typesafe-actions';

const notificationResolver = (resolve) => {
  return (text: any) => resolve(text);
};

export const error = createAction('@notification/ERROR', notificationResolver);
export const success = createAction('@notification/SUCCESS', notificationResolver);
export const warning = createAction('@notification/WARNING', notificationResolver);
export const info = createAction('@notification/INFO', notificationResolver);
export const close = createStandardAction('@notification/CLOSE')<void>();

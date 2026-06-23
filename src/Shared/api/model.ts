import { showErrorNotification } from '@pvm-ui/kit';
import { getInfoNotificationError } from '@pvm-ui/pvm-core';
import { createEffect } from 'effector';

type HandleErrorParams = {
  status?: number;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
};

export const handleErrorFx = createEffect(({ status, title: currentTitle, message = '', data }: HandleErrorParams) => {
  const { title, description } = getInfoNotificationError({
    title: currentTitle,
    description: message,
    status: status,
  });
  const detail = data ? JSON.stringify(data) : '';
  showErrorNotification({ title, detail, description });
});

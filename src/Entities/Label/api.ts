import { AxiosError } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

type SaveLabelsParams = {
  project: string;
  taskName: string;
  labels: string[];
};

// PUT .../labels заменяет весь набор меток конфигурации целиком.
// путь именно /archive/index/project/... (двойной index после префикса), не /archive/task/...
export const saveLabelsFx = createEffect<SaveLabelsParams, string[], AxiosError<AxiosResponseError>>(async ({ project, taskName, labels }) => {
  await axios.put(`/v1/internal/index/archive/index/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/labels`, labels);
  return labels;
});

sample({
  clock: saveLabelsFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось сохранить метки', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

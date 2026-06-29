import { AxiosError } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

type LabelParams = {
  project: string;
  taskName: string;
  label: string;
};

<<<<<<< HEAD
// PUT .../labels заменяет весь набор меток конфигурации целиком.
// путь именно /archive/index/project/... (двойной index после префикса), не /archive/task/...
export const saveLabelsFx = createEffect<SaveLabelsParams, string[], AxiosError<AxiosResponseError>>(async ({ project, taskName, labels }) => {
  await axios.put(`/v1/internal/index/archive/index/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/labels`, labels);
  return labels;
=======
export const addLabelFx = createEffect<LabelParams, LabelParams, AxiosError<AxiosResponseError>>(async ({ project, taskName, label }) => {
  await axios.post(
    `/v1/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/label/${encodeURIComponent(label)}`,
  );
  return { project, taskName, label };
});

export const deleteLabelFx = createEffect<LabelParams, LabelParams, AxiosError<AxiosResponseError>>(async ({ project, taskName, label }) => {
  await axios.delete(
    `/v1/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/label/${encodeURIComponent(label)}`,
  );
  return { project, taskName, label };
});

sample({
  clock: addLabelFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось добавить метку.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

sample({
  clock: deleteLabelFx.failData,
  fn: ({ response, status }) => ({
    title: 'Не удалось удалить метку.',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
>>>>>>> 117d8ff6dfc12b87e25bb941f934836f8cc78cc2
});

sample({
  clock: saveLabelsFx.failData,
  fn: ({ response, status }) => ({ title: 'Не удалось сохранить метки', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

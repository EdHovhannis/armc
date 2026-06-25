import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';

type AddLabelParams = {
  project: string;
  taskName: string;
  label: string;
};

export const addLabelFx = createEffect<AddLabelParams, AddLabelParams>(async ({ project, taskName, label }) => {
  await axios
    .post(
      `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/label/${encodeURIComponent(label)}`,
    )
    .catch(() => undefined);
  return { project, taskName, label };
});

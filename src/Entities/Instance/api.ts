import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';

// TODO(instance-api): добавление экземпляра есть в контракте, но dev-бэк недоступен
// (нет прокси /armc_api в host), поэтому при ошибке тихо проглатываем, чтобы UI работал.
// При интеграции с бэком:
//   1) убрать catch-fallback;
//   2) повесить sample({ clock: addInstanceFx.failData, target: handleErrorFx });
//   3) уточнить тело запроса/ответа (сейчас POST без тела).

const INSTANCE_URL = '/v1/internal/index/archive/task/project';

type AddInstanceParams = {
  project: string;
  taskName: string;
  zoneId: string;
};

// POST .../zone/{zoneId}/instance создаёт экземпляр конфигурации в выбранной зоне
export const addInstanceFx = createEffect<AddInstanceParams, AddInstanceParams>(async ({ project, taskName, zoneId }) => {
  // dev-бэк недоступен - глушим ошибку, чтобы .done сработал и UI не падал. снять при интеграции (см. TODO выше)
  await axios
    .post(`${INSTANCE_URL}/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance`)
    .catch(() => undefined);
  return { project, taskName, zoneId };
});

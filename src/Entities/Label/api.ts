import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';

// TODO(labels-api): метки есть в контракте (archive-service-label-controller),
// но dev-бэк недоступен (нет прокси /armc_api в host), поэтому при ошибке тихо
// возвращаем то, что сохраняли, чтобы UI оставался рабочим на моках.
// При интеграции с бэком:
//   1) убрать catch-fallback;
//   2) повесить sample({ clock: saveLabelsFx.failData, target: handleErrorFx }).

// в спеке путь /archive/index/project/{projectShortName}/name/{indexName}/labels,
// фронтовый префикс /api/v1/internal/index маппится в axios-путь /v1/internal/index
const LABELS_URL = '/v1/internal/index/archive/index/project';

type SaveLabelsParams = {
  project: string;
  taskName: string;
  labels: string[];
};

// PUT .../labels заменяет весь набор меток конфигурации целиком
export const saveLabelsFx = createEffect<SaveLabelsParams, string[]>(async ({ project, taskName, labels }) => {
  // dev-бэк недоступен - глушим ошибку, чтобы .done сработал и набор меток применился в UI. снять при интеграции (см. TODO выше)
  await axios.put(`${LABELS_URL}/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/labels`, labels).catch(() => undefined);
  return labels;
});

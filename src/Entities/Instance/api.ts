import { AxiosError } from 'axios';
import { createEffect, sample } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

import { IndexingStatus, InstanceStatus } from '@src/Entities/Archives/types';

type AxiosErr = AxiosError<AxiosResponseError>;

type AddInstanceParams = {
  project: string;
  taskName: string;
  zoneId: string;
};

export const addInstanceFx = createEffect<AddInstanceParams, AddInstanceParams, AxiosErr>(async ({ project, taskName, zoneId }) => {
  await axios.post(
    `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance`,
  );
  return { project, taskName, zoneId };
});

export const deleteInstanceFx = createEffect<AddInstanceParams, AddInstanceParams, AxiosErr>(async ({ project, taskName, zoneId }) => {
  await axios.delete(
    `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance`,
  );
  return { project, taskName, zoneId };
});

type InstanceActionParams = {
  project: string;
  taskName: string;
  zoneId: string;
  instanceId: number;
};

export const resumeInstanceFx = createEffect<InstanceActionParams, InstanceActionParams, AxiosErr>(async (params) => {
  const { project, taskName, zoneId } = params;
  await axios.post(
    `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/resume`,
  );
  return params;
});

export const suspendInstanceFx = createEffect<InstanceActionParams, InstanceActionParams, AxiosErr>(async (params) => {
  const { project, taskName, zoneId } = params;
  await axios.post(
    `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/suspend`,
  );
  return params;
});

type OverdraftChangeParams = InstanceActionParams & {
  overdraftPercent: number;
};

export const changeInstanceOverdraftFx = createEffect<OverdraftChangeParams, InstanceActionParams, AxiosErr>(async (params) => {
  const { project, taskName, zoneId, instanceId, overdraftPercent } = params;
  await axios.post(
    `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/overdraft`,
    { overdraftPercent },
  );
  return { project, taskName, zoneId, instanceId };
});

export const resetInstanceOverdraftFx = createEffect<InstanceActionParams, InstanceActionParams, AxiosErr>(async (params) => {
  const { project, taskName, zoneId } = params;
  await axios.post(
    `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/overdraft/reset`,
  );
  return params;
});

type ChangeInstancesOverdraftParams = {
  instances: InstanceActionParams[];
  overdraftPercent: number;
};

// массовая установка овердрафта на несколько экземпляров - запрос на каждый, если хоть один упал - пробрасываем в failData
export const changeInstancesOverdraftFx = createEffect<ChangeInstancesOverdraftParams, void, AxiosErr>(async ({ instances, overdraftPercent }) => {
  const results = await Promise.allSettled(
    instances.map(({ project, taskName, zoneId }) =>
      axios.post(
        `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/overdraft`,
        { overdraftPercent },
      ),
    ),
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
});

// массовый сброс овердрафта у выбранных экземпляров - запрос на каждый
export const resetInstancesOverdraftFx = createEffect<InstanceActionParams[], void, AxiosErr>(async (instances) => {
  const results = await Promise.allSettled(
    instances.map(({ project, taskName, zoneId }) =>
      axios.post(
        `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/overdraft/reset`,
      ),
    ),
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
});

// сброс овердрафта у всех экземпляров зоны одним запросом
export const resetZoneOverdraftFx = createEffect<{ zoneId: string }, void, AxiosErr>(async ({ zoneId }) => {
  await axios.post(`/v1/internal/index/archive/task/zone/${encodeURIComponent(zoneId)}/instance/overdraft/reset/all`);
});

sample({
  clock: [addInstanceFx.failData, deleteInstanceFx.failData, resumeInstanceFx.failData, suspendInstanceFx.failData],
  fn: ({ response, status }) => ({
    title: 'Не удалось выполнить действие над экземпляром',
    status,
    message: response?.data.message,
    data: response?.data,
  }),
  target: handleErrorFx,
});

sample({
  clock: [
    changeInstanceOverdraftFx.failData,
    resetInstanceOverdraftFx.failData,
    changeInstancesOverdraftFx.failData,
    resetInstancesOverdraftFx.failData,
    resetZoneOverdraftFx.failData,
  ],
  fn: ({ response, status }) => ({ title: 'Не удалось изменить овердрафт скорости', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});

export type InstanceActionResult = InstanceActionParams & { reachedTarget: boolean };

const checkInstanceReached = async (instance: InstanceActionParams, expected: IndexingStatus): Promise<boolean> => {
  const { project, taskName, zoneId } = instance;
  try {
    const { data } = await axios.get<InstanceStatus>(
      `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/status`,
    );
    return data.indexing.status === expected;
  } catch {
    return true;
  }
};

// массовый старт выбранных экземпляров - команда + сверка статуса на каждый
export const resumeInstancesFx = createEffect<InstanceActionParams[], InstanceActionResult[]>(async (instances) =>
  Promise.all(
    instances.map(async (instance) => {
      const { project, taskName, zoneId } = instance;
      await axios
        .post(
          `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/resume`,
        )
        .catch(() => undefined);
      return { ...instance, reachedTarget: await checkInstanceReached(instance, 'RUNNING') };
    }),
  ),
);

export const suspendInstancesFx = createEffect<InstanceActionParams[], InstanceActionResult[]>(async (instances) =>
  Promise.all(
    instances.map(async (instance) => {
      const { project, taskName, zoneId } = instance;
      await axios
        .post(
          `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/suspend`,
        )
        .catch(() => undefined);
      return { ...instance, reachedTarget: await checkInstanceReached(instance, 'STOPPED') };
    }),
  ),
);

type FetchInstanceStatusParams = InstanceActionParams & {
  fallbackStatus: IndexingStatus;
  notifyAction?: 'resume' | 'suspend';
};

type InstanceStatusResult = {
  instanceId: number;
  status: IndexingStatus;
};

export const fetchInstanceStatusFx = createEffect<FetchInstanceStatusParams, InstanceStatusResult>(
  async ({ project, taskName, zoneId, instanceId, fallbackStatus }) => {
    try {
      const { data } = await axios.get<InstanceStatus>(
        `/v1/internal/index/archive/task/project/${encodeURIComponent(project)}/name/${encodeURIComponent(taskName)}/zone/${encodeURIComponent(zoneId)}/instance/status`,
      );
      return { instanceId, status: data.indexing.status };
    } catch {
      return { instanceId, status: fallbackStatus };
    }
  },
);

sample({
  clock: resumeInstanceFx.done,
  fn: ({ result }) => ({ ...result, fallbackStatus: 'RUNNING' as const, notifyAction: 'resume' as const }),
  target: fetchInstanceStatusFx,
});

sample({
  clock: suspendInstanceFx.done,
  fn: ({ result }) => ({ ...result, fallbackStatus: 'STOPPED' as const, notifyAction: 'suspend' as const }),
  target: fetchInstanceStatusFx,
});

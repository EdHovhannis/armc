import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import {
  archiveConfigFixture,
  archiveConfigurationsFixture,
  featureFlagEnabledFixture,
  projectsFixture,
  restrictionsFixture,
  restrictionsOverviewFixture,
  topicsFixture,
} from './fixtures';

const MOCK_DELAY_MS = 300;

interface MockRoute {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  // проверка по config.url (это путь вида /v1/internal/..., baseURL сюда не входит)
  match: RegExp;
  // отдаём либо данные, либо [status, данные]
  resolve: (config: InternalAxiosRequestConfig) => unknown;
}

const getPageParams = (config: InternalAxiosRequestConfig) => {
  const params = (config.params ?? {}) as { pageSize?: number; pageNumber?: number };
  return { pageSize: Number(params.pageSize) || 20, pageNumber: Number(params.pageNumber) || 1 };
};

interface MockFilter {
  field: string;
  op: string;
  values: string[];
}

// мок учитывает только фильтры по имени (name) и строку поиска (nameLike) - этого хватает
// для проверки drill-down и поиска офлайн. остальные field на стенде фильтрует бэк
const matchesNameFilters = (name: string, filters: MockFilter[]): boolean =>
  filters.every((filter) => {
    if (filter.field === 'nameLike') {
      const term = (filter.values[0] ?? '').replace(/%/g, '').toLowerCase();
      return name.toLowerCase().includes(term);
    }
    if (filter.field !== 'name') return true;

    switch (filter.op) {
      case 'eq':
        return filter.values.includes(name);
      case 'isNot':
        return !filter.values.includes(name);
      case 'in':
        return filter.values.includes(name);
      case 'notIn':
        return !filter.values.includes(name);
      default:
        return true;
    }
  });

const getFilteredConfigurations = (config: InternalAxiosRequestConfig) => {
  const params = (config.params ?? {}) as { filters?: string };
  if (!params.filters) return archiveConfigurationsFixture;

  try {
    const filters = JSON.parse(params.filters) as MockFilter[];
    return archiveConfigurationsFixture.filter((item) => matchesNameFilters(item.name, filters));
  } catch {
    return archiveConfigurationsFixture;
  }
};

const routes: MockRoute[] = [
  {
    method: 'get',
    match: /\/archive\/list\/page-count/,
    // фронт шлёт pageSize=1, бэк отдаёт число страниц == числу (отфильтрованных) конфигураций
    resolve: (config) => getFilteredConfigurations(config).length,
  },
  {
    method: 'get',
    match: /\/archive\/list\/paginated/,
    resolve: (config) => {
      const { pageSize, pageNumber } = getPageParams(config);
      const start = (pageNumber - 1) * pageSize;
      return getFilteredConfigurations(config).slice(start, start + pageSize);
    },
  },
  {
    method: 'post',
    match: /\/archive\/task\/project\/[^/]+\/config$/,
    resolve: (config) => {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      return { ...archiveConfigFixture, ...body };
    },
  },
  {
    method: 'get',
    match: /\/archive\/task\/project\/[^/]+\/name\/[^/]+\/config$/,
    // экспорт: возвращаем конфигурацию с name из запроса, чтобы совпадал с именем файла
    resolve: (config) => {
      const named = (config.url ?? '').match(/\/name\/([^/]+)\/config/);
      const name = named?.[1] ? decodeURIComponent(named[1]) : archiveConfigFixture.name;
      return { ...archiveConfigFixture, name };
    },
  },
  {
    method: 'put',
    match: /\/archive\/task\/project\/[^/]+\/name\/[^/]+\/config$/,
    resolve: (config) => {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      return { ...archiveConfigFixture, ...body };
    },
  },
  {
    method: 'get',
    match: /\/archive\/restrictions\/overview/,
    resolve: () => restrictionsOverviewFixture,
  },
  {
    method: 'get',
    match: /\/archive\/restrictions$/,
    resolve: () => restrictionsFixture,
  },
  {
    method: 'get',
    match: /\/project\/list/,
    resolve: () => projectsFixture,
  },
  {
    method: 'get',
    match: /\/source\/kafka\/topics$/,
    resolve: () => topicsFixture,
  },
  {
    method: 'get',
    match: /\/feature-settings\/value/,
    resolve: () => featureFlagEnabledFixture,
  },
  {
    method: 'delete',
    // удаление экземпляра (в т.ч. батчем из тулбара выбора)
    match: /\/archive\/task\/project\/[^/]+\/name\/[^/]+\/zone\/[^/]+\/instance$/,
    resolve: () => ({}),
  },
  {
    method: 'delete',
    // удаление конфигурации (одиночное и батчем)
    match: /\/archive\/task\/project\/[^/]+\/name\/[^/]+\/config$/,
    resolve: () => ({}),
  },
];

const findRoute = (config: InternalAxiosRequestConfig): MockRoute | undefined => {
  const method = (config.method ?? 'get').toLowerCase();
  const url = config.url ?? '';
  return routes.find((route) => route.method === method && route.match.test(url));
};

const buildResponse = (config: InternalAxiosRequestConfig, data: unknown): Promise<AxiosResponse> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK', headers: {}, config });
    }, MOCK_DELAY_MS);
  });

// Подключает моки к axios-инстансу. Для совпавших путей подменяет config.adapter,
// возвращая фикстуру; несовпавшие запросы идут штатным адаптером (в dev - в прокси хоста).
// Включается только под флагом __ARMC_MOCK__ из axios.ts. Реальную библиотеку (axios-mock-adapter)
// поставить нельзя - на машинах вёрстки недоступен npm-registry, поэтому перехват свой.
export const setupApiMock = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config) => {
    const route = findRoute(config);
    if (route) {
      config.adapter = () => buildResponse(config, route.resolve(config));
    }
    return config;
  });

  console.info('[armc] API mock включён (__ARMC_MOCK__). Запросы к стенду подменяются фикстурами.');
};

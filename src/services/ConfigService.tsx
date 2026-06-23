import { Config, IndexConfig, Versions } from '../store/config/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

export default class ConfigService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/clientapi/metadata/version');

    if (result.ok) {
      const data = await result.text();
      try {
        const res = JSON.parse(data);
        okCallback(data, res);
      } catch (e) {
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(
        result,
        'Метод, возвращающий версию Client Api сервиса недоступен. ' + 'Возможно, он неверно сконфигурирован.' + ' Обратитесь к администратору.',
      );
      errorCallback(message.message);
    }
  }

  static async fetchConfig(okCallback: (config: Config) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/config');

    const data = await result.json();
    if (result.ok) {
      const res: Config = {
        pvmMode: data['service-mode'] === 'PVM',
        minCountMask: data['users.search.min-mask-length'],
        registerEnabled: data.registerEnabled,
        maxCountUser: data['users.search.max-users-to-return'],
      };
      okCallback(res as Config);
    } else {
      const message = await ErrorHandling.handleError(result, 'Сервисы недоступны. Обратитесь к администратору.');
      errorCallback(message.message);
    }
  }

  static async fetchConfigPVM(okCallback: (config: Config) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/config/pvm');

    const data = await result.json();
    if (result.ok) {
      const res: Config = {
        localUserEnable: data['isLocalUsersMode'],
      };
      okCallback(res as Config);
    } else {
      const message = await ErrorHandling.handleError(result, 'Сервис авторизации PVM недоступен. Обратитесь к администратору.');
      errorCallback(message.message);
    }
  }

  static async getIndexConfig(
    index: 'fulltext' | 'archive' | 'analytical',
    okCallback: (cluster: IndexConfig) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', `/internal/config/${index}`);

    if (result.ok) {
      okCallback((await result.json()) as IndexConfig);
    } else {
      const message = await ErrorHandling.handleError(result, 'Сервисы недоступны. Обратитесь к администратору.');
      errorCallback(message.message);
    }
  }

  static getBasePath(): string {
    return BackendProvider.abyssProxyPath + (window as any).__BASE_PATH__;
  }

  static async getHealthCheckConfig(okCallback: (cluster: IndexConfig) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', `/health/services`);

    if (result.ok) {
      okCallback((await result.json()) as IndexConfig);
    } else {
      const message = await ErrorHandling.handleError(result, 'Сервисы недоступны. Обратитесь к администратору.');
      errorCallback(message.message);
    }
  }

  static async updateHealthCheckConfig(serviceByZone: any, health: string, okCallback: () => void, errorCallback: (message: string) => void) {
    let isError;
    await Promise.all(
      Object.entries(serviceByZone).map(async ([zone, services]) => {
        const responses = await Promise.all(
          services.map(async (serv) => {
            const res = await BackendProvider.request('PUT', `/health/services/${serv}`, null, { zone, health });
            if (!res.ok) {
              isError = await ErrorHandling.handleError(res, 'Сервисы недоступны. Обратитесь к администратору.');
            }
          }),
        );
        return responses;
      }),
    );
    if (isError) {
      errorCallback(isError.message);
    } else {
      okCallback();
    }
  }
}

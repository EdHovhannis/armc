import { APIkeyInfo, APIkeyParameters } from '../store/apiKeys/Types';
import { Versions } from '../store/config/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис выдачи API ключей в данный момент недоступен. Обратитесь к администратору.';

export default class APIkeyService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/abyss/pvm_auth/metadata/version');

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
        'Метод, возвращающий версию PVM Auth сервиса недоступен. ' + 'Возможно, он неверно сконфигурирован.' + ' Обратитесь к администратору.',
      );
      errorCallback(message.message);
    }
  }

  static async generateKey(
    parameters: APIkeyParameters,
    user: string,
    okCallback: (apiKey: string) => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', `/internal/abyss/user/${user}/apikey`, null, null, JSON.stringify(parameters));

    if (result.ok) {
      const body = await result.json();
      okCallback(body.key as string);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', ` ${user}`);
      errorCallback(message.message);
    }
  }

  static async updateKey(
    parameters: APIkeyParameters | null,
    user: string,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request(
      'PUT',
      `/internal/abyss/user/${user}/apikey`,
      null,
      null,
      parameters ? JSON.stringify(parameters) : null,
    );

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', ` ${user}`);
      errorCallback(message.message);
    }
  }

  static async deleteKey(user: string, okCallback: () => void, errorCallback: (errorMsg: { message: string; details?: string }) => void) {
    const result = await BackendProvider.request('DELETE', `/internal/abyss/user/${user}/apikey`);

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', ` ${user}`);
      errorCallback(message.message);
    }
  }

  static async getApiKeyInfoForUser(user: string, okCallback: (apiKeyInfo: APIkeyInfo) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/abyss/user/${user}/apikey/info`);

    if (result.ok) {
      const body = await result.json();
      okCallback(body as APIkeyInfo);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', ` ${user}`);
      errorCallback(message.message);
    }
  }

  static async getApiKeyInfo(okCallback: (apiKeyInfo: APIkeyInfo[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/abyss/apikey/info`);

    if (result.ok) {
      const body = await result.json();
      okCallback(body as APIkeyInfo[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getTimeUnits(okCallback: (timeUnits: string[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/abyss/time/units`);

    if (result.ok) {
      const body = await result.json();
      okCallback(body as string[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

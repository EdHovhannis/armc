import { AuthType, User } from '../store/auth/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис авторизации в данный момент недоступен. Обратитесь к администратору.';

export default class AuthService {
  static async register(
    username: string,
    password: string,
    okCallback: (user: User, redirect: string | null) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/internal/auth/register',
      null,
      null,
      JSON.stringify({
        username: username,
        password: password,
      }),
    );

    if (result.ok) {
      const body = await result.json();
      okCallback(body as User, result.headers.get('redirect'));
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', ` ${username}`);
      errorCallback(message.message);
    }
  }

  static async auth(
    username: string,
    password: string,
    okCallback: (user: User, redirect: string | null) => void,
    errorCallback: (errorMessage: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/internal/auth/login',
      null,
      null,
      JSON.stringify({
        username: username,
        password: password,
      }),
    );

    if (result.ok) {
      const body = await result.json();
      const user = body as User;
      okCallback(user, result.headers.get('redirect'));
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', '', ` ${username}`);
      errorCallback(message.message);
    }
  }

  static async checkAuthType(okCallback: (type: AuthType) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/authorization/policies/type');

    if (result.ok) {
      const body = await result.text();
      const type = body as AuthType;

      okCallback(type);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async checkAuth(okCallback: (user: User) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/auth/whoami');

    if (result.ok) {
      const body = await result.json();
      const user = body as User;
      okCallback(user);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async logout(okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/auth/logout');

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

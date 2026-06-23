import { User } from '../store/auth/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис авторизации в данный момент недоступен. Обратитесь к администратору.';

export default class UserService {
  static async fetchUsers(okCallback: (users: User[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/user/all');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as User[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async addLocalUser(userName: string, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', `/internal/user/add/${userName}`);

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deleteLocalUser(userName: string, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', `/internal/user/delete/${userName}`);

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchAllAdmins(okCallback: (users: string[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/roles/admin/users');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as string[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async searchUsersByMask(mask: string, okCallback: (users: User[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/user/all', null, { searchMask: mask });

    if (result.ok) {
      // let data = await result.json();
      const users = await result.json();
      okCallback(users);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchUserById(user_id: number, okCallback: (users: User) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', `/internal/user/${user_id}`);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as User);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

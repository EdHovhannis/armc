import { User } from '../store/auth/Types';
import { Group } from '../store/group/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Групп сервис в данный момент недоступен. Обратитесь к администратору.';

export default class GroupService {
  static async fetchGroups(okCallback: (group: Group[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/group/list/all');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Group[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchGroupMembers(group_id: string, okCallback: (user: User[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/group/' + group_id + '/users');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as User[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchGroupById(groupId: string, okCallback: (team: Group) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/group/' + groupId);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Group);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async createNewGroup(groupName: string, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/group/create', null, null, JSON.stringify({ name: groupName }));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ``, '', ` ${groupName}`);
      errorCallback(message.message);
    }
  }

  static async getGroupByName(name: number, okCallback: (team: Group) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/group/name/' + name);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Group);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, '', '', ` ${name}`);
      errorCallback(message.message);
    }
  }

  static async addUserToGroup(groupId: number, user_id: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/group/' + groupId + '/add/user/' + user_id);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async removeUserFromGroup(group_id: number, user_id: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/group/' + group_id + '/delete/user/' + user_id);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async removeGroup(team_id: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', '/internal/group/' + team_id);

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

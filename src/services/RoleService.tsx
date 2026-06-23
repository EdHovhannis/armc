import { Versions } from '../store/config/Types';
import { Resource, Role, Unit, UnitRole } from '../store/role/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Ролевой сервис в данный момент недоступен. Обратитесь к администратору.';

export default class RoleService {
  static async fetchUnitRolesForResource(
    resource: Resource,
    resourceId: number,
    okCallback: (unitRoles: UnitRole[]) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', '/internal/roles/resource/' + resource + '/' + resourceId, null, { withTransitive: false });

    if (result.ok) {
      const data = await result.json();
      okCallback(data as UnitRole[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async addUnitRoleToResource(
    unit: Unit,
    unitId: number,
    role: Role,
    resource: Resource,
    resource_id: number,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/internal/roles/resource/' + resource + '/' + resource_id + '/' + unit + '/' + unitId + '/' + role,
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async removeUnitRoleFromResource(
    unit: Unit,
    unitId: number,
    role: Role,
    resource: Resource,
    resource_id: number,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'DELETE',
      '/internal/roles/resource/' + resource + '/' + resource_id + '/' + unit + '/' + unitId + '/' + role,
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async removeAllUnitRolesFromResource(
    unit: Unit,
    unitId: number,
    resource: Resource,
    resource_id: number,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('DELETE', '/internal/roles/resource/' + resource + '/' + resource_id + '/' + unit + '/' + unitId);

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(
        result,
        ERROR_502_MESSAGE,
        '',
        '',
        '',
        unit === Unit.USER ? ` пользователя ${unitId}` : ` группы ${unitId}`,
      );
      errorCallback(message.message);
    }
  }

  static async fetchResourceIsSharedFlag(
    resource: Resource,
    resource_id: number,
    okCallback: (isPublic: boolean) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', '/internal/roles/resource/' + resource + '/' + resource_id + '/shared');
    if (result.ok) {
      okCallback((await result.json()) as boolean);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async setShared(resource: Resource, resource_id: number, shared: boolean, okCallback: () => void, errorCallback: (msg: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/roles/resource/' + resource + '/' + resource_id + '/shared', null, {
      is_shared: shared,
    });

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async setAdmin(user_id: string, isAdmin: boolean, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/user/' + user_id + '/admin/' + isAdmin);

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async checkUserHasRoleForResourceWithParent(
    userId: string,
    resource: Resource,
    resourceId: number,
    parent: Resource,
    parentId: number,
    role: Role,
    okCallback: (isRole: boolean) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'GET',
      '/internal/roles/user/' + userId + '/resource/' + resource + '/' + resourceId + '/parent/' + parent + '/' + parentId + '/' + role + '/check',
    );

    if (result.ok) {
      const data = await result.json();
      okCallback(data as boolean);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

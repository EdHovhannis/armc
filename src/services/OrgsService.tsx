import { IndicatorDatasource, IndicatorDatasourceCreateNew, IndicatorUser, MigrateStatus, Org } from '../store/orgs/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider, { SystemType } from './BackendProvider';

const ERROR_502_MESSAGE = 'Indicator в данный момент недоступен. Обратитесь к администратору.';

export default class OrgsService {
  static async fetchOrgs(okCallback: (orgs: Org[]) => void, errorCallback: (message: string) => void) {
    const CHUNK_SIZE = 1000;
    let page = 0;
    const successResponses: Org[] = [];

    async function paginationResponse(pagePagination) {
      try {
        const result = await BackendProvider.request(
          'GET',
          `/orgs?perpage=${CHUNK_SIZE}&page=${pagePagination}`,
          null,
          null,
          null,
          undefined,
          SystemType.indicator,
        );
        if (result.ok) {
          try {
            const data = await result.json();
            successResponses.push(...data);
            if (data.length < CHUNK_SIZE) {
              return okCallback(successResponses);
            } else if (data.length === CHUNK_SIZE) {
              page += 1;
              return paginationResponse(page);
            }
          } catch (e) {
            return errorCallback(ERROR_502_MESSAGE);
          }
        } else {
          const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
          return errorCallback(message.message);
        }
      } catch (error) {
        return errorCallback(ERROR_502_MESSAGE);
      }
    }
    paginationResponse(page);
  }

  static async createOrg(orgName: string, projectId: string, okCallback: (org: Org) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request(
      'POST',
      '/pvm/orgs/',
      null,
      null,
      JSON.stringify({ name: orgName, projectId: projectId }),
      undefined,
      SystemType.indicator,
    );

    if (result.ok) {
      try {
        const data = await result.json();
        okCallback(data as Org);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ``, '', ` ${orgName}`);
      errorCallback(message.message);
    }
  }

  static async deleteOrg(orgId: number, okCallback: (message: string) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', `/pvm/orgs/?organizationId=${orgId}`, null, null, null, undefined, SystemType.indicator);

    if (result.ok) {
      try {
        const data = await result.text();
        okCallback(data as string);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ``, '', ` ${orgId}`);
      errorCallback(message.message);
    }
  }

  static async fetchUsersInOrg(orgId: number, okCallback: (user: IndicatorUser[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/pvm/orgs/users?organizationId=' + orgId, null, null, null, undefined, SystemType.indicator);

    if (result.ok) {
      try {
        const data = await result.json();
        okCallback(data as IndicatorUser[]);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async removeUserFromOrg(sub: string, orgId: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request(
      'DELETE',
      '/pvm/orgs/users?organizationId=' + orgId + '&sub=' + sub,
      null,
      null,
      null,
      undefined,
      SystemType.indicator,
    );
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchOrgById(orgId: number, okCallback: (org: Org) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/orgs/' + orgId, null, null, null, undefined, SystemType.indicator);

    if (result.ok) {
      try {
        const data = await result.json();
        okCallback(data as Org);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateOrgById(orgId: number, org: Org, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('PUT', '/orgs/' + orgId, null, null, JSON.stringify(org), undefined, SystemType.indicator);

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateRoleForUser(
    user: IndicatorUser,
    newRole: string,
    orgId: number,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'PATCH',
      '/pvm/orgs/users?organizationId=' + orgId + '&sub=' + user.sub,
      null,
      null,
      JSON.stringify({ ...user, role: newRole }),
      undefined,
      SystemType.indicator,
    );

    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async addUserToCurrentOrg(
    userLogin: string,
    orgId: number,
    role: string,
    okCallback: (user: IndicatorUser) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/pvm/orgs/users/?organizationId=' + orgId,
      null,
      null,
      JSON.stringify({ sub: userLogin, role: role }),
      undefined,
      SystemType.indicator,
    );
    if (result.ok) {
      try {
        okCallback({
          orgId: orgId,
          role: role,
          sub: userLogin,
          name: '',
        });
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchDatasourcesInOrg(
    orgId: number,
    okCallback: (datasources: IndicatorDatasource[]) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'GET',
      '/pvm/orgs/datasources?organizationId=' + orgId,
      null,
      null,
      null,
      undefined,
      SystemType.indicator,
    );

    if (result.ok) {
      try {
        const data = await result.json();
        okCallback(data as IndicatorDatasource[]);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async addDatasourceToOrg(
    datasourceName: string,
    urlSettings: string,
    selectedProjectNewDatasource: string,
    orgId: number,
    okCallback: (datasource: IndicatorDatasourceCreateNew) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request(
      'POST',
      '/pvm/orgs/datasources/?organizationId=' + orgId,
      null,
      null,
      JSON.stringify({
        name: datasourceName,
        type: 'sbt-datasource-abyss',
        access: 'proxy',
        isDefault: false,
        orgId: orgId,
        url: urlSettings,
        jsonData: {
          execute_query_on_front: true,
          headerNamesList: 'Authorization',
          project: selectedProjectNewDatasource,
          url: urlSettings,
          work_mode: 'abyss',
        },
      }),
      undefined,
      SystemType.indicator,
    );
    if (result.ok) {
      try {
        const data = await result.json();
        okCallback({
          id: data.id,
          message: data.message,
          name: data.name,
          datasource: {
            id: data.id,
            uid: '',
            orgId: data.datasource.orgId,
            name: data.name,
            type: data.datasource.type,
            typeName: '',
            typeLogoUrl: '',
            access: data.datasource.access,
            url: data.datasource.url,
            password: '',
            user: '',
            database: '',
            basicAuth: data.datasource.basicAuth,
            isDefault: data.datasource.isDefault,
            jsonData: data.datasource.jsonData,
            readOnly: data.datasource.readOnly,
          },
        });
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getStatusMigration(okCallback: (status: MigrateStatus) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/pvm/migration', null, null, null, undefined, SystemType.indicator);

    if (result.ok) {
      try {
        const data = await result.json();
        okCallback(data as MigrateStatus);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async startMigration(okCallback: (message: string) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/pvm/migration', null, null, null, undefined, SystemType.indicator);
    if (result.ok) {
      try {
        const data = await result.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

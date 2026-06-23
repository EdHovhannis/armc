import { OsirisCheckQuotaRequest, OsirisQuota, OsirisTrafficQuotaRequest } from '../store/osiris/Type';

import BackendProvider, { SystemType } from './BackendProvider';

const ERROR_502_MESSAGE = 'Osiris в данный момент недоступен. Обратитесь к администратору.';

export default class OsirisService {
  static async getProjectQuota(projectName: string, okCallback: (quota: OsirisQuota[]) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', 'quota/' + projectName, null, null, null, false, SystemType.osiris);

    if (res.ok) {
      try {
        const data: OsirisQuota[] = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При запросе квоты Osiris на проект ' + projectName + ' произошла ошибка: ' + data.message);
        } catch (e) {
          if (res.status === 401) {
            errorCallback('Вы не авторизованы.');
          } else {
            errorCallback(ERROR_502_MESSAGE);
          }
        }
      }
    }
  }

  static async createProjectCheckQuota(
    projectName: string,
    quota: OsirisCheckQuotaRequest,
    okCallback: () => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('PUT', 'quota/' + projectName + '/', null, null, JSON.stringify(quota), false, SystemType.osiris);

    if (res.ok) {
      okCallback();
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При создании квоты Osiris на проект ' + projectName + ' произошла ошибка: ' + data.message);
        } catch (e) {
          if (res.status === 401) {
            errorCallback('Вы не авторизованы.');
          } else {
            errorCallback(ERROR_502_MESSAGE);
          }
        }
      }
    }
  }

  static async createProjectTrafficQuota(
    projectName: string,
    quota: OsirisTrafficQuotaRequest,
    okCallback: () => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('PUT', 'quota/' + projectName + '/', null, null, JSON.stringify(quota), false, SystemType.osiris);

    if (res.ok) {
      okCallback();
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При создании квоты Osiris на проект ' + projectName + ' произошла ошибка: ' + data.message);
        } catch (e) {
          if (res.status === 401) {
            errorCallback('Вы не авторизованы.');
          } else {
            errorCallback(ERROR_502_MESSAGE);
          }
        }
      }
    }
  }

  static async updateProjectCheckQuota(
    projectName: string,
    quota: OsirisCheckQuotaRequest,
    okCallback: () => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('POST', 'quota/' + projectName + '/', null, null, JSON.stringify(quota), false, SystemType.osiris);

    if (res.ok) {
      okCallback();
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При обновлении квоты Osiris на проект ' + projectName + ' произошла ошибка: ' + data.message);
        } catch (e) {
          if (res.status === 401) {
            errorCallback('Вы не авторизованы.');
          } else {
            errorCallback(ERROR_502_MESSAGE);
          }
        }
      }
    }
  }

  static async updateProjectTrafficQuota(
    projectName: string,
    quota: OsirisTrafficQuotaRequest,
    okCallback: () => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('POST', 'quota/' + projectName + '/', null, null, JSON.stringify(quota), false, SystemType.osiris);

    if (res.ok) {
      okCallback();
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При обновлении квоты Osiris на проект ' + projectName + ' произошла ошибка: ' + data.message);
        } catch (e) {
          if (res.status === 401) {
            errorCallback('Вы не авторизованы.');
          } else {
            errorCallback(ERROR_502_MESSAGE);
          }
        }
      }
    }
  }

  static async getQuotas(okCallback: (quotas: OsirisQuota[]) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', 'quota', null, null, null, false, SystemType.osiris);

    if (res.ok) {
      try {
        const data: OsirisQuota[] = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_502_MESSAGE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('Ошибка при получении всех квот Osiris: ' + data.message);
        } catch (e) {
          if (res.status === 401) {
            errorCallback('Вы не авторизованы.');
          } else {
            errorCallback(ERROR_502_MESSAGE);
          }
        }
      }
    }
  }
}

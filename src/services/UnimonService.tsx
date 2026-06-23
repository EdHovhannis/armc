import { UnimonProjectQuota, UnimonProjectRequestQuota } from '../store/unimon/Type';

import BackendProvider, { SystemType } from './BackendProvider';

const ERROR_502_MESSAGE = 'Unimon в данный момент недоступен. Обратитесь к администратору.';

export default class UnimonService {
  static async getProjectQuota(projectName: string, okCallback: (quota: UnimonProjectQuota) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/quota/rn/' + projectName, null, null, null, false, SystemType.unimon);

    if (res.ok) {
      try {
        const data: UnimonProjectQuota = await res.json();
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
          errorCallback('При запросе квоты Unimon на проект ' + projectName + ' произошла ошибка: ' + data.message);
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

  static async setProjectQuota(
    projectName: string,
    quota: UnimonProjectRequestQuota,
    okCallback: () => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('POST', '/quota/rn/' + projectName, null, null, JSON.stringify(quota), false, SystemType.unimon);

    if (res.ok) {
      okCallback();
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При установке квоты Unimon на проект ' + projectName + ' произошла ошибка: ' + data.message);
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

  static async getListQuota(okCallback: (quotas: any) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/quota/rn/list', null, null, null, false, SystemType.unimon);

    if (res.ok) {
      try {
        const data = await res.json();
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
          errorCallback('При запросе списка квот Unimon на проекты произошла ошибка: ' + data.message);
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

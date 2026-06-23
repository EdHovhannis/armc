import { AlmgrProjectQuota, AlmgrReducedQuota } from '../store/almgr/Type';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Almgr в данный момент недоступен. Обратитесь к администратору.';

export default class AlmgrService {
  static async getProjectQuota(projectName: string, okCallback: (quota: AlmgrProjectQuota) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/quota/alert/project/' + projectName, null, null, null, false);

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
          errorCallback('При запросе квоты Alert Manager ' + projectName + ' произошла ошибка: ' + data.message);
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

  static async setProjectQuota(projectName: string, quota: AlmgrReducedQuota, okCallback: () => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request(
      'POST',
      '/quota/alert/project/' + projectName,
      null,
      null,
      JSON.stringify({ maxRpm: quota.maxRpm, maxGroupRulesAmount: quota.maxGroupRulesAmount }),
      false,
    );

    if (res.ok) {
      okCallback();
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При установке квоты Alert Manager на проект ' + projectName + ' произошла ошибка: ' + data.message);
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

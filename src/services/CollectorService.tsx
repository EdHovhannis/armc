import { CollectorProjectQuota } from '../store/collector/Type';

import BackendProvider, { SystemType } from './BackendProvider';

const ERROR_502_MESSAGE = 'Коллектор в данный момент недоступен. Обратитесь к администратору.';
const ERROR_PARSE_RESPONSE = 'В процессе обработки полученных данных возникла ошибка. Обратитесь к администратору.';

export default class CollectorService {
  // получение квоты по проекту
  static async getProjectQuotaByProjectName(
    projectName: string,
    okCallback: (quota: CollectorProjectQuota) => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('GET', '/quota/collector/project/' + projectName, null, null, null, false);

    if (res.ok) {
      try {
        const data: CollectorProjectQuota = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_PARSE_RESPONSE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При запросе квоты коллектора на проект ' + projectName + ' произошла ошибка: ' + data.message);
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

  // получение квоты по проекту
  static async getProjectQuotaByProjectNameSafe(
    projectName: string,
    okCallback: (quota: CollectorProjectQuota | null) => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request('GET', '/quota/collector/project/' + projectName + '/safe', null, null, null, false);

    if (res.ok) {
      try {
        const data: CollectorProjectQuota | null = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_PARSE_RESPONSE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При запросе квоты коллектора на проект ' + projectName + ' произошла ошибка: ' + data.message);
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

  // получение квоты по ID квоты
  static async getProjectQuotaById(quotaId: string, okCallback: (quota: CollectorProjectQuota) => void, errorCallback: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/quota/' + quotaId, null, null, null, false, SystemType.collector);

    if (res.ok) {
      try {
        const data: CollectorProjectQuota = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_PARSE_RESPONSE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При запросе квоты коллектора по ИД квоты (' + quotaId + ') произошла ошибка: ' + data.message);
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

  // получение списка всех квот по доступным для пользователя проектам
  static async getListQuotasForAvailableProjects(
    projectNames: string[],
    okCallback: (quota: CollectorProjectQuota[]) => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request(
      'GET',
      '/quota/by-project-names',
      null,
      projectNames.length > 0 ? { projectNames: projectNames } : null,
      null,
      false,
      SystemType.collector,
    );

    if (res.ok) {
      try {
        const data: CollectorProjectQuota[] = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_PARSE_RESPONSE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При запросе списка квот по проектам ' + projectNames + ' произошла ошибка: ' + data.message);
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
    quota: number,
    okCallback: (quota: CollectorProjectQuota) => void,
    errorCallback: (error: string) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/quota/collector/project/' + projectName,
      null,
      null,
      JSON.stringify({ limitTrafficBytesPerMin: quota }),
      false,
    );

    if (res.ok) {
      try {
        const data: CollectorProjectQuota = await res.json();
        okCallback(data);
      } catch (e) {
        errorCallback(ERROR_PARSE_RESPONSE);
      }
    } else {
      if (res.status === 404) {
        errorCallback(ERROR_502_MESSAGE);
      } else {
        try {
          const data = await res.json();
          errorCallback('При установке квоты коллектора на проект ' + projectName + ' произошла ошибка: ' + data.message);
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

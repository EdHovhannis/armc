import { OverdraftConfig } from '../store/overdraft/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE_FULLTEXT = 'Сервис полнотектвого индекса в данный момент недоступен. Обратитесь к администратору.';
const ERROR_502_MESSAGE_ARCHIVE = 'Архивный сервис в данный момент недоступен. Обратитесь к администратору.';

export default class OverdraftService {
  static async getFulltextOverdraftConfig(okCallback: (overdraft: OverdraftConfig) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/fulltext/task/overdraft/config');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as OverdraftConfig);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE_FULLTEXT);
      errorCallback(message.message);
    }
  }

  static async setFulltextOverdraftConfig(
    overdraft: OverdraftConfig,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', '/internal/index/fulltext/task/overdraft/config', null, null, JSON.stringify(overdraft));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE_FULLTEXT);
      errorCallback(message);
    }
  }

  static async getArchiveOverdraftConfig(okCallback: (overdraft: OverdraftConfig) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/archive/task/overdraft/config');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as OverdraftConfig);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE_ARCHIVE);
      errorCallback(message.message);
    }
  }

  static async setArchiveOverdraftConfig(
    overdraft: OverdraftConfig,
    okCallback: () => void,
    errorCallback: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const result = await BackendProvider.request('POST', '/internal/index/archive/task/overdraft/config', null, null, JSON.stringify(overdraft));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE_ARCHIVE);
      errorCallback(message);
    }
  }
}

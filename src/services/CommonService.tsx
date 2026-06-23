import { OffsetDialogData } from '../components/shared/types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис индексации в данный момент недоступен. Обратитесь к администратору.';

export default class CommonService {
  static async saveOffsetData({ urlForSaveOffset, consumerData }, okCallback: (data) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', urlForSaveOffset, null, null, JSON.stringify(consumerData));
    if (result.ok) {
      okCallback('offset успешно установлен');
    } else {
      const json = await result.json();
      const { message, errorCode } = json;
      const defaultMessage = message || errorCode || ERROR_502_MESSAGE;
      const errorMessage = await ErrorHandling.handleError(result, defaultMessage);
      errorCallback(errorMessage.message);
    }
  }
  static async getOffsetDialogData(
    urlForGetOffsetData: string,
    okCallback: (data: Array<OffsetDialogData>) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', urlForGetOffsetData);
    if (result.ok) {
      const response = await result.json();
      okCallback(response);
    } else {
      const errorMessage = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(errorMessage.message);
    }
  }
}

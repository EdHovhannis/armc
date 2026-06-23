import { Zone } from '../store/zone/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис размещений в данный момент недоступен. Обратитесь к администратору.';
const apiRoot = '/internal';

export default class ZoneService {
  static async fetchZones(okCallback: (zones: Zone) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot + '/zones');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Zone);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

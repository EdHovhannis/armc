import qs from 'qs';

import { CurrentFeatureSettings, GetCurrentFeatureSettingsValueParams, GetCurrentFeatureSettingsValueResponse } from '../store/featureSettings/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис управления настройками в данный момент недоступен. Обратитесь к администратору.';

export default class FeatureSettingsService {
  // Получение значения текущей настройки
  static async getCurrentFeatureSettingsValue(
    params: GetCurrentFeatureSettingsValueParams,
    okCallback: (res: CurrentFeatureSettings) => void,
    errorCallback: (message: string) => void,
  ) {
    const search = qs.stringify(params, { addQueryPrefix: false, skipNulls: true });
    const result = await BackendProvider.request('GET', `/feature-settings/value?${search}`);

    if (result.ok) {
      const res = (await result.json()) as GetCurrentFeatureSettingsValueResponse;
      okCallback({ ...params, value: res.value === 'true' ? true : false });
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

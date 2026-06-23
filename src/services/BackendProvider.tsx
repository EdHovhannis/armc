export enum SystemType {
  unimon,
  osiris,
  indicator,
  collector,
  almgr,
  legacy_api_path_without_version,
}

export default class BackendProvider {
  static path = '';
  static base_path = '';
  static legacy_api_path = '/abyss_api/coordinator/api/v1';
  static legacy_api_path_without_version = '/abyss_api/coordinator/api';
  static indicator_api_path = '/api/indicator';
  static osiris_api_path = '/api/osiris/';
  static unimon_api_path = '/api/unimon';
  static collector_api_path = '/api/collector';
  static almgr_api_path = '/api/almgr';

  static request(
    method: string,
    path: string | URL,
    headers?: any,
    params?: any,
    body?: any,
    lookup?: boolean,
    system?: SystemType,
    abortSignal?: AbortSignal,
  ) {
    const _headers = lookup
      ? {
          Accept: 'application/json',
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        }
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        };

    if (headers) {
      for (const key in headers) {
        _headers[key] = headers[key];
      }
    }

    let url = BackendProvider.base_path;

    switch (system) {
      case SystemType.indicator:
        url = url + this.indicator_api_path + path;
        break;
      case SystemType.osiris:
        url = url + this.osiris_api_path + path;
        break;
      case SystemType.unimon:
        url = url + this.unimon_api_path + path;
        break;
      case SystemType.collector:
        url = url + this.collector_api_path + path;
        break;
      case SystemType.almgr:
        url = url + this.almgr_api_path + path;
        break;
      case SystemType.legacy_api_path_without_version:
        url = url + this.legacy_api_path_without_version + path;
        break;
      default:
        url = url + this.legacy_api_path + path;
    }

    if (params) {
      const paramArr: string[] = [];
      Object.keys(params).forEach((key) => {
        if (params[key] !== '') paramArr.push(key + '=' + encodeURIComponent(params[key]));
      });
      url += '?' + paramArr.join('&');
    }

    const fetchOptions: RequestInit = {
      method: method,
      credentials: 'include',
      headers: _headers,
      redirect: 'manual',
      body: body,
    };

    if (abortSignal && abortSignal instanceof AbortSignal) {
      fetchOptions.signal = abortSignal;
    }

    return fetch(url, fetchOptions);
  }
}

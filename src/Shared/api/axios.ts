import { create, isAxiosError, isCancel as isAxiosCancel } from 'axios';
import { createEvent, createStore } from 'effector';

const getTimeZoneInSecond = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return offset <= 0 ? Math.abs(offset) : -offset;
};

const URL_PROXY = '/armc_api';

const axios = create({
  headers: {
    timezone: getTimeZoneInSecond(),
    'Content-Type': 'application/json',
  },
});

export const $urlProxy = createStore('');
export const onUpdateUrlProxy = createEvent<string>();
$urlProxy.on(onUpdateUrlProxy, (_, payload) => {
  const url = payload + URL_PROXY;
  axios.defaults.baseURL = url;
  return url;
});

export { axios, isAxiosCancel, isAxiosError };

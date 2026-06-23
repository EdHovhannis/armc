import { createAsyncAction } from 'typesafe-actions';

import ZoneService from '../../services/ZoneService';
import * as notificationActions from '../notification/Actions';

import { Zone } from './Types';

export const fetchZoneAction = createAsyncAction('@project/FETCH_ZONES', '@project/FETCH_ZONES_SUCC', '@project/FETCH_ZONES_FAIL')<
  void,
  Zone,
  string
>();

export function fetchAllZone(fetchedCallback?: (zone: Zone) => void, errorCallback?) {
  return (dispatch, getState) => {
    ZoneService.fetchZones(
      (zone: Zone) => {
        dispatch(fetchZoneAction.success(zone));
        if (fetchedCallback) fetchedCallback(zone);
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchZoneAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

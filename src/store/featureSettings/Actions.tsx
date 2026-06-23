import FeatureSettingsService from '@src/services/FeatureSettings';
import { Dispatch } from 'redux';
import { createAsyncAction } from 'typesafe-actions';

import * as notificationActions from '../../store/notification/Actions';

import { CurrentFeatureSettings, GetCurrentFeatureSettingsValueParams } from './Types';

export const getCurrentFeatureSettings = createAsyncAction(
  '@featureSettings/GET_CURRENT_FEATURE_SETTINGS_REQ',
  '@featureSettings/GET_CURRENT_FEATURE_SETTINGS_SUCCESS',
  '@featureSettings/GET_CURRENT_FEATURE_SETTINGS_FAILURE',
)<void, CurrentFeatureSettings, string>();

export function fetchCurrentFeatureSettings(params: GetCurrentFeatureSettingsValueParams) {
  return (dispatch: Dispatch) => {
    dispatch(getCurrentFeatureSettings.request());
    FeatureSettingsService.getCurrentFeatureSettingsValue(
      params,
      (formats) => {
        dispatch(getCurrentFeatureSettings.success(formats));
      },
      (error) => {
        dispatch(notificationActions.error(error));
      },
    );
  };
}

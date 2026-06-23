import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { ApplicationState } from '../Store';

import * as actions from './Actions';
import { CurrentFeatureSettings } from './Types';
import {
  FEATURE_SETTINGS_LIMITS_FEATURE,
  FEATURE_SETTINGS_LIMITS_SETTING,
  FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_FEATURE,
  FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_SETTING,
} from './constants';

export interface FeatureSettingsStore {
  currentFeaturesFlags: Map<string, CurrentFeatureSettings>;
}

const initialState: FeatureSettingsStore = {
  // все текущие настройки
  currentFeaturesFlags: new Map(),
};

export type Actions = ActionType<typeof actions>;

export const reducer: Reducer<FeatureSettingsStore> = (state: FeatureSettingsStore = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.getCurrentFeatureSettings.success): {
      const newCurrentFeaturesFlags = new Map([...state.currentFeaturesFlags]);
      newCurrentFeaturesFlags.set(action.payload.feature + action.payload.setting, action.payload);
      return { ...state, currentFeaturesFlags: newCurrentFeaturesFlags };
    }
    default:
      return state;
  }
};

/*
  Включен ли фичефлаг лимитов
 */
export function getEnableFeatureSettingLimits(state: ApplicationState): boolean {
  const enabledLimits = state.featureSettings.currentFeaturesFlags.get(FEATURE_SETTINGS_LIMITS_FEATURE + FEATURE_SETTINGS_LIMITS_SETTING);
  if (enabledLimits?.value) {
    return true;
  }
  return false;
}

/*
  Включен ли фичефлаг лимитов для строгой валидации
 */
export function getValidationStrictFeatureSettingLimits(state: ApplicationState): boolean {
  const enabledLimits = state.featureSettings.currentFeaturesFlags.get(
    FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_FEATURE + FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_SETTING,
  );
  if (enabledLimits?.value) {
    return true;
  }
  return false;
}

export function getFeaturesSettings(state: ApplicationState): Map<string, CurrentFeatureSettings> {
  return state.featureSettings.currentFeaturesFlags;
}

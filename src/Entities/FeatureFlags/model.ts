import { createStore, combine } from 'effector';

import { fetchFeatureFlagFx } from './api';
import { FEATURE_FLAG_GLOBAL, FEATURE_SETTINGS_LIMITS_FEATURE, FEATURE_SETTINGS_LIMITS_SETTING } from './constants';

export const $featureFlags = createStore<Map<string, string>>(new Map());
$featureFlags.on(fetchFeatureFlagFx.done, (state, payload) => {
  const newState = new Map(state);

  const projectOrGlobal = payload.params.project || FEATURE_FLAG_GLOBAL;
  newState.set(payload.params.feature + payload.params.setting + projectOrGlobal, payload.result.data.value);

  return newState;
});

export const $isLimitFeatureSettingEnabled = combine(
  $featureFlags,
  (featureFlags) => featureFlags.get(FEATURE_SETTINGS_LIMITS_FEATURE + FEATURE_SETTINGS_LIMITS_SETTING + FEATURE_FLAG_GLOBAL) === 'true',
);

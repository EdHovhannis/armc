import { createStore } from 'effector';

import { fetchCurrentProjectLimitsFx, fetchCurrentEstimateFx, fetchCurrentOverdraftEstimateFx } from './api';
import { INIT_PROJECT_ESTIMATE, INIT_PROJECT_LIMITS } from './constants';
import { ProjectLimitItem, ProjectEstimate } from './types';

export const $currentProjectLimits = createStore<ProjectLimitItem>(INIT_PROJECT_LIMITS);
$currentProjectLimits.on(fetchCurrentProjectLimitsFx.doneData, (_, payload) => payload.data).reset([fetchCurrentProjectLimitsFx.failData]);

export const $currentProjectEstimate = createStore<ProjectEstimate>(INIT_PROJECT_ESTIMATE);
$currentProjectEstimate
  .on(fetchCurrentEstimateFx.done, (_, { result }) => ({
    maxStoreDurationSec: result.data.maxStoreDurationSec,
    maxOverdraftPercent: result.data.flowEstimateConfig.maxOverdraftPercent,
    maxDataRateBytesPerSec: result.data.maxDataRateBytesPerSec,
    maxSizeBytes: result.data.maxSizeBytes,
    slotsCount: result.data.slotsCount,
    bytesPerSecOnSlot: result.data.bytesPerSecOnSlot,
    correctPartitionsToSlotsRatio: result.data.correctPartitionsToSlotsRatio,
    estimateBySize: true,
  }))
  .reset([fetchCurrentEstimateFx.failData]);

export const $currentEstimateWarnings = createStore<string[]>([]);
$currentEstimateWarnings.on(fetchCurrentEstimateFx.doneData, (_, payload) => payload.data.warnings).reset([fetchCurrentEstimateFx.failData]);

export const $currentEstimateBlockers = createStore<string[]>([]);
$currentEstimateBlockers.on(fetchCurrentEstimateFx.doneData, (_, payload) => payload.data.blockers).reset([fetchCurrentEstimateFx.failData]);

export const $currentEstimateOverdraft = createStore<number>(0);
$currentEstimateOverdraft
  .on(fetchCurrentOverdraftEstimateFx.doneData, (_, payload) => payload.data.maxAvailableOverdraft)
  .reset([fetchCurrentOverdraftEstimateFx.failData]);

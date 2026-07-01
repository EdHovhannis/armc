import { createStore } from 'effector';

import { fetchCurrentEstimateFx, fetchCurrentOverdraftEstimateFx, fetchCurrentProjectLimitsFx, fetchInstanceEstimateFx } from './api';
import { INIT_PROJECT_ESTIMATE, INIT_PROJECT_LIMITS } from './constants';
import { ProjectLimitItem, ProjectEstimate, ProjectEstimateItem } from './types';

export const $currentProjectLimits = createStore<ProjectLimitItem>(INIT_PROJECT_LIMITS);
$currentProjectLimits.on(fetchCurrentProjectLimitsFx.doneData, (_, payload) => payload.data).reset([fetchCurrentProjectLimitsFx.failData]);

const mapEstimateData = (data: ProjectEstimateItem): Omit<ProjectEstimate, 'estimateBySize'> => ({
  maxStoreDurationSec: data.maxStoreDurationSec,
  maxOverdraftPercent: data.flowEstimateConfig.maxOverdraftPercent,
  maxDataRateBytesPerSec: data.maxDataRateBytesPerSec,
  maxSizeBytes: data.maxSizeBytes,
  slotsCount: data.slotsCount,
  bytesPerSecOnSlot: data.bytesPerSecOnSlot,
  correctPartitionsToSlotsRatio: data.correctPartitionsToSlotsRatio,
});

export const $currentProjectEstimate = createStore<ProjectEstimate>(INIT_PROJECT_ESTIMATE);
$currentProjectEstimate
  .on(fetchCurrentEstimateFx.done, (_, { params, result }) => ({
    ...mapEstimateData(result.data),
    estimateBySize: params.maxStoreDurationSec === null,
  }))
  .on(fetchInstanceEstimateFx.done, (_, { result }) => ({
    ...mapEstimateData(result.data),
    estimateBySize: true,
  }))
  .reset([fetchCurrentEstimateFx.failData, fetchInstanceEstimateFx.failData]);

export const $currentEstimateWarnings = createStore<string[]>([]);
$currentEstimateWarnings
  .on([fetchCurrentEstimateFx.doneData, fetchInstanceEstimateFx.doneData], (_, payload) => payload.data.warnings)
  .reset([fetchCurrentEstimateFx.failData, fetchInstanceEstimateFx.failData]);

export const $currentEstimateBlockers = createStore<string[]>([]);
$currentEstimateBlockers
  .on([fetchCurrentEstimateFx.doneData, fetchInstanceEstimateFx.doneData], (_, payload) => payload.data.blockers)
  .reset([fetchCurrentEstimateFx.failData, fetchInstanceEstimateFx.failData]);

$currentProjectEstimate.on(fetchCurrentOverdraftEstimateFx.doneData, (state, payload) => ({
  ...state,
  maxOverdraftPercent: payload.data.maxOverdraftPercent,
}));

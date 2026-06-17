import { notification } from '@sds-eng/base';
import { combine, createEffect, createStore, sample } from 'effector';

import {
  fetchIndexOptionsFx,
  fetchProjectOptionsFx,
  fetchRestrictionAllFx,
  fetchRestrictionsOverviewFx,
  saveRestrictionAllFx,
  saveRestrictionsByIndexFx,
  saveRestrictionsByProjectFx,
} from './api';
import { RestrictionAllItem, RestrictionByIndexItem, RestrictionByProjectItem } from './types';

export const $indexOptions = createStore<string[]>([]);
$indexOptions.on(fetchIndexOptionsFx.doneData, (_, payload) => payload);

export const $projectOptions = createStore<string[]>([]);
$projectOptions.on(fetchProjectOptionsFx.doneData, (_, payload) => payload);

export const $restrictionsByIndex = createStore<RestrictionByIndexItem[]>([]);
$restrictionsByIndex
  .on(fetchRestrictionsOverviewFx.doneData, (_, { byIndex }) => byIndex)
  .on(saveRestrictionsByIndexFx.doneData, (_, payload) => payload);

export const $restrictionsByProject = createStore<RestrictionByProjectItem[]>([]);
$restrictionsByProject
  .on(fetchRestrictionsOverviewFx.doneData, (_, { byProject }) => byProject)
  .on(saveRestrictionsByProjectFx.doneData, (_, payload) => payload);

export const $restrictionAll = createStore<RestrictionAllItem | null>(null);
$restrictionAll.on([fetchRestrictionAllFx.doneData, saveRestrictionAllFx.doneData], (_, payload) => payload);

export const $optionsIndex = combine($indexOptions, (options) => options.map((name) => ({ value: name, label: name })));

export const $optionsProject = combine($projectOptions, (options) => options.map((name) => ({ value: name, label: name })));

const showSaveSuccessFx = createEffect<void, void>(() => {
  notification({ title: 'Ограничения сохранены', status: 'success' });
});

sample({
  clock: [saveRestrictionsByIndexFx.done, saveRestrictionsByProjectFx.done, saveRestrictionAllFx.done],
  target: showSaveSuccessFx,
});

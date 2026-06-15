import { notification } from '@sds-eng/base';
import { combine, createEffect, createStore, sample } from 'effector';

import {
  fetchIndexOptionsFx,
  fetchProjectOptionsFx,
  fetchRestrictionAllFx,
  fetchRestrictionsByIndexFx,
  fetchRestrictionsByProjectFx,
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
$restrictionsByIndex.on(fetchRestrictionsByIndexFx.doneData, (_, payload) => payload);
$restrictionsByIndex.on(saveRestrictionsByIndexFx.doneData, (_, payload) => payload);

export const $restrictionsByProject = createStore<RestrictionByProjectItem[]>([]);
$restrictionsByProject.on(fetchRestrictionsByProjectFx.doneData, (_, payload) => payload);
$restrictionsByProject.on(saveRestrictionsByProjectFx.doneData, (_, payload) => payload);

export const $restrictionAll = createStore<RestrictionAllItem | null>(null);
$restrictionAll.on(fetchRestrictionAllFx.doneData, (_, payload) => payload);
$restrictionAll.on(saveRestrictionAllFx.doneData, (_, payload) => payload);

export const $optionsIndex = combine($indexOptions, (options) => options.map((name) => ({ value: name, label: name })));

export const $optionsProject = combine($projectOptions, (options) => options.map((name) => ({ value: name, label: name })));

const showSaveSuccessFx = createEffect<void, void>(() => {
  notification({ title: 'Ограничения сохранены', status: 'success' });
});

sample({
  clock: [saveRestrictionsByIndexFx.done, saveRestrictionsByProjectFx.done, saveRestrictionAllFx.done],
  fn: () => undefined,
  target: showSaveSuccessFx,
});

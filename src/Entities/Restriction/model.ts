import { notification } from '@sds-eng/base';
import { combine, createEffect, createStore, sample } from 'effector';

import {
  deleteRestrictionFx,
  fetchRestrictionAllFx,
  fetchRestrictionsTableFx,
  saveRestrictionAllFx,
  saveRestrictionsFx,
} from './api';
import { RestrictionAllItem, RestrictionObjectItem } from './types';

// полный список объектов с ограничениями (overview + догруженные значения)
export const $restrictionsTable = createStore<RestrictionObjectItem[]>([]);
$restrictionsTable.on(fetchRestrictionsTableFx.doneData, (_, payload) => payload);

// раскладываем по вкладкам: INDEX -> "По индексу", PROJECT -> "По проекту"
export const $restrictionsByIndex = combine($restrictionsTable, (items) => items.filter((item) => item.objectType === 'INDEX'));
export const $restrictionsByProject = combine($restrictionsTable, (items) => items.filter((item) => item.objectType === 'PROJECT'));

export const $restrictionAll = createStore<RestrictionAllItem | null>(null);
$restrictionAll.on([fetchRestrictionAllFx.doneData, saveRestrictionAllFx.doneData], (_, payload) => payload);

// после сохранения/удаления перезапрашиваем весь список - как abyss
sample({ clock: [saveRestrictionsFx.done, deleteRestrictionFx.done], target: fetchRestrictionsTableFx });

const showSaveSuccessFx = createEffect<void, void>(() => {
  notification({ title: 'Ограничения сохранены', status: 'success' });
});

sample({ clock: [saveRestrictionsFx.done, saveRestrictionAllFx.done], target: showSaveSuccessFx });

const showDeleteSuccessFx = createEffect<void, void>(() => {
  notification({ title: 'Ограничение удалено', status: 'success' });
});

sample({ clock: deleteRestrictionFx.done, target: showDeleteSuccessFx });

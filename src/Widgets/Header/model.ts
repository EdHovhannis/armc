import { createStore, createEvent } from 'effector';

export const $headerOpenRestrictionDrawer = createStore(false);
export const onChangeHeaderOpenRestrictionDrawer = createEvent<boolean>();

// id конфигурации для преселекта на вкладке "По индексу" при открытии из kebab строки.
// null - открыли общей кнопкой в шапке, без контекста
export const $restrictionPreselectIndexId = createStore<string | null>(null);
export const onOpenRestrictionDrawerForConfig = createEvent<string>();

$headerOpenRestrictionDrawer.on(onChangeHeaderOpenRestrictionDrawer, (_, payload) => payload).on(onOpenRestrictionDrawerForConfig, () => true);

$restrictionPreselectIndexId
  .on(onOpenRestrictionDrawerForConfig, (_, indexId) => indexId)
  // сбрасываем на любом onChangeHeaderOpenRestrictionDrawer - и закрытие, и открытие общей кнопкой идут без контекста
  .reset(onChangeHeaderOpenRestrictionDrawer);

import { DrawerBody, Tab, Tabs } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DEFAULT_RESTRICTION_UNIT } from '@src/Shared/constants/restrictions';
import { secondsToValueUnit } from '@src/Shared/lib/format/restrictionSeconds';

import { fetchArchiveOptionsFx } from '@src/Entities/Archives/api';
import { $optionsArchiveConfig } from '@src/Entities/Archives/model';
import { fetchProjectOptionsFx, fetchRestrictionAllFx, fetchRestrictionsTableFx } from '@src/Entities/Restriction/api';
import { $optionsProject, $restrictionAll, $restrictionsByIndex, $restrictionsByProject } from '@src/Entities/Restriction/model';
import { RestrictionAllItem, RestrictionObjectItem } from '@src/Entities/Restriction/types';

import { $restrictionPreselectIndexId } from '../model';

import AllIndexesTab from './AllIndexesTab';
import RestrictionFooter from './RestrictionFooter';
import RestrictionGrid from './RestrictionGrid';
import { $restrictionTab, onChangeRestrictionTab } from './model';
import * as styles from './styles.module.css';
import { RestrictionEntityRow, RestrictionsFormValues, RestrictionTab } from './types';

// пустая строка-заготовка (та же форма, что добавляет кнопка "+ ограничение")
const emptyRow = (): RestrictionEntityRow => ({ entity: '', value: null, unit: DEFAULT_RESTRICTION_UNIT });

// объект overview -> строка формы. value+unit раскладываем из секунд; если значение не догрузилось - пусто
const itemToRow = (item: RestrictionObjectItem): RestrictionEntityRow =>
  item.maxSearchTimeIntervalSec !== null
    ? { entity: item.objectId, ...secondsToValueUnit(item.maxSearchTimeIntervalSec) }
    : { entity: item.objectId, value: null, unit: DEFAULT_RESTRICTION_UNIT };

// строки "По индексу". если открыли из kebab конфигурации (preselectIndexId) и её ещё нет в списке -
// добавляем для неё строку в конец (значение подтянет EntitySelectCell). пустой список -> одна заготовка
const buildByIndexRows = (items: RestrictionObjectItem[], preselectIndexId: string | null): RestrictionEntityRow[] => {
  const rows = items.map(itemToRow);
  if (preselectIndexId && !rows.some((row) => row.entity === preselectIndexId)) {
    rows.push({ ...emptyRow(), entity: preselectIndexId });
  }
  return rows.length ? rows : [emptyRow()];
};

const buildRows = (items: RestrictionObjectItem[]): RestrictionEntityRow[] => {
  const rows = items.map(itemToRow);
  return rows.length ? rows : [emptyRow()];
};

// готовим значения формы: objectId -> entity (общее поле для обеих вкладок), секунды -> value+unit.
// all может быть null (бэк ещё не ответил)
const buildDefaults = (
  byIndex: RestrictionObjectItem[],
  byProject: RestrictionObjectItem[],
  all: RestrictionAllItem | null,
  preselectIndexId: string | null,
): RestrictionsFormValues => ({
  byIndex: buildByIndexRows(byIndex, preselectIndexId),
  byProject: buildRows(byProject),
  all: all ? secondsToValueUnit(all.maxSearchTimeIntervalSec) : { value: null, unit: DEFAULT_RESTRICTION_UNIT },
});

const DrawerRestrictionBody: FC = () => {
  const [tab, onTabChange] = useUnit([$restrictionTab, onChangeRestrictionTab]);
  const preselectIndexId = useUnit($restrictionPreselectIndexId);
  const [
    optionsIndex,
    optionsProject,
    storeByIndex,
    storeByProject,
    storeAll,
    loadingIndexOptions,
    loadingProjectOptions,
    loadingTable,
    fetchArchiveOptions,
    fetchProjectOptions,
    fetchRestrictionsTable,
    fetchRestrictionAll,
  ] = useUnit([
    $optionsArchiveConfig,
    $optionsProject,
    $restrictionsByIndex,
    $restrictionsByProject,
    $restrictionAll,
    fetchArchiveOptionsFx.pending,
    fetchProjectOptionsFx.pending,
    fetchRestrictionsTableFx.pending,
    fetchArchiveOptionsFx,
    fetchProjectOptionsFx,
    fetchRestrictionsTableFx,
    fetchRestrictionAllFx,
  ]);

  const methods = useForm<RestrictionsFormValues>({
    mode: 'onChange',
    // Инициализируем из стора: при повторном открытии Drawer данные уже есть — без мигания.
    defaultValues: buildDefaults(storeByIndex, storeByProject, storeAll, preselectIndexId),
  });

  useEffect(() => {
    fetchArchiveOptions();
    fetchProjectOptions();
    fetchRestrictionsTable();
    fetchRestrictionAll();
  }, [fetchArchiveOptions, fetchProjectOptions, fetchRestrictionsTable, fetchRestrictionAll]);

  const { reset } = methods;
  useEffect(() => {
    reset(buildDefaults(storeByIndex, storeByProject, storeAll, preselectIndexId));
  }, [reset, storeByIndex, storeByProject, storeAll, preselectIndexId]);

  // открыли из конкретной конфигурации - сразу показываем вкладку "По индексу"
  useEffect(() => {
    if (preselectIndexId) {
      onTabChange('byIndex');
    }
  }, [preselectIndexId, onTabChange]);

  return (
    <FormProvider {...methods}>
      <DrawerBody className={styles.drawerRestrictionBody}>
        <Tabs value={tab} onChange={(value) => onTabChange(value as RestrictionTab)} className={styles.drawerRestrictionTabs}>
          <Tab value="byIndex" header="По индексу" />
          <Tab value="byProject" header="По проекту" />
          <Tab value="all" header="Все индексы" />
        </Tabs>

        {tab === 'byIndex' && (
          <RestrictionGrid
            name="byIndex"
            objectType="INDEX"
            entityHeader="Индекс"
            entityPlaceholder="Выберите индекс"
            options={optionsIndex}
            loadingOptions={loadingIndexOptions}
            loading={loadingTable}
            loaded={storeByIndex}
          />
        )}
        {tab === 'byProject' && (
          <RestrictionGrid
            name="byProject"
            objectType="PROJECT"
            entityHeader="Проект"
            entityPlaceholder="Выберите проект"
            options={optionsProject}
            loadingOptions={loadingProjectOptions}
            loading={loadingTable}
            loaded={storeByProject}
          />
        )}
        {tab === 'all' && <AllIndexesTab />}
      </DrawerBody>

      <RestrictionFooter />
    </FormProvider>
  );
};

export default DrawerRestrictionBody;

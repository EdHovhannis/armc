import { DrawerBody, Tab, Tabs } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DEFAULT_RESTRICTION_UNIT } from '@src/Shared/constants/restrictions';

import { fetchIndexOptionsFx, fetchProjectOptionsFx, fetchRestrictionAllFx, fetchRestrictionsOverviewFx } from '@src/Entities/Restriction/api';
import { $optionsIndex, $optionsProject, $restrictionAll, $restrictionsByIndex, $restrictionsByProject } from '@src/Entities/Restriction/model';
import { RestrictionAllItem, RestrictionByIndexItem, RestrictionByProjectItem } from '@src/Entities/Restriction/types';

import AllIndexesTab from './AllIndexesTab';
import RestrictionFooter from './RestrictionFooter';
import RestrictionGrid from './RestrictionGrid';
import { $restrictionTab, onChangeRestrictionTab } from './model';
import * as styles from './styles.module.css';
import { RestrictionsFormValues, RestrictionTab } from './types';

// готовим значения формы из данных стора: indexId/project переименовываем в общее
// поле entity, чтобы таблица и ячейки были общими для обеих вкладок.
// all может быть null (бэк ещё не ответил) - подставляем дефолт
const buildDefaults = (
  byIndex: RestrictionByIndexItem[],
  byProject: RestrictionByProjectItem[],
  all: RestrictionAllItem | null,
): RestrictionsFormValues => ({
  byIndex: byIndex.map((item) => ({ entity: item.indexId, value: item.value, unit: item.unit })),
  byProject: byProject.map((item) => ({ entity: item.project, value: item.value, unit: item.unit })),
  all: all ? { value: all.value, unit: all.unit } : { value: null, unit: DEFAULT_RESTRICTION_UNIT },
});

const DrawerRestrictionBody: FC = () => {
  const [tab, onTabChange] = useUnit([$restrictionTab, onChangeRestrictionTab]);
  const [
    optionsIndex,
    optionsProject,
    storeByIndex,
    storeByProject,
    storeAll,
    loadingIndex,
    loadingProject,
    loadingOverview,
    fetchIndexOptions,
    fetchProjectOptions,
    fetchRestrictionsOverview,
    fetchRestrictionAll,
  ] = useUnit([
    $optionsIndex,
    $optionsProject,
    $restrictionsByIndex,
    $restrictionsByProject,
    $restrictionAll,
    fetchIndexOptionsFx.pending,
    fetchProjectOptionsFx.pending,
    fetchRestrictionsOverviewFx.pending,
    fetchIndexOptionsFx,
    fetchProjectOptionsFx,
    fetchRestrictionsOverviewFx,
    fetchRestrictionAllFx,
  ]);

  const methods = useForm<RestrictionsFormValues>({
    mode: 'onChange',
    // Инициализируем из стора: при повторном открытии Drawer данные уже есть — без мигания.
    defaultValues: buildDefaults(storeByIndex, storeByProject, storeAll),
  });

  useEffect(() => {
    fetchIndexOptions();
    fetchProjectOptions();
    fetchRestrictionsOverview();
    fetchRestrictionAll();
  }, [fetchIndexOptions, fetchProjectOptions, fetchRestrictionsOverview, fetchRestrictionAll]);

  const { reset } = methods;
  useEffect(() => {
    reset(buildDefaults(storeByIndex, storeByProject, storeAll));
  }, [reset, storeByIndex, storeByProject, storeAll]);

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
            entityHeader="Индекс"
            entityPlaceholder="Выберите индекс"
            options={optionsIndex}
            loadingOptions={loadingIndex}
            loading={loadingOverview}
          />
        )}
        {tab === 'byProject' && (
          <RestrictionGrid
            name="byProject"
            entityHeader="Проект"
            entityPlaceholder="Выберите проект"
            options={optionsProject}
            loadingOptions={loadingProject}
            loading={loadingOverview}
          />
        )}
        {tab === 'all' && <AllIndexesTab />}
      </DrawerBody>

      <RestrictionFooter />
    </FormProvider>
  );
};

export default DrawerRestrictionBody;

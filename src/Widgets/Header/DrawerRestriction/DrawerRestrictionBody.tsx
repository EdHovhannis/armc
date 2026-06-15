import { DrawerBody, Tab, Tabs } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  fetchIndexOptionsFx,
  fetchProjectOptionsFx,
  fetchRestrictionAllFx,
  fetchRestrictionsByIndexFx,
  fetchRestrictionsByProjectFx,
} from '@src/Entities/Restriction/api';
import { DEFAULT_RESTRICTION_UNIT } from '@src/Entities/Restriction/constants';
import { $optionsIndex, $optionsProject, $restrictionAll, $restrictionsByIndex, $restrictionsByProject } from '@src/Entities/Restriction/model';
import { RestrictionAllItem, RestrictionByIndexItem, RestrictionByProjectItem } from '@src/Entities/Restriction/types';

import AllIndexesTab from './AllIndexesTab';
import RestrictionFooter from './RestrictionFooter';
import RestrictionGrid from './RestrictionGrid';
import { $restrictionTab, onChangeRestrictionTab } from './model';
import * as styles from './styles.module.css';
import { RestrictionsFormValues, RestrictionTab } from './types';

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
    fetchIndexOptions,
    fetchProjectOptions,
    fetchRestrictionsByIndex,
    fetchRestrictionsByProject,
    fetchRestrictionAll,
  ] = useUnit([
    $optionsIndex,
    $optionsProject,
    $restrictionsByIndex,
    $restrictionsByProject,
    $restrictionAll,
    fetchIndexOptionsFx.pending,
    fetchProjectOptionsFx.pending,
    fetchIndexOptionsFx,
    fetchProjectOptionsFx,
    fetchRestrictionsByIndexFx,
    fetchRestrictionsByProjectFx,
    fetchRestrictionAllFx,
  ]);

  const methods = useForm<RestrictionsFormValues>({
    mode: 'onChange',
    defaultValues: { byIndex: [], byProject: [], all: { value: null, unit: DEFAULT_RESTRICTION_UNIT } },
  });

  useEffect(() => {
    fetchIndexOptions();
    fetchProjectOptions();
    fetchRestrictionsByIndex();
    fetchRestrictionsByProject();
    fetchRestrictionAll();
  }, [fetchIndexOptions, fetchProjectOptions, fetchRestrictionsByIndex, fetchRestrictionsByProject, fetchRestrictionAll]);

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
          />
        )}
        {tab === 'byProject' && (
          <RestrictionGrid
            name="byProject"
            entityHeader="Проект"
            entityPlaceholder="Выберите проект"
            options={optionsProject}
            loadingOptions={loadingProject}
          />
        )}
        {tab === 'all' && <AllIndexesTab />}
      </DrawerBody>

      <RestrictionFooter />
    </FormProvider>
  );
};

export default DrawerRestrictionBody;

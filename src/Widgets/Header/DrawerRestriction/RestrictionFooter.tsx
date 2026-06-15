import { Button, DrawerFooter } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { saveRestrictionAllFx, saveRestrictionsByIndexFx, saveRestrictionsByProjectFx } from '@src/Entities/Restriction/api';
import { $restrictionsByIndex, $restrictionsByProject } from '@src/Entities/Restriction/model';

import { $restrictionTab } from './model';
import * as styles from './styles.module.css';
import { RestrictionEntityRow, RestrictionsFormValues } from './types';

const isPositiveInteger = (value: number | null): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0;

const isListValid = (rows: RestrictionEntityRow[]): boolean => rows.every((row) => Boolean(row.entity) && isPositiveInteger(row.value));

const RestrictionFooter: FC = () => {
  const { control } = useFormContext<RestrictionsFormValues>();
  const byIndex = useWatch({ control, name: 'byIndex' }) ?? [];
  const byProject = useWatch({ control, name: 'byProject' }) ?? [];
  const all = useWatch({ control, name: 'all' });

  const [tab, storeByIndex, storeByProject, savingByIndex, savingByProject, savingAll, saveByIndex, saveByProject, saveAll] = useUnit([
    $restrictionTab,
    $restrictionsByIndex,
    $restrictionsByProject,
    saveRestrictionsByIndexFx.pending,
    saveRestrictionsByProjectFx.pending,
    saveRestrictionAllFx.pending,
    saveRestrictionsByIndexFx,
    saveRestrictionsByProjectFx,
    saveRestrictionAllFx,
  ]);

  const byIndexPayload = byIndex.map((row) => ({ indexId: row.entity, value: Number(row.value), unit: row.unit }));
  const byProjectPayload = byProject.map((row) => ({ project: row.entity, value: Number(row.value), unit: row.unit }));

  const isByIndexDirty = JSON.stringify(byIndexPayload) !== JSON.stringify(storeByIndex);
  const isByProjectDirty = JSON.stringify(byProjectPayload) !== JSON.stringify(storeByProject);

  const { disabled, isLoading, onSave } = (() => {
    if (tab === 'byIndex') {
      return {
        disabled: !isByIndexDirty || !isListValid(byIndex),
        isLoading: savingByIndex,
        onSave: () => saveByIndex(byIndexPayload),
      };
    }
    if (tab === 'byProject') {
      return {
        disabled: !isByProjectDirty || !isListValid(byProject),
        isLoading: savingByProject,
        onSave: () => saveByProject(byProjectPayload),
      };
    }
    // Вкладка «Все индексы»: кнопка активна при валидном значении (без проверки на изменения).
    return {
      disabled: !isPositiveInteger(all?.value ?? null),
      isLoading: savingAll,
      onSave: () => {
        if (all && isPositiveInteger(all.value)) {
          saveAll({ value: all.value, unit: all.unit });
        }
      },
    };
  })();

  return (
    <DrawerFooter className={styles.drawerRestrictionFooter}>
      <Button view="primary" size="md" disabled={disabled} isLoading={isLoading} onClick={onSave}>
        Сохранить
      </Button>
    </DrawerFooter>
  );
};

export default RestrictionFooter;

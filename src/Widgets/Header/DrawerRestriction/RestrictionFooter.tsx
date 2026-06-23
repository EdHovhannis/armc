import { Button, DrawerFooter } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { valueUnitToSeconds } from '@src/Shared/lib/format/restrictionSeconds';

import { saveRestrictionAllFx, saveRestrictionsFx } from '@src/Entities/Restriction/api';
import { $restrictionAll, $restrictionsByIndex, $restrictionsByProject } from '@src/Entities/Restriction/model';
import { RestrictionObjectItem } from '@src/Entities/Restriction/types';

import { $restrictionTab } from './model';
import * as styles from './styles.module.css';
import { RestrictionEntityRow, RestrictionsFormValues } from './types';

const isPositiveInteger = (value: number | null): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0;

const isListValid = (rows: RestrictionEntityRow[]): boolean => rows.every((row) => Boolean(row.entity) && isPositiveInteger(row.value));

// строки активной вкладки, которые надо PATCH-нуть: валидные + новые или с изменившимся значением
const buildPatchItems = (rows: RestrictionEntityRow[], loaded: RestrictionObjectItem[]): { id: string; maxSearchTimeIntervalSec: number }[] =>
  rows
    .flatMap((row) =>
      row.entity && isPositiveInteger(row.value) ? [{ id: row.entity, maxSearchTimeIntervalSec: valueUnitToSeconds(row.value, row.unit) }] : [],
    )
    .filter((item) => {
      const prev = loaded.find((loadedItem) => loadedItem.objectId === item.id);
      return !prev || prev.maxSearchTimeIntervalSec !== item.maxSearchTimeIntervalSec;
    });

const RestrictionFooter: FC = () => {
  const { control } = useFormContext<RestrictionsFormValues>();
  const byIndex = useWatch({ control, name: 'byIndex', defaultValue: [] });
  const byProject = useWatch({ control, name: 'byProject', defaultValue: [] });
  const all = useWatch({ control, name: 'all' });

  const [tab, storeByIndex, storeByProject, storeAll, savingTable, savingAll] = useUnit([
    $restrictionTab,
    $restrictionsByIndex,
    $restrictionsByProject,
    $restrictionAll,
    saveRestrictionsFx.pending,
    saveRestrictionAllFx.pending,
  ]);

  const { disabled, isLoading, onSave } = (() => {
    if (tab === 'byIndex') {
      const items = buildPatchItems(byIndex, storeByIndex);
      return {
        disabled: !isListValid(byIndex) || items.length === 0,
        isLoading: savingTable,
        onSave: () => saveRestrictionsFx({ type: 'INDEX', items }),
      };
    }
    if (tab === 'byProject') {
      const items = buildPatchItems(byProject, storeByProject);
      return {
        disabled: !isListValid(byProject) || items.length === 0,
        isLoading: savingTable,
        onSave: () => saveRestrictionsFx({ type: 'PROJECT', items }),
      };
    }
    // Вкладка "Все индексы": кнопка активна только если значение валидно и отличается от сохранённого
    const allSeconds = all && isPositiveInteger(all.value) ? valueUnitToSeconds(all.value, all.unit) : null;
    const allChanged = allSeconds !== null && allSeconds !== (storeAll?.maxSearchTimeIntervalSec ?? null);
    return {
      disabled: !allChanged,
      isLoading: savingAll,
      onSave: () => {
        if (all && isPositiveInteger(all.value)) {
          saveRestrictionAllFx({ maxSearchTimeIntervalSec: valueUnitToSeconds(all.value, all.unit) });
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

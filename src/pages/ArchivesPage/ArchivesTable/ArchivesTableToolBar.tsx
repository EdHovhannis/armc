import { Button, Icon } from '@sds-eng/base';
import { DataGridRowData, DataGridTableInstance, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useState } from 'react';

import { SpeedIconRemoved } from '@src/Shared/assets/icons/SpeedIconRemoved';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';

import { ArchivesSearchInput } from './ArchivesSearchInput';
import * as styles from './styles.module.css';

interface ArchivesTableToolBarProps<TRow extends DataGridRowData> {
  onSearchChange: (value: string) => void;
  searchValue: string;
  isLoading?: boolean;
  rowCount: number;
  showHideMenuId?: string;
  table: DataGridTableInstance<TRow>;
}

export const ArchivesTableToolBar = <TRow extends DataGridRowData>({
  onSearchChange,
  searchValue,
  isLoading,
  rowCount,
  showHideMenuId,
  table,
}: ArchivesTableToolBarProps<TRow>) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  return (
    <div className={styles.tableToolbarWrapper}>
      <ArchivesSearchInput value={searchValue} onChange={onSearchChange} restoreFocusKey={`${searchValue}-${Boolean(isLoading)}-${rowCount}`} />
      <>
        <div className={styles.tableToolbarRow}>
          <div className={styles.filterIcons}>
            <Button.Icon
              icon={<Icon.ColumnThree />}
              onClick={(event) => setColumnMenuAnchor((prev: HTMLElement | null) => (prev ? null : event.currentTarget))}
              aria-label="Столбцы"
            />
            <Button.Icon
              className={styles.filterIcons}
              icon={<Icon.Filter />}
              aria-label="Фильтры"
              onClick={() => onChangeFilterDrawerOpenFn(true)}
            />
          </div>

          <Button.Icon
            className={styles.filterIcons}
            icon={<SpeedIconRemoved />}
            aria-label="Сбросить фильтры"
            // onClick={() => handleClearFilters(table)}
          />
          <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={() => {}} />
        </div>
        {columnMenuAnchor && (
          <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} id={showHideMenuId} table={table} />
        )}
      </>
    </div>
  );
};

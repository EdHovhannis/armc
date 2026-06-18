import { Button, Icon } from '@sds-eng/base';
import { ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, useState } from 'react';

import { SpeedIconRemoved } from '@src/Shared/assets/icons/SpeedIconRemoved';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';

import { ArchivesSearchInput } from './ArchivesSearchInput';
import * as styles from './styles.module.css';

interface ArchivesTableToolBarProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
  isLoading?: boolean;
  rowCount: number;
  showHideMenuId?: string;
  //tableKey
}

export const ArchivesTableToolBar: FC<ArchivesTableToolBarProps> = ({ onSearchChange, searchValue, isLoading, rowCount, showHideMenuId }) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  //  const [localTableKey, setLocalTableKey] = useState(tableKey);

  //   const handleClearFilters = useCallback(
  //     (table: DataGridTableInstance<TRow>) => {
  //       table.resetColumnFilters();
  //       table.setGlobalFilter('');
  //       onSearchChange('');
  //     },
  //     [onSearchChange],
  //   );
  //  const handleRefresh = useCallback(() => {
  //     setLocalTableKey((prev) => prev + 1);
  //   }, []);
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
          <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} id={showHideMenuId} table={undefined} />
        )}
      </>
    </div>
  );
};

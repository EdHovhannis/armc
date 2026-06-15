import { Button, Icon } from '@sds-eng/base';
import { FC, memo, MouseEvent, RefObject, useCallback } from 'react';

import ArchivesSearchField, { ArchivesSearchFieldRef } from './ArchivesSearchField';
import * as styles from './styles.module.css';

type ArchivesTableToolbarProps = {
  searchFieldRef: RefObject<ArchivesSearchFieldRef>;
  onDebouncedSearchChange: (value: string) => void;
  onColumnMenuClick: (anchor: HTMLElement) => void;
  onFiltersClick: () => void;
  onClearFilters: () => void;
  onRefresh: () => void;
};

const ArchivesTableToolbar: FC<ArchivesTableToolbarProps> = ({
  searchFieldRef,
  onDebouncedSearchChange,
  onColumnMenuClick,
  onFiltersClick,
  onClearFilters,
  onRefresh,
}) => {
  const handleColumnMenuClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onColumnMenuClick(event.currentTarget);
    },
    [onColumnMenuClick],
  );

  return (
    <div className={styles.tableToolbarRow}>
      <ArchivesSearchField ref={searchFieldRef} onDebouncedChange={onDebouncedSearchChange} />
      <div className={styles.filterIcons}>
        <Button.Icon icon={<Icon.ColumnThree />} onClick={handleColumnMenuClick} aria-label="Столбцы" />
        <Button.Icon icon={<Icon.Filter />} aria-label="Фильтры" onClick={onFiltersClick} />
      </div>
      <Button.Icon className={styles.filterIcons} icon={<Icon.Clear />} aria-label="Сбросить фильтры" onClick={onClearFilters} />
      <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={onRefresh} />
    </div>
  );
};

export default memo(ArchivesTableToolbar);

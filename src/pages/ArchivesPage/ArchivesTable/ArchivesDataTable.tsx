import { Button, Icon, TextField } from '@sds-eng/base';
import { DataGridColumnDef, DataGridPaginationState, DataGridTableInstance, DataGridUpdater, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { memo, useCallback, useEffect, useRef, useState, MouseEvent } from 'react';

import DataGridTable from '@src/Widgets/DataGridTable';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';

import * as styles from './styles.module.css';

const SEARCH_ICON = <Icon.Search />;

interface ArchivesDataTableProps<TRow extends { id: number | string }> {
  data: TRow[];
  columns: DataGridColumnDef<TRow>[];
  tableKey: number;
  showHideMenuId: string;
  isLoading?: boolean;
  pagination: DataGridPaginationState;
  onPaginationChange: (updater: DataGridUpdater<DataGridPaginationState>) => void;
  rowCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

interface ArchivesSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ArchivesSearchInput = memo(({ value, onChange }: ArchivesSearchInputProps) => (
  <TextField prefix={SEARCH_ICON} placeholder="Найти" value={value} onChange={onChange} size="md" className={styles.searchInput} />
));

ArchivesSearchInput.displayName = 'ArchivesSearchInput';

export const ArchivesDataTable = <TRow extends { id: number | string }>({
  data,
  columns,
  tableKey,
  showHideMenuId,
  isLoading,
  pagination,
  onPaginationChange,
  rowCount,
  searchValue,
  onSearchChange,
}: ArchivesDataTableProps<TRow>) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [localTableKey, setLocalTableKey] = useState(tableKey);
  const searchInputWrapperRef = useRef<HTMLDivElement | null>(null);
  const shouldRestoreSearchFocusRef = useRef(false);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  const handleColumnMenuClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleFiltersClick = useCallback(() => {
    onChangeFilterDrawerOpenFn(true);
  }, [onChangeFilterDrawerOpenFn]);

  const handleClearFilters = useCallback(
    (table: DataGridTableInstance<TRow>) => {
      table.resetColumnFilters();
      table.setGlobalFilter('');
      shouldRestoreSearchFocusRef.current = true;
      onSearchChange('');
    },
    [onSearchChange],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      shouldRestoreSearchFocusRef.current = true;
      onSearchChange(value);
    },
    [onSearchChange],
  );

  const handleRefresh = useCallback(() => {
    setLocalTableKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!searchInputWrapperRef.current?.contains(event.target as Node)) {
        shouldRestoreSearchFocusRef.current = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!shouldRestoreSearchFocusRef.current) {
      return;
    }

    const input = searchInputWrapperRef.current?.querySelector('input');
    if (!input || document.activeElement === input) {
      return;
    }

    input.focus();
  }, [data, isLoading, rowCount, searchValue]);

  const renderTopToolbar = useCallback(
    ({ table }: { table: DataGridTableInstance<TRow> }) => (
      <>
        <div className={styles.tableToolbarRow}>
          <div className={styles.filterIcons}>
            <Button.Icon icon={<Icon.ColumnThree />} onClick={handleColumnMenuClick} aria-label="Столбцы" />
            <Button.Icon className={styles.filterIcons} icon={<Icon.Filter />} aria-label="Фильтры" onClick={handleFiltersClick} />
          </div>

          <Button.Icon className={styles.filterIcons} icon={<Icon.Clear />} aria-label="Сбросить фильтры" onClick={() => handleClearFilters(table)} />
          <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={handleRefresh} />
        </div>
        {columnMenuAnchor && <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} table={table} id={showHideMenuId} />}
      </>
    ),
    [columnMenuAnchor, handleColumnMenuClick, handleFiltersClick, handleClearFilters, handleRefresh, showHideMenuId],
  );

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.searchToolbarRow} ref={searchInputWrapperRef}>
        <ArchivesSearchInput value={searchValue} onChange={handleSearchChange} />
      </div>
      <DataGridTable
        key={localTableKey}
        data={data}
        columns={columns as DataGridColumnDef<TRow, unknown>[]}
        isLoading={Boolean(isLoading)}
        onScroll={() => {}}
        getRowId={(row) => String(row.id)}
        layoutMode="semantic"
        defaultColumn={{ minSize: 60, enableColumnFilter: false, enableSorting: false }}
        enableStickyHeader
        enableRowSelection
        enableRowVirtualization={false}
        enablePagination
        manualPagination
        autoResetPageIndex={false}
        rowCount={rowCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        enableTopToolbar
        enableBottomToolbar
        enableFilters={false}
        enableColumnFilters={false}
        enableGlobalFilter={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding
        enableColumnActions={false}
        enableSorting={false}
        enableToolbarInternalActions={true}
        renderTopToolbar={renderTopToolbar}
        initialState={{
          showColumnFilters: false,
          globalFilter: '',
        }}
        bottomToolbarProps={{
          relative: false,
          className: styles.fixedBottomToolbar,
        }}
        paginationProps={{
          rowsPerPageOptions: [20, 50, 100],
          showRowsPerPage: true,
          showPageCount: true,
        }}
        localization={{
          rowsPerPage: 'записей на странице',
          nextTitle: 'Дальше',
        }}
        displayColumnDefOptions={{
          'data-grid-row-select': { header: '', size: 40, maxSize: 40, minSize: 40 },
        }}
        tableProps={{ className: styles.table }}
        tableContainerProps={{ className: styles.tableContainer }}
        tableBodyCellProps={{ className: styles.tableCell }}
        tableHeadCellProps={{ className: styles.tableHeadCell }}
      />
    </div>
  );
};

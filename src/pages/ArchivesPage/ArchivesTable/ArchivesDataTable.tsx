import { Button, Icon, TextField } from '@sds-eng/base';
import { DataGridColumnDef, DataGridPaginationState, DataGridTableInstance, DataGridUpdater, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useCallback, useEffect, useRef, useState, MouseEvent } from 'react';

import DataGridTable from '@src/Widgets/DataGridTable';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';

import * as styles from './styles.module.css';

const SEARCH_DEBOUNCE_MS = 400;

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

interface ArchivesTableToolbarProps<TRow extends { id: number | string }> {
  table: DataGridTableInstance<TRow>;
  showHideMenuId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const ArchivesTableToolbar = <TRow extends { id: number | string }>({
  table,
  showHideMenuId,
  searchValue,
  onSearchChange,
  onRefresh,
}: ArchivesTableToolbarProps<TRow>) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (localSearchValue === searchValue) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSearchChange(localSearchValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [localSearchValue, onSearchChange, searchValue]);

  const handleColumnMenuClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleFiltersClick = useCallback(() => {
    onChangeFilterDrawerOpenFn(true);
  }, [onChangeFilterDrawerOpenFn]);

  const handleClearFilters = useCallback(() => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
    setLocalSearchValue('');
  }, [table]);

  return (
    <>
      <div className={styles.tableToolbarRow}>
        <TextField
          prefix={<Icon.Search />}
          placeholder="Найти"
          value={localSearchValue}
          onChange={setLocalSearchValue}
          size="md"
          className={styles.searchInput}
        />
        <div className={styles.filterIcons}>
          <Button.Icon icon={<Icon.ColumnThree />} onClick={handleColumnMenuClick} aria-label="Столбцы" />
          <Button.Icon className={styles.filterIcons} icon={<Icon.Filter />} aria-label="Фильтры" onClick={handleFiltersClick} />
        </div>

        <Button.Icon className={styles.filterIcons} icon={<Icon.Clear />} aria-label="Сбросить фильтры" onClick={handleClearFilters} />
        <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={onRefresh} />
      </div>
      {columnMenuAnchor && <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} table={table} id={showHideMenuId} />}
    </>
  );
};

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
  const [localTableKey, setLocalTableKey] = useState(tableKey);
  const searchValueRef = useRef(searchValue);

  useEffect(() => {
    searchValueRef.current = searchValue;
  }, [searchValue]);

  const handleRefresh = useCallback(() => {
    setLocalTableKey((prev) => prev + 1);
  }, []);

  const renderTopToolbar = useCallback(
    ({ table }: { table: DataGridTableInstance<TRow> }) => (
      <ArchivesTableToolbar
        table={table}
        showHideMenuId={showHideMenuId}
        searchValue={searchValueRef.current}
        onSearchChange={onSearchChange}
        onRefresh={handleRefresh}
      />
    ),
    [handleRefresh, onSearchChange, showHideMenuId],
  );

  return (
    <div className={styles.tableWrapper}>
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

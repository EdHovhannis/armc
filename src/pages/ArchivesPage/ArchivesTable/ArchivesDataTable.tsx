import { Button, Icon, TextField } from '@sds-eng/base';
import { DataGridColumnDef, DataGridTableInstance, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useCallback, useState, MouseEvent } from 'react';

import DataGridTable from '@src/Widgets/DataGridTable';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';

import * as styles from './styles.module.css';

interface ArchivesDataTableProps<TRow extends { id: number | string }> {
  data: TRow[];
  columns: DataGridColumnDef<TRow>[];
  tableKey: number;
  showHideMenuId: string;
  isLoading?: boolean;
}

export const ArchivesDataTable = <TRow extends { id: string }>({
  data,
  columns,
  tableKey,
  showHideMenuId,
  isLoading,
}: ArchivesDataTableProps<TRow>) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [localTableKey, setLocalTableKey] = useState(tableKey);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  const handleColumnMenuClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleFiltersClick = useCallback(() => {
    onChangeFilterDrawerOpenFn(true);
  }, [onChangeFilterDrawerOpenFn]);

  const handleClearFilters = useCallback((table: DataGridTableInstance<TRow>) => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
  }, []);

  const handleRefresh = useCallback(() => {
    setLocalTableKey((prev) => prev + 1);
  }, []);

  const renderTopToolbar = useCallback(
    ({ table }: { table: DataGridTableInstance<TRow> }) => (
      <>
        <div className={styles.tableToolbarRow}>
          <TextField
            prefix={<Icon.Search />}
            placeholder="Найти"
            value={table.getState().globalFilter || ''}
            onChange={() => {}}
            size="md"
            className={styles.searchInput}
          />
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
      <DataGridTable
        key={localTableKey}
        data={data}
        columns={columns as DataGridColumnDef<TRow, unknown>[]}
        isLoading={Boolean(isLoading)}
        onScroll={() => {}}
        getRowId={(row) => row.id}
        layoutMode="semantic"
        defaultColumn={{ minSize: 60, enableColumnFilter: false, enableSorting: false }}
        enableStickyHeader
        enableRowSelection
        enableRowVirtualization={false}
        enablePagination
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
          pagination: { pageSize: 20, pageIndex: 0 },
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

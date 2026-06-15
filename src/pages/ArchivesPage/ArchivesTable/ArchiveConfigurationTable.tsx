// import React from 'react';

import { Button, Icon, TextField } from '@sds-eng/base';
import { DataGrid, DataGridTableInstance, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, useState, MouseEvent, useCallback } from 'react';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';
import { ArchiveConfigurationRow } from '../types';

import { archiveConfigurationColumns } from './columns';
import * as styles from './styles.module.css';

export const ArchiveConfigurationTable: FC<{
  data: ArchiveConfigurationRow[];
  tableKey: number;
}> = ({ data, tableKey }) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [localTableKey, setLocalTableKey] = useState(tableKey);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);

  const handleColumnMenuClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleFiltersClick = useCallback(() => {
    onChangeFilterDrawerOpenFn(true);
  }, [onChangeFilterDrawerOpenFn]);

  const handleClearFilters = useCallback((table: DataGridTableInstance<ArchiveConfigurationRow>) => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
  }, []);

  const handleRefresh = useCallback(() => {
    setLocalTableKey((prev) => prev + 1);
  }, []);

  const renderTopToolbar = useCallback(
    ({ table }: { table: DataGridTableInstance<ArchiveConfigurationRow> }) => (
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
            <Button.Icon icon={<Icon.Filter />} aria-label="Фильтры" onClick={handleFiltersClick} />
          </div>

          <Button.Icon className={styles.filterIcons} icon={<Icon.Clear />} aria-label="Сбросить фильтры" onClick={() => handleClearFilters(table)} />
          <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={handleRefresh} />
        </div>
        {columnMenuAnchor && (
          <ShowHideColumnsMenu
            anchorEl={columnMenuAnchor}
            setAnchorEl={setColumnMenuAnchor}
            table={table}
            id="archives-configuration-show-hide-menu"
          />
        )}
      </>
    ),
    [columnMenuAnchor, handleColumnMenuClick, handleFiltersClick, handleClearFilters, handleRefresh],
  );

  return (
    <div className={styles.tableWrapper}>
      <DataGrid
        key={localTableKey}
        data={data}
        columns={archiveConfigurationColumns}
        getRowId={(row) => row.id}
        layoutMode="semantic"
        defaultColumn={{ minSize: 60, enableColumnFilter: false, enableSorting: false }}
        enableStickyHeader
        enableRowSelection
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

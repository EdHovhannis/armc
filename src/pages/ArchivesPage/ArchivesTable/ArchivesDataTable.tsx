import { DataGridColumnDef, DataGridPaginationState, DataGridUpdater } from '@sds-eng/data-grid';
import { useState } from 'react';

import DataGridTable from '@src/Widgets/DataGridTable';

import { ArchivesActionsToolBar } from './ArchivesActionsToolBar';
import { ArchivesTableToolBar } from './ArchivesTableToolBar';
import * as styles from './styles.module.css';

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

export const ArchivesDataTable = <TRow extends { id: number | string }>({
  data,
  columns,
  // tableKey,
  isLoading,
  pagination,
  onPaginationChange,
  rowCount,
  searchValue,
  onSearchChange,
  showHideMenuId,
}: ArchivesDataTableProps<TRow>) => {
  const [rowSelection, setRowSelection] = useState({});
  const rowSelectionCount = Object.values(rowSelection).length;
  const isArchiveActionsShown = Boolean(rowSelectionCount);

  return (
    <div className={styles.tableWrapper}>
      <ArchivesTableToolBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        isLoading={isLoading}
        rowCount={rowCount}
        showHideMenuId={showHideMenuId}
      />
      {isArchiveActionsShown && <ArchivesActionsToolBar rowSelectionCount={rowSelectionCount} />}
      <DataGridTable
        data={data}
        columns={columns as DataGridColumnDef<TRow, unknown>[]}
        isLoading={Boolean(isLoading)}
        onScroll={() => {}}
        getRowId={(row) => String(row.id)}
        layoutMode="semantic"
        defaultColumn={{ minSize: 60, enableColumnFilter: false, enableSorting: false }}
        enableStickyHeader
        enableRowSelection
        onRowSelectionChange={setRowSelection}
        enableRowVirtualization={false}
        enablePagination
        manualPagination
        autoResetPageIndex={false}
        rowCount={rowCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
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
        initialState={{
          showColumnFilters: false,
          globalFilter: '',
        }}
        state={{
          rowSelection,
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

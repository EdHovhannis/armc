import { DataGridColumnDef, DataGridPaginationState, DataGridRowSelectionState, DataGridUpdater } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { useCallback } from 'react';

import { $selectedRowIds, setRowSelection } from '@src/Features/TableView/model';

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
  onDeleteSuccess: () => void;
}

export const ArchivesDataTable = <TRow extends { id: number | string }>({
  data,
  columns,
  isLoading,
  pagination,
  onPaginationChange,
  rowCount,
  searchValue,
  onSearchChange,
  showHideMenuId,
  onDeleteSuccess,
}: ArchivesDataTableProps<TRow>) => {
  const [rowSelection, setRowSelectionFn] = useUnit([$selectedRowIds, setRowSelection]);

  const handleRowSelectionChange = useCallback(
    (updaterOrValue: DataGridUpdater<DataGridRowSelectionState>) => {
      const nextRowSelection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
      setRowSelectionFn(nextRowSelection);
    },
    [rowSelection, setRowSelectionFn],
  );

  const rowSelectionCount = Object.values(rowSelection).length;
  const isArchiveActionsShown = Boolean(rowSelectionCount);
  return (
    <div className={styles.tableWrapper}>
      {isArchiveActionsShown && <ArchivesActionsToolBar rowSelectionCount={rowSelectionCount} onDeleteSuccess={onDeleteSuccess} />}
      <DataGridTable
        data={data}
        columns={columns as DataGridColumnDef<TRow, unknown>[]}
        isLoading={Boolean(isLoading)}
        onScroll={() => {}}
        getRowId={(row) => String(row.id)}
        layoutMode="semantic"
        defaultColumn={{ minSize: 60, enableColumnFilter: false, enableSorting: false }}
        enableStickyHeader
        enableRowSelection={(row) => {
          return !row.original.instances?.length;
        }}
        onRowSelectionChange={handleRowSelectionChange}
        enableRowVirtualization={false}
        enablePagination
        manualPagination
        autoResetPageIndex={false}
        rowCount={rowCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        enableBottomToolbar
        enableTopToolbar
        enableFilters={false}
        enableColumnFilters={false}
        enableGlobalFilter={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding
        enableColumnActions={false}
        enableSorting={false}
        renderTopToolbar={({ table }) => (
          <ArchivesTableToolBar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            isLoading={isLoading}
            rowCount={rowCount}
            showHideMenuId={showHideMenuId}
            table={table}
          />
        )}
        enableToolbarInternalActions={false}
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

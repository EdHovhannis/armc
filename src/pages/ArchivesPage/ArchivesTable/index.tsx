import { Button, Icon, TextField } from '@sds-eng/base';
import { DataGridPaginationState, DataGridRowData, DataGridTableInstance, DataGridUpdater, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, memo, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchArchivesFx, fetchArchivesPageCountFx, createNameLikeFilter } from '@src/Entities/Archive/api';
import { $archiveConfigs, $archiveInstances, $archivesTotalCount } from '@src/Entities/Archive/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import DataGridTable from '@src/Widgets/DataGridTable';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';
import { getArchiveConfigurations } from '../mock/archiveConfigurations';
import { getArchiveInstances } from '../mock/archiveIndexes';
import { ArchiveConfigurationRow, ArchiveIndexRow } from '../types';

import { archiveConfigurationColumns, archiveIndexColumns } from './columns';
import * as styles from './styles.module.css';

const DEFAULT_PAGE_SIZE = 10;
const MIN_ROWS_FOR_PAGINATION = 10;
const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_ICON = <Icon.Search />;

const TABLE_INITIAL_STATE = {
  pagination: { pageSize: DEFAULT_PAGE_SIZE, pageIndex: 0 },
  showColumnFilters: false,
};

const TABLE_LOCALIZATION = {
  rowsPerPage: 'записей на странице',
  nextTitle: 'Дальше',
};

const DISPLAY_COLUMN_OPTIONS = {
  'data-grid-row-select': { header: '', size: 40, maxSize: 40, minSize: 40 },
};

const DEFAULT_COLUMN_CONFIG = { minSize: 60, enableColumnFilter: false, enableSorting: false };

type TableSearchInputProps = {
  onDebouncedChange: (value: string) => void;
  resetKey: number;
};

const TableSearchInput = memo(({ onDebouncedChange, resetKey }: TableSearchInputProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [resetKey]);

  useEffect(() => {
    const timer = setTimeout(() => onDebouncedChange(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, onDebouncedChange]);

  return (
    <TextField
      prefix={SEARCH_ICON}
      placeholder="Найти"
      value={value}
      onChange={setValue}
      size="md"
      className={styles.searchInput}
    />
  );
});

TableSearchInput.displayName = 'TableSearchInput';

const ArchivesTable: FC = () => {
  const [tableView] = useUnit([$tableView]);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);
  const [isArchivesLoading, fetchArchives, fetchArchivesPageCount, archiveInstances, archiveConfigs, archivesTotalCount] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    fetchArchivesPageCountFx,
    $archiveInstances,
    $archiveConfigs,
    $archivesTotalCount,
  ]);

  const [pagination, setPagination] = useState<DataGridPaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const tableRef = useRef<DataGridTableInstance<DataGridRowData> | null>(null);

  const filters = useMemo(() => createNameLikeFilter(debouncedSearchQuery), [debouncedSearchQuery]);

  const handleDebouncedSearchChange = useCallback((value: string) => {
    setDebouncedSearchQuery(value);
  }, []);

  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchArchivesPageCount({ filters });
  }, [fetchArchivesPageCount, filters]);

  useEffect(() => {
    fetchArchives({
      pageSize: pagination.pageSize,
      pageNumber: pagination.pageIndex + 1,
      filters,
    });
  }, [fetchArchives, pagination.pageIndex, pagination.pageSize, filters]);

  const handlePaginationChange = useCallback((updater: DataGridUpdater<DataGridPaginationState>) => {
    setPagination((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const handleColumnMenuClick = useCallback((event: MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleRefresh = useCallback(() => {
    setTableKey((prev) => prev + 1);
    fetchArchivesPageCount({ filters });
    fetchArchives({
      pageSize: pagination.pageSize,
      pageNumber: pagination.pageIndex + 1,
      filters,
    });
  }, [fetchArchives, fetchArchivesPageCount, filters, pagination.pageIndex, pagination.pageSize]);

  const handleClearFilters = useCallback(() => {
    setSearchResetKey((prev) => prev + 1);
    setDebouncedSearchQuery('');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleFiltersClick = useCallback(() => {
    onChangeFilterDrawerOpenFn(true);
  }, [onChangeFilterDrawerOpenFn]);

  const showPagination = archivesTotalCount >= MIN_ROWS_FOR_PAGINATION;

  const commonTableProps = useMemo(
    () => ({
      isLoading: isArchivesLoading,
      onScroll: () => {},
      layoutMode: 'semantic' as const,
      defaultColumn: DEFAULT_COLUMN_CONFIG,
      enableStickyHeader: true,
      enableRowSelection: true,
      enablePagination: showPagination,
      manualPagination: true,
      rowCount: archivesTotalCount,
      onPaginationChange: handlePaginationChange,
      state: { pagination },
      enableTopToolbar: false,
      enableBottomToolbar: showPagination,
      enableFilters: false,
      enableColumnFilters: false,
      enableGlobalFilter: false,
      enableDensityToggle: false,
      enableFullScreenToggle: false,
      enableHiding: true,
      enableColumnActions: false,
      enableSorting: false,
      initialState: TABLE_INITIAL_STATE,
      bottomToolbarProps: {
        relative: false,
        className: styles.fixedBottomToolbar,
      },
      paginationProps: {
        rowsPerPageOptions: [10, 20, 50],
        showRowsPerPage: true,
        showPageCount: true,
      },
      localization: TABLE_LOCALIZATION,
      displayColumnDefOptions: DISPLAY_COLUMN_OPTIONS,
      tableProps: { className: styles.table },
      tableContainerProps: { className: styles.tableContainer },
      tableBodyCellProps: { className: styles.tableCell },
      tableHeadCellProps: { className: styles.tableHeadCell },
    }),
    [isArchivesLoading, showPagination, archivesTotalCount, handlePaginationChange, pagination],
  );

  const tableData = useMemo(
    () => (tableView === SEGMENT_INSTANCES ? getArchiveInstances(archiveInstances) : getArchiveConfigurations(archiveConfigs)),
    [tableView, archiveInstances, archiveConfigs],
  );

  if (tableView !== SEGMENT_INSTANCES && tableView !== SEGMENT_CONFIGURATIONS) {
    return null;
  }

  return (
    <>
      <div className={styles.tableToolbarRow}>
        <TableSearchInput onDebouncedChange={handleDebouncedSearchChange} resetKey={searchResetKey} />
        <div className={styles.filterIcons}>
          <Button.Icon icon={<Icon.ColumnThree />} onClick={handleColumnMenuClick} aria-label="Столбцы" />
          <Button.Icon icon={<Icon.Filter />} aria-label="Фильтры" onClick={handleFiltersClick} />
        </div>
        <Button.Icon className={styles.filterIcons} icon={<Icon.Clear />} aria-label="Сбросить фильтры" onClick={handleClearFilters} />
        <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={handleRefresh} />
      </div>
      {columnMenuAnchor && tableRef.current ? (
        <ShowHideColumnsMenu
          anchorEl={columnMenuAnchor}
          setAnchorEl={setColumnMenuAnchor}
          table={tableRef.current}
          id={tableView === SEGMENT_INSTANCES ? 'archives-index-show-hide-menu' : 'archives-configuration-show-hide-menu'}
        />
      ) : null}
      {tableView === SEGMENT_INSTANCES ? (
        <DataGridTable<ArchiveIndexRow>
          key={tableKey}
          data={tableData as ArchiveIndexRow[]}
          columns={archiveIndexColumns}
          getRowId={(row) => row.id}
          tableWrapperProps={({ table }) => {
            tableRef.current = table as unknown as DataGridTableInstance<DataGridRowData>;
            return {};
          }}
          {...commonTableProps}
        />
      ) : (
        <DataGridTable<ArchiveConfigurationRow>
          key={tableKey}
          data={tableData as ArchiveConfigurationRow[]}
          columns={archiveConfigurationColumns}
          getRowId={(row) => row.id}
          tableWrapperProps={({ table }) => {
            tableRef.current = table as unknown as DataGridTableInstance<DataGridRowData>;
            return {};
          }}
          {...commonTableProps}
        />
      )}
    </>
  );
};

export default ArchivesTable;

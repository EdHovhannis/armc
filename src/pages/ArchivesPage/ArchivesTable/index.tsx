import { Button, Icon, TextField } from '@sds-eng/base';
import { DataGridTableInstance, ShowHideColumnsMenu } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { fetchArchivesFx } from '@src/Entities/Archive/api';
import { $archiveConfigs, $archiveInstances } from '@src/Entities/Archive/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import DataGridTable from '@src/Widgets/DataGridTable';

import { onChangeFilterDrawerOpen } from '../FilterDrawer/model';
import { getArchiveConfigurations } from '../mock/archiveConfigurations';
import { getArchiveInstances } from '../mock/archiveIndexes';
import { ArchiveConfigurationRow, ArchiveIndexRow } from '../types';

import { archiveConfigurationColumns, archiveIndexColumns } from './columns';
import * as styles from './styles.module.css';

const TABLE_INITIAL_STATE = {
  pagination: { pageSize: 20, pageIndex: 0 },
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

const ArchivesTable: FC = () => {
  const [tableView] = useUnit([$tableView]);
  const onChangeFilterDrawerOpenFn = useUnit(onChangeFilterDrawerOpen);
  const [isArchivesLoading, fetchArchives, archiveInstances, archiveConfigs] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    $archiveInstances,
    $archiveConfigs,
  ]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [tableKey, setTableKey] = useState(0);

  const handleColumnMenuClick = (event: MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor((prev) => (prev ? null : event.currentTarget));
  };

  const handleRefresh = () => {
    setTableKey((prev) => prev + 1);
  };

  const handleClearFiltersForIndex = useCallback((table: DataGridTableInstance<ArchiveIndexRow>) => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
  }, []);

  const handleClearFiltersForConfiguration = useCallback((table: DataGridTableInstance<ArchiveConfigurationRow>) => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
  }, []);

  const handleFiltersClick = useCallback(() => {
    onChangeFilterDrawerOpenFn(true);
  }, [onChangeFilterDrawerOpenFn]);

  const commonTableProps = {
    isLoading: isArchivesLoading,
    onScroll: () => {},
    layoutMode: 'semantic' as const,
    defaultColumn: DEFAULT_COLUMN_CONFIG,
    enableStickyHeader: true,
    enableRowSelection: true,
    enablePagination: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
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
      rowsPerPageOptions: [20, 50, 100],
      showRowsPerPage: true,
      showPageCount: true,
    },
    localization: TABLE_LOCALIZATION,
    displayColumnDefOptions: DISPLAY_COLUMN_OPTIONS,
    tableProps: { className: styles.table },
    tableContainerProps: { className: styles.tableContainer },
    tableBodyCellProps: { className: styles.tableCell },
    tableHeadCellProps: { className: styles.tableHeadCell },
  };

  const renderInstancesTopToolbar = ({ table }: { table: DataGridTableInstance<ArchiveIndexRow> }) => (
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
        <Button.Icon
          className={styles.filterIcons}
          icon={<Icon.Clear />}
          aria-label="Сбросить фильтры"
          onClick={() => handleClearFiltersForIndex(table)}
        />
        <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={handleRefresh} />
      </div>
      {columnMenuAnchor && (
        <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} table={table} id="archives-index-show-hide-menu" />
      )}
    </>
  );

  const renderConfigurationsTopToolbar = ({ table }: { table: DataGridTableInstance<ArchiveConfigurationRow> }) => (
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
        <Button.Icon
          className={styles.filterIcons}
          icon={<Icon.Clear />}
          aria-label="Сбросить фильтры"
          onClick={() => handleClearFiltersForConfiguration(table)}
        />
        <Button.Icon className={styles.filterIcons} icon={<Icon.Refresh />} aria-label="Обновить" onClick={handleRefresh} />
      </div>
      {columnMenuAnchor && (
        <ShowHideColumnsMenu anchorEl={columnMenuAnchor} setAnchorEl={setColumnMenuAnchor} table={table} id="archives-configuration-show-hide-menu" />
      )}
    </>
  );

  if (tableView === SEGMENT_INSTANCES) {
    return (
      <DataGridTable<ArchiveIndexRow>
        key={tableKey}
        data={getArchiveInstances(archiveInstances)}
        columns={archiveIndexColumns}
        getRowId={(row) => row.id}
        renderTopToolbar={renderInstancesTopToolbar}
        {...commonTableProps}
      />
    );
  }

  if (tableView === SEGMENT_CONFIGURATIONS) {
    return (
      <DataGridTable<ArchiveConfigurationRow>
        key={tableKey}
        data={getArchiveConfigurations(archiveConfigs)}
        columns={archiveConfigurationColumns}
        getRowId={(row) => row.id}
        renderTopToolbar={renderConfigurationsTopToolbar}
        {...commonTableProps}
      />
    );
  }

  return null;
};

export default ArchivesTable;

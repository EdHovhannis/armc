import { Divider, Paper } from '@material-ui/core';
import { Icon } from '@sds-eng/base';
import { DataGrid, DataGridColumnDef, DataGridRow, ShowHideColumnsButton, ToggleFullScreenButton } from '@sds-eng/data-grid';
import { DataGridTableInstance } from '@sds-eng/data-grid/dist/esm/types';
import BackupsDisabledBanner from '@src/components/backups/BackupsDisabledBanner';
import { EmptyDataFallback } from '@src/components/backups/EmptyDataFallback';
import ComplexFilter from '@src/components/backups/FilterControls/ComplexFilter';
import ToolbarButton from '@src/components/backups/FilterControls/ToolbarButton';
import FilterIcon from '@src/components/backups/FilterIcon';
import { PageHeader } from '@src/components/backups/PageHeader';
import { ZoneRequiredFallback } from '@src/components/backups/ZoneRequiredFallback';
import { useBackupsFilter } from '@src/components/backups/hooks/useBackupFilter';
import { useUrlPagination } from '@src/components/backups/hooks/useUrlPagination';
import { useZoneParam } from '@src/components/backups/hooks/useZoneParam';
import { BackupTableRow, FilterDefinition, FilterSelections, IListBackups } from '@src/components/backups/types';
import BackupsService from '@src/services/BackupsService';
import { ApplicationState } from '@src/store/Store';
import { fetchFulltextServiceConfig } from '@src/store/config/Actions';
import { getFulltextServiceConfig, isFulltextServiceConfigLoading } from '@src/store/config/Reducer';
import { ColumnFiltersState } from '@tanstack/table-core/src/features/ColumnFiltering';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import useDeepCompareEffect from 'use-deep-compare-effect';

export type SetFiltersFn = (newFilter: FilterSelections, options?: { replace?: boolean; resetPage?: boolean }) => void;
export type GenerateColumnsFn<T extends BackupTableRow> = (
  filterDefinitions: FilterDefinition[],
  filterSelectedValues: FilterSelections,
  setFilterSelectedValues: SetFiltersFn,
) => DataGridColumnDef<T>[];

export type GenerateActionsFn<T extends BackupTableRow> = (props: {
  closeMenu: () => void;
  row: DataGridRow<T>;
  staticRowIndex?: number;
  table: DataGridTableInstance<T>;
}) => ReactNode[] | undefined;

interface GenericBackupsTableProps<T extends BackupTableRow> {
  displayError(error: string): void;

  localStorageVisibilityKey: string;
  localStorageSizingKey: string;
  title: string;
  endpoint: string;
  filterZones: string[];
  filterDefinitions: FilterDefinition[];
  generateColumnsFn: GenerateColumnsFn<T>;
  actionMenuItems: GenerateActionsFn<T>;
  defaultColumnVisibility: Record<string, boolean>;
  defaultColumnSizing: Record<string, number>;
  filterToFieldMapping: Record<string, string>;
  refreshKey: number;
}

const tableProps = {
  enableRowActions: true,
  enableColumnResizing: true,
  enableRowVirtualization: true,
  enableSorting: false,
  enableTopToolbar: true,
  enableColumnActions: false,
};

export const GenericBackupsTable = <T extends BackupTableRow>({
  displayError,
  localStorageVisibilityKey,
  localStorageSizingKey,
  title,
  endpoint,
  filterZones,
  filterDefinitions,
  generateColumnsFn,
  actionMenuItems,
  defaultColumnVisibility,
  defaultColumnSizing,
  filterToFieldMapping,
  refreshKey,
}: GenericBackupsTableProps<T>) => {
  const dispatch: Dispatch<any> = useDispatch();

  const [tableData, setTableData] = React.useState<T[]>([]);
  const [totalPages, setTotalPages] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const loadColumnVisibility = (): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem(localStorageVisibilityKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse column visibility from localStorage', e);
    }
    return defaultColumnVisibility;
  };

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(loadColumnVisibility);

  const saveColumnVisibility = (visibility: Record<string, boolean>) => {
    try {
      localStorage.setItem(localStorageVisibilityKey, JSON.stringify(visibility));
    } catch (e) {
      console.warn('Failed to save column visibility to localStorage', e);
    }
  };

  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  const loadColumnSizing = (): Record<string, number> => {
    try {
      const saved = localStorage.getItem(localStorageSizingKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse column sizing from localStorage', e);
    }
    return defaultColumnSizing;
  };

  const [columnSizing, setColumnSizing] = useState<Record<string, number>>(loadColumnSizing);

  const saveColumnSizing = (sizing: Record<string, number>) => {
    try {
      localStorage.setItem(localStorageSizingKey, JSON.stringify(sizing));
    } catch (e) {
      console.warn('Failed to save column sizing to localStorage', e);
    }
  };

  useEffect(() => {
    saveColumnSizing(columnSizing);
  }, [columnSizing]);

  const { zone, setZone } = useZoneParam();
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();
  const { filterSelectedValues, setFilterSelectedValues } = useBackupsFilter(filterDefinitions);

  const isFulltextConfigLoading: boolean = useSelector(isFulltextServiceConfigLoading);
  const isBackupEnabled: boolean | undefined = useSelector((state: ApplicationState) => getFulltextServiceConfig(state)?.backupsEnabled);

  useEffect(() => {
    if (!zone && filterZones.length === 1 && !!filterZones[0]) {
      setZone(filterZones[0], { replace: true });
    }
  }, [zone, filterZones, setZone]);

  React.useEffect(() => {
    dispatch(fetchFulltextServiceConfig(undefined, (message: string) => displayError(`Ошибка при получении конфигурации ${message}`)));
  }, [dispatch, displayError]);

  const fetchData = React.useCallback(
    (page: number, pageSize: number, defs: FilterDefinition[], vals: FilterSelections) => {
      if (!zone || !isBackupEnabled) return;
      setIsLoading(true);
      BackupsService.fetchBackupList(
        zone,
        endpoint,
        defs,
        vals,
        page,
        pageSize,
        (data: IListBackups | null) => {
          if (data?.items) {
            setTableData(data.items as T[]);
            setTotalPages(data.totalPages);
          }
        },
        (message: string) => displayError(`Ошибка при получении данных: ${message}`),
      ).finally(() => setIsLoading(false));
    },
    [zone, isBackupEnabled, endpoint],
  );

  useDeepCompareEffect(() => {
    if (!zone || !isBackupEnabled || !filterSelectedValues) {
      setTableData([]);
      setTotalPages(0);
      return;
    }
    setTableData([]);
    setPage(1);
    setTotalPages(0);
    fetchData(page, pageSize, filterDefinitions, filterSelectedValues);
  }, [fetchData, filterDefinitions, filterSelectedValues, refreshKey]);

  useEffect(() => {
    setTableData([]);
    fetchData(page, pageSize, filterDefinitions, filterSelectedValues);
  }, [page, pageSize]);

  const tableColumns = useMemo(
    () => generateColumnsFn(filterDefinitions, filterSelectedValues, setFilterSelectedValues),
    [filterDefinitions, filterSelectedValues, setFilterSelectedValues],
  );

  const handlerResetDefaults = () => {
    setColumnVisibility(defaultColumnVisibility);
    setColumnSizing(defaultColumnSizing);
  };

  const handlerRefresh = () => {
    setTableData([]);
    fetchData(page, pageSize, filterDefinitions, filterSelectedValues);
  };

  const filteringState: ColumnFiltersState = useMemo(() => {
    const uniqueIds = new Set<string>();
    return filterSelectedValues
      .map((val) => val.key)
      .map((key) => filterToFieldMapping[key])
      .filter((id) => id !== undefined && !uniqueIds.has(id) && uniqueIds.add(id))
      .map((id) => ({ id: id as string, value: 'true' }));
  }, [filterToFieldMapping, filterSelectedValues]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title={title}
        zones={filterZones}
        selectedZone={zone}
        onZoneChanged={(newZone: string | null) => {
          if (newZone) setZone(newZone, { replace: true });
        }}
      />
      <Divider style={{ margin: '8px 0', backgroundColor: '#e0e0e0' }} />
      {isBackupEnabled === false && <BackupsDisabledBanner />}
      {!zone && isBackupEnabled && <ZoneRequiredFallback />}
      {!!zone && isBackupEnabled && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="abyssDataGridWrapperBoxContent">
          <DataGrid
            {...tableProps}
            data={tableData}
            columns={tableColumns}
            columnFilterDisplayMode={'popover'}
            renderRowActionMenuItems={actionMenuItems}
            positionActionsColumn="last"
            manualFiltering
            state={{
              isLoading: isLoading || isFulltextConfigLoading,
              columnVisibility: columnVisibility,
              columnSizing: columnSizing,
              columnFilters: filteringState,
              pagination: {
                pageIndex: page,
                pageSize: pageSize,
              },
            }}
            icons={{
              FilterIcon: (props: Icon.IconProps) => <FilterIcon content={props.style !== undefined} />,
            }}
            onColumnSizingChange={setColumnSizing}
            onColumnVisibilityChange={setColumnVisibility}
            enablePagination
            manualPagination
            paginationProps={{
              currentPage: page,
              showRowsPerPage: true,
              rowsPerPageOptions: [10, 25, 50, 100],
              totalPageCount: totalPages,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
              disabled: false,
            }}
            renderTopToolbar={({ table }) => {
              return (
                <ComplexFilter
                  definitions={filterDefinitions}
                  selections={filterSelectedValues}
                  onSelectionsChange={(newSelections: FilterSelections) => {
                    setFilterSelectedValues(newSelections, { replace: true, resetPage: true });
                  }}
                  filterButtonPosition={1}
                  actionButtons={[
                    <ToolbarButton key={'refresh-button'} onClick={handlerRefresh} icon={<Icon.Refresh />} tooltip={'Обновить'} />,
                    <ToolbarButton
                      key={'reset-defaults-button'}
                      onClick={handlerResetDefaults}
                      icon={<Icon.Clear />}
                      tooltip={'Сбросить настройки видимости и размера полей'}
                    />,
                    <ShowHideColumnsButton key={'show-hide-button'} table={table} />,
                    <ToggleFullScreenButton key={'full-screen-button'} table={table} />,
                  ]}
                />
              );
            }}
            renderEmptyRowsFallback={() => <EmptyDataFallback />}
          />
        </div>
      )}
    </div>
  );
};

import { useUnit } from 'effector-react';
import { FC, useState, useEffect, useMemo, useCallback } from 'react';

import { type ArchiveFilter, fetchArchivesCountFx, fetchArchivesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances, $archivesTotalCount } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $pagination, $tableView, resetPaginationPage, setPagination } from '@src/Features/TableView/model';

import { $appliedArchiveFilters } from '../FilterDrawer/model';

import { ArchivesDataTable } from './ArchivesDataTable';
import { archiveConfigurationColumns, archiveIndexColumns } from './columns';
import { useArchiveFiltersSync } from './useArchiveFiltersSync';

const ArchivesTable: FC = () => {
  useArchiveFiltersSync();

  const [tableView, pagination, setPaginationFn, resetPaginationPageFn, appliedFilters] = useUnit([
    $tableView,
    $pagination,
    setPagination,
    resetPaginationPage,
    $appliedArchiveFilters,
  ]);
  const [isArchivesLoading, fetchArchives, fetchArchivesCount, archiveInstanceData, archiveConfigsData, totalCount] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    fetchArchivesCountFx,
    $archiveInstances,
    $archiveConfigs,
    $archivesTotalCount,
  ]);

  const [searchValue, setSearchValue] = useState('');
  const searchQuery = searchValue.trim().toLowerCase();

  const filters = useMemo<ArchiveFilter[]>(() => {
    const result = [...appliedFilters];
    if (searchQuery) {
      result.push({ field: 'nameLike', op: 'like', values: [`%${searchQuery}%`] });
    }
    return result;
  }, [appliedFilters, searchQuery]);

  useEffect(() => {
    resetPaginationPageFn();
  }, [appliedFilters, resetPaginationPageFn]);

  const archiveInstanceTableData = useMemo(
    () => (searchQuery ? archiveInstanceData.filter((item) => item.configName.toLowerCase().includes(searchQuery)) : archiveInstanceData),
    [archiveInstanceData, searchQuery],
  );

  const archiveConfigTableData = useMemo(
    () => (searchQuery ? archiveConfigsData.filter((item) => item.configuration.toLowerCase().includes(searchQuery)) : archiveConfigsData),
    [archiveConfigsData, searchQuery],
  );

  const getRowCount = useCallback(
    (dataLength: number, filteredDataLength: number) => (searchQuery && dataLength !== filteredDataLength ? filteredDataLength : totalCount),
    [searchQuery, totalCount],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      resetPaginationPageFn();
    },
    [resetPaginationPageFn],
  );

  useEffect(() => {
    fetchArchivesCount({ filters });
  }, [fetchArchivesCount, filters]);

  useEffect(() => {
    fetchArchives({ pageNumber: pagination.pageIndex + 1, pageSize: pagination.pageSize, filters });
  }, [fetchArchives, filters, pagination.pageIndex, pagination.pageSize]);

  const handleDeleteSuccess = useCallback(() => {
    fetchArchivesCount({ filters });
    fetchArchives({ pageNumber: pagination.pageIndex + 1, pageSize: pagination.pageSize, filters });
  }, [fetchArchives, fetchArchivesCount, filters, pagination.pageIndex, pagination.pageSize]);

  const [tableKey] = useState(0);
  switch (tableView) {
    case SEGMENT_CONFIGURATIONS:
      return (
        <ArchivesDataTable
          // перемонтаж при смене вкладки: у вкладок разный набор колонок, а грид иначе тащит
          // внутреннее (неконтролируемое) состояние порядка колонок от предыдущего набора
          key={SEGMENT_CONFIGURATIONS}
          isLoading={isArchivesLoading}
          data={archiveConfigTableData}
          columns={archiveConfigurationColumns}
          tableKey={tableKey}
          showHideMenuId="archives-configuration-show-hide-menu"
          pagination={pagination}
          onPaginationChange={setPaginationFn}
          rowCount={getRowCount(archiveConfigsData.length, archiveConfigTableData.length)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onDeleteSuccess={handleDeleteSuccess}
        />
      );
    case SEGMENT_INSTANCES:
      return (
        <ArchivesDataTable
          key={SEGMENT_INSTANCES}
          isLoading={isArchivesLoading}
          data={archiveInstanceTableData}
          columns={archiveIndexColumns}
          tableKey={tableKey}
          showHideMenuId="archives-index-show-hide-menu"
          pagination={pagination}
          onPaginationChange={setPaginationFn}
          rowCount={getRowCount(archiveInstanceData.length, archiveInstanceTableData.length)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onDeleteSuccess={handleDeleteSuccess}
        />
      );
    default:
      return null;
  }
};

export default ArchivesTable;

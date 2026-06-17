import { DataGridPaginationState } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, useState, useEffect, useMemo, useCallback } from 'react';

import { type ArchiveFilter, fetchArchivesCountFx, fetchArchivesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances, $archivesTotalCount } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $rowId, $tableView } from '@src/Features/TableView/model';

import { ArchivesDataTable } from './ArchivesDataTable';
import { archiveConfigurationColumns, archiveIndexColumns } from './columns';

const ArchivesTable: FC = () => {
  const [tableView, rowId] = useUnit([$tableView, $rowId]);
  const [isArchivesLoading, fetchArchives, fetchArchivesCount, archiveInstanceData, archiveConfigsData, totalCount] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    fetchArchivesCountFx,
    $archiveInstances,
    $archiveConfigs,
    $archivesTotalCount,
  ]);

  const [pagination, setPagination] = useState<DataGridPaginationState>({ pageIndex: 0, pageSize: 20 });
  const [searchValue, setSearchValue] = useState('');
  const searchQuery = searchValue.trim().toLowerCase();

  const filters = useMemo<ArchiveFilter[]>(() => {
    return searchQuery ? [{ field: 'nameLike', op: 'like', values: [`%${searchQuery}%`] }] : [];
  }, [searchQuery]);

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

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  useEffect(() => {
    fetchArchivesCount({ filters });
  }, [fetchArchivesCount, filters]);

  useEffect(() => {
    fetchArchives({ pageNumber: pagination.pageIndex + 1, pageSize: pagination.pageSize, filters });
  }, [fetchArchives, filters, pagination.pageIndex, pagination.pageSize]);

  const instanceByRowId = useMemo(() => {
    if (!rowId) return null;

    const findInstanceByRowId = archiveConfigTableData.find((item) => {
      return Number(item.id) === Number(rowId);
    });

    if (!findInstanceByRowId) return null;

    return findInstanceByRowId.instances?.map((instance) => ({
      ...instance,
      configName: findInstanceByRowId.configuration,
      configVersion: instance.version,
      instanceStatus: instance.status.indexing.status,
      currentSizeBytes: instance.status.storage.currentSizeBytes,
      maxSizeBytes: instance.status.storage.maxSizeBytes,
      maxIndexSize: findInstanceByRowId.maxIndexSize,
      maxWriteSpeed: findInstanceByRowId.maxWriteSpeed,
      maxRetention: findInstanceByRowId.maxRetention,
    }));
  }, [archiveConfigTableData, rowId]);

  const [tableKey] = useState(0);

  switch (tableView) {
    case SEGMENT_CONFIGURATIONS:
      return (
        <ArchivesDataTable
          isLoading={isArchivesLoading}
          data={archiveConfigTableData}
          columns={archiveConfigurationColumns}
          tableKey={tableKey}
          showHideMenuId="archives-configuration-show-hide-menu"
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={getRowCount(archiveConfigsData.length, archiveConfigTableData.length)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
      );
    case SEGMENT_INSTANCES:
      return (
        <ArchivesDataTable
          isLoading={isArchivesLoading}
          data={instanceByRowId ?? archiveInstanceTableData}
          columns={archiveIndexColumns}
          tableKey={tableKey}
          showHideMenuId="archives-index-show-hide-menu"
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={getRowCount(archiveInstanceData.length, archiveInstanceTableData.length)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
      );
    default:
      return null;
  }
};

export default ArchivesTable;

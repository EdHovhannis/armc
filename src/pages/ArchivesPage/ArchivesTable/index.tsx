import { useUnit } from 'effector-react';
import { FC, useCallback, useState, useEffect } from 'react';
import { DataGridPaginationState } from '@sds-eng/data-grid';

import { DEFAULT_ARCHIVES_PAGE_SIZE, fetchArchivesFx, fetchArchivesPageCountFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances, $archivePageCount } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import { ArchivesDataTable } from './ArchivesDataTable';
import { archiveConfigurationColumns, archiveIndexColumns } from './columns';

const ArchivesTable: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tableView] = useUnit([$tableView]);
  const [isArchivesLoading, fetchArchives, fetchArchivesPageCount, archiveInstanceData, archiveConfigsData, archivePageCount] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    fetchArchivesPageCountFx,
    $archiveInstances,
    $archiveConfigs,
    $archivePageCount,
  ]);

  useEffect(() => {
    fetchArchivesPageCount();
  }, [fetchArchivesPageCount]);

  useEffect(() => {
    fetchArchives({ pageSize: DEFAULT_ARCHIVES_PAGE_SIZE, pageNumber: currentPage });
  }, [fetchArchives, currentPage]);

  useEffect(() => {
    if (currentPage > archivePageCount) {
      setCurrentPage(archivePageCount);
    }
  }, [archivePageCount, currentPage]);

  const [tableKey] = useState(0);

  const paginationState: DataGridPaginationState = {
    pageIndex: currentPage - 1,
    pageSize: DEFAULT_ARCHIVES_PAGE_SIZE,
  };

  const handlePaginationChange = useCallback(
    (updater: DataGridPaginationState | ((old: DataGridPaginationState) => DataGridPaginationState)) => {
      const nextPagination = typeof updater === 'function' ? updater(paginationState) : updater;
      const nextPage = nextPagination.pageIndex + 1;

      if (nextPage !== currentPage) {
        setCurrentPage(Math.min(Math.max(nextPage, 1), archivePageCount));
      }
    },
    [archivePageCount, currentPage, paginationState],
  );

  switch (tableView) {
    case SEGMENT_INSTANCES:
      return (
        <ArchivesDataTable
          isLoading={isArchivesLoading}
          data={archiveInstanceData}
          columns={archiveIndexColumns}
          tableKey={tableKey}
          pageCount={archivePageCount}
          paginationState={paginationState}
          onPaginationChange={handlePaginationChange}
          showHideMenuId="archives-index-show-hide-menu"
        />
      );
    case SEGMENT_CONFIGURATIONS:
      return (
        <ArchivesDataTable
          isLoading={isArchivesLoading}
          data={archiveConfigsData}
          columns={archiveConfigurationColumns}
          tableKey={tableKey}
          pageCount={archivePageCount}
          paginationState={paginationState}
          onPaginationChange={handlePaginationChange}
          showHideMenuId="archives-configuration-show-hide-menu"
        />
      );
    default:
      return null;
  }
};

export default ArchivesTable;

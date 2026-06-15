import { DataGridPaginationState } from '@sds-eng/data-grid';
import { useUnit } from 'effector-react';
import { FC, useState, useEffect } from 'react';

import { fetchArchivesCountFx, fetchArchivesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances, $archivesTotalCount } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import { ArchivesDataTable } from './ArchivesDataTable';
import { archiveConfigurationColumns, archiveIndexColumns } from './columns';

const ArchivesTable: FC = () => {
  const [tableView] = useUnit([$tableView]);
  const [isArchivesLoading, fetchArchives, fetchArchivesCount, archiveInstanceData, archiveConfigsData, totalCount] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    fetchArchivesCountFx,
    $archiveInstances,
    $archiveConfigs,
    $archivesTotalCount,
  ]);

  const [pagination, setPagination] = useState<DataGridPaginationState>({ pageIndex: 0, pageSize: 20 });

  useEffect(() => {
    fetchArchivesCount();
  }, [fetchArchivesCount]);

  useEffect(() => {
    fetchArchives({ pageNumber: pagination.pageIndex + 1, pageSize: pagination.pageSize });
  }, [fetchArchives, pagination.pageIndex, pagination.pageSize]);

  const [tableKey] = useState(0);

  switch (tableView) {
    case SEGMENT_INSTANCES:
      return (
        <ArchivesDataTable
          isLoading={isArchivesLoading}
          data={archiveInstanceData}
          columns={archiveIndexColumns}
          tableKey={tableKey}
          showHideMenuId="archives-index-show-hide-menu"
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={totalCount}
        />
      );
    case SEGMENT_CONFIGURATIONS:
      return (
        <ArchivesDataTable
          isLoading={isArchivesLoading}
          data={archiveConfigsData}
          columns={archiveConfigurationColumns}
          tableKey={tableKey}
          showHideMenuId="archives-configuration-show-hide-menu"
          pagination={pagination}
          onPaginationChange={setPagination}
          rowCount={totalCount}
        />
      );
    default:
      return null;
  }
};

export default ArchivesTable;

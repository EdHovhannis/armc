import { useUnit } from 'effector-react';
import { FC, useState, useEffect } from 'react';

import { fetchArchivesFx } from '@src/Entities/Archives/api';
import { $archiveConfigs, $archiveInstances } from '@src/Entities/Archives/model';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import { ArchivesDataTable } from './ArchivesDataTable';
import { archiveConfigurationColumns, archiveIndexColumns } from './columns';

const ArchivesTable: FC = () => {
  const [tableView] = useUnit([$tableView]);
  const [isArchivesLoading, fetchArchives, archiveInstanceData, archiveConfigsData] = useUnit([
    fetchArchivesFx.pending,
    fetchArchivesFx,
    $archiveInstances,
    $archiveConfigs,
  ]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

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
        />
      );
    default:
      return null;
  }
};

export default ArchivesTable;

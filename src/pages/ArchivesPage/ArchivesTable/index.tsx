import { useUnit } from 'effector-react';
import { FC, useMemo, useState } from 'react';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import { archiveConfigurationsMock } from '../mock/archiveConfigurations';
import { archiveIndexesMock } from '../mock/archiveIndexes';

import { ArchivesDataTable } from './ArchivesDataTable';
import { archiveConfigurationColumns, archiveIndexColumns } from './columns';

const ArchivesTable: FC = () => {
  const [tableView] = useUnit([$tableView]);
  const [tableKey] = useState(0);

  const instancesData = useMemo(() => archiveIndexesMock, []);
  const configurationsData = useMemo(() => archiveConfigurationsMock, []);

  switch (tableView) {
    case SEGMENT_INSTANCES:
      return (
        <ArchivesDataTable
          data={instancesData}
          columns={archiveIndexColumns}
          tableKey={tableKey}
          showHideMenuId="archives-index-show-hide-menu"
        />
      );
    case SEGMENT_CONFIGURATIONS:
      return (
        <ArchivesDataTable
          data={configurationsData}
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

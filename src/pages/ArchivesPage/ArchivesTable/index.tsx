import { useUnit } from 'effector-react';
import { FC, useMemo, useState } from 'react';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView } from '@src/Features/TableView/model';

import { archiveConfigurationsMock } from '../mock/archiveConfigurations';
import { archiveIndexesMock } from '../mock/archiveIndexes';

import { ArchiveConfigurationTable } from './ArchiveConfigurationTable';
import { ArchivesInstanceTable } from './ArchivesInstanceTable';

const ArchivesTable: FC = () => {
  const [tableView] = useUnit([$tableView]);
  const [tableKey] = useState(0);

  const instancesData = useMemo(() => archiveIndexesMock, []);
  const configurationsData = useMemo(() => archiveConfigurationsMock, []);

  switch (tableView) {
    case SEGMENT_INSTANCES:
      return <ArchivesInstanceTable data={instancesData} tableKey={tableKey} />;
    case SEGMENT_CONFIGURATIONS:
      return <ArchiveConfigurationTable data={configurationsData} tableKey={tableKey} />;
    default:
      return null;
  }
};

export default ArchivesTable;

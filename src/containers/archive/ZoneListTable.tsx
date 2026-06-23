import { Grid, Paper } from '@material-ui/core';
import * as React from 'react';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ShortArchiveTaskWithRole } from '../../store/archive/Actions';
import { User } from '../../store/auth/Types';

import ArchiveZoneInstancesTable from './ArchiveZoneInstancesTable';

interface ZoneListTableProps {
  listOfArchives: ShortArchiveTaskWithRole[];
  filter: FilterMenuItem[] | undefined;
  user: User;
  page: number;
}

const ZoneListTable: React.FC<ZoneListTableProps> = ({ listOfArchives, filter, user, page }) => {
  const archiveTaskInstancesIds: string[] = [];
  listOfArchives.forEach((archiveTask) => {
    archiveTaskInstancesIds.push(...archiveTask.instancesIds);
  });

  return (
    <Grid
      item
      style={{
        width: '90%',
        alignSelf: 'center',
        padding: 6,
        marginTop: -6,
        paddingTop: 0,
      }}
    >
      <Paper elevation={1}>
        <ArchiveZoneInstancesTable
          archiveTaskInstancesIds={archiveTaskInstancesIds}
          tasks={listOfArchives}
          filter={Array.isArray(filter) ? filter[filter?.length - 1] : undefined}
          isAdmin={user.admin}
          page={page}
        />
      </Paper>
    </Grid>
  );
};

export default ZoneListTable;

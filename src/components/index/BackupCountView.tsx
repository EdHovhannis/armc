import { Link, Typography } from '@material-ui/core';
import * as React from 'react';
import { Link as RouterLink } from 'react-router';

import { BACKUPS_PAGE } from '../backups/utils';
import { IS_SAVEPOINTS_FEATURE_ENABLED } from '../shared/constants';

interface BackupCountViewProps {
  name: string;
  project: string;
  zone: string;
  backupCount: number;
  savepointCount: number;
}

const BackupCountView: React.FC<BackupCountViewProps> = ({ name, project, zone, backupCount, savepointCount }) => (
  <>
    <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
      <b>Резервные копии</b>:{' '}
      <RouterLink to={`${BACKUPS_PAGE.list}?indexFilter=${name}&projectFilter=${project}&zone=${zone}`} component={Link}>
        {backupCount}
      </RouterLink>
    </Typography>
    {IS_SAVEPOINTS_FEATURE_ENABLED && (
      <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
        <b>Контрольные точки</b>:{' '}
        <RouterLink to={`${BACKUPS_PAGE.savepoints}?index=${name}&project=${project}&zone=${zone}`} component={Link}>
          {savepointCount}
        </RouterLink>
      </Typography>
    )}
  </>
);

export default BackupCountView;

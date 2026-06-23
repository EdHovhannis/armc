import { Typography } from '@material-ui/core';
import { IBackupsFilter } from '@src/components/backups/types';
import * as React from 'react';

interface EmptyDataProps {
  filter: IBackupsFilter | null;
}

export const LegacyEmptyData: React.FC<EmptyDataProps> = ({ filter }) => {
  const requiredFilterEmpty = !filter?.projectShortName || !filter?.taskName || !filter?.zoneId;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {!requiredFilterEmpty && <Typography variant="h6">Нет данных для отображения</Typography>}
      {requiredFilterEmpty && <Typography variant="h6">Пожалуйста, выберите проект, задачу и зону для отображения данных.</Typography>}
    </div>
  );
};

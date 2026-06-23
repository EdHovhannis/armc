import { Paper } from '@material-ui/core';
import { PageTitle } from '@src/components/backups/LegacyFilter/PageTitle';
import { FulltextTask } from '@src/store/index/Types';
import * as React from 'react';

import { Filter } from '../../LegacyFilter';
import { IBackupsFilter } from '../../types';
import { indexListToFilter } from '../../utils';

import { HistoryTable } from './HistoryTable';
import { RecoveryTable } from './RecoveryTable';

interface IBackupsSavepoints {
  indexesList: FulltextTask[];
  displaySuccess(message: string): void;
  displayError(error: string): void;
}

export const Savepoints: React.FC<IBackupsSavepoints> = ({ indexesList, displaySuccess, displayError }: IBackupsSavepoints) => {
  const [filter, setFilter] = React.useState<IBackupsFilter | null>(null);
  const [resetKey, setResetKey] = React.useState(0);

  const { filterProjects, filterIndexes, filterZones } = indexListToFilter(indexesList);

  const resetData = () => {
    setResetKey((prev) => prev + 1);
  };

  const applyFilterHandler = (newFilter: IBackupsFilter) => {
    resetData();
    setFilter(newFilter);
  };

  return (
    <>
      <PageTitle title="Задачи восстановления (savepoint)" />
      <Paper style={{ width: '100%' }}>
        <Filter
          filter={filter}
          indexes={filterIndexes}
          projects={filterProjects}
          zones={filterZones}
          filterHandler={applyFilterHandler}
          displayError={displayError}
        />
        <RecoveryTable filter={filter} displaySuccess={displaySuccess} displayError={displayError} key={`recovery-${resetKey}`} />
        <HistoryTable
          filter={filter}
          setFilter={setFilter}
          displaySuccess={displaySuccess}
          displayError={displayError}
          style={{ marginTop: 50 }}
          key={`history-${resetKey}`}
        />
      </Paper>
    </>
  );
};

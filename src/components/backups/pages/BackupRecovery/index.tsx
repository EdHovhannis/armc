import { GenericBackupsTable } from '@src/components/backups/GenericBackupsTable';
import { useBackupRecoveryFilterDefinitions } from '@src/components/backups/hooks/useBackupRecoveryFilterDefinitions';
import { useZoneParam } from '@src/components/backups/hooks/useZoneParam';
import { FulltextTask } from '@src/store/index/Types';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import BackupsService, { BACKUPS_PATH } from '../../../../services/BackupsService';
import { InfoDialog } from '../../InfoDialog';
import { IIndexRestore } from '../../types';
import { indexListToFilter, renderRowActionMenuItems, taskStatusIsInProgress } from '../../utils';

import { getColumns, RECOVERY_DEFAULT_COLUMN_SIZES, RECOVERY_DEFAULT_VISIBILITY, RECOVERY_FILTER_MAPPING } from './columns';

interface IBackupsTasks {
  indexesList: FulltextTask[];

  displaySuccess(message: string): void;

  displayError(error: string): void;
}

export const BackupRecovery: React.FC<IBackupsTasks> = ({ indexesList, displaySuccess, displayError }: IBackupsTasks) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirm, setConfirm] = React.useState(false);
  const [rowData, setRowData] = React.useState<IIndexRestore | null>(null);
  const { filterProjects, filterIndexes, filterZones } = useMemo(() => indexListToFilter(indexesList), [indexesList]);

  const { zone, setZone } = useZoneParam();

  useEffect(() => {
    if (!zone && filterZones.length === 1 && !!filterZones[0]) {
      setZone(filterZones[0], { replace: true });
    }
  }, [zone, filterZones, setZone]);

  const filterDefinitions = useBackupRecoveryFilterDefinitions(filterProjects, filterIndexes, zone, (msg) => displayError(msg));

  const confirmDialogHandler = () => {
    if (rowData) {
      const path = `${BACKUPS_PATH.backupRecovery}/project/${rowData?.projectShortName}/task/${rowData?.taskName}/zone/${rowData?.zoneId}/collection/${rowData?.collectionName}/id/${rowData?.id}`;
      BackupsService.requestDelete(
        path,
        () => {
          setRefreshKey((prev) => prev + 1);
          displaySuccess('Запись истории восстановления успешно удалена');
        },
        (message: string) => displayError(`Ошибка при удалении ${message}`),
      );
    }
    setConfirm(false);
  };

  const actionMenuItems = (row: any) => [
    {
      label: 'Удалить',
      visible: !taskStatusIsInProgress(row.original.status),
      onClick: () => {
        setConfirm(true);
        setRowData(row.original);
      },
    },
  ];

  return (
    <>
      <GenericBackupsTable
        localStorageVisibilityKey={'backupRecoveryColumnVisibility'}
        localStorageSizingKey={'backupRecoveryColumnSizing'}
        displayError={displayError}
        title={'Задачи восстановления'}
        endpoint={BACKUPS_PATH.backupRecovery}
        filterZones={filterZones}
        filterDefinitions={filterDefinitions}
        generateColumnsFn={getColumns()}
        actionMenuItems={renderRowActionMenuItems(actionMenuItems)}
        defaultColumnVisibility={RECOVERY_DEFAULT_VISIBILITY}
        defaultColumnSizing={RECOVERY_DEFAULT_COLUMN_SIZES}
        filterToFieldMapping={RECOVERY_FILTER_MAPPING}
        refreshKey={refreshKey}
      />
      <InfoDialog
        open={!!confirm}
        message="Вы уверены что хотите запись истории восстановления?"
        onClose={() => setConfirm(false)}
        onConfirm={confirmDialogHandler}
      />
    </>
  );
};

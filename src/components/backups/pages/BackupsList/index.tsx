import { GenericBackupsTable } from '@src/components/backups/GenericBackupsTable';
import { useBackupListFilterDefinitions } from '@src/components/backups/hooks/useBackupListFilterDefinitions';
import { useZoneParam } from '@src/components/backups/hooks/useZoneParam';
import BackupsService, { BACKUPS_PATH } from '@src/services/BackupsService';
import type { FulltextTask } from '@src/store/index/Types';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { InfoDialog } from '../../InfoDialog';
import { IBackupsFilter, IIndexBackup } from '../../types';
import { BACKUPS_PAGE, getRedirectPath, indexListToFilter, renderRowActionMenuItems, taskStatusIsInProgress } from '../../utils';

import { BACKUP_DEFAULT_COLUMN_SIZES, BACKUP_DEFAULT_VISIBILITY, BACKUP_FILTER_MAPPING, getColumns } from './columns';

interface IBackupsList {
  indexesList: FulltextTask[];

  displaySuccess(message: string): void;

  displayError(error: string): void;
}

export const BackupsList: React.FC<IBackupsList> = ({ indexesList, displaySuccess, displayError }: IBackupsList) => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirm, setConfirm] = React.useState<false | 'RESTORE' | 'DELETE'>(false);
  const [rowData, setRowData] = React.useState<IIndexBackup | null>(null);
  const { filterProjects, filterIndexes, filterZones } = useMemo(() => indexListToFilter(indexesList), [indexesList]);

  const { zone, setZone } = useZoneParam();

  useEffect(() => {
    if (!zone && filterZones.length === 1 && !!filterZones[0]) {
      setZone(filterZones[0], { replace: true });
    }
  }, [zone, filterZones, setZone]);

  const filterDefinitions = useBackupListFilterDefinitions(filterProjects, filterIndexes, zone, (msg) => displayError(msg));

  const confirmDialogHandler = () => {
    if (rowData) {
      if (confirm === 'RESTORE') {
        BackupsService.requestPost(
          BACKUPS_PATH.backupRecovery,
          rowData as IIndexBackup,
          {
            backupName: rowData?.backupName,
            collectionName: rowData?.collectionName,
          },
          (result) => {
            if (result) {
              displaySuccess('Восстановление коллекции запущено');
              const redirectData: IBackupsFilter = {
                projectShortName: rowData?.projectShortName ?? '',
                taskName: rowData?.taskName ?? '',
                zoneId: rowData?.zoneId ?? '',
                collection: rowData?.collectionName ?? '',
              };
              navigate(getRedirectPath(BACKUPS_PAGE.tasks, redirectData));
            } else {
              displayError('Не удалось восстановить резервную копию');
            }
          },
          (message: string) => {
            displayError(`Ошибка при восстановлении ${message}`);
          },
        );
      }
      if (confirm === 'DELETE') {
        const path = `${BACKUPS_PATH.backup}/project/${rowData?.projectShortName}/task/${rowData?.taskName}/zone/${rowData?.zoneId}/collection/${rowData?.collectionName}/name/${rowData?.backupName}`;
        BackupsService.requestDelete(
          path,
          () => {
            setRefreshKey((prev) => prev + 1);
            displaySuccess('Резервная копия успешно удалена');
          },
          (message: string) => displayError(`Ошибка при удалении ${message}`),
        );
      }
    }
    setConfirm(false);
  };

  const getConfirmDialogMessage = () => {
    switch (confirm) {
      case 'RESTORE':
        return (
          <>
            Вы уверены что хотите восстановить коллекцию <strong>{rowData?.collectionName ?? ''}</strong> с резервной копии{' '}
            <strong>{rowData?.backupName ?? ''}</strong>?
          </>
        );
      case 'DELETE':
        return `Вы уверены что хотите удалить резервную копию?`;
      default:
        return '';
    }
  };

  const actionMenuItems = (row: any) => [
    {
      label: 'Восстановить',
      visible: row.original.status === 'DONE',
      onClick: () => {
        setConfirm('RESTORE');
        setRowData(row.original);
      },
    },
    {
      label: 'Удалить',
      visible: !taskStatusIsInProgress(row.original.status),
      onClick: () => {
        setConfirm('DELETE');
        setRowData(row.original);
      },
    },
  ];

  return (
    <>
      <GenericBackupsTable
        localStorageVisibilityKey={'backupListColumnVisibility'}
        localStorageSizingKey={'backupListColumnSizing'}
        displayError={displayError}
        title={'Резервные копии'}
        endpoint={BACKUPS_PATH.backup}
        filterZones={filterZones}
        filterDefinitions={filterDefinitions}
        generateColumnsFn={getColumns(displaySuccess, displayError)}
        actionMenuItems={renderRowActionMenuItems(actionMenuItems)}
        defaultColumnVisibility={BACKUP_DEFAULT_VISIBILITY}
        defaultColumnSizing={BACKUP_DEFAULT_COLUMN_SIZES}
        filterToFieldMapping={BACKUP_FILTER_MAPPING}
        refreshKey={refreshKey}
      />
      <InfoDialog open={!!confirm} message={getConfirmDialogMessage()} onClose={() => setConfirm(false)} onConfirm={confirmDialogHandler} />
    </>
  );
};

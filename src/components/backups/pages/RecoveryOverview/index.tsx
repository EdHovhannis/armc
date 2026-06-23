import { GenericBackupsTable } from '@src/components/backups/GenericBackupsTable';
import { useBackupControlFilterDefinitions } from '@src/components/backups/hooks/useBackupControlFilterDefinitions';
import { useZoneParam } from '@src/components/backups/hooks/useZoneParam';
import { FulltextTask } from '@src/store/index/Types';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import BackupsService, { BACKUPS_PATH } from '../../../../services/BackupsService';
import IndexQueryService from '../../../../services/IndexQueryService';
import { IS_SAVEPOINTS_FEATURE_ENABLED } from '../../../shared/constants';
import { InfoDialog } from '../../InfoDialog';
import { IBackupsFilter, IIndexRecovery } from '../../types';
import { BACKUPS_PAGE, getRedirectPath, indexListToFilter, renderRowActionMenuItems } from '../../utils';

import {
  getColumns,
  RECOVERY_OVERVIEW_DEFAULT_COLUMN_SIZES,
  RECOVERY_OVERVIEW_DEFAULT_VISIBILITY,
  RECOVERY_OVERVIEW_FILTER_MAPPING,
} from './columns';

interface IBackupsControl {
  indexesList: FulltextTask[];

  displaySuccess(message: string): void;

  displayError(error: string): void;
}

type ConfirmType = 'ROTATE' | 'BACKUP' | false;
type RedirectType = 'SAVEPOINT' | 'BACKUP' | 'LIST';

export const RecoveryOverview: React.FC<IBackupsControl> = ({ indexesList, displaySuccess, displayError }: IBackupsControl) => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirm, setConfirm] = React.useState<ConfirmType>(false);
  const [rowData, setRowData] = React.useState<IIndexRecovery | null>(null);
  const { filterProjects, filterIndexes, filterZones } = useMemo(() => indexListToFilter(indexesList), [indexesList]);

  const { zone, setZone } = useZoneParam();

  useEffect(() => {
    if (!zone && filterZones.length === 1 && !!filterZones[0]) {
      setZone(filterZones[0], { replace: true });
    }
  }, [zone, filterZones, setZone]);

  const filterDefinitions = useBackupControlFilterDefinitions(filterProjects, filterIndexes, zone, (msg) => displayError(msg));

  const getConfirmDialogMessage = () => {
    switch (confirm) {
      case 'ROTATE':
        return 'Вы уверены что хотите ротировать коллекцию?';
      case 'BACKUP':
        return 'Вы уверены что хотите создать резервную копию?';
      default:
        return '';
    }
  };

  const confirmDialogHandler = () => {
    if (rowData) {
      if (confirm === 'ROTATE') {
        IndexQueryService.forceRotateIndex(
          rowData.projectShortName,
          rowData.taskName,
          rowData.zoneId,
          (result) => {
            if (result === 'ok') {
              setRefreshKey((prev) => prev + 1);
              displaySuccess('Коллекция успешно ротирована');
            } else {
              displayError('Произошла ошибка');
            }
          },
          (message) => displayError(`Произошла ошибка ${message}`),
        );
      }
      if (confirm === 'BACKUP') {
        BackupsService.requestPost(
          BACKUPS_PATH.backup,
          rowData as IBackupsFilter,
          {
            collectionName: rowData?.collectionName,
          },
          (result) => {
            if (result) {
              setRefreshKey((prev) => prev + 1);
              displaySuccess('Создание резервной копии запущено');
            } else {
              displayError('Не удалось создать резервную копию');
            }
          },
          (message: string) => {
            displayError(`Ошибка при создании ${message}`);
          },
        );
      }
    }
    setConfirm(false);
  };

  const redirectHandler = (type: RedirectType, data: IIndexRecovery) => {
    let corePath = '';
    if (type === 'BACKUP') {
      corePath = `${BACKUPS_PAGE.list}`;
    } else if (type === 'SAVEPOINT') {
      corePath = `${BACKUPS_PAGE.savepoints}`;
    } else if (type === 'LIST') {
      corePath = `${BACKUPS_PAGE.list}`;
    }
    if (corePath) {
      navigate(getRedirectPath(corePath, data));
    }
  };

  const actionMenuItems = (row: any) => [
    {
      label: 'Ротировать',
      visible: row.original.isHot,
      onClick: () => {
        setConfirm('ROTATE');
        setRowData(row.original);
      },
    },
    {
      label: 'Создать резервную копию',
      visible: !row.original.isHot,
      onClick: () => {
        setConfirm('BACKUP');
        setRowData(row.original);
      },
    },
    {
      label: 'Восстановить с savepoint',
      visible: IS_SAVEPOINTS_FEATURE_ENABLED && row.original.canRestoreFromSavepoint,
      onClick: () => redirectHandler('SAVEPOINT', row.original),
    },
    {
      label: 'Восстановить с резервной копии',
      visible: row.original.canRestoreFromBackup,
      onClick: () => redirectHandler('BACKUP', { ...row.original, collection: row.original.collectionName }),
    },
  ];
  return (
    <>
      <GenericBackupsTable
        localStorageVisibilityKey={'recoveryOverviewColumnVisibility'}
        localStorageSizingKey={'recoveryOverviewColumnSizing'}
        displayError={displayError}
        title={'Восстановление'}
        endpoint={BACKUPS_PATH.recoveryOverview}
        filterZones={filterZones}
        filterDefinitions={filterDefinitions}
        generateColumnsFn={getColumns(redirectHandler)}
        actionMenuItems={renderRowActionMenuItems(actionMenuItems)}
        defaultColumnVisibility={RECOVERY_OVERVIEW_DEFAULT_VISIBILITY}
        defaultColumnSizing={RECOVERY_OVERVIEW_DEFAULT_COLUMN_SIZES}
        filterToFieldMapping={RECOVERY_OVERVIEW_FILTER_MAPPING}
        refreshKey={refreshKey}
      />
      <InfoDialog open={!!confirm} message={getConfirmDialogMessage()} onClose={() => setConfirm(false)} onConfirm={confirmDialogHandler} />
    </>
  );
};

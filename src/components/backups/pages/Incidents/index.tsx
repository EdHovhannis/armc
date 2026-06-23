import { GenericBackupsTable } from '@src/components/backups/GenericBackupsTable';
import { useIncidentFilterDefinitions } from '@src/components/backups/hooks/useIncidentFilterDefinitions';
import { useZoneParam } from '@src/components/backups/hooks/useZoneParam';
import { FulltextTask } from '@src/store/index/Types';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import BackupsService, { BACKUPS_PATH } from '../../../../services/BackupsService';
import { IS_SAVEPOINTS_FEATURE_ENABLED } from '../../../shared/constants';
import { InfoDialog } from '../../InfoDialog';
import { IBackupsIncident, IIndexRecovery } from '../../types';
import { BACKUPS_PAGE, getRedirectPath, indexListToFilter, renderRowActionMenuItems } from '../../utils';

import { getColumns, INCIDENTS_DEFAULT_COLUMN_SIZES, INCIDENTS_DEFAULT_VISIBILITY, INCIDENTS_FILTER_MAPPING } from './columns';

interface IBackupsIncidents {
  indexesList: FulltextTask[];

  displaySuccess(message: string): void;

  displayError(error: string): void;
}

type ConfirmType = 'DECIDE' | 'DELETE' | false;
type RedirectType = 'SAVEPOINT' | 'BACKUP';
export const Incidents: React.FC<IBackupsIncidents> = ({ indexesList, displaySuccess, displayError }: IBackupsIncidents) => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirm, setConfirm] = React.useState<ConfirmType>(false);
  const [rowData, setRowData] = React.useState<IBackupsIncident | null>(null);
  const [errorModal, setErrorModal] = React.useState<string | false>(false);
  const { filterProjects, filterIndexes, filterZones } = useMemo(() => indexListToFilter(indexesList), [indexesList]);

  const { zone, setZone } = useZoneParam();

  useEffect(() => {
    if (!zone && filterZones.length === 1 && !!filterZones[0]) {
      setZone(filterZones[0], { replace: true });
    }
  }, [zone, filterZones, setZone]);

  const filterDefinitions = useIncidentFilterDefinitions(filterProjects, filterIndexes, zone, (msg) => displayError(msg));

  const getConfirmDialogMessage = () => {
    switch (confirm) {
      case 'DECIDE':
        return 'Вы уверены что хотите решить инцидент?';
      case 'DELETE':
        return 'Вы уверены что хотите удалить инцидент?';
      default:
        return '';
    }
  };

  const confirmDialogHandler = () => {
    if (rowData) {
      if (confirm === 'DECIDE') {
        const path = `${BACKUPS_PATH.incidents}/id/${rowData?.id}`;
        BackupsService.requestPut(
          path,
          { finished: true },
          () => {
            setRefreshKey((prev) => prev + 1);
            displaySuccess('Инцидент успешно решен');
          },
          (message: string) => displayError(`Ошибка ${message}`),
        );
      }
      if (confirm === 'DELETE') {
        const path = `${BACKUPS_PATH.incidents}/id/${rowData?.id}`;
        BackupsService.requestDelete(
          path,
          () => {
            setRefreshKey((prev) => prev + 1);
            displaySuccess('Инцидент успешно удален');
          },
          (message: string) => displayError(`Ошибка при удалении ${message}`),
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
    }
    if (corePath) {
      navigate(getRedirectPath(corePath, data));
    }
  };

  const actionMenuItems = (row: any) => [
    {
      key: 'BACKUP',
      label: 'Восстановление с резервной копии',
      visible: true,
      onClick: () => {
        redirectHandler('BACKUP', { ...row.original, collection: row.original.collectionName });
      },
    },
    {
      label: 'Восстановление с контрольной точки',
      visible: IS_SAVEPOINTS_FEATURE_ENABLED,
      onClick: () => {
        redirectHandler('SAVEPOINT', { ...row.original, collection: row.original.collectionName });
      },
    },
    {
      label: 'Перевести в "Решен" принудительно',
      visible: !row.original.finished,
      onClick: () => {
        setConfirm('DECIDE');
        setRowData(row.original);
      },
    },
    {
      label: 'Удалить',
      visible: row.original.finished,
      onClick: () => {
        setConfirm('DELETE');
        setRowData(row.original);
      },
    },
  ];

  const showErrorModal = (error: string) => setErrorModal(error);

  const saveError = (error: string, fileName: string) => {
    const blob = new Blob([error], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `${fileName}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <GenericBackupsTable
        localStorageVisibilityKey={'incidentsColumnVisibility'}
        localStorageSizingKey={'incidentsColumnSizing'}
        refreshKey={refreshKey}
        displayError={displayError}
        title={'Инциденты'}
        endpoint={BACKUPS_PATH.incidents}
        filterZones={filterZones}
        filterDefinitions={filterDefinitions}
        generateColumnsFn={getColumns(showErrorModal, saveError)}
        defaultColumnVisibility={INCIDENTS_DEFAULT_VISIBILITY}
        defaultColumnSizing={INCIDENTS_DEFAULT_COLUMN_SIZES}
        filterToFieldMapping={INCIDENTS_FILTER_MAPPING}
        actionMenuItems={renderRowActionMenuItems(actionMenuItems)}
      />
      <InfoDialog open={!!confirm} message={getConfirmDialogMessage()} onClose={() => setConfirm(false)} onConfirm={confirmDialogHandler} />
      <InfoDialog hideCancelButton open={!!errorModal} message={errorModal} confirmButtonText="Закрыть" onConfirm={() => setErrorModal(false)} />
    </>
  );
};

import { DataGrid } from '@sds-eng/data-grid';
import { LegacyEmptyData } from '@src/components/backups/LegacyFilter/LegacyEmptyData';
import { PageTitle } from '@src/components/backups/LegacyFilter/PageTitle';
import * as React from 'react';

import BackupsService, { BACKUPS_PATH } from '../../../../services/BackupsService';
import { DetailsDialog } from '../../DetailsDialog';
import { InfoDialog } from '../../InfoDialog';
import { Pagination } from '../../Pagination';
import { IBackupsFilter, IListBackups, ISavepointIndex } from '../../types';
import { renderRowActionMenuItems } from '../../utils';

import { columnsIndex } from './columns';

const tableProps = {
  enableRowActions: true,
  enableColumnResizing: false,
  enableRowVirtualization: true,
  enableSorting: false,
  enableTopToolbar: false,
  enableBottomToolbar: false,
  enablePagination: false,
  enableColumnActions: false,
};

interface IRecoveryTable {
  filter: IBackupsFilter | null;
  displaySuccess(message: string): void;
  displayError(error: string): void;
}

type ConfirmType = 'RESTORE' | 'DELETE' | false;

const PAGE_SIZE = 10;

export const RecoveryTable: React.FC<IRecoveryTable> = ({ filter, displaySuccess, displayError }: IRecoveryTable) => {
  const [tableData, setTableData] = React.useState<ISavepointIndex[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [modal, setModal] = React.useState<any>(false);
  const [confirm, setConfirm] = React.useState<ConfirmType>(false);
  const [rowData, setRowData] = React.useState<ISavepointIndex | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const resetData = () => {
    setTableData([]);
    setPage(1);
    setTotalPages(0);
  };

  React.useEffect(() => {
    if (filter?.projectShortName && filter?.taskName && filter?.zoneId) {
      setIsLoading(true);
      BackupsService.requestGet(
        BACKUPS_PATH.savepoint,
        { ...filter, page, pageSize: PAGE_SIZE },
        (data: IListBackups | null) => {
          if (data?.items) {
            const items = data.items as ISavepointIndex[];
            setTableData(items);
            setTotalPages(data.totalPages);
          }
        },
        (message: string) => displayError(`Ошибка при получении данных ${message}`),
      ).finally(() => setIsLoading(false));
    }
  }, [filter, page]);

  const getConfirmDialogMessage = () => {
    switch (confirm) {
      case 'RESTORE':
        return 'Вы уверены что хотите восстановить с savepoint?';
      case 'DELETE':
        return 'Вы уверены что хотите удалить savepoint?';
      default:
        return '';
    }
  };

  const confirmDialogHandler = () => {
    if (!filter || !rowData) return;
    if (rowData) {
      if (confirm === 'RESTORE') {
        BackupsService.requestPost(
          BACKUPS_PATH.savepointRecovery,
          rowData as ISavepointIndex,
          {
            collectionName: rowData?.collectionName,
            savepointName: rowData?.savepointName,
          },
          (result) => {
            if (result) {
              resetData();
              displaySuccess('Задача восстановления индекса из контрольной точки запущена');
            } else {
              displayError('Не удалось запустить задачу восстановления индекса из контрольной точки');
            }
          },
          (message: string) => {
            displayError(`Ошибка при восстановлении ${message}`);
          },
        );
      }
      if (confirm === 'DELETE') {
        const path = `${BACKUPS_PATH.savepoint}/project/${rowData?.projectShortName}/task/${rowData?.taskName}/zone/${rowData?.zoneId}/collection/${rowData?.collectionName}/savepoint/${rowData?.savepointName}`;
        BackupsService.requestDelete(
          path,
          () => {
            resetData();
            displaySuccess('Точка восстановления удалена');
          },
          (message: string) => displayError(`Ошибка при удалении ${message}`),
        );
      }
    }
    setConfirm(false);
  };

  const isEmpty = tableData.length === 0 && !isLoading;

  const actionMenuItems = (row: any) => [
    {
      label: 'Детали',
      visible: true,
      onClick: () => setModal(row.original),
    },
    {
      label: 'Восстановить',
      visible: true,
      onClick: () => {
        setConfirm('RESTORE');
        setRowData(row.original);
      },
    },
    {
      label: 'Удалить',
      visible: true,
      onClick: () => {
        setConfirm('DELETE');
        setRowData(row.original);
      },
    },
  ];

  return (
    <>
      {!isEmpty && <PageTitle title="Точки восстановления для индекса" variant="h5" />}
      {isEmpty && !isLoading && <LegacyEmptyData filter={filter} />}
      {!isEmpty && (
        <>
          <div className="abyssDataGridWrapperBoxContent">
            <DataGrid
              {...tableProps}
              data={tableData}
              columns={columnsIndex}
              renderRowActionMenuItems={renderRowActionMenuItems(actionMenuItems)}
              positionActionsColumn={'last'}
              state={{
                isLoading: isLoading,
              }}
            />
          </div>
          <Pagination totalPageCount={totalPages} currentPage={page} onPageChange={(value: number) => setPage(value)} />
        </>
      )}
      <DetailsDialog modal={modal} setModal={setModal} />
      <InfoDialog open={!!confirm} message={getConfirmDialogMessage()} onClose={() => setConfirm(false)} onConfirm={confirmDialogHandler} />
    </>
  );
};

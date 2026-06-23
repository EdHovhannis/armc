import DeleteIcon from '@material-ui/icons/Delete';
import { DataGrid } from '@sds-eng/data-grid';
import { PageTitle } from '@src/components/backups/LegacyFilter/PageTitle';
import * as React from 'react';

import BackupsService, { BACKUPS_PATH } from '../../../../services/BackupsService';
import { InfoDialog } from '../../InfoDialog';
import { Pagination } from '../../Pagination';
import { IBackupsFilter, IListBackups, ISavepointRecovery } from '../../types';
import { renderRowActionMenuItems, taskStatusIsInProgress } from '../../utils';

import { columnsSavepoints } from './columns';

const PAGE_SIZE = 10;

interface IHistoryTable {
  filter: IBackupsFilter | null;
  style?: React.CSSProperties;
  setFilter: (filter: IBackupsFilter) => void;
  displaySuccess(message: string): void;
  displayError(error: string): void;
}

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

export const HistoryTable: React.FC<IHistoryTable> = ({ filter, style, setFilter, displaySuccess, displayError }) => {
  const [tableData, setTableData] = React.useState<ISavepointRecovery[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [confirm, setConfirm] = React.useState(false);
  const [rowData, setRowData] = React.useState<ISavepointRecovery | null>(null);
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
        BACKUPS_PATH.savepointRecovery,
        { ...filter, page, pageSize: PAGE_SIZE },
        (data: IListBackups | null) => {
          if (data?.items) {
            const items = data.items as ISavepointRecovery[];
            setTableData(items);
            setTotalPages(data.totalPages);
          }
        },
        (message: string) => displayError(`Ошибка при получении данных ${message}`),
      ).finally(() => setIsLoading(false));
    }
  }, [filter, page]);

  const confirmDialogHandler = () => {
    if (!filter) return;
    if (rowData) {
      const path = `${BACKUPS_PATH.savepointRecovery}/project/${rowData?.projectShortName}/task/${rowData?.taskName}/zone/${rowData?.zoneId}/collection/${rowData?.collectionName}/id/${rowData?.id}`;
      BackupsService.requestDelete(
        path,
        () => {
          resetData();
          setFilter({ ...filter });
          displaySuccess('Задача восстановления индекса из контрольной точки успешно удалена');
        },
        (message: string) => displayError(`Ошибка при удалении ${message}`),
      );
    }
    setConfirm(false);
  };

  const isEmpty = tableData.length === 0 && !isLoading;

  const actionMenuItems = (row: any) => [
    {
      label: 'Удалить',
      visible: !taskStatusIsInProgress(row.original.status),
      onClick: () => {
        setConfirm(true);
        setRowData(row.original);
      },
      icon: <DeleteIcon />,
    },
  ];

  return (
    <div style={style || {}}>
      {!isEmpty && !isLoading && <PageTitle title="История задач восстановления" variant="h5" />}
      {!isEmpty && (
        <>
          <div className="abyssDataGridWrapperBoxContent">
            <DataGrid
              {...tableProps}
              data={tableData}
              columns={columnsSavepoints}
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
      <InfoDialog
        open={!!confirm}
        message="Вы уверены что хотите удалить задачу восстановления с контрольной точки?"
        onClose={() => setConfirm(false)}
        onConfirm={confirmDialogHandler}
      />
    </div>
  );
};

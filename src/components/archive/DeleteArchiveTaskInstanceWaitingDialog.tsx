import { Typography } from '@material-ui/core';
import { ShortArchiveTaskWithRole } from '@src/store/archive/Actions';
import * as React from 'react';

import ArchiveTaskInstanceWaitingDialogDetailError from '../../containers/archive/DeleteArchiveTaskInstanceWaitingDialogDetailError';
import DeleteArchiveTaskInstanceWaitingDialogError from '../../containers/archive/DeleteArchiveTaskInstanceWaitingDialogError';
import { ArchiveTaskDelete, ArchiveTaskDeleteValues } from '../../store/archive/Types';
import WaitingDialog from '../WaitingDialog';

interface DeleteArchiveTaskInstanceWaitingDialogProps {
  archiveTaskInstancesDeletePairs: [string, ArchiveTaskDelete | string | null][];
  onClose: (page: number, nameFilter: string) => void;
  listArchiveTasksWithRoles: (
    okCallback?: (tasks: ShortArchiveTaskWithRole[]) => void,
    errorCallback?: (errorMsg: string) => void,
    page?: number,
    nameLike?: string,
  ) => void;
  page: number;
  nameFilter: string;
}

const DeleteArchiveTaskInstanceWaitingDialog: React.FC<DeleteArchiveTaskInstanceWaitingDialogProps> = ({
  archiveTaskInstancesDeletePairs,
  onClose,
  page,
  nameFilter,
}) => {
  const inProcessRequests = archiveTaskInstancesDeletePairs.filter(([id, requestStatus]) => requestStatus === ArchiveTaskDelete.inProcess);
  const failedRequests = archiveTaskInstancesDeletePairs.filter(
    ([id, errorMessage]) => !ArchiveTaskDeleteValues.includes(errorMessage as ArchiveTaskDelete),
  );
  return (
    <WaitingDialog
      title={archiveTaskInstancesDeletePairs.length === 1 ? 'Удаление архива' : 'Удаление архивов'}
      open={archiveTaskInstancesDeletePairs.length > 0}
      complete={inProcessRequests.length === 0}
      success={failedRequests.length === 0}
      successMessage={archiveTaskInstancesDeletePairs.length === 1 ? 'Экземпляр успешно удален' : 'Экземпляры успешно удалены'}
      onClose={() => onClose(page + 1, nameFilter)}
      errorMessage={
        <>
          {failedRequests.length === 1 ? 'Произошла ошибка при удалении экземпляра: ' : 'Произошла ошибка при удалении экземпляров: '}
          <Typography variant="subtitle1">
            {failedRequests.map(([archiveTaskInstanceId]) => (
              <DeleteArchiveTaskInstanceWaitingDialogError key={archiveTaskInstanceId} archiveTaskInstanceId={archiveTaskInstanceId} />
            ))}
          </Typography>
        </>
      }
      needDetailedInfo={true}
      details={
        <>
          <Typography variant="body2">
            {failedRequests.map(([archiveTaskInstanceId]) => (
              <ArchiveTaskInstanceWaitingDialogDetailError key={archiveTaskInstanceId} archiveTaskInstanceId={archiveTaskInstanceId} />
            ))}
          </Typography>
        </>
      }
    />
  );
};

export default DeleteArchiveTaskInstanceWaitingDialog;

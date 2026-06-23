import { Typography } from '@material-ui/core';
import * as React from 'react';

import ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage from '../../containers/archive/ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage';
import ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage from '../../containers/archive/ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage';
import { ArchiveTaskRequestStatus } from '../../store/archive/Types';
import WaitingDialog from '../WaitingDialog';

interface ResetArchiveTaskInstanceOverdraftWaitingDialogProps {
  archiveTaskInstancesPairs: [string, ArchiveTaskRequestStatus | { message: string; details?: string } | null][];
  onClose: () => void;
}

const ResetArchiveTaskInstanceOverdraftWaitingDialog: React.FC<ResetArchiveTaskInstanceOverdraftWaitingDialogProps> = ({
  archiveTaskInstancesPairs,
  onClose,
}) => {
  const inProcessRequests = archiveTaskInstancesPairs.filter(([id, requestStatus]) => requestStatus === ArchiveTaskRequestStatus.inProcess);
  const failedRequests = archiveTaskInstancesPairs.filter(([id, errorMessage]) => errorMessage != ArchiveTaskRequestStatus.success);
  return (
    <WaitingDialog
      title={'Изменение скорости обработки'}
      open={archiveTaskInstancesPairs.length > 0}
      complete={inProcessRequests.length === 0}
      success={failedRequests.length === 0}
      successMessage={archiveTaskInstancesPairs.length === 1 ? 'Скорость обработки изменена' : 'Скорость обработки экземпляров была изменена'}
      onClose={onClose}
      errorMessage={
        <>
          {failedRequests.length === 1 ? 'При сбросе скорости произошла ошибка: ' : 'При сбросе скорости произошли ошибки: '}
          <Typography variant="subtitle1">
            {failedRequests.map(([archiveTaskInstanceId]) => {
              return (
                <ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage
                  key={archiveTaskInstanceId}
                  archiveTaskInstanceId={archiveTaskInstanceId}
                />
              );
            })}
          </Typography>
        </>
      }
      needDetailedInfo={true}
      details={
        <>
          <Typography variant="body2">
            {failedRequests.map(([archiveTaskInstanceId]) => (
              <ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage
                key={archiveTaskInstanceId}
                archiveTaskInstanceId={archiveTaskInstanceId}
              />
            ))}
          </Typography>
        </>
      }
    />
  );
};

export default ResetArchiveTaskInstanceOverdraftWaitingDialog;

import * as React from 'react';

import { ArchiveTaskInstance } from '../../store/archive/Types';

interface Props {
  archiveTaskInstanceId: string;
  instance: ArchiveTaskInstance;
  requestResult: { message: string; details?: string };
}

const ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage: React.FC<Props> = ({ instance, requestResult }) => (
  <React.Fragment>
    <div>{`${instance.project}/${instance.name}/${instance.zoneId}:`}</div>
    <div>{requestResult.details}</div>
  </React.Fragment>
);

export default ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage;

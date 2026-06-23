import * as React from 'react';

import { ArchiveTaskInstance } from '../../store/archive/Types';

interface Props {
  archiveTaskInstanceId: string;
  instance: ArchiveTaskInstance;
  requestResult: { message: string; details?: string };
}

const ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage: React.FC<Props> = ({ instance, requestResult }) => (
  <div>{`${instance.project}/${instance.name}/${instance.zoneId} (${requestResult.message})`}</div>
);

export default ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage;

import * as React from 'react';

import { ArchiveTaskDelete, ArchiveTaskInstance } from '../../store/archive/Types';

interface Props {
  archiveTaskInstanceId: string;
  instance: ArchiveTaskInstance;
  requestResult: { message: string; details?: string };
}

const ArchiveTaskInstanceWaitingDialogError: React.FC<Props> = ({ instance, requestResult }) => (
  <div>{`${instance.project}/${instance.name}/${instance.zoneId} (${requestResult.message})`}</div>
);

export default ArchiveTaskInstanceWaitingDialogError;

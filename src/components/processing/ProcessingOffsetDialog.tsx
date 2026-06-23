import * as React from 'react';
import { FC, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import CommonService from '../../services/CommonService';
import { FlowInstance } from '../../store/flow/Types';
import * as notificationActions from '../../store/notification/Actions';
import { IndexType, OffsetDialogData } from '../shared/types';
import { OffsetDialog } from '../shared/ui';

interface IOffsetDialogProps {
  handleClose: () => void;
  rowData?: FlowInstance;
}

export const ProcessingOffsetDialog: FC<IOffsetDialogProps> = (props) => {
  const { handleClose, rowData } = props;
  const dispatch = useDispatch();

  const [offsetData, setOffsetData] = useState<Array<OffsetDialogData>>([]);
  const zoneId = rowData?.zoneId;
  const indexName = rowData?.flowName;
  const project = rowData?.projectName;
  const flowId = rowData?.flowId;
  useEffect(() => {
    const urlForGetOffsetData = `/internal/flow/offset/project/${project}/task/${indexName}/zone/${zoneId}?businessTask=NON`;
    CommonService.getOffsetDialogData(
      urlForGetOffsetData,
      (data) => {
        const checkIfConsumerGroupsEmpty = data.every((item) => item.consumerGroups.length);
        if (!data.length || !checkIfConsumerGroupsEmpty) {
          handleClose();
          return dispatch(notificationActions.error('Отсутствуют источники данных для offset'));
        }
        setOffsetData(data);
      },
      (message) => {
        handleClose();
        dispatch(notificationActions.error(message));
      },
    );
  }, []);

  const urlForSaveOffset = `/internal/flow/task/${flowId}/zone/${zoneId}/project/${project}/instance/setOffsets`;
  return (
    <OffsetDialog
      open={true}
      handleClose={handleClose}
      offsetData={offsetData}
      urlForSaveOffset={urlForSaveOffset}
      name={indexName}
      project={project}
      zoneId={zoneId}
      indexType={IndexType.CUSTOM}
    />
  );
};

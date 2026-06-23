import * as React from 'react';
import { useDispatch } from 'react-redux';

import CommonService from '../../services/CommonService';
import { ArchiveTaskInstance } from '../../store/archive/Types';
import * as notificationActions from '../../store/notification/Actions';
import { IndexType, OffsetDialogData } from '../shared/types';
import { OffsetDialog } from '../shared/ui';

export interface IArchiveOffsetDialogProps {
  handleMenuClose?: () => void;
  handleClose: () => void;
  rowData?: ArchiveTaskInstance;
}
export const ArchiveOffsetDialog: React.FC<IArchiveOffsetDialogProps> = (props) => {
  const dispatch = useDispatch();
  const { handleClose, rowData, handleMenuClose } = props;
  const [offsetData, setOffsetData] = React.useState<Array<OffsetDialogData>>([]);
  const zoneId = rowData?.zoneId;
  const indexName = rowData?.name;
  const project = rowData?.project;

  React.useEffect(() => {
    if (handleMenuClose) {
      handleMenuClose();
    }
    const urlForGetOffsetData = `/internal/flow/offset/project/${project}/task/${indexName}/zone/${zoneId}?businessTask=ARCHIVING`;
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

  const urlForSaveOffset = `/internal/index/archive/task/project/${rowData?.project}/name/${rowData?.name}/zone/${rowData?.zoneId}/instance/setOffsets`;

  return (
    <OffsetDialog
      open={true}
      handleClose={handleClose}
      offsetData={offsetData}
      urlForSaveOffset={urlForSaveOffset}
      name={indexName}
      project={project}
      zoneId={zoneId}
      indexType={IndexType.ARCHIVE}
    />
  );
};

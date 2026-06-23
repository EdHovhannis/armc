import * as React from 'react';
import { useState, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';

import * as notificationActions from '../../store/notification/Actions';
import { IndexOverviewDataNew } from '../../utils/IndexUtils';
import { IndexType, OffsetDialogData } from '../shared/types';

interface IFullTextOffsetDialog {
  handleClose: () => void;
  rowData?: IndexOverviewDataNew;
}

import CommonService from '../../services/CommonService';
import { OffsetDialog } from '../shared/ui';

export const FullTextOffsetDialog: FC<IFullTextOffsetDialog> = (props) => {
  const { handleClose, rowData } = props;
  const dispatch = useDispatch();
  const [offsetData, setOffsetData] = useState<Array<OffsetDialogData>>([]);
  const zoneId = rowData?.zoneId;
  const indexName = rowData?.name;
  const project = rowData?.project;

  useEffect(() => {
    const urlForGetOffsetData = `/internal/flow/offset/project/${project}/task/${indexName}/zone/${zoneId}?businessTask=INDEXING`;
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

  const urlForSaveOffset = `/internal/index/fulltext/project/${project}/name/${indexName}/zone/${zoneId}/instance/setOffsets`;
  return (
    <OffsetDialog
      urlForSaveOffset={urlForSaveOffset}
      open={true}
      handleClose={handleClose}
      offsetData={offsetData}
      name={indexName}
      project={project}
      zoneId={zoneId}
      indexType={IndexType.FULLTEXT_INDEX}
    />
  );
};

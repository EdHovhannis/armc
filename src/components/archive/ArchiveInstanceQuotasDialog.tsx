import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { FC, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import QuotaPart from '../../containers/archive/QuotaPart';
import ArchiveService from '../../services/ArchiveService';
import { ApplicationState } from '../../store/Store';
import * as archiveActions from '../../store/archive/Actions';
import { ArchivalQuota, ArchiveQuota, ArchiveTask, ArchiveTaskInstance, KafkaArchiveSource } from '../../store/archive/Types';
import * as notificationActions from '../../store/notification/Actions';
import { ArchiveUtils } from '../../utils/ArchiveUtils';

import { WrongInput } from './ArchiveEditorForm';

export interface IArchiveInstanceQuotasDialogProps {
  handleMenuClose?: () => void;
  handleClose: () => void;
  rowData: ArchiveTaskInstance;
}

export const ArchiveInstanceQuotasDialog: FC<IArchiveInstanceQuotasDialogProps> = ({ handleClose, rowData, handleMenuClose }) => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const [quota, setQuota] = useState<ArchiveQuota>({
    maxStorageTimeSec: rowData.maxStorageTimeSec || 0,
    maxSizeBytes: rowData.maxSizeBytes || 0,
    maxDataRateBytesPerSec: rowData.maxDataRateBytesPerSec || 0,
  });
  const [wrongInput, setWrongInput] = useState<WrongInput>({ wrongInput: false, message: '' });
  const [availableQuota, availableQuotaChanged] = useState<ArchivalQuota>(ArchiveUtils.getEmptyArchivalQuota());
  const [kafkaTopics, setKafkaTopics] = useState<KafkaArchiveSource[]>([]);
  const topics = useSelector((state: ApplicationState) => state.kafka.topics);

  const fetchQuota = useCallback(
    (project: string, okCallback: (quota: ArchivalQuota) => void, errorCallback?: (error: string) => void) => {
      ArchiveService.getArchiveQuota(project, okCallback, errorCallback);
    },
    [dispatch],
  );

  const onSaveChanges = useCallback(() => {
    if (wrongInput.wrongInput) {
      dispatch(notificationActions.error(wrongInput.message));
      return;
    }
    setLoading(true);
    ArchiveService.updateArchiveInstanceQuota(
      {
        projectShortName: rowData.project,
        name: rowData.name,
        zoneId: rowData.zoneId || '',
        quota,
      },
      () => {
        handleClose();
        setLoading(false);
        dispatch(archiveActions.fetchListArchivesWithRoles());
      },
      () => {
        setLoading(false);
      },
    );
  }, [wrongInput.wrongInput, rowData, quota]);

  useEffect(() => {
    if (handleMenuClose) {
      handleMenuClose();
    }
    ArchiveService.getArchiveTaskInfo(rowData.project, rowData.name, (task: ArchiveTask) => setKafkaTopics(task.source.kafka));
  }, []);

  return (
    <Dialog open onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="lg" fullWidth>
      <DialogTitle id="form-dialog-title">Переопределение квот экземпляра</DialogTitle>
      <DialogContent>
        {kafkaTopics.length > 0 && (
          <QuotaPart
            canEdit
            projectShortName={rowData.project}
            quota={quota}
            quotaChanged={setQuota}
            wrongInputChanged={setWrongInput}
            availableQuota={availableQuota}
            availableQuotaChanged={availableQuotaChanged}
            kafkaTopics={kafkaTopics}
            topics={topics}
            fetchQuota={fetchQuota}
            indexName={rowData.name}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Отмена
        </Button>
        <Button onClick={onSaveChanges} color="primary" disabled={isLoading}>
          Сохранить изменения
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { useUnit } from 'effector-react';
import { FC } from 'react';

import ConfirmModal from '@src/Shared/ui/ConfirmModal';

import { resetOffsetFx } from '@src/Entities/Instance/api';

import { $resetOffsetModalRow, onCloseResetOffsetModal } from './model';

const ResetOffsetModal: FC = () => {
  const [row, onClose, resetting] = useUnit([$resetOffsetModalRow, onCloseResetOffsetModal, resetOffsetFx.pending]);

  const handleConfirm = () => {
    if (!row) return;
    resetOffsetFx({ project: row.projectName, taskName: row.configName, zoneId: row.zoneId });
  };

  const archiveName = row ? `${row.projectName}/${row.configName}/${row.zoneId}` : '';

  return (
    <ConfirmModal
      open={!!row}
      title="Сброс offset"
      description={`Вы уверены что, хотите сбросить офсет для архива ${archiveName}?`}
      loading={resetting}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmLabel="Да"
      cancelLabel="Отмена"
    />
  );
};

export default ResetOffsetModal;

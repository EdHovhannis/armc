import { useUnit } from 'effector-react';
import { FC } from 'react';

import ConfirmModal from '@src/Shared/ui/ConfirmModal';

import { resumeInstanceFx, suspendInstanceFx } from '@src/Entities/Instance/api';

import { $instanceActionModal, onCloseInstanceActionModal } from './model';

const InstanceActionModal: FC = () => {
  const [target, onClose, resuming, suspending] = useUnit([
    $instanceActionModal,
    onCloseInstanceActionModal,
    resumeInstanceFx.pending,
    suspendInstanceFx.pending,
  ]);

  const row = target?.row;
  const isResume = target?.action === 'resume';
  const verb = isResume ? 'запустить' : 'остановить';

  const handleConfirm = () => {
    if (!row) return;
    const params = { project: row.projectName, taskName: row.configName, zoneId: row.zoneId, instanceId: row.id };
    if (isResume) {
      resumeInstanceFx(params);
    } else {
      suspendInstanceFx(params);
    }
  };

  return (
    <ConfirmModal
      open={!!target}
      title={isResume ? 'Запуск экземпляра' : 'Остановка экземпляра'}
      description={row ? `Вы уверены что, хотите ${verb} экземпляр архива ${row.projectName}/${row.configName}/${row.zoneId}?` : ''}
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={resuming || suspending}
      cancelLabel="Отмена"
    />
  );
};

export default InstanceActionModal;

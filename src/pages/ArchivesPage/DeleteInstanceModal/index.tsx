import { useUnit } from 'effector-react';
import { FC } from 'react';

import ConfirmDeleteModal from '@src/Shared/ui/ConfirmDeleteModal';

import { deleteInstanceFx } from '@src/Entities/Instance/api';

import { $deleteInstanceModalRow, onCloseDeleteInstanceModal } from './model';

const DeleteInstanceModal: FC = () => {
  const [row, onClose, deleting] = useUnit([$deleteInstanceModalRow, onCloseDeleteInstanceModal, deleteInstanceFx.pending]);

  const handleDelete = () => {
    if (!row) return;
    deleteInstanceFx({ project: row.projectName, taskName: row.configName, zoneId: row.zoneId });
  };

  const archiveName = row ? `${row.projectName}/${row.configName}/${row.zoneId}` : '';

  return (
    <ConfirmDeleteModal
      open={!!row}
      title="Удаление экземпляра"
      description={`Вы уверены что, хотите удалить архив ${archiveName}? Его будет невозможно восстановить.`}
      loading={deleting}
      onClose={onClose}
      onConfirm={handleDelete}
      width={520}
    />
  );
};

export default DeleteInstanceModal;

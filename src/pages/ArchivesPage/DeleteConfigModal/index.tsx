import { useUnit } from 'effector-react';
import { FC } from 'react';

import ConfirmDeleteModal from '@src/Shared/ui/ConfirmDeleteModal';

import { deleteArchiveFx } from '@src/Entities/Archives/api';

import { $deleteConfigModalRow, onCloseDeleteConfigModal } from './model';

const DeleteConfigModal: FC = () => {
  const [row, onClose, deleteArchive, deleting] = useUnit([
    $deleteConfigModalRow,
    onCloseDeleteConfigModal,
    deleteArchiveFx,
    deleteArchiveFx.pending,
  ]);

  const handleDelete = () => {
    if (!row) return;
    deleteArchive({ project: row.projectKey, taskName: row.configuration });
  };

  // имя архива в подтверждении показываем как project/taskName (как в старом проекте abyss)
  const archiveName = row ? `${row.projectKey}/${row.configuration}` : '';

  return (
    <ConfirmDeleteModal
      open={!!row}
      title="Удаление архива"
      description={`Вы уверены что, хотите удалить архив ${archiveName}? Его будет невозможно восстановить.`}
      loading={deleting}
      onClose={onClose}
      onConfirm={handleDelete}
      width={520}
    />
  );
};

export default DeleteConfigModal;

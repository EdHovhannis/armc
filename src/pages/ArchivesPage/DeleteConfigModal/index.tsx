import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { deleteArchiveFx } from '@src/Entities/Archives/api';

import { $deleteConfigModalRow, onCloseDeleteConfigModal } from './model';
import * as styles from './styles.module.css';

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
    <Modal open={!!row} onClose={onClose} width={520}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <Text kind="h4b">Удаление архива</Text>
      </ModalHeader>
      <ModalBody>
        <Text kind="bodyM">Вы уверены что, хотите удалить архив {archiveName}? Его будет невозможно восстановить.</Text>
      </ModalBody>
      <ModalFooter className={styles.deleteConfigModalFooter}>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          Отменить
        </Button>
        <Button view="negative" isLoading={deleting} onClick={handleDelete}>
          Удалить
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfigModal;

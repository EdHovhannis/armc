import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { $restrictionDeleteRow, onCloseRestrictionDelete } from './model';

type Props = {
  onConfirm: (index: number) => void;
};

const DeleteRestrictionModal: FC<Props> = ({ onConfirm }) => {
  const [deleteRow, onClose] = useUnit([$restrictionDeleteRow, onCloseRestrictionDelete]);

  const handleConfirm = () => {
    if (deleteRow) {
      onConfirm(deleteRow.index);
    }
    onClose();
  };

  return (
    <Modal open={!!deleteRow} onClose={onClose} width={480}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        Удаление ограничения
      </ModalHeader>
      <ModalBody>
        <Text kind="bodyM">Удалить ограничение{deleteRow?.label ? ` для «${deleteRow.label}»` : ''}?</Text>
      </ModalBody>
      <ModalFooter>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button view="negative" onClick={handleConfirm}>
          Удалить
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteRestrictionModal;

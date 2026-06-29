import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import * as styles from './styles.module.css';

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  description: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  width?: number;
}

const ConfirmDeleteModal: FC<ConfirmDeleteModalProps> = ({
  open,
  title,
  description,
  onClose,
  onConfirm,
  loading,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  width = 480,
}) => {
  return (
    <Modal open={open} onClose={onClose} width={width}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <Text kind="h4b">{title}</Text>
      </ModalHeader>
      <ModalBody>{typeof description === 'string' ? <Text kind="bodyM">{description}</Text> : description}</ModalBody>
      <ModalFooter className={styles.confirmDeleteModalFooter}>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button view="negative" isLoading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDeleteModal;

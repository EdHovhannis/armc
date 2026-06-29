import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import * as styles from './styles.module.css';

type ConfirmButtonView = 'primary' | 'negative';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmView?: ConfirmButtonView;
  width?: number;
}

// Презентационная модалка подтверждения произвольного действия (старт/стоп и т.п.).
// Для удаления есть отдельная ConfirmDeleteModal с негативной кнопкой.
const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  onClose,
  onConfirm,
  loading,
  confirmLabel = 'Да',
  cancelLabel = 'Нет',
  confirmView = 'primary',
  width = 480,
}) => {
  return (
    <Modal open={open} onClose={onClose} width={width}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <Text kind="h4b">{title}</Text>
      </ModalHeader>
      <ModalBody>{typeof description === 'string' ? <Text kind="bodyM">{description}</Text> : description}</ModalBody>
      <ModalFooter className={styles.confirmModalFooter}>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button view={confirmView} isLoading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;

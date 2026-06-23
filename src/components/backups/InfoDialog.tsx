import { Modal, ModalBody, ModalFooter, Button, Text } from '@sds-eng/base';
import * as React from 'react';

interface IInfoDialog {
  open: boolean;
  message: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  hideConfirmButton?: boolean;
  hideCancelButton?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export const InfoDialog = ({
  open,
  message,
  confirmButtonText,
  cancelButtonText,
  hideConfirmButton = false,
  hideCancelButton = false,
  onClose,
  onConfirm,
}: IInfoDialog): JSX.Element => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalBody>
        <Text>{message}</Text>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end' }}>
        {!hideConfirmButton && (
          <Button view="secondary" onClick={onConfirm}>
            {confirmButtonText ?? 'Подтвердить'}
          </Button>
        )}
        {!hideCancelButton && <Button onClick={onClose}>{cancelButtonText ?? 'Отменить'}</Button>}
      </ModalFooter>
    </Modal>
  );
};

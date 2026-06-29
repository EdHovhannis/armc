import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { ZONE_OPTIONS } from '@src/Shared/constants/filters';
import ConfirmModal from '@src/Shared/ui/ConfirmModal';

import { resetZoneOverdraftFx } from '@src/Entities/Instance/api';

import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';

import { $resetZoneOverdraftOpen, onCloseResetZoneOverdraftModal } from './model';
import * as styles from './styles.module.css';

type ResetZoneFormValues = {
  zone: string;
};

const ResetZoneOverdraftModal: FC = () => {
  const [open, onClose, resetting] = useUnit([$resetZoneOverdraftOpen, onCloseResetZoneOverdraftModal, resetZoneOverdraftFx.pending]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const methods = useForm<ResetZoneFormValues>({ defaultValues: { zone: '' } });

  useEffect(() => {
    if (open) {
      methods.reset({ zone: '' });
    }
  }, [open, methods]);

  const zone = useWatch({ control: methods.control, name: 'zone' });

  const handleConfirm = () => {
    resetZoneOverdraftFx({ zoneId: zone });
    setConfirmOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} width={520}>
        <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
          <Text kind="h4b">Сбросить овердрафт скорости</Text>
          <Text kind="h6n">Овердрафт скорости будет сброшен до значений по умолчанию для всех экземпляров выбранной зоны</Text>
        </ModalHeader>
        <ModalBody>
          <FormProvider {...methods}>
            <div className={styles.resetZoneOverdraftModalBody}>
              <ControllerSelectSingle name="zone" options={ZONE_OPTIONS} placeholder="Выберите зону" />
            </div>
          </FormProvider>
        </ModalBody>
        <ModalFooter className={styles.resetZoneOverdraftModalFooter}>
          <Button view="primary" disabled={!zone} onClick={() => setConfirmOpen(true)}>
            Выбрать
          </Button>
          <Button view="secondary" kind="ghost" onClick={onClose}>
            Отмена
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        title="Сбросить овердрафт?"
        description="Скорость обработки всех экземпляров будет сброшена до значений по умолчанию"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={resetting}
        cancelLabel="Отмена"
      />
    </>
  );
};

export default ResetZoneOverdraftModal;

import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ZONE_OPTIONS } from '@src/Shared/constants/filters';

import { addInstanceFx } from '@src/Entities/Instance/api';

import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';

import { $addInstanceModalRow, onCloseAddInstanceModal } from './model';
import * as styles from './styles.module.css';

type AddInstanceFormValues = {
  zone: string;
};

const DEFAULT_ZONE = 'PRIMARY';

const AddInstanceModal: FC = () => {
  const [row, onClose, addInstance, adding] = useUnit([$addInstanceModalRow, onCloseAddInstanceModal, addInstanceFx, addInstanceFx.pending]);

  const methods = useForm<AddInstanceFormValues>({
    defaultValues: { zone: DEFAULT_ZONE },
  });

  // при каждом открытии сбрасываем зону на дефолт
  useEffect(() => {
    if (row) {
      methods.reset({ zone: DEFAULT_ZONE });
    }
  }, [row, methods]);

  const handleAdd = methods.handleSubmit(({ zone }) => {
    if (!row) return;
    addInstance({ project: row.projectKey, taskName: row.configuration, zoneId: zone });
  });

  return (
    <Modal open={!!row} onClose={onClose} width={520}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <Text kind="h4b">Добавление экземпляра задачи в зону</Text>
      </ModalHeader>
      <ModalBody>
        <FormProvider {...methods}>
          <div className={styles.addInstanceModalBody}>
            <TextField label="Название конфигурации" value={row?.configuration ?? ''} disabled />
            <div className={styles.addInstanceModalZone}>
              <ControllerSelectSingle name="zone" options={ZONE_OPTIONS} />
              <Text kind="bodyXS" className={styles.addInstanceModalHint}>
                Конфигурация будет размещена в выбранной зоне
              </Text>
            </div>
          </div>
        </FormProvider>
      </ModalBody>
      <ModalFooter className={styles.addInstanceModalFooter}>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          Отменить
        </Button>
        <Button view="primary" isLoading={adding} onClick={handleAdd}>
          Добавить
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddInstanceModal;

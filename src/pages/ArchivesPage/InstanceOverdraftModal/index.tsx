import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { formatSpeed } from '@src/Shared/lib/format/formatSpeed';
import ConfirmModal from '@src/Shared/ui/ConfirmModal';

import { changeInstanceOverdraftFx, resetInstanceOverdraftFx } from '@src/Entities/Instance/api';
import { $overdraftConfig } from '@src/Entities/Overdraft/model';

import ControllerInputNumber from '@src/Features/Controllers/ControllerInputNumber';

import { $instanceOverdraftModalRow, onCloseInstanceOverdraftModal } from './model';
import * as styles from './styles.module.css';

type OverdraftFormValues = {
  overdraftPercent: number;
};

type ConfirmAction = 'change' | 'reset' | null;

const InstanceOverdraftModal: FC = () => {
  const [row, overdraftConfig, onClose, changing, resetting] = useUnit([
    $instanceOverdraftModalRow,
    $overdraftConfig,
    onCloseInstanceOverdraftModal,
    changeInstanceOverdraftFx.pending,
    resetInstanceOverdraftFx.pending,
  ]);

  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  const methods = useForm<OverdraftFormValues>({ defaultValues: { overdraftPercent: 0 } });

  useEffect(() => {
    if (row) {
      methods.reset({ overdraftPercent: row.overdraftPercent });
    }
  }, [row, methods]);

  const percent = useWatch({ control: methods.control, name: 'overdraftPercent' }) ?? 0;

  const maxAvailable = row?.metadata.maxAvailableOverdraft ?? 0;
  const maxOverdraft = overdraftConfig ? Math.min(overdraftConfig.maxOverdraftPercent, maxAvailable) : maxAvailable;
  const maxSpeed = row ? formatSpeed(row.maxDataRateBytesPerSec * (1 + 0.01 * percent)) : '';
  const instanceLabel = row ? `${row.projectName} / ${row.configName} / ${row.zoneId}` : '';

  const params = row ? { project: row.projectName, taskName: row.configName, zoneId: row.zoneId, instanceId: row.id } : null;

  const handleChangeClick = methods.handleSubmit(() => setConfirm('change'));

  const handleConfirm = () => {
    if (!params) return;
    if (confirm === 'change') {
      changeInstanceOverdraftFx({ ...params, overdraftPercent: percent });
    } else if (confirm === 'reset') {
      resetInstanceOverdraftFx(params);
    }
    setConfirm(null);
  };

  return (
    <>
      <Modal open={!!row} onClose={onClose} width={520}>
        <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
          <Text kind="h4b">Изменение скорости обработки экземпляра</Text>
        </ModalHeader>
        <ModalBody>
          <FormProvider {...methods}>
            <div className={styles.instanceOverdraftModalBody}>
              <TextField label="Экземпляр задачи" value={instanceLabel} disabled />
              <div className={styles.instanceOverdraftModalField}>
                <Text kind="textSn" className={styles.instanceOverdraftModalLabel}>
                  Процент увеличения скорости обработки
                </Text>
                <ControllerInputNumber
                  name="overdraftPercent"
                  placeholder="Введите значение"
                  precision={0}
                  rules={{ required: true, validate: (value) => Number.isInteger(value) && (value ?? 0) >= 0 && (value ?? 0) <= maxOverdraft }}
                />
                <Text kind="bodyXS" className={styles.instanceOverdraftModalHint}>
                  Максимальный процент увеличения скорости: {maxOverdraft}%
                </Text>
              </div>
              <TextField label="Максимальная скорость обработки" value={maxSpeed} disabled />
            </div>
          </FormProvider>
        </ModalBody>
        <ModalFooter className={styles.instanceOverdraftModalFooter}>
          <Button view="secondary" kind="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button view="secondary" onClick={() => setConfirm('reset')}>
            Сбросить
          </Button>
          <Button view="primary" onClick={handleChangeClick}>
            Изменить
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        open={confirm !== null}
        title={confirm === 'reset' ? 'Сбросить овердрафт?' : 'Изменение скорости обработки'}
        description={
          confirm === 'reset'
            ? `Вы уверены, что хотите сбросить скорость обработки экземпляра ${instanceLabel} до значения по умолчанию?`
            : `Вы уверены, что хотите изменить скорость обработки экземпляра ${instanceLabel}?`
        }
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        loading={changing || resetting}
        cancelLabel="Отмена"
      />
    </>
  );
};

export default InstanceOverdraftModal;

import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ConfirmModal from '@src/Shared/ui/ConfirmModal';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { changeInstancesOverdraftFx, resetInstancesOverdraftFx } from '@src/Entities/Instance/api';
import { $overdraftConfig } from '@src/Entities/Overdraft/model';

import ControllerInputNumber from '@src/Features/Controllers/ControllerInputNumber';

import { $overDraftModalRows, onCloseOverDraftModal } from './model';
import * as styles from './styles.module.css';

type OverDraftFormValues = {
  overdraftPercent: number;
};

type ConfirmAction = 'change' | 'reset' | null;

const getInitialOverdraftPercent = (rows: ArchiveInstanceView[]): number => {
  const [firstRow] = rows;
  if (!firstRow) return 0;

  const isSameOverdraftPercent = rows.every((row) => row.overdraftPercent === firstRow.overdraftPercent);
  return isSameOverdraftPercent ? firstRow.overdraftPercent : 0;
};

const OverDraftModal: FC = () => {
  const [rows, overdraftConfig, onClose, changing, resetting] = useUnit([
    $overDraftModalRows,
    $overdraftConfig,
    onCloseOverDraftModal,
    changeInstancesOverdraftFx.pending,
    resetInstancesOverdraftFx.pending,
  ]);

  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  const methods = useForm<OverDraftFormValues>({ defaultValues: { overdraftPercent: 0 } });

  useEffect(() => {
    if (rows) {
      methods.reset({ overdraftPercent: getInitialOverdraftPercent(rows) });
    }
  }, [rows, methods]);

  const selectedRows = rows ?? [];
  const maxAvailable = selectedRows.length ? Math.min(...selectedRows.map((row) => row.metadata.maxAvailableOverdraft)) : 0;
  const maxOverdraft = overdraftConfig ? Math.min(overdraftConfig.maxOverdraftPercent, maxAvailable) : maxAvailable;

  const instances = selectedRows.map((row) => ({ project: row.projectName, taskName: row.configName, zoneId: row.zoneId, instanceId: row.id }));

  const handleSave = methods.handleSubmit(() => setConfirm('change'));

  const handleConfirm = () => {
    if (confirm === 'change') {
      changeInstancesOverdraftFx({ instances, overdraftPercent: methods.getValues().overdraftPercent });
    } else if (confirm === 'reset') {
      resetInstancesOverdraftFx(instances);
    }
    setConfirm(null);
  };

  return (
    <>
      <Modal open={!!rows} onClose={onClose} width={520}>
        <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
          <Text kind="h4b">Изменение скорости обработки экземпляров</Text>
          <Text kind="h6n">Новое значение овердрафта применится ко всем выбранным экземплярам</Text>
        </ModalHeader>
        <ModalBody>
          <FormProvider {...methods}>
            <div className={styles.overDraftModalBody}>
              <div className={styles.overDraftModalField}>
                <Text kind="textSn" className={styles.overDraftModalLabel}>
                  Процент увеличения скорости обработки
                </Text>
                <ControllerInputNumber
                  name="overdraftPercent"
                  placeholder="Введите значение"
                  precision={0}
                  rules={{ required: true, validate: (value) => Number.isInteger(value) && (value ?? 0) >= 0 && (value ?? 0) <= maxOverdraft }}
                />
                <Text kind="bodyXS" className={styles.overDraftModalHint}>
                  Максимальный процент увеличения скорости: {maxOverdraft}%
                </Text>
              </div>
              <div className={styles.overDraftModalInstances}>
                <Text kind="bodyS">Выбрано экземпляров: {selectedRows.length}</Text>
                <div className={styles.overDraftModalInstancesList}>
                  {selectedRows.map(({ projectName, configName, zoneId }) => (
                    <Text key={`${projectName}-${configName}-${zoneId}`} kind="bodyS" className={styles.overDraftModalInstance}>
                      {projectName}/{configName}/{zoneId}
                    </Text>
                  ))}
                </div>
              </div>
            </div>
          </FormProvider>
        </ModalBody>
        <ModalFooter className={styles.overDraftModalFooter}>
          <Button view="secondary" kind="ghost" onClick={onClose}>
            Отменить
          </Button>
          <Button view="secondary" onClick={() => setConfirm('reset')}>
            Сбросить
          </Button>
          <Button view="primary" onClick={handleSave}>
            Сохранить
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        open={confirm !== null}
        title={confirm === 'reset' ? 'Сбросить овердрафт?' : 'Изменение скорости обработки'}
        description={
          confirm === 'reset'
            ? `Вы уверены, что хотите сбросить скорость обработки выбранных экземпляров (${selectedRows.length}) до значения по умолчанию?`
            : `Вы уверены, что хотите изменить скорость обработки выбранных экземпляров (${selectedRows.length})?`
        }
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        loading={changing || resetting}
        cancelLabel="Отмена"
      />
    </>
  );
};

export default OverDraftModal;

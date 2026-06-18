import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';

import { $overDraftModalRows, onCloseOverDraftModal } from './model';
import * as styles from './styles.module.css';

type OverDraftFormValues = {
  overdraftPercent: string;
};

const getInitialOverdraftPercent = (rows: ArchiveInstanceView[]) => {
  const [firstRow] = rows;
  if (!firstRow) return '';

  const isSameOverdraftPercent = rows.every((row) => row.overdraftPercent === firstRow.overdraftPercent);
  return isSameOverdraftPercent ? String(firstRow.overdraftPercent) : '';
};

const OverDraftModal: FC = () => {
  const [rows, onClose] = useUnit([$overDraftModalRows, onCloseOverDraftModal]);

  const { control, handleSubmit, reset } = useForm<OverDraftFormValues>({
    defaultValues: { overdraftPercent: '' },
  });

  useEffect(() => {
    if (rows) {
      reset({ overdraftPercent: getInitialOverdraftPercent(rows) });
    }
  }, [reset, rows]);

  const selectedRows = rows ?? [];
  const maxAvailableOverdraft = selectedRows.length
    ? Math.min(...selectedRows.map((row) => row.metadata.maxAvailableOverdraft))
    : null;

  const handleSave = handleSubmit(() => {
    onClose();
  });

  return (
    <Modal open={!!rows} onClose={onClose} width={520}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <Text kind="h4b">Настройка овердрафта</Text>
      </ModalHeader>
      <ModalBody>
        <div className={styles.overDraftModalBody}>
          <Controller
            name="overdraftPercent"
            control={control}
            render={({ field }) => <TextField {...field} label="Овердрафт, %" placeholder="Введите значение" size="md" />}
          />
          {maxAvailableOverdraft !== null && (
            <Text kind="bodyXS" className={styles.overDraftModalHint}>
              Максимально доступный овердрафт для выбранных экземпляров: {maxAvailableOverdraft}%
            </Text>
          )}
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
      </ModalBody>
      <ModalFooter className={styles.overDraftModalFooter}>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          Отменить
        </Button>
        <Button view="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default OverDraftModal;

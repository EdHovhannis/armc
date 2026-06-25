import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Tag, TextField, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, KeyboardEvent, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { addLabelFx, deleteLabelFx } from '@src/Entities/Label/api';

import { $labelsModalRow, onCloseLabelsModal } from './model';
import * as styles from './styles.module.css';

type LabelsFormValues = {
  labels: string[];
  newLabel: string;
};

const LabelsModal: FC = () => {
  const [row, onClose, addLabel, deleteLabel, saving] = useUnit([
    $labelsModalRow,
    onCloseLabelsModal,
    addLabelFx,
    deleteLabelFx,
    addLabelFx.pending,
  ]);

  const { control, reset, setValue, getValues } = useForm<LabelsFormValues>({
    defaultValues: { labels: [], newLabel: '' },
  });

  useEffect(() => {
    if (row) {
      reset({ labels: row.labels ?? [], newLabel: '' });
    }
  }, [row, reset]);

  const labels = useWatch({ control, name: 'labels', defaultValue: [] });
  const newLabel = useWatch({ control, name: 'newLabel', defaultValue: '' });

  const trimmedNewLabel = newLabel.trim();
  const canSave = !!trimmedNewLabel;

  const handleAddLabel = () => {
    const value = newLabel.trim();
    if (!value || labels.includes(value)) return;
    setValue('labels', [...labels, value]);
    setValue('newLabel', '');
  };

  const handleRemoveLabel = (label: string) => {
    if (!row) return;
    deleteLabel({ project: row.projectKey, taskName: row.configuration, label });
    setValue(
      'labels',
      getValues('labels').filter((item) => item !== label),
    );
  };

  const handleNewLabelKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddLabel();
    }
  };

  const handleSave = () => {
    if (!row || !trimmedNewLabel) return;
    addLabel({ project: row.projectKey, taskName: row.configuration, label: trimmedNewLabel });
  };

  return (
    <Modal open={!!row} onClose={onClose} width={740}>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <div className={styles.labelsModalTitle}>
          <Text kind="h4b">Список меток на индекс</Text>
          <Text kind="h4b" ellipsis title={row?.configuration} className={styles.labelsModalIndexName}>
            {row?.configuration}
          </Text>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className={styles.labelsModalBody}>
          {labels.length > 0 && (
            <div className={styles.labelsModalTags}>
              {labels.map((label) => (
                <Tag key={label} closable onDelete={() => handleRemoveLabel(label)}>
                  {label}
                </Tag>
              ))}
            </div>
          )}
          <Controller
            name="newLabel"
            control={control}
            render={({ field }) => <TextField {...field} placeholder="Метка" size="md" onKeyDown={handleNewLabelKeyDown} />}
          />
        </div>
      </ModalBody>
      <ModalFooter className={styles.labelsModalFooter}>
        <Button view="primary" disabled={!canSave} isLoading={saving} onClick={handleSave}>
          Сохранить
        </Button>
        <Button view="secondary" kind="ghost" onClick={onClose}>
          Отмена
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LabelsModal;

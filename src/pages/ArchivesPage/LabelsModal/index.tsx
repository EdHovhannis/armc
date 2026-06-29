import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Tag, TextField, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, KeyboardEvent, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { saveLabelsFx } from '@src/Entities/Label/api';

import { $labelsModalRow, onCloseLabelsModal } from './model';
import * as styles from './styles.module.css';

type LabelsFormValues = {
  labels: string[];
  newLabel: string;
};

// две метки считаем одинаковым набором независимо от порядка
const isSameLabels = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((label, index) => label === sortedRight[index]);
};

const LabelsModal: FC = () => {
  const [row, onClose, saveLabels, saving] = useUnit([$labelsModalRow, onCloseLabelsModal, saveLabelsFx, saveLabelsFx.pending]);

  const { control, handleSubmit, reset, setValue, getValues } = useForm<LabelsFormValues>({
    defaultValues: { labels: [], newLabel: '' },
  });

  useEffect(() => {
    if (row) {
      reset({ labels: row.labels ?? [], newLabel: '' });
    }
  }, [row, reset]);

  const labels = useWatch({ control, name: 'labels', defaultValue: [] });
  const newLabel = useWatch({ control, name: 'newLabel', defaultValue: '' });

  const isChanged = !!row && !isSameLabels(labels, row.labels ?? []);

  const handleAddLabel = () => {
    const value = newLabel.trim();
    // TODO(labels): уточнить у аналитика регистрозависимость - Audit и audit это одна метка или разные. сейчас сравнение регистрозависимое (тут и в isSameLabels)
    if (!value || labels.includes(value)) return;
    setValue('labels', [...labels, value]);
    setValue('newLabel', '');
  };

  const handleRemoveLabel = (label: string) => {
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

  const handleSave = handleSubmit(({ labels: nextLabels }) => {
    if (!row) return;
    saveLabels({ project: row.projectKey, taskName: row.configuration, labels: nextLabels });
  });

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
        <Button view="primary" disabled={!isChanged} isLoading={saving} onClick={handleSave}>
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

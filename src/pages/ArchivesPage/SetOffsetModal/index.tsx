import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useState } from 'react';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { fetchOffsetDataFx, setOffsetsFx } from '@src/Entities/Instance/api';
import { OffsetSetItem, OffsetTopicData } from '@src/Entities/Instance/types';

import { $offsetData, $setOffsetModalRow, onCloseSetOffsetModal } from './model';
import * as styles from './styles.module.css';

const COPY_FROM_OPTIONS = [
  { value: 'consumergroup', label: 'Consumer group' },
  { value: 'zone', label: 'Зона' },
];

interface TopicSelection {
  copyFrom: string;
  sourceConsumerGroupId: string;
}

const getValueOptions = (item: OffsetTopicData, copyFrom: string) => {
  if (copyFrom === 'consumergroup') {
    return item.consumerGroups.map((cg) => ({ value: cg.consumerGroup.name, label: `${cg.type}_${cg.consumerGroup.displayName}` }));
  }
  if (copyFrom === 'zone') {
    return item.zoneIds.map((z) => ({ value: z, label: z }));
  }
  return [];
};

// для режима "Зона" ищем consumerGroup.name по выбранной зоне
const resolveZoneConsumerGroupId = (item: OffsetTopicData, zoneId: string, taskName: string, project: string): string =>
  item.consumerGroups.find((cg) => cg.indexName === taskName && cg.projectName === project && cg.type === 'ARCHIVE' && cg.zoneId === zoneId)
    ?.consumerGroup.name ?? '';

interface ContentProps {
  row: ArchiveInstanceView;
  offsetData: OffsetTopicData[];
  saving: boolean;
  onClose: () => void;
}

// внутренний компонент: монтируется с key={rowId-offsetData.length}, инициализирует selections из props без useEffect
const SetOffsetContent: FC<ContentProps> = ({ row, offsetData, saving, onClose }) => {
  const [selections, setSelections] = useState<TopicSelection[]>(() => offsetData.map(() => ({ copyFrom: '', sourceConsumerGroupId: '' })));
  const [isConfirmStep, setIsConfirmStep] = useState(false);

  const handleCopyFromChange = (index: number, value: string) => {
    setSelections((prev) => prev.map((sel, i) => (i === index ? { copyFrom: value, sourceConsumerGroupId: '' } : sel)));
  };

  const handleValueChange = (index: number, value: string, item: OffsetTopicData) => {
    const sourceConsumerGroupId =
      selections[index]?.copyFrom === 'zone' ? resolveZoneConsumerGroupId(item, value, row.configName, row.projectName) : value;
    setSelections((prev) => prev.map((sel, i) => (i === index ? { ...sel, sourceConsumerGroupId } : sel)));
  };

  const canSubmit = selections.some((sel) => sel.sourceConsumerGroupId);

  const handleConfirm = () => {
    const items: OffsetSetItem[] = offsetData
      .map((item, index) => {
        const parts = item.topicName.split('.');
        return {
          sourceConsumerGroupId: selections[index]?.sourceConsumerGroupId ?? '',
          topicName: parts[1] ?? item.topicName,
          projectName: parts[0] ?? '',
        };
      })
      .filter((item) => item.sourceConsumerGroupId);

    setOffsetsFx({ project: row.projectName, taskName: row.configName, zoneId: row.zoneId, items });
  };

  // обратный поиск зоны по сохранённому consumerGroupId для отображения в Select
  const getDisplayValue = (index: number, item: OffsetTopicData): string => {
    const sel = selections[index];
    if (!sel?.sourceConsumerGroupId) return '';
    if (sel.copyFrom === 'consumergroup') return sel.sourceConsumerGroupId;
    return item.consumerGroups.find((cg) => cg.consumerGroup.name === sel.sourceConsumerGroupId)?.zoneId ?? '';
  };

  return (
    <>
      <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
        <Text kind="h4b">{isConfirmStep ? 'Подтверждение' : 'Установка offset'}</Text>
      </ModalHeader>

      <ModalBody>
        {isConfirmStep ? (
          <Text kind="bodyM">
            Подтверждаете установку offset для экземпляра {row.configName} в зону {row.zoneId}?
          </Text>
        ) : (
          <div className={styles.setOffsetTopics}>
            {offsetData.map((item, index) => (
              <div key={item.topicName} className={styles.setOffsetTopicBlock}>
                <TextField value={item.topicName} label="Имя источника данных/Топика" disabled size="md" />
                <TextField value={item.currentConsumerGroup.displayName} label="Имя текущей consumer group" disabled size="md" />
                <Text kind="textMn">Копировать из:</Text>
                <Select
                  options={COPY_FROM_OPTIONS}
                  value={selections[index]?.copyFrom ?? ''}
                  onChange={(value) => handleCopyFromChange(index, String(value))}
                  placeholder="Consumer group/Зона"
                  size="md"
                />
                <Select
                  options={getValueOptions(item, selections[index]?.copyFrom ?? '')}
                  value={getDisplayValue(index, item)}
                  onChange={(value) => handleValueChange(index, String(value), item)}
                  placeholder="Устанавливаемое значение"
                  size="md"
                  disabled={!selections[index]?.copyFrom}
                />
              </div>
            ))}
          </div>
        )}
      </ModalBody>

      <ModalFooter className={styles.setOffsetFooter}>
        {isConfirmStep ? (
          <>
            <Button view="secondary" kind="ghost" onClick={() => setIsConfirmStep(false)}>
              Отмена
            </Button>
            <Button isLoading={saving} onClick={handleConfirm}>
              Подтвердить
            </Button>
          </>
        ) : (
          <>
            <Button view="secondary" kind="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button disabled={!canSubmit} onClick={() => setIsConfirmStep(true)}>
              Установить
            </Button>
          </>
        )}
      </ModalFooter>
    </>
  );
};

const SetOffsetModal: FC = () => {
  const [row, offsetData, loading, saving, onClose] = useUnit([
    $setOffsetModalRow,
    $offsetData,
    fetchOffsetDataFx.pending,
    setOffsetsFx.pending,
    onCloseSetOffsetModal,
  ]);

  return (
    <Modal open={!!row} onClose={onClose} width={700}>
      {loading ? (
        <>
          <ModalHeader showCloseButton closeButtonProps={{ onClick: onClose }}>
            <Text kind="h4b">Установка offset</Text>
          </ModalHeader>
          <ModalBody>
            <div className={styles.setOffsetSpinner}>
              <Spinner />
            </div>
          </ModalBody>
        </>
      ) : row && offsetData.length > 0 ? (
        <SetOffsetContent key={`${row.id}-${offsetData.length}`} row={row} offsetData={offsetData} saving={saving} onClose={onClose} />
      ) : null}
    </Modal>
  );
};

export default SetOffsetModal;

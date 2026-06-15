import { clsx, Text, Button, Icon, Select } from '@sds-eng/base';
import { FC, useState } from 'react';
import { useFieldArray, useFormContext, useWatch, Controller } from 'react-hook-form';

import { SCHEMA_CONDITION_FIELDS, SCHEMA_DLQ_FIELDS } from '@src/Shared/constants/options';
import AccordionComponent from '@src/Shared/ui/AccordionComponent';

import FilterMessage from '@src/Features/SchemaFields/FilterMessage';

import * as styles from './styles.module.css';

const PreprocessingFilterMessage: FC = () => {
  const { control, setValue } = useFormContext();
  const [editId, setEditId] = useState<string | null>(null);
  const { fields, append, remove } = useFieldArray({ name: 'processing.messageFilter.condition.conditions', control });
  const messageFields = useWatch({ name: 'processing.messageFilter.condition.conditions', defaultValue: [] }) as {
    type: string;
    field: string;
    value: string;
    inverted: boolean;
  }[];

  const hasEmptyFields = messageFields.some((item) => !item.type || !item.field || !item.value);

  return (
    <AccordionComponent title="Фильтрация сообщений">
      <div style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }} className={styles.archiveSchemaGrid}>
        <Controller
          control={control}
          defaultValue={SCHEMA_CONDITION_FIELDS[0].value}
          name="processing.messageFilter.condition.type"
          render={({ field: { value, onChange, ...rest } }) => {
            const currentValue = SCHEMA_CONDITION_FIELDS.find((item) => item.value === value) || null;
            return <Select label="Тип условия" value={currentValue} onChange={(v) => onChange(v)} options={SCHEMA_CONDITION_FIELDS} {...rest} />;
          }}
        />
        <Controller
          control={control}
          defaultValue={SCHEMA_DLQ_FIELDS[0].value}
          name="processing.messageFilter.dlqField"
          render={({ field: { value, onChange, ...rest } }) => {
            const currentValue = SCHEMA_DLQ_FIELDS.find((item) => item.value === value) || null;
            return (
              <Select
                label="Обработка сообщений, непрошедших фильтрацию"
                value={currentValue}
                onChange={(v) => onChange(v)}
                options={SCHEMA_DLQ_FIELDS}
                {...rest}
              />
            );
          }}
        />
      </div>
      <div style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 80px' }} className={clsx(styles.archiveSchemaGrid, styles.archiveSchemaDateGridHeader)}>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Имя поля
        </Text>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Значение
        </Text>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Тип проверки
        </Text>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Инверсия условий
        </Text>
        <div />
      </div>
      {fields.map((item, index) => {
        const currentItem = messageFields[index];
        if (currentItem) {
          return (
            <div
              key={item.id}
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 80px' }}
              className={styles.archiveSchemaGrid}
              data-active={item.id === editId}
            >
              <FilterMessage
                field={currentItem.field}
                type={currentItem.type}
                value={currentItem.value}
                inverted={currentItem.inverted}
                edit={item.id === editId}
                currentId={item.id}
                onRemove={() => remove(index)}
                onEdit={setEditId}
                onSave={(data) => {
                  setValue(`processing.messageFilter.condition.conditions.${index}`, data);
                  setEditId(null);
                }}
              />
            </div>
          );
        }
        return null;
      })}
      {fields.length === 0 && (
        <Text as="span" kind="bodyS" className={styles.archiveSchemaEmptyState}>
          Условий фильтрации нет
        </Text>
      )}
      <Button
        disabled={hasEmptyFields || !!editId}
        view="secondary"
        size="sm"
        prefixIcon={<Icon.Plus />}
        style={{ width: '100%', marginTop: 12 }}
        onClick={() => append({ type: '', field: '', value: '', inverted: false })}
      >
        поле
      </Button>
    </AccordionComponent>
  );
};

export default PreprocessingFilterMessage;

import { clsx, Text, Button, Icon } from '@sds-eng/base';
import { FC, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import AccordionComponent from '@src/Shared/ui/AccordionComponent';

import CopyFields from '@src/Features/SchemaFields/CopyFields';

import * as styles from './styles.module.css';

const PreprocessingCopySchema: FC = () => {
  const { control, setValue } = useFormContext();
  const [editId, setEditId] = useState<string | null>(null);
  const { fields, append, remove } = useFieldArray({ name: 'processing.copyField', control });
  const schemaFields = useWatch({ name: 'schema.fields', defaultValue: [] }) as {
    name: string;
    type: string;
    subType?: string;
    format?: string;
  }[];
  const copyFields = useWatch({ name: 'processing.copyField', defaultValue: [] }) as {
    from: string;
    to: string[];
  }[];

  const options = schemaFields.map((item) => ({ label: item.name, value: item.name }));

  const hasEmptyFields = copyFields.some((item) => !item.from || !item.to);

  return (
    <AccordionComponent title="Копирование поля">
      <div style={{ gridTemplateColumns: '1fr 1fr 80px' }} className={clsx(styles.archiveSchemaGrid, styles.archiveSchemaDateGridHeader)}>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Имя поля
        </Text>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Поля для копирования
        </Text>
        <div />
      </div>
      {fields.map((item, index) => {
        const currentItem = copyFields[index];
        if (currentItem) {
          return (
            <div key={item.id} style={{ gridTemplateColumns: '1fr 1fr 80px' }} className={styles.archiveSchemaGrid} data-active={item.id === editId}>
              <CopyFields
                from={currentItem.from}
                to={currentItem.to}
                options={options}
                edit={item.id === editId}
                currentId={item.id}
                onRemove={() => remove(index)}
                onEdit={setEditId}
                onSave={(data) => {
                  setValue(`processing.copyField.${index}`, data);
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
          Полей, созданных с помощью копирования, в схеме нет
        </Text>
      )}
      <Button
        disabled={hasEmptyFields || !!editId}
        view="secondary"
        size="sm"
        prefixIcon={<Icon.Plus />}
        style={{ width: '100%', marginTop: 12 }}
        onClick={() => append({ from: '', to: [] })}
      >
        поле
      </Button>
    </AccordionComponent>
  );
};

export default PreprocessingCopySchema;

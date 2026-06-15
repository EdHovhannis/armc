import { clsx, Text, Button, Icon, Switch, LabelControl } from '@sds-eng/base';
import { FC, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import AccordionComponent from '@src/Shared/ui/AccordionComponent';

import AuditMessage from '@src/Features/SchemaFields/AuditMessage';

import * as styles from './styles.module.css';

const PreprocessingAuditMessage: FC = () => {
  const { control, setValue } = useFormContext();
  const [editId, setEditId] = useState<string | null>(null);
  const [fullState, setFullState] = useState<boolean>(false);
  const { fields, append, remove } = useFieldArray({ name: 'processing.copyAuditParams.copyAuditParamsSpecs', control });
  const messageFields = useWatch({ name: 'processing.copyAuditParams.copyAuditParamsSpecs', defaultValue: [] }) as {
    auditParamsArrayFieldName: string;
    auditParamName: string;
    fieldWithAuditParamName: string;
    fieldWithAuditParamValue: string;
    resultFieldName: string;
    resultFieldType: string;
  }[];

  const hasEmptyFields = messageFields.some(
    (item) =>
      !item.auditParamsArrayFieldName ||
      !item.auditParamName ||
      !item.fieldWithAuditParamName ||
      !item.fieldWithAuditParamValue ||
      !item.resultFieldName,
  );

  return (
    <AccordionComponent title="Копирования поля параметра аудита">
      <div style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }} className={styles.archiveSchemaGrid}>
        <div />
        <LabelControl
          label="Отображать дополнительные поля"
          checked={fullState}
          onChange={() => setFullState((prev) => !prev)}
          control={<Switch />}
        />
      </div>
      <div
        style={{ gridTemplateColumns: fullState ? '1fr 1fr 1fr 1fr 1fr 1fr 80px' : '1fr 1fr 80px' }}
        className={clsx(styles.archiveSchemaGrid, styles.archiveSchemaDateGridHeader)}
      >
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Имя массивов параметра
        </Text>
        <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
          Имя параметра
        </Text>
        {fullState && (
          <>
            <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
              Поле с именем параметра аудита
            </Text>
            <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
              Поле со значением параметра аудита
            </Text>
            <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
              Имя итогового поля
            </Text>
            <Text as="h5" kind="bodyS" className={styles.archiveSchemaDateGridHeaderText}>
              Тип поля
            </Text>
          </>
        )}
        <div />
      </div>
      {fields.map((item, index) => {
        const currentItem = messageFields[index];
        if (currentItem) {
          return (
            <div
              key={item.id}
              style={{ gridTemplateColumns: fullState ? '1fr 1fr 1fr 1fr 1fr 1fr 80px' : '1fr 1fr 80px' }}
              className={styles.archiveSchemaGrid}
              data-active={item.id === editId}
            >
              <AuditMessage
                auditParamsArrayFieldName={currentItem.auditParamsArrayFieldName}
                auditParamName={currentItem.auditParamName}
                fieldWithAuditParamName={currentItem.fieldWithAuditParamName}
                fieldWithAuditParamValue={currentItem.fieldWithAuditParamValue}
                resultFieldName={currentItem.resultFieldName}
                resultFieldType={currentItem.resultFieldType}
                fullState={fullState}
                edit={item.id === editId}
                currentId={item.id}
                onRemove={() => remove(index)}
                onEdit={setEditId}
                onSave={(data) => {
                  setValue(`processing.copyAuditParams.copyAuditParamsSpecs.${index}`, data);
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
          Поля для копирования отсутствуют
        </Text>
      )}
      <Button
        disabled={hasEmptyFields || !!editId}
        view="secondary"
        size="sm"
        prefixIcon={<Icon.Plus />}
        style={{ width: '100%', marginTop: 12 }}
        onClick={() =>
          append({
            auditParamsArrayFieldName: 'params',
            auditParamName: '',
            fieldWithAuditParamName: 'name',
            fieldWithAuditParamValue: 'value',
            resultFieldName: '',
            resultFieldType: 'STRING',
          })
        }
      >
        поле
      </Button>
    </AccordionComponent>
  );
};

export default PreprocessingAuditMessage;

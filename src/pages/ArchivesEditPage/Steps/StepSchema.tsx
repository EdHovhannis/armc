import { clsx, Text, Button, Icon } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import AccordionWithSearch from '@src/Shared/ui/AccordionWithSearch';

import { fetchDateFormatsFx } from '@src/Entities/InputFormat/api';

import DateFields from '@src/Features/SchemaFields/DateFields';
import MainFields from '@src/Features/SchemaFields/MainFields';

import { createSchemaFx } from './api';
import * as styles from './styles.module.css';

const StepSchema: FC = () => {
  const [fetchDateFormats, createSchema] = useUnit([fetchDateFormatsFx, createSchemaFx]);
  const { control, setValue } = useFormContext();
  const [searchField, setSearchField] = useState('');
  const [searchFieldDate, setSearchFieldDate] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editDateId, setEditDateId] = useState<string | null>(null);
  const { fields, append, remove } = useFieldArray({ name: 'schema.fields', control });
  const schemaFields = useWatch({ name: 'schema.fields', defaultValue: [] }) as { name: string; type: string; subType?: string; format?: string }[];
  const currentFields = fields.filter(
    (item) => 'name' in item && typeof item.name === 'string' && item.name.toLowerCase().includes(searchField.toLowerCase()),
  );
  const currentDatesFields = schemaFields.filter((item) => {
    const isCurrentFiledName = item.name.toLowerCase().includes(searchFieldDate.toLowerCase());
    const isDateType = item.type === 'DATE';
    const isDateSubType = item.subType === 'DATE';

    return isCurrentFiledName && (isDateType || isDateSubType);
  });

  const hasEmptyFields = schemaFields.some((item) => !item.name || !item.type);

  useEffect(() => {
    fetchDateFormats();
  }, [fetchDateFormats]);

  return (
    <div className={clsx(styles.archiveStepWrapper, styles.archiveStepWrapperFullWidth)}>
      <div className={styles.archiveStepSchemaActiveWrapper}>
        <Button view="secondary" onClick={() => createSchema()}>
          Сгенерировать
        </Button>
        <Button
          kind="ghost"
          view="secondary"
          disabled={schemaFields.length === 0}
          onClick={() => {
            remove();
            setValue('schema.fields', []);
          }}
        >
          Очистить
        </Button>
      </div>
      <div className={styles.archiveStepSchemaAccordionWrapper}>
        <AccordionWithSearch title="Данные" search={searchField} onChangeSearch={setSearchField} defaultExpanded>
          <div className={clsx(styles.archiveStepSchemaGrid, styles.archiveStepSchemaDateGridHeader)}>
            <Text as="h5" kind="bodyS" className={styles.archiveStepSchemaDateGridHeaderText}>
              Поле
            </Text>
            <Text as="h5" kind="bodyS" className={styles.archiveStepSchemaDateGridHeaderText}>
              Тип поля
            </Text>
            <Text as="h5" kind="bodyS" className={styles.archiveStepSchemaDateGridHeaderText}>
              Подтип
            </Text>
            <div />
          </div>
          {fields.map((item, index) => {
            const currentItem = schemaFields[index];
            // Фильтруем список тут, чтобы сохранить порядок массива для react-hook-form, иначе index будет не валидный,
            // если фильтровать выше
            if (currentItem && (searchField.length === 0 || currentItem.name.toLowerCase().includes(searchField.toLowerCase()))) {
              return (
                <div key={item.id} className={styles.archiveStepSchemaGrid} data-active={item.id === editId}>
                  <MainFields
                    name={currentItem.name}
                    type={currentItem.type}
                    subType={currentItem.subType}
                    edit={item.id === editId}
                    currentId={item.id}
                    onRemove={() => remove(index)}
                    onEdit={setEditId}
                    onSave={(data) => {
                      setValue(`schema.fields.${index}`, data);
                      setEditId(null);
                    }}
                  />
                </div>
              );
            }
            return null;
          })}
          {fields.length === 0 && searchField.length === 0 && (
            <Text as="span" kind="bodyS" className={styles.archiveStepSchemaEmptyState}>
              Полей в схеме нет
            </Text>
          )}
          {currentFields.length === 0 && searchField.length > 0 && (
            <Text as="span" kind="bodyS" className={styles.archiveStepSchemaEmptyState}>
              Поля с данным именем не найдены
            </Text>
          )}
          <Button
            disabled={hasEmptyFields || !!editId}
            view="secondary"
            size="sm"
            prefixIcon={<Icon.Plus />}
            style={{ width: '100%', marginTop: 12 }}
            onClick={() => append({ name: '', type: '', subType: '' })}
          >
            поле
          </Button>
        </AccordionWithSearch>
      </div>
      <div className={styles.archiveStepSchemaAccordionWrapper}>
        <AccordionWithSearch title="Даты" search={searchFieldDate} onChangeSearch={setSearchFieldDate} defaultExpanded>
          <div className={clsx(styles.archiveStepSchemaGrid, styles.archiveStepSchemaDateGridHeader)}>
            <Text as="h5" kind="bodyS" className={styles.archiveStepSchemaDateGridHeaderText}>
              Поле времени
            </Text>
            <Text as="h5" kind="bodyS" className={styles.archiveStepSchemaDateGridHeaderText}>
              Исходный формат времени
            </Text>
            <div />
          </div>
          {schemaFields.map((item, index) => {
            const currentItem = schemaFields[index];
            const isCurrentFiledName = item.name.toLowerCase().includes(searchFieldDate.toLowerCase());
            const isDateType = item.type === 'DATE';
            const isDateSubType = item.subType === 'DATE';
            // Фильтруем список тут, чтобы сохранить порядок массива для react-hook-form, иначе index будет не валидный,
            // если фильтровать выше
            if (currentItem && isCurrentFiledName && (isDateType || isDateSubType)) {
              return (
                <div key={item.name} className={styles.archiveStepSchemaDateGrid} data-active={item.name === editDateId}>
                  <DateFields
                    name={currentItem.name}
                    type={currentItem.type}
                    subType={currentItem.subType}
                    format={currentItem.format}
                    edit={item.name === editDateId}
                    currentId={item.name}
                    onEdit={setEditDateId}
                    onSave={(data) => {
                      setValue(`schema.fields.${index}`, data);
                      setEditDateId(null);
                    }}
                  />
                </div>
              );
            }
            return null;
          })}
          {currentDatesFields.length === 0 && searchFieldDate.length === 0 && (
            <Text as="span" kind="bodyS" className={styles.archiveStepSchemaEmptyState}>
              Полей с типом &quot;Дата&quot; в схеме нет
            </Text>
          )}
          {currentDatesFields.length === 0 && searchFieldDate.length > 0 && (
            <Text as="span" kind="bodyS" className={styles.archiveStepSchemaEmptyState}>
              Поля с данным именем не найдены
            </Text>
          )}
        </AccordionWithSearch>
      </div>
    </div>
  );
};

export default StepSchema;

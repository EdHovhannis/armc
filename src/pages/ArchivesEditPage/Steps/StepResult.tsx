import { ColumnProps, LabelControl, Radio, RadioGroup, Select, Table, Text, TextField } from '@sds-eng/base';
import { FC, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { formatBytes } from '@src/Shared/lib/format/formatBytes';
import { formatSpeed } from '@src/Shared/lib/format/formatSpeed';
import { sizeUnitToBytes, speedUnitToBytesPerSec } from '@src/Shared/lib/format/quotaUnits';

import { PrimaryTimeFieldType } from '@src/Entities/Archives/types';

import { ArchiveEditFormValues } from '../types';

import * as styles from './styles.module.css';

type SchemaTableRow = {
  name: string;
  type: string;
  subtype: string;
};

type DateTableRow = {
  dateField: string;
  sourceFormat: string;
};

const columns: ColumnProps<SchemaTableRow>[] = [
  { key: 'name', dataIndex: 'name', title: 'Поле', align: 'right' },
  { key: 'type', dataIndex: 'type', title: 'Тип поля', align: 'center' },
  { key: 'subtype', dataIndex: 'subtype', title: 'Подтип', align: 'left' },
];

const columnsDate: ColumnProps<DateTableRow>[] = [
  { key: 'dateField', dataIndex: 'dateField', title: 'Поле времени', align: 'right' },
  { key: 'sourceFormat', dataIndex: 'sourceFormat', title: 'Исходный формат времени', align: 'right' },
];

const isDateField = (field: { type: string; subType?: string }) => field.type === 'DATE' || field.subType === 'DATE';

const StepResult: FC = () => {
  const { control } = useFormContext<ArchiveEditFormValues>();
  const [schemaFields, quota, quotaUnits, flatten, primaryTimeFieldType] = useWatch({
    control,
    name: ['schema.fields', 'quota', 'quotaUnits', 'flatten', 'primaryTimeField.type'],
  });

  const schemaTableData = useMemo<SchemaTableRow[]>(
    () =>
      (schemaFields ?? [])
        .filter((field) => !isDateField(field))
        .map((field) => ({
          name: field.name,
          type: field.type,
          subtype: field.subType ?? '',
        })),
    [schemaFields],
  );

  const dateTableData = useMemo<DateTableRow[]>(
    () =>
      (schemaFields ?? []).filter(isDateField).map((field) => ({
        dateField: field.name,
        sourceFormat: field.format ?? '',
      })),
    [schemaFields],
  );

  const dateFieldOptions = useMemo(() => dateTableData.map((item) => ({ label: item.dateField, value: item.dateField })), [dateTableData]);

  const archiveSizeLabel = formatBytes(sizeUnitToBytes(quota?.maxSizeBytes ?? 0, quotaUnits?.size ?? 'MB'));
  const archiveSpeedLabel = formatSpeed(speedUnitToBytesPerSec(quota?.maxDataRateBytesPerSec ?? 0, quotaUnits?.speed ?? 'B/s'));
  const isCustomTimeField = primaryTimeFieldType === 'CUSTOM';

  return (
    <div className={styles.archiveStepWrapper}>
      <div className={styles.archiveIndexInfo}>
        <Text as="span">Размер архива: {archiveSizeLabel}</Text>
        <Text as="span">Скорость записи: {archiveSpeedLabel}</Text>
        <Text as="span">Вложенные поля в JSON {flatten ? 'будут' : 'не будут'} раскладываться.</Text>
      </div>
      <div className={styles.archiveIndexTimeInfo}>
        <div>
          <Text kind="h5b">Основное время</Text>
          <Controller
            name="primaryTimeField.type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                direction="vertical"
                name="primaryTimeFieldType"
                onChange={(value) => field.onChange(value as PrimaryTimeFieldType)}
              >
                <LabelControl value="CUSTOM" control={<Radio />} label="использовать поле из схемы" />
                <LabelControl value="AUTOGENERATE" control={<Radio />} label="использовать время записи в хранилище" />
              </RadioGroup>
            )}
          />
        </div>
        <div className={styles.archiveStepItemWrapper}>
          {isCustomTimeField ? (
            <Controller
              name="primaryTimeField.field"
              control={control}
              render={({ field }) => {
                const currentValue = dateFieldOptions.find((item) => item.value === field.value) ?? null;
                return (
                  <Select
                    placeholder="Поле из схемы"
                    options={dateFieldOptions}
                    canClear
                    isSearchable
                    limitByWidth
                    required
                    {...field}
                    value={currentValue}
                    onChange={(value) => field.onChange(value ?? '')}
                  />
                );
              }}
            />
          ) : (
            <>
              <Controller
                name="primaryTimeField.lateMessageRejectionPeriod"
                control={control}
                render={({ field }) => <TextField placeholder="Допустимый диапазон времени в сообщении (прошлое)" required {...field} />}
              />
              <Controller
                name="primaryTimeField.earlyMessageRejectionPeriod"
                control={control}
                render={({ field }) => <TextField placeholder="Допустимый диапазон времени в сообщении (будущее)" required {...field} />}
              />
            </>
          )}
        </div>
      </div>

      <div className={styles.archiveStepItemWrapper}>
        <Text kind="h5b">Dead Letter Queue</Text>
        <Controller
          name="deadLetterQueue"
          control={control}
          render={({ field }) => {
            const dlqOptions = schemaTableData.map((item) => ({ label: item.name, value: item.name }));
            const currentValue = field.value ? (dlqOptions.find((item) => item.value === field.value) ?? null) : null;
            return (
              <Select
                placeholder="Выберите значение"
                options={dlqOptions}
                canClear
                isSearchable
                limitByWidth
                {...field}
                value={currentValue}
                onChange={(value) => field.onChange(value ?? null)}
              />
            );
          }}
        />
      </div>
      <div className={styles.archiveStepItemWrapper}>
        <Text kind="h5b">Метки</Text>
        <Controller name="labelsText" control={control} render={({ field }) => <TextField placeholder="Введите значение" {...field} />} />
      </div>
      <div className={styles.archiveIndexDataInfo}>
        <Text kind="h5b">Схема индекса</Text>
        <div>
          <Text kind="h5b">Данные</Text>
          <Table dataSource={schemaTableData} columns={columns} />
        </div>
        <div>
          <Text kind="h5b">Даты</Text>
          <Table dataSource={dateTableData} columns={columnsDate} />
        </div>
      </div>
    </div>
  );
};

export default StepResult;

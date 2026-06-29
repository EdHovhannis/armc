import { ColumnProps, LabelControl, Radio, RadioGroup, Select, Table, Text, TextField } from '@sds-eng/base';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import * as styles from './styles.module.css';
interface TempInterface {
  name: string;
  type: string;
  subtype: string;
}
interface TempInterfaceDate {
  name: string;
  type: string;
  subtype: string;
}
const dataSourceDate: [] = [{ dateField: 'timestamp', sourceFormat: 'UNIX_TIMESTAMP_MILLIS' }];

const columnsDate = [
  {
    key: 'dateField',
    dataIndex: 'dateField',
    title: 'Поле времени',
    align: 'right',
  },
  {
    key: 'sourceFormat',
    dataIndex: 'sourceFormat',
    title: 'Исходный формат времени',
    align: 'right',
  },
];

const dataSource: [] = [
  { name: 'hostname', type: 'string', subtype: '' },
  { name: 'app_version', type: 'string', subtype: '' },
  { name: 'pod', type: 'string', subtype: '' },
];

const columns: ColumnProps<TempInterface>[] = [
  {
    key: 'name',
    dataIndex: 'name',
    title: 'Поле',
    align: 'right',
  },
  {
    key: 'type',
    dataIndex: 'type',
    title: 'Тип поля',
    align: 'center',
  },
  {
    key: 'subtype',
    dataIndex: 'subtype',
    title: 'Подтип',
    align: 'left',
  },
];

const StepResult = () => {
  const [value, setTempValue] = useState('debt');
  const { control, setValue } = useFormContext();

  return (
    <div className={styles.archiveStepWrapper}>
      <div className={styles.archiveIndexInfo}>
        <Text as="span">Размер архива: 1.19 Gb</Text>
        <Text as="span"> Скорость записи: 1000 b/s</Text>
        <Text as="span"> Вложенные поля в JSON раскладываться не будут.</Text>
      </div>
      <div className={styles.archiveIndexTimeInfo}>
        <div>
          <Text kind="h5b">Основное время</Text>
          <RadioGroup value={value} direction="vertical" name="Vertical" onChange={setTempValue}>
            <LabelControl value="debt" control={<Radio />} label="использовать поле из схемы" />
            <LabelControl value="credit" control={<Radio />} label="использовать время записи в хранилище" />
          </RadioGroup>
        </div>
        {value === 'debt' ? (
          <div>
            <Controller
              name="projectShortName"
              control={control}
              rules={{}}
              render={({ field }) => {
                // const currentValue = optionsProject.find((item) => item.value === field.value) || null;
                return (
                  <Select
                    defaultValue={null}
                    placeholder="Поле из схемы"
                    options={[]}
                    canClear
                    isSearchable
                    loading={false}
                    limitByWidth
                    required
                    {...field}
                    value={null}
                  />
                );
              }}
            />
          </div>
        ) : (
          <div>
            <Controller
              name="projectShortName"
              control={control}
              rules={{}}
              render={({ field }) => {
                // const currentValue = optionsProject.find((item) => item.value === field.value) || null;
                return (
                  <Select
                    defaultValue={null}
                    placeholder="Поле из схемы"
                    options={[]}
                    canClear
                    isSearchable
                    loading={false}
                    limitByWidth
                    required
                    {...field}
                    value={null}
                  />
                );
              }}
            />
            <Controller
              name="name"
              control={control}
              rules={{}}
              render={({ field }) => (
                <TextField placeholder="Допустимый диапазон времени в сообщении (прошлое)" required {...field} defaultValue={'P1D'} />
              )}
            />
            <Controller
              name="name"
              control={control}
              rules={{}}
              render={({ field }) => (
                <TextField placeholder="Допустимый диапазон времени в сообщении (будущее)" required {...field} defaultValue={'P1D'} />
              )}
            />
          </div>
        )}
      </div>

      <div>
        <Text kind="h5b"> Dead Letter Queue</Text>
        <Controller
          name="projectShortName"
          control={control}
          rules={{}}
          render={({ field }) => {
            // const currentValue = optionsProject.find((item) => item.value === field.value) || null;
            return (
              <Select
                defaultValue={null}
                placeholder="Выберите значение"
                options={[]}
                canClear
                isSearchable
                loading={false}
                limitByWidth
                required
                {...field}
                value={null}
              />
            );
          }}
        />
      </div>
      <div>
        <Text kind="h5b">Метки</Text>
        <Controller
          name="name"
          control={control}
          rules={{}}
          render={({ field }) => <TextField placeholder="Введите значение" required {...field} />}
        />
      </div>
      <div className={styles.archiveIndexDataInfo}>
        <Text kind="h5b"> Схема индекса</Text>
        <div>
          <Text kind="h5b"> Данные </Text>
          <Table dataSource={dataSource} columns={columns} />
        </div>
        <div>
          <Text kind="h5b"> Даты </Text>
          <Table dataSource={dataSourceDate} columns={columnsDate} />
        </div>
      </div>
    </div>
  );
};

export default StepResult;

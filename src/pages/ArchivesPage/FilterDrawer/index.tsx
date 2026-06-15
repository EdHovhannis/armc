import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Select, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { OptionItemType } from '@src/Shared/types/filter';

import { $filterDrawerOpen, onChangeFilterDrawerOpen } from './model';
import * as styles from './styles.module.css';
import { FilterFormValues } from './types';

const IN_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: 'IN', label: 'IN' },
  { value: 'NOT_IN', label: 'NOT IN' },
  { value: 'IS', label: 'IS' },
  { value: 'IS NOT', label: 'IS NOT' },
];

const IS_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: 'IS', label: 'IS' },
  { value: 'IS_NOT', label: 'IS NOT' },
];

const COMPARE_OPERATOR_OPTIONS: OptionItemType[] = [
  { value: '>=', label: '≥' },
  { value: '<=', label: '≤' },
  { value: '=', label: '=' },
];

const STATUS_OPTIONS: OptionItemType[] = [
  { value: 'RUNNING', label: 'RUNNING' },
  { value: 'STOPPED', label: 'STOPPED' },
  { value: 'FAILED', label: 'FAILED' },
  { value: 'UNDEFINED', label: 'UNDEFINED' },
  { value: 'WITHOUT_RESPONSE', label: 'WITHOUT_RESPONSE' },
];

const ZONE_OPTIONS: OptionItemType[] = [
  { value: 'PRIMARY', label: 'PRIMARY' },
  { value: 'SECONDARY', label: 'SECONDARY' },
];

const WRITE_SPEED_UNIT_OPTIONS: OptionItemType[] = [
  { value: 'B/s', label: 'B/s' },
  { value: 'KB/s', label: 'KB/s' },
  { value: 'MB/s', label: 'MB/s' },
  { value: 'GB/s', label: 'GB/s' },
];

const INDEX_SIZE_UNIT_OPTIONS: OptionItemType[] = [
  { value: 'B', label: 'B' },
  { value: 'KB', label: 'KB' },
  { value: 'MB', label: 'MB' },
  { value: 'GB', label: 'GB' },
];

const RETENTION_UNIT_OPTIONS: OptionItemType[] = [
  { value: 'сек', label: 'сек' },
  { value: 'мин', label: 'мин' },
  { value: 'ч', label: 'ч' },
  { value: 'дн', label: 'дн' },
];

const DEFAULT_VALUES: FilterFormValues = {
  configuration: { operator: 'IN', values: [] },
  projectKey: { operator: 'IN', values: [] },
  status: { operator: 'IN', values: [] },
  labels: { operator: 'IN', values: [] },
  zone: { operator: 'IS', value: '' },
  configVersion: { operator: 'IS', value: '' },
  processingSpeed: { operator: '>=', value: '' },
  maxWriteSpeed: { operator: 'IN', from: '', to: '', unit: 'B/s' },
  maxIndexSize: { operator: 'IN', from: '', to: '', unit: 'B' },
  maxRetention: { operator: 'IN', from: '', to: '', unit: 'сек' },
};

const toMultiValues = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  return v.map((i) => (typeof i === 'string' ? i : (i as OptionItemType).value));
};

const FilterDrawer: FC = () => {
  const [open, onChangeFilterDrawerOpenFn] = useUnit([$filterDrawerOpen, onChangeFilterDrawerOpen]);
  const { control, handleSubmit, reset } = useForm<FilterFormValues>({ defaultValues: DEFAULT_VALUES });

  const handleClose = () => onChangeFilterDrawerOpenFn(false);

  const handleReset = () => {
    reset(DEFAULT_VALUES);
    console.log('Сбросить фильтры');
  };

  const onSubmit = handleSubmit((data) => {
    console.log('Применить фильтры:', data);
    handleClose();
  });

  return (
    <Drawer open={open} onClose={handleClose} width={520}>
      <DrawerHeader onClose={handleClose}>Фильтр</DrawerHeader>
      <DrawerBody>
        <div className={styles.filterDrawerBody}>
          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Конфигурация</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="configuration.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="configuration.values"
                  control={control}
                  render={({ field }) => (
                    <Select
                      multiple
                      isSearchable
                      options={[]}
                      size="sm"
                      placeholder="Выберите значение"
                      value={field.value as string[]}
                      onChange={(v) => field.onChange(toMultiValues(v))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Ключ проекта</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="projectKey.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="projectKey.values"
                  control={control}
                  render={({ field }) => (
                    <Select
                      multiple
                      isSearchable
                      options={[]}
                      size="sm"
                      placeholder="Выберите значение"
                      value={field.value as string[]}
                      onChange={(v) => field.onChange(toMultiValues(v))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Статус</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="status.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="status.values"
                  control={control}
                  render={({ field }) => {
                    const values = STATUS_OPTIONS.filter((o) => (field.value as string[]).includes(o.value));
                    return (
                      <Select
                        multiple
                        options={STATUS_OPTIONS}
                        size="sm"
                        placeholder="Выберите значение"
                        value={values}
                        onChange={(v) => field.onChange(toMultiValues(v))}
                        disableCloseOnSelect
                        formatOptionLabel={(label) => <Text kind="bodyS">{label}</Text>}
                      />
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Метки</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="labels.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="labels.values"
                  control={control}
                  render={({ field }) => (
                    <Select
                      multiple
                      isSearchable
                      options={[]}
                      size="sm"
                      placeholder="Выберите значение"
                      value={field.value as string[]}
                      onChange={(v) => field.onChange(toMultiValues(v))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Зона</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="zone.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IS_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IS_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="zone.value"
                  control={control}
                  render={({ field }) => {
                    const value = ZONE_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return (
                      <Select
                        options={ZONE_OPTIONS}
                        placeholder="Выберите значение"
                        canClear
                        size="sm"
                        {...field}
                        value={value}
                        formatOptionLabel={(label) => <Text kind="bodyS">{label}</Text>}
                      />
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Версия конфигурации</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="configVersion.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IS_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IS_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="configVersion.value"
                  control={control}
                  render={({ field }) => <TextField size="sm" placeholder="Выберите значение" {...field} />}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Скорость обработки (%)</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="processingSpeed.operator"
                  control={control}
                  render={({ field }) => {
                    const value = COMPARE_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={COMPARE_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerValueField}>
                <Controller
                  name="processingSpeed.value"
                  control={control}
                  render={({ field }) => <TextField size="sm" placeholder="Введите значение" {...field} />}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Максимальная скорость записи</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="maxWriteSpeed.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerRangeRow}>
                <div className={styles.filterDrawerRangeInput}>
                  <Controller
                    name="maxWriteSpeed.from"
                    control={control}
                    render={({ field }) => <TextField size="sm" placeholder="от" {...field} />}
                  />
                </div>
                <span className={styles.filterDrawerRangeDash}>—</span>
                <div className={styles.filterDrawerRangeInput}>
                  <Controller name="maxWriteSpeed.to" control={control} render={({ field }) => <TextField size="sm" placeholder="до" {...field} />} />
                </div>
                <div className={styles.filterDrawerUnitSelect}>
                  <Controller
                    name="maxWriteSpeed.unit"
                    control={control}
                    render={({ field }) => {
                      const value = WRITE_SPEED_UNIT_OPTIONS.find((o) => o.value === field.value) ?? null;
                      return <Select size="sm" options={WRITE_SPEED_UNIT_OPTIONS} {...field} value={value} />;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Максимальный размер индекса</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="maxIndexSize.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerRangeRow}>
                <div className={styles.filterDrawerRangeInput}>
                  <Controller
                    name="maxIndexSize.from"
                    control={control}
                    render={({ field }) => <TextField size="sm" placeholder="от" {...field} />}
                  />
                </div>
                <span className={styles.filterDrawerRangeDash}>—</span>
                <div className={styles.filterDrawerRangeInput}>
                  <Controller name="maxIndexSize.to" control={control} render={({ field }) => <TextField size="sm" placeholder="до" {...field} />} />
                </div>
                <div className={styles.filterDrawerUnitSelect}>
                  <Controller
                    name="maxIndexSize.unit"
                    control={control}
                    render={({ field }) => {
                      const value = INDEX_SIZE_UNIT_OPTIONS.find((o) => o.value === field.value) ?? null;
                      return <Select size="sm" options={INDEX_SIZE_UNIT_OPTIONS} {...field} value={value} />;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.filterDrawerField}>
            <Text kind="h5b">Максимальное время хранения данных</Text>
            <div className={styles.filterDrawerControls}>
              <div className={styles.filterDrawerOperatorSelect}>
                <Controller
                  name="maxRetention.operator"
                  control={control}
                  render={({ field }) => {
                    const value = IN_OPERATOR_OPTIONS.find((o) => o.value === field.value) ?? null;
                    return <Select size="sm" options={IN_OPERATOR_OPTIONS} {...field} value={value} />;
                  }}
                />
              </div>
              <div className={styles.filterDrawerRangeRow}>
                <div className={styles.filterDrawerRangeInput}>
                  <Controller
                    name="maxRetention.from"
                    control={control}
                    render={({ field }) => <TextField size="sm" placeholder="от" {...field} />}
                  />
                </div>
                <span className={styles.filterDrawerRangeDash}>—</span>
                <div className={styles.filterDrawerRangeInput}>
                  <Controller name="maxRetention.to" control={control} render={({ field }) => <TextField size="sm" placeholder="до" {...field} />} />
                </div>
                <div className={styles.filterDrawerUnitSelect}>
                  <Controller
                    name="maxRetention.unit"
                    control={control}
                    render={({ field }) => {
                      const value = RETENTION_UNIT_OPTIONS.find((o) => o.value === field.value) ?? null;
                      return <Select size="sm" options={RETENTION_UNIT_OPTIONS} {...field} value={value} />;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className={styles.filterDrawerFooter}>
          <Button onClick={onSubmit}>Применить</Button>
          <Button view="secondary" onClick={handleReset}>
            Сбросить
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
};

export default FilterDrawer;

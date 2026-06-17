import { Text } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import {
  COMPARE_OPERATOR_OPTIONS,
  INDEX_SIZE_UNIT_OPTIONS,
  IN_OPERATOR_OPTIONS,
  IS_OPERATOR_OPTIONS,
  RETENTION_UNIT_OPTIONS,
  STATUS_OPTIONS,
  WRITE_SPEED_UNIT_OPTIONS,
  ZONE_OPTIONS,
} from '@src/Shared/constants/filters';
import { OptionItemType } from '@src/Shared/types/filter';

import ControllerSelectMultiple from '@src/Features/Controllers/ControllerSelectMultiple';
import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';
import ControllerTextField from '@src/Features/Controllers/ControllerTextField';

import * as styles from './styles.module.css';

type FilterDrawerFieldProps = {
  title: string;
  operatorName: string;
  operatorOptions: OptionItemType[];
  children: ReactNode;
};

// строка фильтра: заголовок + селект оператора + контрол значения
const FilterDrawerField: FC<FilterDrawerFieldProps> = ({ title, operatorName, operatorOptions, children }) => (
  <div className={styles.filterDrawerField}>
    <Text kind="h5b">{title}</Text>
    <div className={styles.filterDrawerControls}>
      <div className={styles.filterDrawerOperatorSelect}>
        <ControllerSelectSingle name={operatorName} options={operatorOptions} />
      </div>
      {children}
    </div>
  </div>
);

type FilterDrawerRangeProps = {
  name: 'maxWriteSpeed' | 'maxIndexSize' | 'maxRetention';
  unitOptions: OptionItemType[];
};

// диапазон "от - до" , плюс единица измерения
const FilterDrawerRange: FC<FilterDrawerRangeProps> = ({ name, unitOptions }) => (
  <div className={styles.filterDrawerRangeRow}>
    <div className={styles.filterDrawerRangeInput}>
      <ControllerTextField name={`${name}.from`} placeholder="от" />
    </div>
    <span className={styles.filterDrawerRangeDash}>—</span>
    <div className={styles.filterDrawerRangeInput}>
      <ControllerTextField name={`${name}.to`} placeholder="до" />
    </div>
    <div className={styles.filterDrawerUnitSelect}>
      <ControllerSelectSingle name={`${name}.unit`} options={unitOptions} />
    </div>
  </div>
);

const FilterDrawerBody: FC = () => (
  <div className={styles.filterDrawerBody}>
    <FilterDrawerField title="Конфигурация" operatorName="configuration.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerSelectMultiple name="configuration.values" options={[]} isSearchable placeholder="Выберите значение" />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Ключ проекта" operatorName="projectKey.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerSelectMultiple name="projectKey.values" options={[]} isSearchable placeholder="Выберите значение" />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Статус" operatorName="status.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerSelectMultiple
          name="status.values"
          options={STATUS_OPTIONS}
          placeholder="Выберите значение"
          disableCloseOnSelect
          formatOptionLabel={(label) => <Text kind="bodyS">{label}</Text>}
        />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Метки" operatorName="labels.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerSelectMultiple name="labels.values" options={[]} isSearchable placeholder="Выберите значение" />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Зона" operatorName="zone.operator" operatorOptions={IS_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerSelectSingle
          name="zone.value"
          options={ZONE_OPTIONS}
          placeholder="Выберите значение"
          canClear
          formatOptionLabel={(label) => <Text kind="bodyS">{label}</Text>}
        />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Версия конфигурации" operatorName="configVersion.operator" operatorOptions={IS_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerTextField name="configVersion.value" placeholder="Выберите значение" />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Скорость обработки (%)" operatorName="processingSpeed.operator" operatorOptions={COMPARE_OPERATOR_OPTIONS}>
      <div className={styles.filterDrawerValueField}>
        <ControllerTextField name="processingSpeed.value" placeholder="Введите значение" />
      </div>
    </FilterDrawerField>

    <FilterDrawerField title="Максимальная скорость записи" operatorName="maxWriteSpeed.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <FilterDrawerRange name="maxWriteSpeed" unitOptions={WRITE_SPEED_UNIT_OPTIONS} />
    </FilterDrawerField>

    <FilterDrawerField title="Максимальный размер индекса" operatorName="maxIndexSize.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <FilterDrawerRange name="maxIndexSize" unitOptions={INDEX_SIZE_UNIT_OPTIONS} />
    </FilterDrawerField>

    <FilterDrawerField title="Максимальное время хранения данных" operatorName="maxRetention.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
      <FilterDrawerRange name="maxRetention" unitOptions={RETENTION_UNIT_OPTIONS} />
    </FilterDrawerField>
  </div>
);

export default FilterDrawerBody;

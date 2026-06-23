import { Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import {
  COMPARE_OPERATOR_OPTIONS,
  INDEX_SIZE_UNIT_OPTIONS,
  IN_NOT_IN_OPERATOR_OPTIONS,
  IN_OPERATOR_OPTIONS,
  IS_OPERATOR_OPTIONS,
  RETENTION_UNIT_OPTIONS,
  STATUS_OPTIONS,
  WRITE_SPEED_UNIT_OPTIONS,
  ZONE_OPTIONS,
} from '@src/Shared/constants/filters';

import { $optionsArchiveLabel, $optionsArchiveName, $archiveFilterValues } from '@src/Entities/Archives/model';
import {} from '@src/Entities/Archives/model';
import { $optionsProject } from '@src/Entities/Project/model';

import ControllerSelectMultiple from '@src/Features/Controllers/ControllerSelectMultiple';
import ControllerSelectSingle from '@src/Features/Controllers/ControllerSelectSingle';
import ControllerTextField from '@src/Features/Controllers/ControllerTextField';

import FilterDrawerField from './FilterDrawerField';
import FilterDrawerRange from './FilterDrawerRange';
import * as styles from './styles.module.css';

const FilterDrawerBody: FC = () => {
  const [configurationOptions, projectOptions, labelOptions, archiveFilterValues] = useUnit([
    $optionsArchiveName,
    $optionsProject,
    $optionsArchiveLabel,
    $archiveFilterValues,
  ]);

  return (
    <div className={styles.filterDrawerBody}>
      <FilterDrawerField title="Конфигурация" operatorName="configuration.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
        <div className={styles.filterDrawerValueField}>
          <ControllerSelectMultiple
            name="configuration.values"
            options={archiveFilterValues.names}
            isSearchable
            virtualized
            placeholder="Выберите значение"
          />
        </div>
      </FilterDrawerField>

      <FilterDrawerField title="Ключ проекта" operatorName="projectKey.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
        <div className={styles.filterDrawerValueField}>
          <ControllerSelectMultiple name="projectKey.values" options={archiveFilterValues.projects} isSearchable placeholder="Выберите значение" />
        </div>
      </FilterDrawerField>

      <FilterDrawerField title="Статус" operatorName="status.operator" operatorOptions={IN_OPERATOR_OPTIONS}>
        <div className={styles.filterDrawerValueField}>
          <ControllerSelectMultiple
            name="status.values"
            options={STATUS_OPTIONS}
            placeholder="Выберите значение"
            formatOptionLabel={(label) => <Text kind="bodyS">{label}</Text>}
          />
        </div>
      </FilterDrawerField>

      <FilterDrawerField title="Метки" operatorName="labels.operator" operatorOptions={IN_NOT_IN_OPERATOR_OPTIONS}>
        <div className={styles.filterDrawerValueField}>
          <ControllerSelectMultiple
            name="labels.values"
            options={archiveFilterValues.labels}
            isSearchable
            virtualized
            placeholder="Выберите значение"
          />
        </div>
      </FilterDrawerField>

      <FilterDrawerField title="Зона" operatorName="zone.operator" operatorOptions={IS_OPERATOR_OPTIONS}>
        <div className={styles.filterDrawerValueField}>
          <ControllerSelectSingle
            name="zone.value"
            options={archiveFilterValues.zones}
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
};

export default FilterDrawerBody;

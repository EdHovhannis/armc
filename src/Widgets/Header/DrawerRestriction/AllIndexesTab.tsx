import { InputNumber, Select, Text } from '@sds-eng/base';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { RESTRICTION_UNIT_OPTIONS } from '@src/Entities/Restriction/constants';

import * as styles from './styles.module.css';
import { RestrictionsFormValues } from './types';

const AllIndexesTab: FC = () => {
  const { control } = useFormContext<RestrictionsFormValues>();

  return (
    <div className={styles.drawerRestrictionAllTab}>
      <Text kind="textSn" className={styles.drawerRestrictionAllLabel}>
        Максимальный временной интервал поиска
      </Text>
      <div className={styles.drawerRestrictionAllInterval}>
        <div className={styles.drawerRestrictionIntervalValue}>
          <Controller
            name="all.value"
            control={control}
            rules={{ required: true, validate: (value) => Number.isInteger(value) && (value ?? 0) > 0 }}
            render={({ field, fieldState }) => (
              <InputNumber
                placeholder="Введите значение"
                valueType="number"
                precision={0}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                size="sm"
              />
            )}
          />
        </div>
        <div className={styles.drawerRestrictionIntervalUnit}>
          <Controller
            name="all.unit"
            control={control}
            render={({ field }) => {
              const currentValue = RESTRICTION_UNIT_OPTIONS.find((option) => option.value === field.value) || null;
              return <Select options={RESTRICTION_UNIT_OPTIONS} value={currentValue} onChange={field.onChange} size="sm" />;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AllIndexesTab;

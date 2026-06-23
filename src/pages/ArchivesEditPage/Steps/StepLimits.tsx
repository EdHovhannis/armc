import { clsx, Select, Text, InputNumber, StatusCard } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { DateUnitOption, SizeUnitOption, SpeedUnitOption } from '@src/Shared/types/filter';

import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { fetchCurrentEstimateFx, fetchCurrentOverdraftEstimateFx, fetchCurrentProjectLimitsFx } from '@src/Entities/Limits/api';
import { $currentEstimateBlockers, $currentEstimateWarnings } from '@src/Entities/Limits/model';

import LimitsInfo from '@src/Features/Limits/ui/LimitsInfo';
import LimitsProjectInfo from '@src/Features/Limits/ui/LimitsProjectInfo';

import * as styles from './styles.module.css';

type UnitState = {
  speed: SpeedUnitOption;
  size: SizeUnitOption;
  date: DateUnitOption;
};

const StepLimits: FC = () => {
  const { control } = useFormContext();
  const [state, setState] = useState<UnitState>({
    speed: SPEED_LIMITS_UNIT_OPTIONS[0],
    size: SIZE_LIMITS_UNIT_OPTIONS[0],
    date: DATE_LIMITS_UNIT_OPTIONS[5],
  });
  const currentProject = useWatch({ name: 'project', defaultValue: null }) as string | null;
  const [fetchCurrentProjectLimits, fetchCurrentEstimate, fetchCurrentOverdraftEstimate, warnings, blockers, isLimitFeatureSettingEnabled] = useUnit([
    fetchCurrentProjectLimitsFx,
    fetchCurrentEstimateFx,
    fetchCurrentOverdraftEstimateFx,
    $currentEstimateWarnings,
    $currentEstimateBlockers,
    $isLimitFeatureSettingEnabled,
  ]);

  useEffect(() => {
    // if (typeof currentProject === 'string') {
    fetchCurrentProjectLimits('abyss');
    fetchCurrentEstimate({ project: 'abyss' });
    fetchCurrentOverdraftEstimate();
    // }
  }, [currentProject, fetchCurrentProjectLimits, fetchCurrentEstimate, fetchCurrentOverdraftEstimate]);

  return (
    <div className={clsx(styles.archiveStepWrapper, styles.archiveStepWrapperFullWidth)}>
      <div className={styles.archiveStepLimitsGrid}>
        <div className={styles.archiveStepWrapper}>
          <div className={styles.archiveStepItemWrapper}>
            <Text as="h5" kind="h5b">
              Максимальная скорость записи
            </Text>
            <Controller
              name="quota.maxDataRateBytesPerSec"
              control={control}
              rules={{}}
              render={({ field }) => (
                <div className={styles.archiveStepLimitsWrapper}>
                  <InputNumber
                    placeholder="Введите значение"
                    required
                    valueType="number"
                    decimalSeparator="."
                    precision={3}
                    {...field}
                    classes={{ inputContainer: styles.archiveStepLimitsInputWrapper }}
                  />
                  <Select
                    value={state.speed}
                    options={SPEED_LIMITS_UNIT_OPTIONS}
                    onChange={(v, e, fullValue) => (fullValue ? setState((prev) => ({ ...prev, speed: fullValue })) : {})}
                    classes={{ root: styles.archiveStepLimitsSelectWrapper }}
                  />
                </div>
              )}
            />
          </div>
          <div className={styles.archiveStepItemWrapper}>
            <Text as="h5" kind="h5b">
              Максимальный размер архива
            </Text>
            <Controller
              name="quota.maxSizeBytes"
              control={control}
              rules={{}}
              render={({ field }) => (
                <div className={styles.archiveStepLimitsWrapper}>
                  <InputNumber
                    placeholder="Введите значение"
                    required
                    valueType="number"
                    decimalSeparator="."
                    precision={3}
                    {...field}
                    classes={{ inputContainer: styles.archiveStepLimitsInputWrapper }}
                  />
                  <Select
                    value={state.size}
                    options={SIZE_LIMITS_UNIT_OPTIONS}
                    onChange={(v, e, fullValue) => (fullValue ? setState((prev) => ({ ...prev, size: fullValue })) : {})}
                    classes={{ root: styles.archiveStepLimitsSelectWrapper }}
                  />
                </div>
              )}
            />
          </div>
          <div className={styles.archiveStepItemWrapper}>
            <Text as="h5" kind="h5b">
              Максимальное время хранения данных
            </Text>
            <Controller
              name="quota.maxStorageTimeSec"
              control={control}
              rules={{}}
              render={({ field }) => (
                <div className={styles.archiveStepLimitsWrapper}>
                  <InputNumber
                    placeholder="Введите значение"
                    required
                    valueType="number"
                    decimalSeparator="."
                    precision={3}
                    {...field}
                    classes={{ inputContainer: styles.archiveStepLimitsInputWrapper }}
                  />
                  <Select
                    value={state.date}
                    options={DATE_LIMITS_UNIT_OPTIONS}
                    onChange={(v, e, fullValue) => (fullValue ? setState((prev) => ({ ...prev, date: fullValue })) : {})}
                    classes={{ root: styles.archiveStepLimitsSelectWrapper }}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div className={styles.archiveStepWrapper}>
          <LimitsProjectInfo />
        </div>
      </div>
      <LimitsInfo topicNames={[]} sumBytesPerSec={0} sumPartitions={0} />
      {isLimitFeatureSettingEnabled && warnings.length > 0 && (
        <StatusCard status="warning" classes={{ body: styles.archiveStepLimitsStatusCard }}>
          {warnings.join('. ')}
        </StatusCard>
      )}
      {isLimitFeatureSettingEnabled && blockers.length > 0 && (
        <StatusCard status="error" classes={{ body: styles.archiveStepLimitsStatusCard }}>
          {blockers.join('. ')}
        </StatusCard>
      )}
    </div>
  );
};

export default StepLimits;

import { clsx, Select, Text, InputNumber, StatusCard } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { dateUnitToSeconds, sizeUnitToBytes, speedUnitToBytesPerSec } from '@src/Shared/lib/format/quotaUnits';
import { DateUnitOption, SizeUnitOption, SpeedUnitOption } from '@src/Shared/types/filter';

import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { fetchCurrentEstimateFx, fetchCurrentOverdraftEstimateFx } from '@src/Entities/Limits/api';
import { $currentEstimateBlockers, $currentEstimateWarnings } from '@src/Entities/Limits/model';

import LimitsInfo from '@src/Features/Limits/ui/LimitsInfo';
import LimitsProjectInfo from '@src/Features/Limits/ui/LimitsProjectInfo';

import { isKafkaSourcesFilled, isQuotaFilled } from '../lib/formValidation';
import { $archiveEditName, $archiveEditProjectShortName } from '../model';

import * as styles from './styles.module.css';

const ESTIMATE_DEBOUNCE_MS = 500;

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
  const [archiveName, projectShortName, fetchCurrentEstimate, fetchCurrentOverdraftEstimate, warnings, blockers, isLimitFeatureSettingEnabled] =
    useUnit([
      $archiveEditName,
      $archiveEditProjectShortName,
      fetchCurrentEstimateFx,
      fetchCurrentOverdraftEstimateFx,
      $currentEstimateWarnings,
      $currentEstimateBlockers,
      $isLimitFeatureSettingEnabled,
    ]);
  const [kafkaSources, quota] = useWatch({
    control,
    name: ['source.kafka', 'quota'],
    defaultValue: { 'source.kafka': [], quota: {} },
  });

  useEffect(() => {
    fetchCurrentOverdraftEstimate();
  }, [fetchCurrentOverdraftEstimate]);

  useEffect(() => {
    const quotaValues = (quota ?? {}) as {
      maxDataRateBytesPerSec?: number;
      maxSizeBytes?: number;
      maxStorageTimeSec?: number;
    };
    const sources = (kafkaSources ?? []) as Array<{ project: string | null; name: string | null }>;

    if (!projectShortName || !isQuotaFilled(quotaValues) || !isKafkaSourcesFilled(sources)) {
      return undefined;
    }

    const timer = setTimeout(() => {
      fetchCurrentEstimate({
        project: projectShortName,
        name: archiveName.trim() || null,
        maxDataRateBytesPerSec: speedUnitToBytesPerSec(quotaValues.maxDataRateBytesPerSec!, state.speed.value),
        maxStoreDurationSec: dateUnitToSeconds(quotaValues.maxStorageTimeSec!, state.date.value),
        maxSizeBytes: sizeUnitToBytes(quotaValues.maxSizeBytes!, state.size.value),
        sources: sources.map((source) => ({ project: source.project!, name: source.name! })),
      });
    }, ESTIMATE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    archiveName,
    projectShortName,
    kafkaSources,
    quota,
    state.speed,
    state.size,
    state.date,
    fetchCurrentEstimate,
  ]);

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

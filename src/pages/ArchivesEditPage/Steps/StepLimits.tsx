import { clsx, Select, Text, InputNumber, StatusCard } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { bytesToSizeUnit, dateUnitToSeconds, secondsToDateUnit, sizeUnitToBytes, speedUnitToBytesPerSec } from '@src/Shared/lib/format/quotaUnits';
import { DateUnitOption, SizeUnitOption, SpeedUnitOption } from '@src/Shared/types/filter';

import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { fetchCurrentEstimateFx } from '@src/Entities/Limits/api';
import { $currentEstimateBlockers, $currentEstimateWarnings } from '@src/Entities/Limits/model';

import LimitsInfo from '@src/Features/Limits/ui/LimitsInfo';
import LimitsProjectInfo from '@src/Features/Limits/ui/LimitsProjectInfo';

import { isFilledNumber, isKafkaSourcesFilled, isQuotaEstimateReady } from '@src/Widgets/ArchiveEditStepper/formValidation';

import { $archiveEditName, $archiveEditProjectShortName } from '../model';

import * as styles from './styles.module.css';

const ESTIMATE_DEBOUNCE_MS = 500;

type UnitState = {
  speed: SpeedUnitOption;
  size: SizeUnitOption;
  date: DateUnitOption;
};

type QuotaFormValues = {
  maxDataRateBytesPerSec?: number;
  maxSizeBytes?: number;
  maxStorageTimeSec?: number;
};

const StepLimits: FC = () => {
  const { control, setValue } = useFormContext();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(searchParams.get('name')?.trim());
  const [state, setState] = useState<UnitState>({
    speed: SPEED_LIMITS_UNIT_OPTIONS[0],
    size: SIZE_LIMITS_UNIT_OPTIONS[0],
    date: DATE_LIMITS_UNIT_OPTIONS[5],
  });
  const [archiveName, projectShortName, warnings, blockers, isLimitFeatureSettingEnabled] = useUnit([
    $archiveEditName,
    $archiveEditProjectShortName,
    $currentEstimateWarnings,
    $currentEstimateBlockers,
    $isLimitFeatureSettingEnabled,
  ]);
  const [kafkaSources, maxDataRateBytesPerSec, maxSizeBytes, maxStorageTimeSec] = useWatch({
    control,
    name: ['source.kafka', 'quota.maxDataRateBytesPerSec', 'quota.maxSizeBytes', 'quota.maxStorageTimeSec'],
  });

  useEffect(() => {
    const unsubscribe = fetchCurrentEstimateFx.done.watch(({ params, result }) => {
      if (params.maxStoreDurationSec === null) {
        const seconds = result.data.maxStoreDurationSec;
        if (isFilledNumber(seconds) && seconds > 0) {
          const { value, unit } = secondsToDateUnit(seconds);
          const dateOption = DATE_LIMITS_UNIT_OPTIONS.find((option) => option.value === unit) ?? DATE_LIMITS_UNIT_OPTIONS[5];
          setValue('quota.maxStorageTimeSec', value);
          setState((prev) => ({ ...prev, date: dateOption }));
        }
      }

      if (params.maxSizeBytes === null) {
        const sizeBytes = result.data.maxSizeBytes;
        if (isFilledNumber(sizeBytes) && sizeBytes > 0) {
          const { value, unit } = bytesToSizeUnit(sizeBytes);
          const sizeOption = SIZE_LIMITS_UNIT_OPTIONS.find((option) => option.value === unit) ?? SIZE_LIMITS_UNIT_OPTIONS[0];
          setValue('quota.maxSizeBytes', value);
          setState((prev) => ({ ...prev, size: sizeOption }));
        }
      }
    });

    return unsubscribe;
  }, [setValue]);

  useEffect(() => {
    const sources = (kafkaSources ?? []) as Array<{ project: string | null; name: string | null }>;
    const quotaValues: QuotaFormValues = { maxDataRateBytesPerSec, maxSizeBytes, maxStorageTimeSec };

    if (!projectShortName || !isQuotaEstimateReady(quotaValues) || !isKafkaSourcesFilled(sources)) {
      return undefined;
    }

    const timer = setTimeout(() => {
      fetchCurrentEstimateFx({
        project: projectShortName,
        name: isEditMode ? archiveName.trim() || null : null,
        maxDataRateBytesPerSec: speedUnitToBytesPerSec(quotaValues.maxDataRateBytesPerSec!, state.speed.value),
        maxStoreDurationSec: isFilledNumber(quotaValues.maxStorageTimeSec)
          ? dateUnitToSeconds(quotaValues.maxStorageTimeSec, state.date.value)
          : null,
        maxSizeBytes: isFilledNumber(quotaValues.maxSizeBytes) ? sizeUnitToBytes(quotaValues.maxSizeBytes, state.size.value) : null,
        sources: sources.map((source) => ({ project: source.project!, name: source.name! })),
      });
    }, ESTIMATE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    archiveName,
    isEditMode,
    kafkaSources,
    maxDataRateBytesPerSec,
    maxSizeBytes,
    maxStorageTimeSec,
    projectShortName,
    state.date.value,
    state.size.value,
    state.speed.value,
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

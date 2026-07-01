import { clsx, Select, Text, InputNumber, StatusCard } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useMemo, useRef } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { bytesToSizeUnit, dateUnitToSeconds, secondsToDateUnit, sizeUnitToBytes, speedUnitToBytesPerSec } from '@src/Shared/lib/format/quotaUnits';

import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { fetchCurrentEstimateFx, fetchCurrentProjectLimitsFx } from '@src/Entities/Limits/api';
import { $currentEstimateBlockers, $currentEstimateWarnings, $currentProjectLimits } from '@src/Entities/Limits/model';
import { fetchTopicsFx } from '@src/Entities/Topic/api';
import { $topics } from '@src/Entities/Topic/model';

import LimitsInfo from '@src/Features/Limits/ui/LimitsInfo';
import LimitsProjectInfo from '@src/Features/Limits/ui/LimitsProjectInfo';

import { isFilledNumber, isKafkaSourcesFilled, isPositiveNumber, isQuotaEstimateReady } from '@src/Widgets/ArchiveEditStepper/formValidation';

import { $archiveEditName, $archiveEditProjectShortName } from '../model';
import { ArchiveEditFormValues } from '../types';

import * as styles from './styles.module.css';

const ESTIMATE_DEBOUNCE_MS = 500;

type QuotaFormValues = {
  maxDataRateBytesPerSec?: number;
  maxSizeBytes?: number;
  maxStorageTimeSec?: number;
};

type LastEditedQuotaField = 'size' | 'time' | null;

const getSpeedUnit = (value?: string) => SPEED_LIMITS_UNIT_OPTIONS.find((option) => option.value === value) ?? SPEED_LIMITS_UNIT_OPTIONS[0];
const getSizeUnit = (value?: string) => SIZE_LIMITS_UNIT_OPTIONS.find((option) => option.value === value) ?? SIZE_LIMITS_UNIT_OPTIONS[0];
const getDateUnit = (value?: string) => DATE_LIMITS_UNIT_OPTIONS.find((option) => option.value === value) ?? DATE_LIMITS_UNIT_OPTIONS[5];

const buildEstimateQuotaParams = (quotaValues: QuotaFormValues, units: ArchiveEditFormValues['quotaUnits'], lastEdited: LastEditedQuotaField) => {
  const hasSize = isPositiveNumber(quotaValues.maxSizeBytes);
  const hasTime = isPositiveNumber(quotaValues.maxStorageTimeSec);

  if (lastEdited === 'size' && hasSize) {
    return {
      maxSizeBytes: sizeUnitToBytes(quotaValues.maxSizeBytes!, units.size),
      maxStoreDurationSec: null,
    };
  }

  if (lastEdited === 'time' && hasTime) {
    return {
      maxSizeBytes: null,
      maxStoreDurationSec: dateUnitToSeconds(quotaValues.maxStorageTimeSec!, units.date),
    };
  }

  if (hasSize && !hasTime) {
    return {
      maxSizeBytes: sizeUnitToBytes(quotaValues.maxSizeBytes!, units.size),
      maxStoreDurationSec: null,
    };
  }

  if (hasTime && !hasSize) {
    return {
      maxSizeBytes: null,
      maxStoreDurationSec: dateUnitToSeconds(quotaValues.maxStorageTimeSec!, units.date),
    };
  }

  if (hasSize && hasTime) {
    return {
      maxSizeBytes: sizeUnitToBytes(quotaValues.maxSizeBytes!, units.size),
      maxStoreDurationSec: dateUnitToSeconds(quotaValues.maxStorageTimeSec!, units.date),
    };
  }

  return { maxSizeBytes: null, maxStoreDurationSec: null };
};

const StepLimits: FC = () => {
  const { control, setValue, getValues } = useFormContext<ArchiveEditFormValues>();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(searchParams.get('name')?.trim());
  const lastEditedQuotaFieldRef = useRef<LastEditedQuotaField>(null);
  const isApplyingEstimateRef = useRef(false);
  const lastEstimateRequestKeyRef = useRef<string | null>(null);
  const [archiveName, projectShortName, warnings, blockers, isLimitFeatureSettingEnabled, topics, currentProjectLimits, fetchProjectLimits] =
    useUnit([
      $archiveEditName,
      $archiveEditProjectShortName,
      $currentEstimateWarnings,
      $currentEstimateBlockers,
      $isLimitFeatureSettingEnabled,
      $topics,
      $currentProjectLimits,
      fetchCurrentProjectLimitsFx,
    ]);
  const [kafkaSources, maxDataRateBytesPerSec, maxSizeBytes, maxStorageTimeSec, quotaUnits] = useWatch({
    control,
    name: ['source.kafka', 'quota.maxDataRateBytesPerSec', 'quota.maxSizeBytes', 'quota.maxStorageTimeSec', 'quotaUnits'],
  });

  const speedUnit = getSpeedUnit(quotaUnits?.speed);
  const sizeUnit = getSizeUnit(quotaUnits?.size);
  const dateUnit = getDateUnit(quotaUnits?.date);

  const limitsInfo = useMemo(() => {
    const sources = (kafkaSources ?? []) as Array<{ project: string | null; name: string | null }>;
    const filledSources = sources.filter((source) => source.project && source.name);
    const topicNames = filledSources.map((source) => `${source.project}/${source.name}`);

    return filledSources.reduce(
      (acc, source) => {
        const topicKey = `${source.project}/${source.name}`;
        const topic = topics.find((item) => item.topicFullName.replace('.', '/') === topicKey);

        if (topic) {
          acc.sumBytesPerSec += topic.plannedRate ?? 0;
          acc.sumPartitions += topic.partitions ?? 0;
        }

        return acc;
      },
      { topicNames, sumBytesPerSec: 0, sumPartitions: 0 },
    );
  }, [kafkaSources, topics]);

  useEffect(() => {
    fetchTopicsFx();
  }, []);

  useEffect(() => {
    const project = projectShortName?.trim();
    if (!project) return;

    fetchProjectLimits(project);
  }, [projectShortName, fetchProjectLimits]);

  useEffect(() => {
    setValue('availableQuota', currentProjectLimits);
  }, [currentProjectLimits, setValue]);

  useEffect(() => {
    const unsubscribe = fetchCurrentEstimateFx.done.watch(({ params, result }) => {
      const currentQuotaUnits = getValues('quotaUnits');
      let didApplyEstimate = false;

      if (params.maxStoreDurationSec === null) {
        const seconds = result.data.maxStoreDurationSec;
        if (isFilledNumber(seconds) && seconds > 0) {
          const { value, unit } = secondsToDateUnit(seconds);
          const dateOption = getDateUnit(unit);
          if (getValues('quota.maxStorageTimeSec') !== value || currentQuotaUnits.date !== dateOption.value) {
            didApplyEstimate = true;
            setValue('quota.maxStorageTimeSec', value);
            setValue('quotaUnits.date', dateOption.value);
          }
        }
      }

      if (params.maxSizeBytes === null) {
        const sizeBytes = result.data.maxSizeBytes;
        if (isFilledNumber(sizeBytes) && sizeBytes > 0) {
          const { value, unit } = bytesToSizeUnit(sizeBytes);
          const sizeOption = getSizeUnit(unit);
          if (getValues('quota.maxSizeBytes') !== value || currentQuotaUnits.size !== sizeOption.value) {
            didApplyEstimate = true;
            setValue('quota.maxSizeBytes', value);
            setValue('quotaUnits.size', sizeOption.value);
          }
        }
      }

      if (didApplyEstimate) {
        isApplyingEstimateRef.current = true;
        lastEditedQuotaFieldRef.current = null;
      }
    });

    return unsubscribe;
  }, [getValues, setValue]);

  useEffect(() => {
    if (isApplyingEstimateRef.current) {
      isApplyingEstimateRef.current = false;
      return undefined;
    }

    const sources = (kafkaSources ?? []) as Array<{ project: string | null; name: string | null }>;
    const quotaValues: QuotaFormValues = { maxDataRateBytesPerSec, maxSizeBytes, maxStorageTimeSec };
    const units = {
      speed: speedUnit.value,
      size: sizeUnit.value,
      date: dateUnit.value,
    };

    if (!projectShortName || !isQuotaEstimateReady(quotaValues) || !isKafkaSourcesFilled(sources)) {
      lastEstimateRequestKeyRef.current = null;
      return undefined;
    }

    const { maxSizeBytes: estimateSizeBytes, maxStoreDurationSec } = buildEstimateQuotaParams(quotaValues, units, lastEditedQuotaFieldRef.current);

    const requestPayload = {
      project: projectShortName,
      name: isEditMode ? archiveName.trim() || null : null,
      maxDataRateBytesPerSec: speedUnitToBytesPerSec(quotaValues.maxDataRateBytesPerSec!, units.speed),
      maxStoreDurationSec,
      maxSizeBytes: estimateSizeBytes,
      sources: sources.map((source) => ({ project: source.project!, name: source.name! })),
    };
    const requestKey = JSON.stringify(requestPayload);

    if (requestKey === lastEstimateRequestKeyRef.current) {
      return undefined;
    }

    const timer = setTimeout(() => {
      lastEstimateRequestKeyRef.current = requestKey;
      fetchCurrentEstimateFx(requestPayload);
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
    dateUnit.value,
    sizeUnit.value,
    speedUnit.value,
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
                    value={speedUnit}
                    options={SPEED_LIMITS_UNIT_OPTIONS}
                    onChange={(v, e, fullValue) => {
                      if (fullValue) {
                        setValue('quotaUnits.speed', fullValue.value);
                      }
                    }}
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
              render={({ field: { onChange, ...field } }) => (
                <div className={styles.archiveStepLimitsWrapper}>
                  <InputNumber
                    placeholder="Введите значение"
                    required
                    valueType="number"
                    decimalSeparator="."
                    precision={3}
                    {...field}
                    onChange={(value) => {
                      lastEditedQuotaFieldRef.current = 'size';
                      onChange(value);
                    }}
                    classes={{ inputContainer: styles.archiveStepLimitsInputWrapper }}
                  />
                  <Select
                    value={sizeUnit}
                    options={SIZE_LIMITS_UNIT_OPTIONS}
                    onChange={(v, e, fullValue) => {
                      if (fullValue) {
                        lastEditedQuotaFieldRef.current = 'size';
                        setValue('quotaUnits.size', fullValue.value);
                      }
                    }}
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
              render={({ field: { onChange, ...field } }) => (
                <div className={styles.archiveStepLimitsWrapper}>
                  <InputNumber
                    placeholder="Введите значение"
                    required
                    valueType="number"
                    decimalSeparator="."
                    precision={3}
                    {...field}
                    onChange={(value) => {
                      lastEditedQuotaFieldRef.current = 'time';
                      onChange(value);
                    }}
                    classes={{ inputContainer: styles.archiveStepLimitsInputWrapper }}
                  />
                  <Select
                    value={dateUnit}
                    options={DATE_LIMITS_UNIT_OPTIONS}
                    onChange={(v, e, fullValue) => {
                      if (fullValue) {
                        lastEditedQuotaFieldRef.current = 'time';
                        setValue('quotaUnits.date', fullValue.value);
                      }
                    }}
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
      <LimitsInfo topicNames={limitsInfo.topicNames} sumBytesPerSec={limitsInfo.sumBytesPerSec} sumPartitions={limitsInfo.sumPartitions} />
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

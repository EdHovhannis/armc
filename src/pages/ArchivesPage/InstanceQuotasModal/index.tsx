import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Select, StatusCard, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { DateUnitValue, SizeUnitValue, SpeedUnitValue } from '@src/Shared/types/filter';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { saveInstanceQuotasFx } from '@src/Entities/Instance/api';
import { fetchInstanceEstimateFx } from '@src/Entities/Limits/api';
import { $currentEstimateBlockers, $currentEstimateWarnings, $instanceOverdraftValue } from '@src/Entities/Limits/model';

import LimitsInfo from '@src/Features/Limits/ui/LimitsInfo';
import LimitsProjectInfo from '@src/Features/Limits/ui/LimitsProjectInfo';

import { $instanceQuotasModalRow, $instanceQuotasTopics, onCloseInstanceQuotasModal } from './model';
import * as styles from './styles.module.css';

const SPEED_MULTIPLIERS: Record<SpeedUnitValue, number> = { 'B/s': 1, 'KB/s': 1024, 'MB/s': 1048576 };
const SIZE_MULTIPLIERS: Record<SizeUnitValue, number> = { MB: 1048576, GB: 1073741824, TB: 1099511627776 };
const TIME_MULTIPLIERS: Record<DateUnitValue, number> = { SEC: 1, MIN: 60, HOURS: 3600, DAYS: 86400, WEEKS: 604800, MONTH: 2592000 };

const DEFAULT_SPEED: SpeedUnitValue = 'B/s';
const DEFAULT_SIZE: SizeUnitValue = 'MB';
const DEFAULT_DATE: DateUnitValue = 'SEC';

const ESTIMATE_DEBOUNCE_MS = 400;

const toDisplay = (raw: number, multiplier: number): number => (multiplier > 1 ? Math.round((raw / multiplier) * 1000) / 1000 : raw);

const toRaw = (display: number, multiplier: number): number => Math.round(display * multiplier);

// строка для инпута: целые и дробные без хвостовых нулей (String(10)='10', String(0.001)='0.001'); 0 - пустое поле
const displayStr = (raw: number, multiplier: number): string => (raw ? String(toDisplay(raw, multiplier)) : '');

// оставляем только цифры и одну точку
const sanitizeNumeric = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
};

const parseNumeric = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

type QuotaFormValues = {
  maxSpeed: string;
  maxSize: string;
  maxTime: string;
};

type UnitState = {
  speed: SpeedUnitValue;
  size: SizeUnitValue;
  date: DateUnitValue;
};

type RawQuota = {
  speed: number;
  size: number;
  time: number;
};

interface DrawerContentProps {
  row: ArchiveInstanceView;
  onClose: () => void;
}

const DrawerInstanceQuotasContent: FC<DrawerContentProps> = ({ row, onClose }) => {
  const [topics, saving, warnings, blockers, isLimitEnabled, overdraftValue] = useUnit([
    $instanceQuotasTopics,
    saveInstanceQuotasFx.pending,
    $currentEstimateWarnings,
    $currentEstimateBlockers,
    $isLimitFeatureSettingEnabled,
    $instanceOverdraftValue,
  ]);

  const [units, setUnits] = useState<UnitState>({ speed: DEFAULT_SPEED, size: DEFAULT_SIZE, date: DEFAULT_DATE });
  const unitsRef = useRef<UnitState>({ speed: DEFAULT_SPEED, size: DEFAULT_SIZE, date: DEFAULT_DATE });

  const rawRef = useRef<RawQuota>({ speed: row.maxDataRateBytesPerSec || 0, size: row.maxSizeBytes || 0, time: row.maxStorageTimeSec ?? 0 });

  const methods = useForm<QuotaFormValues>({
    defaultValues: {
      maxSpeed: displayStr(row.maxDataRateBytesPerSec || 0, SPEED_MULTIPLIERS[DEFAULT_SPEED]),
      maxSize: displayStr(row.maxSizeBytes || 0, SIZE_MULTIPLIERS[DEFAULT_SIZE]),
      maxTime: displayStr(row.maxStorageTimeSec || 0, TIME_MULTIPLIERS[DEFAULT_DATE]),
    },
  });

  const { control, handleSubmit, setValue } = methods;

  const sizeTimer = useRef<ReturnType<typeof setTimeout>>();
  const timeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      if (sizeTimer.current) clearTimeout(sizeTimer.current);
      if (timeTimer.current) clearTimeout(timeTimer.current);
    },
    [],
  );

  const runEstimate = useCallback(
    (mode: 'size' | 'time') => {
      const raw = rawRef.current;
      if (!raw.speed) return;
      if (mode === 'size' && !raw.size) return;
      if (mode === 'time' && !raw.time) return;

      fetchInstanceEstimateFx({
        project: row.projectName,
        taskName: row.configName,
        maxDataRateBytesPerSec: raw.speed,
        maxSizeBytes: mode === 'size' ? raw.size : null,
        maxStoreDurationSec: mode === 'time' ? raw.time : null,
        sources: topics,
      })
        .then((response) => {
          if (mode === 'size') {
            rawRef.current.time = response.data.maxStoreDurationSec;
            setValue('maxTime', displayStr(response.data.maxStoreDurationSec, TIME_MULTIPLIERS[unitsRef.current.date]));
          } else {
            rawRef.current.size = response.data.maxSizeBytes;
            setValue('maxSize', displayStr(response.data.maxSizeBytes, SIZE_MULTIPLIERS[unitsRef.current.size]));
          }
        })
        .catch(() => undefined);
    },
    [row.projectName, row.configName, topics, setValue],
  );

  useEffect(() => {
    if (topics.length === 0) return;
    runEstimate('size');
  }, [topics.length, runEstimate]);

  const onSpeedInput = (raw: string) => {
    const value = sanitizeNumeric(raw);
    setValue('maxSpeed', value);
    const num = parseNumeric(value);
    rawRef.current.speed = num ? toRaw(num, SPEED_MULTIPLIERS[unitsRef.current.speed]) : 0;
    rawRef.current.size = 0;
    rawRef.current.time = 0;
    setValue('maxSize', '');
    setValue('maxTime', '');
  };

  const onSizeInput = (raw: string) => {
    const value = sanitizeNumeric(raw);
    setValue('maxSize', value);
    const num = parseNumeric(value);
    rawRef.current.size = num ? toRaw(num, SIZE_MULTIPLIERS[unitsRef.current.size]) : 0;
    rawRef.current.time = 0;
    setValue('maxTime', '');
    if (sizeTimer.current) clearTimeout(sizeTimer.current);
    if (num) sizeTimer.current = setTimeout(() => runEstimate('size'), ESTIMATE_DEBOUNCE_MS);
  };

  const onTimeInput = (raw: string) => {
    const value = sanitizeNumeric(raw);
    setValue('maxTime', value);
    const num = parseNumeric(value);
    rawRef.current.time = num ? toRaw(num, TIME_MULTIPLIERS[unitsRef.current.date]) : 0;
    rawRef.current.size = 0;
    setValue('maxSize', '');
    if (timeTimer.current) clearTimeout(timeTimer.current);
    if (num) timeTimer.current = setTimeout(() => runEstimate('time'), ESTIMATE_DEBOUNCE_MS);
  };

  const onSpeedUnitChange = (unit: SpeedUnitValue) => {
    unitsRef.current = { ...unitsRef.current, speed: unit };
    setUnits((prev) => ({ ...prev, speed: unit }));
    setValue('maxSpeed', displayStr(rawRef.current.speed, SPEED_MULTIPLIERS[unit]));
  };

  const onSizeUnitChange = (unit: SizeUnitValue) => {
    unitsRef.current = { ...unitsRef.current, size: unit };
    setUnits((prev) => ({ ...prev, size: unit }));
    setValue('maxSize', displayStr(rawRef.current.size, SIZE_MULTIPLIERS[unit]));
  };

  const onDateUnitChange = (unit: DateUnitValue) => {
    unitsRef.current = { ...unitsRef.current, date: unit };
    setUnits((prev) => ({ ...prev, date: unit }));
    setValue('maxTime', displayStr(rawRef.current.time, TIME_MULTIPLIERS[unit]));
  };

  const onSubmit = () =>
    handleSubmit(() => {
      saveInstanceQuotasFx({
        project: row.projectName,
        taskName: row.configName,
        zoneId: row.zoneId,
        maxDataRateBytesPerSec: rawRef.current.speed,
        maxSizeBytes: rawRef.current.size,
        maxStorageTimeSec: rawRef.current.time,
      });
    })();

  const topicNames = topics.map((source) => source.name);
  const hasBlockers = isLimitEnabled && blockers.length > 0;

  return (
    <>
      <DrawerBody>
        <FormProvider {...methods}>
          <div className={styles.instanceQuotasDrawerBody}>
            <div className={styles.instanceQuotasDrawerGrid}>
              <div className={styles.instanceQuotasDrawerFields}>
                <div className={styles.instanceQuotasDrawerField}>
                  <Text kind="textSb">Максимальная скорость записи</Text>
                  <div className={styles.instanceQuotasDrawerInputRow}>
                    <Controller
                      name="maxSpeed"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value}
                          onChange={onSpeedInput}
                          size="md"
                          fullWidth
                          inputMode="decimal"
                          placeholder="Введите значение"
                          className={styles.instanceQuotasDrawerInput}
                        />
                      )}
                    />
                    <Select
                      value={units.speed}
                      options={SPEED_LIMITS_UNIT_OPTIONS}
                      onChange={(v) => v && onSpeedUnitChange(v as SpeedUnitValue)}
                      classes={{ root: styles.instanceQuotasDrawerSelect }}
                    />
                  </div>
                </div>

                <div className={styles.instanceQuotasDrawerField}>
                  <Text kind="textSb">Максимальный размер архива</Text>
                  <div className={styles.instanceQuotasDrawerInputRow}>
                    <Controller
                      name="maxSize"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value}
                          onChange={onSizeInput}
                          size="md"
                          fullWidth
                          inputMode="decimal"
                          placeholder="Введите значение"
                          className={styles.instanceQuotasDrawerInput}
                        />
                      )}
                    />
                    <Select
                      value={units.size}
                      options={SIZE_LIMITS_UNIT_OPTIONS}
                      onChange={(v) => v && onSizeUnitChange(v as SizeUnitValue)}
                      classes={{ root: styles.instanceQuotasDrawerSelect }}
                    />
                  </div>
                </div>

                <div className={styles.instanceQuotasDrawerField}>
                  <Text kind="textSb">Максимальное время хранения данных</Text>
                  <div className={styles.instanceQuotasDrawerInputRow}>
                    <Controller
                      name="maxTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value}
                          onChange={onTimeInput}
                          size="md"
                          fullWidth
                          inputMode="decimal"
                          placeholder="Введите значение"
                          className={styles.instanceQuotasDrawerInput}
                        />
                      )}
                    />
                    <Select
                      value={units.date}
                      options={DATE_LIMITS_UNIT_OPTIONS}
                      onChange={(v) => v && onDateUnitChange(v as DateUnitValue)}
                      classes={{ root: styles.instanceQuotasDrawerSelect }}
                    />
                  </div>
                </div>
              </div>

              <LimitsProjectInfo overdraftValue={overdraftValue} />
            </div>

            <LimitsInfo topicNames={topicNames} sumBytesPerSec={0} sumPartitions={0} />

            {isLimitEnabled && warnings.length > 0 && (
              <StatusCard status="warning" classes={{ body: styles.instanceQuotasDrawerStatusCard }}>
                {warnings.join('. ')}
              </StatusCard>
            )}
            {isLimitEnabled && blockers.length > 0 && (
              <StatusCard status="error" classes={{ body: styles.instanceQuotasDrawerStatusCard }}>
                {blockers.join('. ')}
              </StatusCard>
            )}
          </div>
        </FormProvider>
      </DrawerBody>
      <DrawerFooter>
        <div className={styles.instanceQuotasDrawerFooter}>
          <Button view="secondary" kind="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button view="primary" onClick={onSubmit} isLoading={saving} disabled={hasBlockers}>
            Сохранить
          </Button>
        </div>
      </DrawerFooter>
    </>
  );
};

const DrawerInstanceQuotas: FC = () => {
  const [row, onClose] = useUnit([$instanceQuotasModalRow, onCloseInstanceQuotasModal]);
  const instanceLabel = row ? `${row.configName} (${row.zoneId})` : '';

  return (
    <Drawer open={!!row} onClose={onClose} width="80%">
      <DrawerHeader onClose={onClose}>
        <div className={styles.instanceQuotasDrawerHeader}>
          <span>Переопределение квот экземпляра</span>
          <Text kind="bodyLightS">{instanceLabel}</Text>
        </div>
      </DrawerHeader>
      {row && <DrawerInstanceQuotasContent key={row.id} row={row} onClose={onClose} />}
    </Drawer>
  );
};

export default DrawerInstanceQuotas;

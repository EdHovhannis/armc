import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, InputNumber, Select, StatusCard, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { DATE_LIMITS_UNIT_OPTIONS, SIZE_LIMITS_UNIT_OPTIONS, SPEED_LIMITS_UNIT_OPTIONS } from '@src/Shared/constants/options';
import { DateUnitValue, SizeUnitValue, SpeedUnitValue } from '@src/Shared/types/filter';

import { ArchiveInstanceView } from '@src/Entities/Archives/types';
import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { saveInstanceQuotasFx } from '@src/Entities/Instance/api';
import { fetchInstanceEstimateFx, fetchInstanceOverdraftEstimateFx } from '@src/Entities/Limits/api';
import { $currentEstimateBlockers, $currentEstimateWarnings } from '@src/Entities/Limits/model';

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

const toDisplay = (raw: number | null, multiplier: number): number =>
  raw !== null && raw !== undefined && multiplier > 1 ? Math.round((raw / multiplier) * 1000) / 1000 : (raw ?? 0);

const toRaw = (display: number, multiplier: number): number => Math.round(display * multiplier);

type QuotaFormValues = {
  maxDataRateBytesPerSec: number;
  maxSizeBytes: number;
  maxStorageTimeSec: number;
};

type UnitState = {
  speed: SpeedUnitValue;
  size: SizeUnitValue;
  date: DateUnitValue;
};

interface DrawerContentProps {
  row: ArchiveInstanceView;
  onClose: () => void;
}

// отдельный компонент чтобы при смене row (key меняется) состояние units и формы сбрасывалось до дефолтов
const DrawerInstanceQuotasContent: FC<DrawerContentProps> = ({ row, onClose }) => {
  const [topics, saving, warnings, blockers, isLimitEnabled] = useUnit([
    $instanceQuotasTopics,
    saveInstanceQuotasFx.pending,
    $currentEstimateWarnings,
    $currentEstimateBlockers,
    $isLimitFeatureSettingEnabled,
  ]);

  const [units, setUnits] = useState<UnitState>({ speed: DEFAULT_SPEED, size: DEFAULT_SIZE, date: DEFAULT_DATE });

  const methods = useForm<QuotaFormValues>({
    defaultValues: {
      maxDataRateBytesPerSec: toDisplay(row.maxDataRateBytesPerSec, SPEED_MULTIPLIERS[DEFAULT_SPEED]),
      maxSizeBytes: toDisplay(row.maxSizeBytes, SIZE_MULTIPLIERS[DEFAULT_SIZE]),
      maxStorageTimeSec: toDisplay(row.maxStorageTimeSec, TIME_MULTIPLIERS[DEFAULT_DATE]),
    },
  });

  const { control, handleSubmit } = methods;
  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (topics.length === 0) return;
    const { maxDataRateBytesPerSec, maxSizeBytes, maxStorageTimeSec } = watchedValues;
    if (!maxDataRateBytesPerSec || !maxSizeBytes) return;

    const speedRaw = toRaw(maxDataRateBytesPerSec ?? 0, SPEED_MULTIPLIERS[units.speed]);
    const sizeRaw = toRaw(maxSizeBytes ?? 0, SIZE_MULTIPLIERS[units.size]);
    const timeRaw = toRaw(maxStorageTimeSec ?? 0, TIME_MULTIPLIERS[units.date]);

    fetchInstanceEstimateFx({
      project: row.projectName,
      taskName: row.configName,
      maxDataRateBytesPerSec: speedRaw,
      maxSizeBytes: sizeRaw,
      maxStoreDurationSec: timeRaw,
      sources: topics,
    });

    fetchInstanceOverdraftEstimateFx({ maxDataRateBytesPerSec: speedRaw, maxSizeBytes: sizeRaw, maxStorageTimeSec: timeRaw });
  }, [watchedValues, topics, units, row.projectName, row.configName]);

  const onSubmit = handleSubmit((values) => {
    saveInstanceQuotasFx({
      project: row.projectName,
      taskName: row.configName,
      zoneId: row.zoneId,
      maxDataRateBytesPerSec: toRaw(values.maxDataRateBytesPerSec, SPEED_MULTIPLIERS[units.speed]),
      maxSizeBytes: toRaw(values.maxSizeBytes, SIZE_MULTIPLIERS[units.size]),
      maxStorageTimeSec: toRaw(values.maxStorageTimeSec, TIME_MULTIPLIERS[units.date]),
    });
  });

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
                      name="maxDataRateBytesPerSec"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          placeholder="Введите значение"
                          valueType="number"
                          decimalSeparator="."
                          precision={3}
                          classes={{ inputContainer: styles.instanceQuotasDrawerInput }}
                        />
                      )}
                    />
                    <Select
                      value={units.speed}
                      options={SPEED_LIMITS_UNIT_OPTIONS}
                      onChange={(v) => v && setUnits((prev) => ({ ...prev, speed: v as SpeedUnitValue }))}
                      classes={{ root: styles.instanceQuotasDrawerSelect }}
                    />
                  </div>
                </div>

                <div className={styles.instanceQuotasDrawerField}>
                  <Text kind="textSb">Максимальный размер архива</Text>
                  <div className={styles.instanceQuotasDrawerInputRow}>
                    <Controller
                      name="maxSizeBytes"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          placeholder="Введите значение"
                          valueType="number"
                          decimalSeparator="."
                          precision={3}
                          classes={{ inputContainer: styles.instanceQuotasDrawerInput }}
                        />
                      )}
                    />
                    <Select
                      value={units.size}
                      options={SIZE_LIMITS_UNIT_OPTIONS}
                      onChange={(v) => v && setUnits((prev) => ({ ...prev, size: v as SizeUnitValue }))}
                      classes={{ root: styles.instanceQuotasDrawerSelect }}
                    />
                  </div>
                </div>

                <div className={styles.instanceQuotasDrawerField}>
                  <Text kind="textSb">Максимальное время хранения данных</Text>
                  <div className={styles.instanceQuotasDrawerInputRow}>
                    <Controller
                      name="maxStorageTimeSec"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          placeholder="Введите значение"
                          valueType="number"
                          decimalSeparator="."
                          precision={3}
                          classes={{ inputContainer: styles.instanceQuotasDrawerInput }}
                        />
                      )}
                    />
                    <Select
                      value={units.date}
                      options={DATE_LIMITS_UNIT_OPTIONS}
                      onChange={(v) => v && setUnits((prev) => ({ ...prev, date: v as DateUnitValue }))}
                      classes={{ root: styles.instanceQuotasDrawerSelect }}
                    />
                  </div>
                </div>
              </div>

              <LimitsProjectInfo />
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

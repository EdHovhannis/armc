import { Text, Skeleton } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { fetchCurrentEstimateFx, fetchCurrentProjectLimitsFx, fetchInstanceEstimateFx } from '@src/Entities/Limits/api';
import { $currentProjectEstimate, $currentProjectLimits } from '@src/Entities/Limits/model';

import * as styles from './styles.module.css';

interface LimitsProjectInfoProps {
  overdraftValue?: number;
}

const LimitsProjectInfo: FC<LimitsProjectInfoProps> = ({ overdraftValue }) => {
  const [currentProjectLimits, isLimitFeatureSettingEnabled, currentProjectEstimate, loadingCurrentEstimate, loadingInstanceEstimate, loadingLimits] =
    useUnit([
      $currentProjectLimits,
      $isLimitFeatureSettingEnabled,
      $currentProjectEstimate,
      fetchCurrentEstimateFx.pending,
      fetchInstanceEstimateFx.pending,
      fetchCurrentProjectLimitsFx.pending,
    ]);

  const loadingEstimate = loadingCurrentEstimate || loadingInstanceEstimate;
  const maxOverdraftPercent = currentProjectEstimate.maxOverdraftPercent;
  const hasOverdraftValue = overdraftValue !== undefined;
  const shownOverdraft = hasOverdraftValue ? Math.min(overdraftValue, maxOverdraftPercent) : maxOverdraftPercent;
  const overdraftColor = hasOverdraftValue
    ? overdraftValue === 0
      ? '#FF0000'
      : overdraftValue < maxOverdraftPercent
        ? '#FFA500'
        : '#4CAF50'
    : maxOverdraftPercent === 0
      ? '#FF0000'
      : '#4CAF50';
  return (
    <table className={styles.archiveLimitsTable}>
      <thead>
        <tr>
          {/* В Text нет значения colSpan, но оно есть у th и оно пробрасывается */}
          {/* @ts-ignore */}
          <Text as="th" colSpan={2} kind="textMb" className={styles.archiveLimitsTableInfoText}>
            Расчетные значения для экземпляров конфигурации
          </Text>
        </tr>
      </thead>
      <tbody>
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Текущая скорость всех архивов проекта
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            <Skeleton isLoading={loadingLimits}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectLimits.currentDataRateBytesPerSec}</span>
            </Skeleton>
          </Text>
        </tr>
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Максимальная допустимая скорость всех архивов
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            <Skeleton isLoading={loadingLimits}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectLimits.maxDataRateBytesPerSec}</span>
            </Skeleton>
          </Text>
        </tr>
        {isLimitFeatureSettingEnabled && (
          <tr style={{ color: overdraftColor }}>
            <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
              Максимальный овердрафт скорости
            </Text>
            <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
              <Skeleton isLoading={loadingEstimate}>
                <span className={styles.archiveLimitsTableInfoSpan}>{shownOverdraft}%</span>
              </Skeleton>
            </Text>
          </tr>
        )}
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Текущий размер всех архивов проекта
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            <Skeleton isLoading={loadingLimits}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectLimits.currentSizeBytes}</span>
            </Skeleton>
          </Text>
        </tr>
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Максимально допустимый размер архивов проекта
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            <Skeleton isLoading={loadingLimits}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectLimits.maxSizeBytes}</span>
            </Skeleton>
          </Text>
        </tr>
        {isLimitFeatureSettingEnabled && (
          <tr>
            <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
              Примерное время хранения создаваемого экземпляра при заданных параметрах
            </Text>
            <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
              <Skeleton isLoading={loadingEstimate}>
                <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.maxStoreDurationSec} сек</span>
              </Skeleton>
            </Text>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default LimitsProjectInfo;

import { Text, Skeleton } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { $isLimitFeatureSettingEnabled } from '@src/Entities/FeatureFlags/model';
import { fetchCurrentEstimateFx, fetchCurrentProjectLimitsFx } from '@src/Entities/Limits/api';
import { $currentProjectEstimate, $currentProjectLimits } from '@src/Entities/Limits/model';

import * as styles from './styles.module.css';

const LimitsProjectInfo: FC = () => {
  const [currentProjectLimits, isLimitFeatureSettingEnabled, currentProjectEstimate, loadingEstimate, loadingLimits] = useUnit([
    $currentProjectLimits,
    $isLimitFeatureSettingEnabled,
    $currentProjectEstimate,
    fetchCurrentEstimateFx.pending,
    fetchInstanceEstimateFx.pending,
    fetchCurrentProjectLimitsFx.pending,
  ]);

  const loadingEstimate = loadingEstimate1 || loadingEstimate2;
  const loadingOverdraft = loadingOverdraft1 || loadingOverdraft2;
  const maxOverdraftPercent = currentProjectEstimate.maxOverdraftPercent;
  const overdraftColor = maxOverdraftPercent === 0 ? '#FF0000' : '#4CAF50';
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
                <span className={styles.archiveLimitsTableInfoSpan}>{maxOverdraftPercent}%</span>
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

import { Text, Skeleton } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { fetchCurrentEstimateFx } from '@src/Entities/Limits/api';
import { $currentProjectEstimate } from '@src/Entities/Limits/model';

import * as styles from './styles.module.css';

interface LimitsInfoProps {
  topicNames: string[];
  sumBytesPerSec: number;
  sumPartitions: number;
}

const LimitsInfo: FC<LimitsInfoProps> = ({ topicNames, sumBytesPerSec, sumPartitions }) => {
  const [currentProjectEstimate, loading] = useUnit([$currentProjectEstimate, fetchCurrentEstimateFx.pending]);
  return (
    <table className={styles.archiveLimitsTable}>
      <thead>
        <tr>
          {/* В Text нет значения colSpan, но оно есть у th и оно пробрасывается */}
          {/* @ts-ignore */}
          <Text as="th" colSpan={2} kind="textMb" className={styles.archiveLimitsTableInfoText}>
            Лимиты
          </Text>
        </tr>
        <tr>
          <Text as="th" kind="textSb" className={styles.archiveLimitsTableHeaderBorder}>
            Параметры расчета
          </Text>
          <Text as="th" kind="textSb" className={styles.archiveLimitsTableHeaderBorder}>
            Лимиты
          </Text>
        </tr>
      </thead>
      <tbody>
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Список входных топиков: {topicNames.join(', ')}, суммарный трафик: {sumBytesPerSec} B/s, количество партиций: {sumPartitions} шт.
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Количество необходимых слотов Apache Flink:
            <Skeleton style={{ height: 18 }} isLoading={loading}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.slotsCount}</span>
            </Skeleton>
          </Text>
        </tr>
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Максимальная скорость записи:
            <Skeleton style={{ height: 18 }} isLoading={loading}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.maxDataRateBytesPerSec} B/s</span>
            </Skeleton>
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Расчетная скорость на один слот Apache Flink:
            <Skeleton style={{ height: 18 }} isLoading={loading}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.bytesPerSecOnSlot}</span>
            </Skeleton>
            B/s
          </Text>
        </tr>
        <tr>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            {currentProjectEstimate.estimateBySize ? (
              <>
                Максимальный размер индекса:
                <Skeleton style={{ height: 18 }} isLoading={loading}>
                  <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.maxSizeBytes} B</span>
                </Skeleton>
              </>
            ) : (
              <>
                Максимальное время хранения данных:
                <Skeleton style={{ height: 18 }} isLoading={loading}>
                  <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.maxStoreDurationSec} сек</span>
                </Skeleton>
              </>
            )}
          </Text>
          <Text as="td" kind="textSn" className={styles.archiveLimitsTableInfoText}>
            Соотношение партиций Platform V Corax / слоты Apache Flink: корректно.
            <Skeleton style={{ height: 18 }} isLoading={loading}>
              <span className={styles.archiveLimitsTableInfoSpan}>{currentProjectEstimate.correctPartitionsToSlotsRatio}</span>
            </Skeleton>
          </Text>
        </tr>
      </tbody>
    </table>
  );
};

export default LimitsInfo;

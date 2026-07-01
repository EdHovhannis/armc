import { Text, Skeleton } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { fetchCurrentEstimateFx, fetchInstanceEstimateFx } from '@src/Entities/Limits/api';
import { $currentProjectEstimate } from '@src/Entities/Limits/model';

import * as styles from './styles.module.css';

interface LimitsInfoProps {
  topicNames: string[];
  sumBytesPerSec: number;
  sumPartitions: number;
}

const LimitsInfo: FC<LimitsInfoProps> = ({ topicNames, sumBytesPerSec, sumPartitions }) => {
  const [currentProjectEstimate, loadingCurrent, loadingInstance] = useUnit([
    $currentProjectEstimate,
    fetchCurrentEstimateFx.pending,
    fetchInstanceEstimateFx.pending,
  ]);
  const loading = loadingCurrent || loadingInstance;

  return (
    <div className={styles.archiveLimitsSection}>
      <Text kind="textMb" className={styles.archiveLimitsSectionTitle}>
        Лимиты
      </Text>
      <div className={styles.archiveLimitsTables}>
        <div className={styles.archiveLimitsTableWrapper}>
          <Text kind="bodyLightS" className={styles.archiveLimitsTableLabel}>
            Параметры расчёта
          </Text>
          <table className={styles.archiveLimitsTable}>
            <tbody>
              <tr>
                <td colSpan={2} className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Список входных топиков: {topicNames.join(', ')}</Text>
                </td>
              </tr>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Суммарный трафик</Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">{sumBytesPerSec} B/s</Text>
                </td>
              </tr>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Количество партиций</Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">{sumPartitions} шт</Text>
                </td>
              </tr>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Максимальная скорость записи</Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Skeleton style={{ height: 18 }} isLoading={loading}>
                    <Text kind="textSn">{currentProjectEstimate.maxDataRateBytesPerSec} B/s</Text>
                  </Skeleton>
                </td>
              </tr>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">
                    {currentProjectEstimate.estimateBySize ? 'Максимальный размер индекса' : 'Максимальное время хранения данных'}
                  </Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Skeleton style={{ height: 18 }} isLoading={loading}>
                    <Text kind="textSn">
                      {currentProjectEstimate.estimateBySize
                        ? `${currentProjectEstimate.maxSizeBytes} B`
                        : `${currentProjectEstimate.maxStoreDurationSec} сек`}
                    </Text>
                  </Skeleton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.archiveLimitsTableWrapper}>
          <Text kind="bodyLightS" className={styles.archiveLimitsTableLabel}>
            Лимиты
          </Text>
          <table className={styles.archiveLimitsTable}>
            <tbody>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Количество необходимых слотов Apache Flink</Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Skeleton style={{ height: 18 }} isLoading={loading}>
                    <Text kind="textSn">{currentProjectEstimate.slotsCount}</Text>
                  </Skeleton>
                </td>
              </tr>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Расчётная скорость на один слот Apache Flink</Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Skeleton style={{ height: 18 }} isLoading={loading}>
                    <Text kind="textSn">{currentProjectEstimate.bytesPerSecOnSlot} B/s</Text>
                  </Skeleton>
                </td>
              </tr>
              <tr>
                <td className={styles.archiveLimitsTableCell}>
                  <Text kind="textSn">Соотношение партиций Platform V Corax / слоты Apache Flink</Text>
                </td>
                <td className={styles.archiveLimitsTableCell}>
                  <Skeleton style={{ height: 18 }} isLoading={loading}>
                    <Text kind="textSn">{currentProjectEstimate.correctPartitionsToSlotsRatio} - корректно</Text>
                  </Skeleton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LimitsInfo;

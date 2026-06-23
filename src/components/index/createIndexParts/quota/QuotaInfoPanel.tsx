import { createStyles, makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Alert } from '@material-ui/lab';
import { IndexQuota } from '@src/store/index/Types';
import { KafkaTopic } from '@src/store/kafka/Types';
import { OverdraftConfig } from '@src/store/overdraft/Types';
import { KafkaSource } from '@src/store/pipeline/Types';
import * as React from 'react';

import SizeConverter from '../../../../utils/SizeConverter';
import { FulltextFlowEstimateResponse } from '../../../shared';
import { QUOTA_INFO_STYLES } from '../../../shared/styles';

export interface QuotaInfoPanelProps {
  isLimitFeatureSettingEnabled: boolean;
  currentQuota: IndexQuota;
  plannedVolume: number;
  plannedRate: number;
  approximatedRealIndexSizeBytes: number;
  approximatedStoreTimeSec: number;
  fulltextOverdraftConfig: OverdraftConfig;
  overdraftValue: number;
  estimateResponse: FulltextFlowEstimateResponse;
  currentSources: KafkaSource[];
  topics: KafkaTopic[];
}

export const QuotaInfoPanel: React.FC<QuotaInfoPanelProps> = (props) => {
  const {
    isLimitFeatureSettingEnabled,
    approximatedStoreTimeSec,
    approximatedRealIndexSizeBytes,
    currentQuota,
    plannedVolume,
    plannedRate,
    overdraftValue,
    fulltextOverdraftConfig,
    estimateResponse,
    currentSources,
    topics,
  } = props;
  const classes = useStyles();

  const plannedRateError = currentQuota?.maxRate && plannedRate > currentQuota?.maxRate;

  const plannedVolumeError = currentQuota?.maxVolume && plannedVolume > currentQuota?.maxVolume;
  const isOverdraftCorrect = overdraftValue >= fulltextOverdraftConfig?.maxOverdraftPercent;

  const sumPartitions = React.useMemo(() => {
    return currentSources.reduce((total, item) => total + (item.partition || 0), 0);
  }, [currentSources]);

  const sumBytesPerSec = React.useMemo(() => {
    return currentSources.reduce((total, item) => {
      const fullName = `${item.projectShortName}.${item.topicName}`;
      const topic = topics.find(({ topicFullName }) => topicFullName === fullName);
      return total + (topic?.plannedRate || 0);
    }, 0);
  }, [currentSources, topics]);

  return (
    <>
      <Grid direction={'column'} style={{ width: '49%' }}>
        {isLimitFeatureSettingEnabled && (
          <>
            <Typography variant="body1" display="block" style={{ fontWeight: 'bold' }}>
              Расчетные значения для экземпляров конфигурации
            </Typography>
          </>
        )}
        <table className={classes.table}>
          <tbody>
            <tr>
              <th>Параметр</th>
              <th>Значение</th>
            </tr>
            <tr>
              <td>Текущая скорость всех экземпляров проекта</td>
              <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(currentQuota?.currentRate), true)}</td>
            </tr>
            <tr>
              <td>Расчетная суммарная скорость</td>
              <td className={plannedRateError ? classes.errorText : ''}>
                {SizeConverter.makeSizeString(SizeConverter.convertBytes(plannedRate), true)}
              </td>
            </tr>
            <tr>
              <td>Максимальная допустимая скорость</td>
              <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(currentQuota?.maxRate), true)}</td>
            </tr>
            <tr className={overdraftValue === 0 ? classes.errorText : isOverdraftCorrect ? classes.infoText : classes.warningText}>
              <td>Максимальный овердрафт скорости</td>
              <td>{isOverdraftCorrect ? fulltextOverdraftConfig?.maxOverdraftPercent : overdraftValue}%</td>
            </tr>
            <tr>
              <td>Текущий размер всех экземпляров проекта</td>
              <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(currentQuota?.currentVolume), false)}</td>
            </tr>
            <tr>
              <td>Расчетный суммарный размер экземпляров</td>
              <td className={plannedVolumeError ? classes.errorText : ''}>
                {SizeConverter.makeSizeString(SizeConverter.convertBytes(plannedVolume), false)}
              </td>
            </tr>
            <tr>
              <td>Максимально допустимый размер экземпляров проекта</td>
              <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(currentQuota?.maxVolume), false)}</td>
            </tr>
            <tr>
              <td>Объём ротируемых данных (максимальный размер экземпляра за вычетом накладных расходов)</td>
              <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(approximatedRealIndexSizeBytes), false)}</td>
            </tr>
            <tr>
              <td>Примерное время хранения создаваемого экземпляра при заданных параметрах</td>
              <td>{SizeConverter.makeTimeString(SizeConverter.convertSeconds(approximatedStoreTimeSec))}</td>
            </tr>
          </tbody>
        </table>
      </Grid>
      {isLimitFeatureSettingEnabled && (
        <div className={classes.limits}>
          <Typography variant="body1" display="block" style={{ fontWeight: 'bold', marginTop: 10 }}>
            Лимиты
          </Typography>
          <table className={classes.table}>
            <tbody>
              <tr>
                <th>Параметры расчета</th>
                <th>Лимиты</th>
              </tr>
              <tr>
                <td>
                  <div>
                    Список входных топиков: {currentSources.map((topic) => topic.topicName).join(', ')}, суммарный трафик: {sumBytesPerSec || 0} B/s,
                    количество партиций: {sumPartitions || 0} шт.
                  </div>
                  <div>Уровень репликации коллекций Apache Solr: {estimateResponse.request.replicationFactor}</div>
                  <div>Максимальная скорость записи: {estimateResponse.request.maxDataRateBytesPerSec} B/s</div>
                  {estimateResponse.request.maxSizeBytes && <div>Максимальный размер индекса: {estimateResponse.request.maxSizeBytes} B</div>}
                  {estimateResponse.request.maxStoreDurationSec && (
                    <div>Максимальное время хранения данных: {estimateResponse.request.maxStoreDurationSec} сек.</div>
                  )}
                </td>
                <td>
                  <div>Количество необходимых слотов Apache Flink: {estimateResponse.taskSlots} шт.</div>
                  <div>Расчетная скорость на один слот Apache Flink: {estimateResponse.avgBytesPerTaskSlot} B/s</div>
                  <div>Количество шардов коллекции Apache Solr: {estimateResponse.numShards}</div>
                  <div>Соотношение партиций Platform V Corax / слоты Apache Flink: корректно. {estimateResponse.partitionToSlotsRatio}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {estimateResponse && (
        <div className={classes.alertsWrapper} style={{ marginTop: '10px' }}>
          {estimateResponse.warnings?.length > 0 && <Alert severity="warning">{estimateResponse.warnings.join('. ')}</Alert>}
          {estimateResponse.blockers?.length > 0 && <Alert severity="error">{estimateResponse.blockers.join('. ')}</Alert>}
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(() => createStyles(QUOTA_INFO_STYLES));

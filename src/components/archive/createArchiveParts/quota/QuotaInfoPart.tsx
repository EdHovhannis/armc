import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { Alert } from '@material-ui/lab';
import { ArchivalQuota, ArchiveQuota, ArchiveQuotaResponseDTO, KafkaArchiveSource } from '@src/store/archive/Types';
import * as React from 'react';

import SizeConverter from '../../../../utils/SizeConverter';
import { QUOTA_INFO_STYLES } from '../../../shared/styles';

export interface QuotaInfoPartProps {
  currentQuota: ArchivalQuota;
  currentIndexQuota: ArchiveQuota;
  getOverdraftValue(quota: ArchiveQuota, fetchedCallback?: any): any;
  quotaEstimation: ArchiveQuotaResponseDTO | null;
  kafkaTopics: KafkaArchiveSource[];
  isLimitFeatureSettingEnabled: boolean;
  sumBytesPerSec: number;
  sumPartitions: number;
}

const styles = () => createStyles(QUOTA_INFO_STYLES);

type QuotaInfoPartPropsWithStyles = QuotaInfoPartProps & WithStyles<typeof styles>;

class QuotaInfoPart extends React.Component<QuotaInfoPartPropsWithStyles, { overdraftValue: number }> {
  constructor(props: QuotaInfoPartPropsWithStyles) {
    super(props);
    this.state = {
      overdraftValue: 0,
    };
  }

  componentDidMount() {
    this.props.getOverdraftValue(this.props.currentIndexQuota, (overdraftValue: number) => {
      this.setState({ overdraftValue });
    });
  }

  render() {
    const { isLimitFeatureSettingEnabled, quotaEstimation, classes, sumPartitions, sumBytesPerSec } = this.props;
    const { overdraftValue } = this.state;
    const maxOverdraftPercent = quotaEstimation?.flowEstimateConfig?.maxOverdraftPercent || 0;
    const overdraftColor = overdraftValue < maxOverdraftPercent ? '#FFA500' : '#4CAF50';

    return (
      <>
        <Grid direction={'column'} style={{ width: '49%', paddingLeft: 10, display: 'flex', gap: 8 }}>
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
                <td>Текущая скорость всех архивов проекта</td>
                <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.currentQuota?.currentDataRateBytesPerSec), true)}</td>
              </tr>
              <tr>
                <td>Максимальная допустимая скорость всех архивов</td>
                <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.currentQuota?.maxDataRateBytesPerSec), true)}</td>
              </tr>
              {isLimitFeatureSettingEnabled && (
                <tr style={{ color: overdraftValue === 0 ? '#FF0000' : overdraftColor }}>
                  <td>Максимальный овердрафт скорости</td>
                  <td>{overdraftValue < maxOverdraftPercent ? overdraftValue : maxOverdraftPercent}%</td>
                </tr>
              )}
              <tr>
                <td>Текущий размер всех архивов проекта</td>
                <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.currentQuota?.currentSizeBytes), false)}</td>
              </tr>
              <tr>
                <td>Максимально допустимый размер архивов проекта:</td>
                <td>{SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.currentQuota?.maxSizeBytes), false)}</td>
              </tr>
              {isLimitFeatureSettingEnabled && (
                <tr>
                  <td>Примерное время хранения создаваемого экземпляра при заданных параметрах:</td>
                  <td>{quotaEstimation?.maxStoreDurationSec || 0} сек</td>
                </tr>
              )}
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
                      Список входных топиков: {this.props.kafkaTopics.map((topic) => topic.name).join(', ')}, суммарный трафик: {sumBytesPerSec} B/s,
                      количество партиций: {sumPartitions} шт.
                    </div>
                    {quotaEstimation && (
                      <>
                        <div>Максимальная скорость записи: {quotaEstimation.maxDataRateBytesPerSec} B/s</div>
                        {quotaEstimation.estimateBySize ? (
                          <div>Максимальный размер индекса: {quotaEstimation.maxSizeBytes} B</div>
                        ) : (
                          <div>Максимальное время хранения данных: {quotaEstimation.maxStoreDurationSec} сек</div>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    <div>Количество необходимых слотов Apache Flink: {quotaEstimation?.slotsCount || 0}</div>
                    <div>Расчетная скорость на один слот Apache Flink: {quotaEstimation?.bytesPerSecOnSlot || 0} B/s</div>
                    <div>
                      Соотношение партиций Platform V Corax / слоты Apache Flink: корректно. {quotaEstimation?.correctPartitionsToSlotsRatio || 0}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {quotaEstimation && isLimitFeatureSettingEnabled && (
              <>
                {quotaEstimation.warnings?.length > 0 && (
                  <Alert severity="warning" style={{ margin: '0 0 25px 0' }}>
                    {quotaEstimation?.warnings.join('. ')}
                  </Alert>
                )}
                {quotaEstimation.blockers?.length > 0 && (
                  <Alert severity="error" style={{ margin: '0 0 25px 0' }}>
                    {quotaEstimation.blockers.join('. ')}
                  </Alert>
                )}
              </>
            )}
          </div>
        )}
      </>
    );
  }
}

export default withStyles(styles)(QuotaInfoPart);

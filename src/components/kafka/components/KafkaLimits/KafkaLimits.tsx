import { Accordion, AccordionDetails, AccordionSummary, createStyles, Divider, makeStyles, TextField, Typography, Tooltip } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import WarningIcon from '@material-ui/icons/Warning';
import { Alert } from '@material-ui/lab';
import DataRateInput from '@src/components/input/DataRateInput';
import StorageSizeInput from '@src/components/input/StorageSizeInput';
import StorageTimeInput from '@src/components/input/StorageTimeInput';
import { FC, useEffect, useMemo, useState } from 'react';

import ClusterService from '../../../../services/ClusterService';
import { KafkaLimitsProps } from '../../../../store/kafkaViewer/Types';

import { INIT_STATE } from './constants';
import { KafkaLimitsComponentProps, KafkaLimitsState } from './types';

const useStyles = makeStyles(() =>
  createStyles({
    accordion: {
      padding: 0,
      margin: '0 0 15px 0',
      boxShadow: 'none',
      '&:before': {
        display: 'none',
      },
    },
    block: {
      display: 'block',
      padding: 0,
    },
    item: {
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-start',
      alignContent: 'center',
      marginBottom: '15px',
    },
    itemSelect: {
      width: '100px',
      flexShrink: 0,
    },
    info: {
      display: 'flex',
      gap: '24px',
      margin: '0 0 15px 0',
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column' as any,
      gap: '8px',
    },
  }),
);

const onInstallInitState = (limits?: KafkaLimitsProps): KafkaLimitsState => {
  if (limits) {
    const maxRetentionTimeSec = limits.plannedRetentionTime || 0;
    const maxSizeBytes = limits.plannedVolume || 0;
    const maxRateBytesPerSec = limits.plannedRate || 0;

    const retentionBySize = limits.retentionType === 'BY_TIME_AND_SIZE' || limits.retentionType === 'BY_SIZE' ? true : false;
    const retentionByTime = limits.retentionType === 'BY_TIME_AND_SIZE' || limits.retentionType === 'BY_TIME' ? true : false;
    return {
      ...INIT_STATE,
      maxRetentionTimeSec,
      maxSizeBytes,
      maxRateBytesPerSec,
      retentionBySize,
      retentionByTime,
    };
  }
  return INIT_STATE;
};

export const KafkaLimitsComponent: FC<KafkaLimitsComponentProps> = ({
  projectName,
  clusterId,
  replication,
  topicName,
  limits,
  partitions,
  onValidationFields,
  onUpdateLimits,
  displayError,
  hasPartition,
}) => {
  const classes = useStyles();
  const [state, setState] = useState<KafkaLimitsState>(onInstallInitState(limits));
  const [configuration, setConfiguration] = useState<Record<string, string | number | null>>({});
  const [info, setInfo] = useState<{ blockers: string[]; warnings: string[] }>({ blockers: [], warnings: [] });

  const errors = useMemo(() => {
    const isMaxRateBytesPerSecError = state.maxRateBytesPerSec === null || state.maxRateBytesPerSec < 1;
    const isMaxSizeBytesError = state.retentionBySize && (state.maxSizeBytes === null || state.maxSizeBytes < 1);
    const isMaxRetentionTimeSecError = state.retentionByTime && (state.maxRetentionTimeSec === null || state.maxRetentionTimeSec < 1);
    return { isMaxRateBytesPerSecError, isMaxSizeBytesError, isMaxRetentionTimeSecError };
  }, [state.maxRateBytesPerSec, state.maxRetentionTimeSec, state.maxSizeBytes, state.retentionBySize, state.retentionByTime]);

  const isAlertShow = useMemo(() => {
    const hasErrors = Object.keys(errors).some((key) => {
      const name = key as keyof typeof errors;
      return errors[name];
    });
    return (!state.retentionBySize && !state.retentionByTime) || hasErrors;
  }, [state.retentionBySize, state.retentionByTime, errors]);

  const retentionType = useMemo(() => {
    if (state.retentionByTime && state.retentionBySize) {
      return 'BY_TIME_AND_SIZE';
    } else if (state.retentionByTime) {
      return 'BY_TIME';
    } else if (state.retentionBySize) {
      return 'BY_SIZE';
    }
    return null;
  }, [state.retentionByTime, state.retentionBySize]);

  useEffect(() => {
    if (retentionType === null) {
      if (typeof displayError === 'function') {
        displayError('Необходимо выбрать хотя бы один параметр ротации');
      }
    }
  }, [retentionType]);

  useEffect(() => {
    const noErrors = Object.keys(errors).every((key) => {
      const name = key as keyof typeof errors;
      return errors[name] === false;
    });
    if (retentionType !== null && noErrors && info.blockers.length === 0) {
      onValidationFields(true);
    } else {
      onValidationFields(false);
    }
  }, [retentionType, errors, info.blockers]);

  useEffect(() => {
    const hasErrors = Object.keys(errors).some((key) => {
      const name = key as keyof typeof errors;
      return errors[name];
    });

    if (
      typeof projectName !== 'string' ||
      typeof clusterId !== 'number' ||
      typeof replication !== 'number' ||
      isNaN(replication) ||
      retentionType === null ||
      hasErrors
    ) {
      return;
    }

    ClusterService.checkClustersEstimate({
      projectName: projectName,
      clusterId: clusterId,
      topicName: topicName,
      params: {
        maxRateBytesPerSec: state.maxRateBytesPerSec,
        maxSizeBytes: state.retentionBySize ? state.maxSizeBytes : null,
        maxRetentionTimeSec: state.retentionByTime ? state.maxRetentionTimeSec : null,
        retentionType: retentionType,
        replicationFactor: replication,
        partitions: parseInt(state.partitions) || null,
      },
      okCallback: (res) => {
        setConfiguration({
          brokersNumber: res.configuration.brokersNumber,
          recommendedRatePerPartitionBytesPerSec: res.configuration.recommendedRatePerPartitionBytesPerSec,
          maxAllowableDiskSpaceBytes: res.configuration.maxAllowableDiskSpaceBytes,
          maxPartitionsPerBroker: res.configuration.maxPartitionsPerBroker,
          maxPartitionsPerCluster: res.configuration.maxPartitionsPerCluster,
          maxRateBytesPerSec: res.request.maxRateBytesPerSec,
          maxSizeBytes: res.request.maxSizeBytes,
          maxRetentionTimeSec: res.request.maxRetentionTimeSec,
          retentionType: res.request.retentionType,
          replicationFactor: res.request.replicationFactor,
          partitions: res.partitions,
          maxSize: res.quota.currentQuota.maxSizeBytes,
          retentionBytes: res.retentionBytes,
          retentionMs: res.retentionMs,
          maxTimeSec: res.maxRetentionTimeSec,
          maxBytes: res.maxSizeBytes,
        });
        onUpdateLimits({
          plannedVolume: res.request.maxSizeBytes,
          plannedRetentionTime: res.request.maxRetentionTimeSec,
          plannedRate: res.request.maxRateBytesPerSec,
          retentionType: res.request.retentionType,
          partitions: res.partitions,
        });
        setInfo({ blockers: res.blockers, warnings: res.warnings });
      },
      errorCallback: (e) => {
        displayError(e);
        onUpdateLimits({ plannedVolume: null, plannedRetentionTime: null, plannedRate: null, retentionType: retentionType });
      },
    });
  }, [
    state.maxRateBytesPerSec,
    state.maxRetentionTimeSec,
    state.maxSizeBytes,
    state.partitions,
    retentionType,
    projectName,
    clusterId,
    topicName,
    replication,
    errors,
    state.retentionBySize,
    state.retentionByTime,
    onUpdateLimits,
    displayError,
  ]);

  return (
    <>
      {isAlertShow && (
        <Alert severity="info" style={{ margin: '0 0 15px 0' }}>
          Необходимо заполнить поля: максимальная скорость записи, максимальный объем хранилища и/или максимальное время хранения данных в зависимости
          от выбранной ротации
        </Alert>
      )}
      <Typography
        variant="subtitle2"
        style={{ marginBottom: '15px', display: 'flex', gap: 10, marginLeft: 'auto', alignItems: 'center', justifySelf: 'end' }}
      >
        Ротация
        {isAlertShow && (
          <Tooltip title='Как минимум одно из полей "Максимальный объем хранилища" и/или "Максимальное время хранения данных" должно быть отмечено'>
            <WarningIcon style={{ color: '#e85702' }} />
          </Tooltip>
        )}
      </Typography>
      <DataRateInput
        value={state.maxRateBytesPerSec}
        onChange={(value) => {
          setState((prev) => ({ ...prev, maxRateBytesPerSec: Number(value) }));
        }}
      />
      <StorageSizeInput
        enabled={state.retentionBySize}
        value={state.maxSizeBytes}
        onChange={(value) => {
          setState((prev) => ({ ...prev, maxSizeBytes: Number(value) }));
        }}
        onEnabledChange={(value) => {
          setState((prev) => ({ ...prev, retentionBySize: value }));
        }}
      />
      <StorageTimeInput
        enabled={state.retentionByTime}
        value={state.maxRetentionTimeSec}
        onChange={(value) => {
          setState((prev) => ({ ...prev, maxRetentionTimeSec: Number(value) }));
        }}
        onEnabledChange={(value) => {
          setState((prev) => ({ ...prev, retentionByTime: value }));
        }}
      />
      <Divider style={{ margin: '15px 0' }} />
      <div className={classes.infoItem} style={{ margin: '0 0 15px 0' }}>
        <Typography variant="subtitle1">Лимиты</Typography>
        <div className={classes.infoItem}>
          <Typography variant="subtitle2">
            Параметр: {configuration.retentionBytes || '-'} retention.bytes / Параметр: {configuration.retentionMs || '-'} retention.ms
          </Typography>
          <Typography variant="subtitle2">
            Объем хранилища: {configuration.maxBytes || '-'} bytes / Время хранения: {configuration.maxTimeSec || '-'} сек
          </Typography>
        </div>
      </div>
      <Accordion square className={classes.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ padding: 0 }}>
          <Typography variant="subtitle1">Подробнее</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.block}>
          <div className={classes.info}>
            <div className={classes.infoItem} style={{ flexBasis: '50%' }}>
              <Typography variant="subtitle1">Конфигурация</Typography>
              <div className={classes.infoItem}>
                <Typography variant="subtitle2">Количество брокеров Platform V Corax: {configuration.brokersNumber || '-'}</Typography>
                <Typography variant="subtitle2">
                  Рекомендуемая скорость на одну партицию: {configuration.recommendedRatePerPartitionBytesPerSec || '-'} B/s
                </Typography>
                <Typography variant="subtitle2">Значение максимального допустимого заполнения диска: {configuration.maxSize || '-'} B</Typography>
              </div>
            </div>
            <div className={classes.infoItem} style={{ flexBasis: '50%' }}>
              <Typography variant="subtitle1">Параметры расчета</Typography>
              <div className={classes.infoItem}>
                <Typography variant="subtitle2">Фактор репликации топика:</Typography>
                <ul className={classes.infoItem} style={{ margin: 0 }}>
                  <Typography variant="subtitle2" style={{ margin: '0 0 0 -40px' }}>
                    {configuration.retentionType === 'BY_TIME_AND_SIZE' ? 3 : 2} из 3 параметров:
                  </Typography>
                  <li>
                    <Typography variant="subtitle2">Максимальный объем хранилища: {configuration.maxSizeBytes || '-'} B</Typography>
                  </li>
                  <li>
                    <Typography variant="subtitle2">Максимальная скорость записи: {configuration.maxRateBytesPerSec || '-'} B/s</Typography>
                  </li>
                  <li>
                    <Typography variant="subtitle2">Максимальное время хранения данных: {configuration.maxRetentionTimeSec || '-'} сек</Typography>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      {typeof configuration.partitions === 'number' && typeof partitions === 'number' && configuration.partitions !== partitions && (
        <Alert severity="warning" style={{ margin: '0 0 25px 0' }}>
          Указанное количество партиций отличается от рекомендованного количества. Рекомендуемое количество партиций: {configuration.partitions}
        </Alert>
      )}
      {info.warnings.length > 0 && (
        <Alert severity="warning" style={{ margin: '0 0 25px 0' }}>
          {info.warnings.join('. ')}
        </Alert>
      )}
      {info.blockers.length > 0 && (
        <Alert severity="error" style={{ margin: '0 0 25px 0' }}>
          {info.blockers.join('. ')}
        </Alert>
      )}
      {hasPartition && (
        <TextField
          fullWidth
          style={{ marginBottom: 15 }}
          value={state.partitions}
          variant="outlined"
          label="Кол-во партиций"
          onChange={(e) => setState((prev) => ({ ...prev, partitions: `${parseInt(e.target.value) || ''}` }))}
        />
      )}
    </>
  );
};

import Grid from '@material-ui/core/Grid';
import { EstimateData } from '@src/components/archive/createArchiveParts/types';
import ArchiveService from '@src/services/ArchiveService';
import { ArchivalQuota, ArchiveQuota, ArchiveQuotaResponseDTO, KafkaArchiveSource } from '@src/store/archive/Types';
import { getEnableFeatureSettingLimits, getValidationStrictFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { KafkaTopic } from '@src/store/kafka/Types';
import { ArchiveUtils } from '@src/utils/ArchiveUtils';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import QuotaInfoPart from '../../../containers/archive/QuotaInfoPart';
import { WrongInput } from '../ArchiveEditorForm';

import { useGetSelectedTopicsData } from './hooks';
import QuotaInputPart from './quota/QuotaInputPart';

interface QuotaPartProps {
  availableQuota: ArchivalQuota;
  availableQuotaChanged(availableQuota: ArchivalQuota): void;

  quota: ArchiveQuota;
  quotaChanged(quota: ArchiveQuota): void;

  projectShortName: string;
  canEdit: boolean;
  kafkaTopics: KafkaArchiveSource[];
  topics: KafkaTopic[];
  indexName?: string;

  wrongInputChanged(wrongInput: WrongInput): void;
  wrongInput: boolean;

  fetchQuota(projectShortName: string, okCallback: (quota: ArchivalQuota) => void, errorCallback?: (error: string) => void): void;
}

const QuotaPart = (props: QuotaPartProps) => {
  const {
    availableQuota,
    availableQuotaChanged,
    projectShortName,
    canEdit,
    kafkaTopics,
    topics,
    wrongInputChanged,
    wrongInput,
    fetchQuota,
    quota = {},
    quotaChanged,
    indexName,
  } = props;
  const [estimateData, setEstimateData] = useState<ArchiveQuotaResponseDTO | null>(null);
  const isLimitFeatureSettingEnabled = useSelector(getEnableFeatureSettingLimits);
  const isStrictValidation = useSelector(getValidationStrictFeatureSettingLimits);
  const { selectedTopics, sumBytesPerSec, sumPartitions } = useGetSelectedTopicsData(kafkaTopics, topics);

  const onEstimate = React.useCallback(
    ({ speedBytes, sizeBytes, timeSec }: EstimateData) => {
      if (!speedBytes || !(sizeBytes || timeSec)) {
        return;
      }
      wrongInputChanged({
        wrongInput: true,
        message: 'Выполняется расчет квоты... Попробуйте еще раз',
      });

      ArchiveService.getEstimatedArchiveQuotaWithTime({
        data: {
          maxDataRateBytesPerSec: speedBytes,
          maxStoreDurationSec: timeSec,
          maxSizeBytes: sizeBytes,
          projectShortName,
          sources: selectedTopics,
          indexName,
        },
        okCallback: (data) => {
          // Если у нас включен ФФ на строгую валидацию, то при блокерах не пускаем дальше
          const hasBlockers = (data?.blockers || []).length > 0 && isStrictValidation;
          wrongInputChanged({
            wrongInput: !data.quotaAllowed || hasBlockers,
            message: 'Расчетная скорость записи или размер превысили квоту',
          });
          if (sizeBytes === null) {
            quotaChanged({ ...quota, maxSizeBytes: data.maxSizeBytes, maxStorageTimeSec: timeSec || 0 });
          } else {
            quotaChanged({ ...quota, maxStorageTimeSec: data.maxStoreDurationSec, maxSizeBytes: sizeBytes });
          }
          setEstimateData(data);
        },
        errorCallback: () => {
          wrongInputChanged({
            wrongInput: true,
            message: 'Расчет квоты выполнился с ошибкой. Попробуйте еще раз',
          });
        },
      });
    },
    [selectedTopics, quota, isStrictValidation],
  );

  // При изменении параметров квоты - валидируем их
  useEffect(() => {
    if (wrongInput) {
      return;
    }
    if (isLimitFeatureSettingEnabled) {
      wrongInputChanged({
        wrongInput: quota.maxDataRateBytesPerSec <= 0 || quota.maxSizeBytes <= 0 || quota.maxStorageTimeSec <= 0,
        message: '"Максимальная скорость записи", "Максимальный размер индекса" и "Максимальное время хранения данных" должны быть заполнены.',
      });
    } else {
      wrongInputChanged({
        wrongInput: quota.maxDataRateBytesPerSec <= 0 || quota.maxSizeBytes <= 0,
        message: '"Максимальная скорость записи", "Максимальный размер индекса" должны быть заполнены.',
      });
    }
  }, [quota.maxDataRateBytesPerSec, quota.maxSizeBytes, quota.maxStorageTimeSec, isLimitFeatureSettingEnabled, wrongInput]);

  // Установка информирования о доступной квоте
  useEffect(() => {
    fetchQuota(projectShortName, (quotaIn) => {
      availableQuotaChanged(quotaIn);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTopics.length > 0 && quota.maxDataRateBytesPerSec && quota.maxSizeBytes) {
      onEstimate({
        speedBytes: quota.maxDataRateBytesPerSec,
        sizeBytes: quota.maxSizeBytes,
        timeSec: quota.maxStorageTimeSec,
      });
    }
  }, [selectedTopics]);

  return (
    <Grid container direction="row" justifyContent="space-around" alignItems="center" style={{ marginTop: '10px' }}>
      <Grid container direction="column" style={{ flexWrap: 'nowrap', width: '49%', alignSelf: 'baseline' }}>
        <QuotaInputPart quota={quota} onChangedQuota={quotaChanged} canEdit={canEdit} onEstimate={onEstimate} initSpeed={sumBytesPerSec} />
      </Grid>
      <QuotaInfoPart
        currentIndexQuota={quota}
        currentQuota={availableQuota ? availableQuota : ArchiveUtils.getEmptyArchivalQuota()}
        quotaEstimation={estimateData}
        kafkaTopics={kafkaTopics}
        isLimitFeatureSettingEnabled={isLimitFeatureSettingEnabled}
        sumBytesPerSec={sumBytesPerSec}
        sumPartitions={sumPartitions}
      />
    </Grid>
  );
};

export default QuotaPart;

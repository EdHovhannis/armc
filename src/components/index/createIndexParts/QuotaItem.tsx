import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { ApplicationState } from '@src/store/Store';
import { getEnableFeatureSettingLimits, getValidationStrictFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { getQuotaUnits } from '@src/store/flow/Reducer';
import { QuotaUnits } from '@src/store/flow/Types';
import { EstimatedIndexQuota } from '@src/store/index/Types';
import { KafkaTopic } from '@src/store/kafka/Types';
import { OverdraftConfig } from '@src/store/overdraft/Types';
import { AdvancedPipeline, QuotaPipeline, SourcesPipeline } from '@src/store/pipeline/Types';
import { REPLICATION_NUMBER_REGEXP } from '@src/utils/Utils';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, ConnectedProps, useSelector } from 'react-redux';

import IndexProvider, { Item } from '../../../containers/index/IndexProvider';
import { FulltextFlowEstimateResponse } from '../../shared';
import { WrongInput } from '../CreateIndexPage';

import { QuotaInfoPanel } from './quota/QuotaInfoPanel';
import QuotaStrategy from './quota/QuotaStrategy';
import { getQuota } from './quota/getQuota';
import { QuotaAdvanceParams } from './quotapart/QuotaAdvanceParams';
import QuotaInputPart from './quotapart/QuotaInputPart';

interface QuotaItemProps {
  estimatedQuota: EstimatedIndexQuota;
  projectShortName: string;
  quota: QuotaPipeline;
  indexName?: string;
  replicationFactor: number;
  recoveryStrategy: string;
  isAdmin: boolean;
  fulltextOverdraftConfig: OverdraftConfig;
  sources: SourcesPipeline;
  topics: Array<KafkaTopic>;
  isLimitFeatureSettingEnabled: boolean;
  quotaUnits: QuotaUnits;

  quotaChanged(quota: QuotaPipeline): void;

  replicationFactorChanged(replicationFactor: number): void;

  recoveryStrategyChanged(recoveryStrategy: string): void;

  wrongInputChanged(wrongInput: WrongInput): void;

  wrongInput: WrongInput;

  estimatedQuotaChanged(estimatedQuota: EstimatedIndexQuota): void;

  checkQuota: (
    projectShortName?: string,
    size?: number,
    rate?: number,
    duration?: number,
    replicationFactor?: number,
    sources?: SourcesPipeline,
    indexName?: string,
    maxShards?: number | null,
    collShards?: number | null,
    sourcesParallelism?: number | null,
    nodesAndSinkParallelism?: number | null,
    fetchedCallback?: (quota: FulltextFlowEstimateResponse) => void,
    notFetched?: (msg: string) => void,
  ) => void;
  onAdvancedChange: (advanced: AdvancedPipeline) => void;
  advanced: AdvancedPipeline;
  toggleChangeIsAdvance: (toggle: boolean) => void;
  isAdvancedFields?: boolean;
  showAdvancedParams?: boolean;
  showRecoveryStrategy?: boolean;
}

const mapStateToProps = (state: ApplicationState) => ({
  isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
  quotaUnits: getQuotaUnits(state),
});

const mapDispatchToProps = () => ({});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = QuotaItemProps & PropsFromRedux;

const QuotaItem: React.FC<Props> = ({
  estimatedQuota,
  projectShortName,
  quota,
  indexName,
  replicationFactor,
  recoveryStrategy,
  isAdmin,
  fulltextOverdraftConfig,
  sources,
  topics,
  isLimitFeatureSettingEnabled,
  quotaUnits,
  quotaChanged,
  replicationFactorChanged,
  recoveryStrategyChanged,
  wrongInputChanged,
  wrongInput,
  estimatedQuotaChanged,
  checkQuota,
  onAdvancedChange,
  toggleChangeIsAdvance,
  advanced,
  isAdvancedFields,
  showAdvancedParams = true,
  showRecoveryStrategy = true,
}) => {
  const [allowedMinSize, setAllowedMinSize] = useState<string>('');
  const [estimatedQuotaState, setEstimatedQuotaState] = useState<EstimatedIndexQuota>(estimatedQuota);
  const [overdraftValue, setOverdraftValue] = useState<number>(0);
  const [estimateResponse, setEstimateResponse] = useState<FulltextFlowEstimateResponse>(IndexProvider.getEmptyQuota());
  const [replicationFactorState, setReplicationFactorState] = useState<number>(replicationFactor);
  const [initSpeed, setInitSpeed] = useState<number>(0);
  const [allowedMinSizeNative, setAllowedMinSizeNative] = useState<number>(0);
  const isStrictValidation = useSelector(getValidationStrictFeatureSettingLimits);

  const [errorCodes, setErrorCodes] = useState<string[]>([]);

  const [quotaState, setQuotaState] = useState<QuotaPipeline>(quota);
  const [advancedState, setAdvancedState] = useState<AdvancedPipeline>(advanced);

  const relevantForAsyncValidation = {
    maxDataRateBytesPerSec: quotaState.maxDataRateBytesPerSec,
    maxSizeBytes: quotaState.maxSizeBytes,
    maxStorageTimeSec: quotaState.maxStorageTimeSec,
    replicationFactor: replicationFactorState,
    maxShardSizeBytes: advancedState.maxShardSizeBytes,
    collectionShards: advancedState.collectionShards,
    sourcesParallelism: advancedState.sourcesParallelism,
    nodesAndSinkParallelism: advancedState.nodesAndSinkParallelism,
  };

  const lastQuotaWrongInputRef = useRef<WrongInput>({ wrongInput: false, message: '' });
  const prevRelevantRef = useRef(relevantForAsyncValidation);
  const checkIsWrongInput = useCallback(
    (quotaFetched: FulltextFlowEstimateResponse, data: EstimatedIndexQuota) => {
      let result: WrongInput = { wrongInput: false, message: '' };
      if (quotaFetched.blockers?.length > 0) {
        result = { wrongInput: isStrictValidation, message: quotaFetched.blockers[0] ?? 'Ошибка при проверке квоты' };
      } else if (data.plannedRate > data.currentQuota.maxRate) {
        result = { wrongInput: isStrictValidation, message: 'Расчетная скорость записи превысила квоту' };
      } else if (!data.quotaAllowed) {
        if (quotaState.maxSizeBytes < quotaFetched.minAllowedMaxSizeBytes) {
          result = {
            wrongInput: isStrictValidation,
            message: `Минимальная допустимая величина максимального размера ${quotaFetched.minAllowedMaxSizeBytes}`,
          };
        } else {
          result = {
            wrongInput: isStrictValidation,
            message: `Недопустимый интервал ротации: ${quotaFetched.minRotationTimeSec}. Попробуйте снизить скорость или увеличить объем хранения`,
          };
        }
      } else if (data.plannedVolume > data.currentQuota.maxVolume) {
        result = { wrongInput: isStrictValidation, message: 'Расчетный размер индекса превысил квоту' };
      } else if (allowedMinSizeNative > quota.maxSizeBytes) {
        result = { wrongInput: isStrictValidation, message: `Минимальный размер индекса ${allowedMinSize}` };
      }
      if (lastQuotaWrongInputRef.current.message !== result.message) {
        wrongInputChanged(result);
        lastQuotaWrongInputRef.current = result;
      }
    },
    [allowedMinSize, allowedMinSizeNative, quota.maxSizeBytes, quotaState.maxSizeBytes, wrongInputChanged, isStrictValidation],
  );

  const hasRelevantChanged = (prev: typeof relevantForAsyncValidation, curr: typeof relevantForAsyncValidation) => {
    return (
      prev.maxDataRateBytesPerSec !== curr.maxDataRateBytesPerSec ||
      prev.maxSizeBytes !== curr.maxSizeBytes ||
      prev.maxStorageTimeSec !== curr.maxStorageTimeSec ||
      prev.replicationFactor !== curr.replicationFactor ||
      prev.maxShardSizeBytes !== curr.maxShardSizeBytes ||
      prev.collectionShards !== curr.collectionShards ||
      prev.sourcesParallelism !== curr.sourcesParallelism ||
      prev.nodesAndSinkParallelism !== curr.nodesAndSinkParallelism
    );
  };

  useEffect(() => {
    const hasChanged =
      quota.maxSizeBytes !== quotaState.maxSizeBytes ||
      quota.maxStorageTimeSec !== quotaState.maxStorageTimeSec ||
      quota.maxDataRateBytesPerSec !== quotaState.maxDataRateBytesPerSec;

    if (hasChanged) {
      setQuotaState(quota);
    }
  }, [quota]);

  useEffect(() => {
    if (replicationFactor !== replicationFactorState) {
      setReplicationFactorState(replicationFactor);
    }
  }, [replicationFactor]);

  useEffect(() => {
    let totalSpeed = quotaState.maxDataRateBytesPerSec;
    if (totalSpeed === 0) {
      sources.kafka.forEach((topic) => {
        const topicRate = topics.find((t) => t.name === topic.topicName)?.plannedRate || 0;
        totalSpeed += topicRate;
      });
      setInitSpeed(totalSpeed);
    }
    const speedItem: Item = IndexProvider.calculateSpeed(totalSpeed, quotaUnits.speed);
    const sizeItem: Item = IndexProvider.calculateSize(quotaState.maxSizeBytes, quotaUnits.size);
    const timeItem: Item = IndexProvider.calculateTime(quotaState.maxStorageTimeSec, quotaUnits.time);

    if (speedItem.value && (sizeItem.value || timeItem.value)) {
      checkQuota(
        projectShortName,
        quotaState.maxSizeBytes,
        quotaState.maxDataRateBytesPerSec,
        quotaState.maxStorageTimeSec,
        replicationFactorState,
        sources,
        indexName,
        advancedState.maxShardSizeBytes,
        advancedState.collectionShards,
        advancedState.sourcesParallelism,
        advancedState.nodesAndSinkParallelism,
        (quotaFetched: FulltextFlowEstimateResponse) => {
          const { data, maxOverdraftPercent, minAllowedMaxSizeBytes } = getQuota(quotaFetched);
          checkIsWrongInput(quotaFetched, data);
          setEstimatedQuotaState(data);
          setOverdraftValue(maxOverdraftPercent);
          const allowedValue = IndexProvider.calculateDelimiterFromBytesCeil(minAllowedMaxSizeBytes);
          setAllowedMinSizeNative(minAllowedMaxSizeBytes);
          setAllowedMinSize(`${allowedValue.value} ${allowedValue.unit}`);
          estimatedQuotaChanged(data);
          setEstimateResponse(quotaFetched);
        },
      );
    }
  }, []);

  const handleReplicationFactorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changedValue = parseInt(event.target.value);
    if (isNaN(changedValue)) return;
    setReplicationFactorState(changedValue);
    replicationFactorChanged(changedValue);
  };

  // Статическая валидация
  const staticError: WrongInput = useMemo(() => {
    const { maxDataRateBytesPerSec, maxSizeBytes, maxStorageTimeSec } = quotaState;
    const { maxShardSizeBytes, sinkBatchSize, sinkNumThreads, collectionShards, sourcesParallelism, nodesAndSinkParallelism } = advancedState;

    if (isLimitFeatureSettingEnabled) {
      if (maxDataRateBytesPerSec <= 0 || (maxSizeBytes <= 0 && maxStorageTimeSec <= 0)) {
        return {
          wrongInput: true,
          message: '"Максимальная скорость записи", "Максимальный размер индекса" и "Максимальное время хранения данных" должны быть > 0.',
        };
      }
    } else {
      if (maxDataRateBytesPerSec <= 0 || maxSizeBytes <= 0) {
        return {
          wrongInput: true,
          message: '"Максимальная скорость записи" и "Максимальный размер индекса" должны быть > 0.',
        };
      }
    }

    if (maxShardSizeBytes != null && maxShardSizeBytes < 1048576) {
      return { wrongInput: true, message: 'Максимальный размер шарда не может быть меньше 1048576 байт' };
    }
    if (sinkBatchSize != null && (sinkBatchSize < 500 || sinkBatchSize > 20000)) {
      return { wrongInput: true, message: 'Размер пачки документов должен быть в пределах от 500 до 20 000' };
    }
    if (sinkNumThreads != null && (sinkNumThreads <= 0 || sinkNumThreads > 15)) {
      return { wrongInput: true, message: 'Количество потоков sink должно быть в пределах от 1 до 15' };
    }
    if (collectionShards != null && collectionShards <= 0) {
      return { wrongInput: true, message: 'Количество шардов должно быть положительным числом' };
    }
    if (sourcesParallelism != null && sourcesParallelism <= 0) {
      return { wrongInput: true, message: 'Параллелизм вычитки должен быть положительным числом' };
    }
    if (nodesAndSinkParallelism != null && nodesAndSinkParallelism <= 0) {
      return { wrongInput: true, message: 'Параллелизм записи должен быть положительным числом' };
    }
    if (!replicationFactorState || replicationFactorState <= 0) {
      return { wrongInput: true, message: 'Количество реплик введено некорректно' };
    }

    return { wrongInput: false, message: '' };
  }, [
    quotaState.maxDataRateBytesPerSec,
    quotaState.maxSizeBytes,
    quotaState.maxStorageTimeSec,
    advancedState.maxShardSizeBytes,
    advancedState.sinkBatchSize,
    advancedState.sinkNumThreads,
    advancedState.collectionShards,
    advancedState.sourcesParallelism,
    advancedState.nodesAndSinkParallelism,
    replicationFactorState,
    isLimitFeatureSettingEnabled,
  ]);

  // Асинхронная валидация
  const performAsyncValidation = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    debounce(() => {
      if (staticError.wrongInput) {
        if (wrongInput.message !== staticError.message) {
          wrongInputChanged(staticError);
        }
        return;
      }
      const currRelevant = {
        maxDataRateBytesPerSec: quotaState.maxDataRateBytesPerSec,
        maxSizeBytes: quotaState.maxSizeBytes,
        maxStorageTimeSec: quotaState.maxStorageTimeSec,
        replicationFactor: replicationFactorState,
        maxShardSizeBytes: advancedState.maxShardSizeBytes,
        collectionShards: advancedState.collectionShards,
        sourcesParallelism: advancedState.sourcesParallelism,
        nodesAndSinkParallelism: advancedState.nodesAndSinkParallelism,
      };

      const changed = hasRelevantChanged(prevRelevantRef.current, currRelevant);

      if (!changed && !currRelevant.maxDataRateBytesPerSec) {
        if (!lastQuotaWrongInputRef.current.wrongInput) {
          wrongInputChanged(staticError);
        } else {
          wrongInputChanged(lastQuotaWrongInputRef.current);
        }
        return;
      }
      prevRelevantRef.current = currRelevant;

      wrongInputChanged({ wrongInput: true, message: 'Выполняется расчет квоты...' });
      lastQuotaWrongInputRef.current = { wrongInput: true, message: 'Выполняется расчет квоты...' };

      checkQuota(
        projectShortName,
        quotaState.maxSizeBytes,
        quotaState.maxDataRateBytesPerSec,
        quotaState.maxStorageTimeSec,
        replicationFactorState,
        sources,
        indexName,
        advancedState.maxShardSizeBytes,
        advancedState.collectionShards,
        advancedState.sourcesParallelism,
        advancedState.nodesAndSinkParallelism,
        (quotaFetched: FulltextFlowEstimateResponse) => {
          const { data, maxOverdraftPercent, minAllowedMaxSizeBytes } = getQuota(quotaFetched);

          checkIsWrongInput(quotaFetched, data);
          setEstimatedQuotaState(data);
          estimatedQuotaChanged(data);
          setOverdraftValue(maxOverdraftPercent);
          const allowedValue = IndexProvider.calculateDelimiterFromBytesCeil(minAllowedMaxSizeBytes);

          setAllowedMinSize(`${allowedValue.value} ${allowedValue.unit}`);
          setEstimateResponse(quotaFetched);

          const updates: Partial<QuotaPipeline> = {};

          if (!quotaState.maxSizeBytes && quotaFetched.maxSizeBytes) {
            updates.maxSizeBytes = quotaFetched.maxSizeBytes;
          }
          if (!quotaState.maxStorageTimeSec && quotaFetched.maxStoreDurationSec) {
            updates.maxStorageTimeSec = quotaFetched.maxStoreDurationSec;
          }

          if (Object.keys(updates).length > 0) {
            const newQuota = { ...quotaState, ...updates };
            setQuotaState(newQuota);
            quotaChanged(newQuota);
          }
          const errCodes = quotaFetched.errors;
          if (errCodes && errCodes.length) {
            setErrorCodes(errCodes);
          } else {
            setErrorCodes([]);
          }
        },
        (msg) => {
          const error = { wrongInput: true, message: `Ошибка при оценке: ${msg}` };
          if (lastQuotaWrongInputRef.current.message !== error.message) {
            wrongInputChanged(error);
            lastQuotaWrongInputRef.current = error;
          }
        },
      );
    }, 400),
    [
      staticError.message,
      staticError.wrongInput,
      projectShortName,
      quotaState.maxSizeBytes,
      quotaState.maxDataRateBytesPerSec,
      quotaState.maxStorageTimeSec,
      replicationFactorState,
      sources,
      indexName,
      advancedState.maxShardSizeBytes,
      advancedState.collectionShards,
      advancedState.sourcesParallelism,
      advancedState.nodesAndSinkParallelism,
    ],
  );

  useEffect(() => {
    performAsyncValidation();
  }, [performAsyncValidation]);
  return (
    <>
      <Grid container direction="row" justifyContent="space-around" style={{ marginTop: '10px' }}>
        <Grid item direction={'column'} style={{ flexWrap: 'nowrap', width: '49%' }}>
          <QuotaInputPart
            quota={quotaState}
            onChangedQuota={(quota: QuotaPipeline) => {
              setQuotaState(quota);
              quotaChanged(quota);
            }}
            initSpeed={initSpeed}
            allowedMinSize={allowedMinSize}
            canEdit
            allowedMinSizeNative={allowedMinSizeNative}
          />
          {showAdvancedParams && (
            <QuotaAdvanceParams
              onAdvancedChange={(e: AdvancedPipeline) => {
                setAdvancedState(e);
                onAdvancedChange(e);
              }}
              advanced={advancedState}
              isAdvancedFields={isAdvancedFields}
              toggleChangeIsAdvance={toggleChangeIsAdvance}
              errorCodes={errorCodes}
            />
          )}
          {isAdmin && (
            <Grid item direction={'row'} style={{ marginTop: 10 }}>
              <TextField
                fullWidth
                variant="outlined"
                error={
                  replicationFactorState <= 0 || isNaN(replicationFactorState) || !REPLICATION_NUMBER_REGEXP.test(String(replicationFactorState))
                }
                label="Количество реплик"
                defaultValue={replicationFactorState}
                onChange={handleReplicationFactorChange}
              />
            </Grid>
          )}
        </Grid>
        <QuotaInfoPanel
          estimateResponse={estimateResponse}
          approximatedRealIndexSizeBytes={estimatedQuotaState ? estimatedQuotaState.approximatedRealIndexSizeBytes : 0}
          approximatedStoreTimeSec={estimatedQuotaState ? estimatedQuotaState.approximatedStoreTimeSec : 0}
          plannedVolume={estimatedQuotaState ? estimatedQuotaState.plannedVolume : 0}
          plannedRate={estimatedQuotaState ? estimatedQuotaState.plannedRate : 0}
          currentQuota={estimatedQuotaState ? estimatedQuotaState.currentQuota : IndexProvider.getEmptyIndexQuota()}
          fulltextOverdraftConfig={fulltextOverdraftConfig}
          overdraftValue={overdraftValue}
          isLimitFeatureSettingEnabled={isLimitFeatureSettingEnabled}
          currentSources={sources.kafka}
          topics={topics}
        />
      </Grid>
      {showRecoveryStrategy && isAdmin && (
        <QuotaStrategy
          recoveryStrategy={recoveryStrategy}
          recoveryStrategyChanged={(strategy) => {
            recoveryStrategyChanged(strategy);
          }}
        />
      )}
    </>
  );
};

export default connector(QuotaItem);

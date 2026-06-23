import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TaskType } from '../../containers/archive/ArchiveEditorView';
import IndexProvider from '../../containers/index/IndexProvider';
import { ApplicationState } from '../../store/Store';
import * as indexActions from '../../store/index/Actions';
import { EstimatedIndexQuota } from '../../store/index/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftActions from '../../store/overdraft/Actions';
import { OverdraftConfig } from '../../store/overdraft/Types';
import * as pipelineActions from '../../store/pipeline/Actions';
import { Pipeline, QuotaPipeline, SourcesPipeline } from '../../store/pipeline/Types';
import { IndexOverviewDataNew } from '../../utils/IndexUtils';
import QuotaItem from '../index/createIndexParts/QuotaItem';
import { FulltextFlowEstimateResponse } from '../shared';

import { WrongInput } from './CreateIndexPage';

export interface IndexInstanceQuotasDialogProps {
  open: boolean;
  handleMenuClose?: () => void;
  handleClose: () => void;
  rowData?: IndexOverviewDataNew;
  isAdmin: boolean;
  fulltextOverdraftConfig?: OverdraftConfig;
}

export const IndexInstanceQuotasDialog: React.FC<IndexInstanceQuotasDialogProps> = (props) => {
  const dispatch = useDispatch();
  const topics = useSelector((state: ApplicationState) => state.kafka.topics);
  const { handleClose, rowData, handleMenuClose, isAdmin, open } = props;
  const [replicationFactor, setReplicationFactor] = React.useState<number>(rowData?.replicationFactor || 2);
  const [pipelineInfo, setPipelineInfo] = React.useState<Pipeline | null>(null);
  const [quota, setQuota] = React.useState<QuotaPipeline>({
    maxStorageTimeSec: 0,
    maxSizeBytes: 0,
    maxDataRateBytesPerSec: 0,
  });
  const [estimatedQuota, setEstimatedQuota] = React.useState<EstimatedIndexQuota>(IndexProvider.getEmptyEstimatedIndexQuota());
  const [fulltextOverdraftConfig, setFulltextOverdraftConfig] = React.useState<OverdraftConfig>({
    maxOverdraftedTasks: 0,
    maxOverdraftPercent: 0,
  });
  const [wrongInput, setWrongInput] = React.useState<WrongInput>({ wrongInput: false, message: '' });

  const zoneId = rowData?.zoneId || 'PRIMARY';
  const indexName = rowData?.name || '';
  const project = rowData?.project || '';

  React.useEffect(() => {
    if (handleMenuClose) {
      handleMenuClose();
    }
    if (project && indexName) {
      dispatch(
        pipelineActions.getPipelineInfo(project, indexName, (pipelineInfo) => {
          setPipelineInfo(pipelineInfo);
        }),
      );
    }
    dispatch(overdraftActions.getFulltextOverdraftConfig((fulltextOverdraftConfig) => setFulltextOverdraftConfig(fulltextOverdraftConfig)));
    setQuota({
      maxStorageTimeSec: rowData?.maxStorageTimeSec || 0,
      maxSizeBytes: rowData?.maxSizeBytes || 0,
      maxDataRateBytesPerSec: rowData?.maxDataRateBytesPerSec || 0,
    });
    setReplicationFactor(rowData?.replicationFactor || 2);
  }, [dispatch, handleMenuClose, indexName, project, rowData]);

  const checkQuota = (
    projectShortName: string,
    size: number,
    rate: number,
    duration: number,
    replicationFactor: number,
    sources: SourcesPipeline,
    indexName?: string,
    maxShard?: number | null,
    collShard?: number | null,
    sourcesParallelism?: number | null,
    nodesAndSinkParallelism?: number | null,
    fetchedCallback?: (quota: FulltextFlowEstimateResponse) => void,
    notFetchedCallback?: (msg: string) => void,
  ) => {
    dispatch(
      indexActions.fetchCalculatedQuota(
        projectShortName,
        size,
        rate,
        duration,
        replicationFactor,
        sources,
        fetchedCallback,
        notFetchedCallback,
        indexName,
        maxShard,
        collShard,
        sourcesParallelism,
        nodesAndSinkParallelism,
      ),
    );
  };

  const updateQouta = (
    projectShortName: string,
    name: string,
    zoneId: string,
    quota: QuotaPipeline,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => {
    dispatch(indexActions.updateIndexInstanceQuotas(projectShortName, name, zoneId, quota, okCallback, errorCallback));
  };

  const fetchMinAllowIndexSize = (rate, replicationFactor, fetchedCallback?, notFetchedCallback?) => {
    dispatch(indexActions.fetchMinAllowIndexSize(rate, replicationFactor, fetchedCallback, notFetchedCallback));
  };

  const handleQuotaChange = React.useCallback((newQuota: QuotaPipeline) => {
    setQuota(newQuota);
  }, []);

  const onSaveChanges = React.useCallback(() => {
    if (wrongInput.wrongInput) {
      dispatch(notificationActions.error(wrongInput.message));
      return;
    }
    updateQouta(project, indexName, zoneId, quota, () => {
      dispatch(indexActions.getFulltextTasksList());
      dispatch(notificationActions.success('Квоты успешно обновлены'));
    });
    handleClose();
  }, [wrongInput.wrongInput, project, indexName, zoneId, quota, wrongInput.message]);

  if (!pipelineInfo) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="lg" fullWidth>
      <DialogTitle id="form-dialog-title">Переопределение квот экземпляра</DialogTitle>
      <DialogContent>
        <QuotaItem
          sources={pipelineInfo.sources}
          topics={topics}
          replicationFactorChanged={(replicationFactor) => {
            setReplicationFactor(replicationFactor);
          }}
          recoveryStrategyChanged={() => {}}
          onAdvancedChange={() => {}}
          toggleChangeIsAdvance={() => {}}
          isAdmin={isAdmin}
          estimatedQuota={estimatedQuota}
          projectShortName={project}
          indexName={indexName}
          quota={quota}
          recoveryStrategy={rowData?.recoveryStrategy || ''}
          advanced={{}}
          estimatedQuotaChanged={(estimatedQuota) => {
            setEstimatedQuota(estimatedQuota);
          }}
          wrongInputChanged={(wrongInput) => {
            setWrongInput(wrongInput);
          }}
          wrongInput={wrongInput}
          quotaChanged={handleQuotaChange}
          replicationFactor={replicationFactor}
          checkQuota={checkQuota}
          fulltextOverdraftConfig={fulltextOverdraftConfig}
          showAdvancedParams={false}
          showRecoveryStrategy={false}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Отмена
        </Button>
        <Button onClick={onSaveChanges} color="primary">
          Сохранить изменения
        </Button>
      </DialogActions>
    </Dialog>
  );
};

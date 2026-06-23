import BackendProvider, { SystemType } from '@src/services/BackendProvider';
import { getValidationStrictFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { AnalyticalQuotaResponse } from '@src/store/monitoring/Types';
import { GlobalConfigsUtil } from '@src/utils/GlobalConfigsUtil';
import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

interface QuotaEstimateProps {
  maxTaskCount: number;
  replicaCount: number;
  zone?: string;
  additionalIoConfig?: string;
  project: string | null;
  indexName?: string;
  onEstimate: (data: AnalyticalQuotaResponse | null) => void;
  onValidChange: (isValidQuota: boolean) => void;
}

export const QuotaEstimate: FC<QuotaEstimateProps> = ({
  onValidChange,
  project,
  maxTaskCount,
  replicaCount,
  onEstimate,
  zone,
  additionalIoConfig,
  indexName,
}) => {
  const [hasBlockers, setBlockers] = useState<boolean>(false);
  const isStrictValidation = useSelector(getValidationStrictFeatureSettingLimits);

  const parsedIoConfigOverrides = useMemo(() => {
    if (!additionalIoConfig) {
      return undefined;
    }
    try {
      return GlobalConfigsUtil.serializeMonitoringConfig(additionalIoConfig);
    } catch {
      return undefined;
    }
  }, [additionalIoConfig]);

  useEffect(() => {
    if (project) {
      const url = `/v2/index/analytical/task/project/${project}/quota/estimate`;
      const body: Record<string, any> = {
        maxTaskCount,
        replicaCount,
      };
      if (zone) {
        body.zone = zone;
      }
      if (indexName) {
        body.indexName = indexName;
      }
      if (parsedIoConfigOverrides && Object.keys(parsedIoConfigOverrides).length > 0) {
        body.ioConfigOverrides = parsedIoConfigOverrides;
      }
      BackendProvider.request('POST', url, null, null, JSON.stringify(body), false, SystemType.legacy_api_path_without_version)
        .then(async (response) => {
          if (response.ok) {
            const quotaData: AnalyticalQuotaResponse = await response.json();
            onEstimate(quotaData);
            setBlockers(quotaData.blockers.length > 0);
          } else {
            onEstimate(null);
            setBlockers(false);
          }
        })
        .catch(() => {
          onEstimate(null);
          setBlockers(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxTaskCount, project, replicaCount, zone, parsedIoConfigOverrides, indexName]);

  useEffect(() => {
    if (isStrictValidation) {
      // Если блокеров нет, то считаем что квота валидна
      onValidChange(!hasBlockers);
    } else {
      onValidChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBlockers, isStrictValidation]);

  return null;
};

import { Alert } from '@material-ui/lab';
import BackendProvider, { SystemType } from '@src/services/BackendProvider';
import { getValidationStrictFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { LookupEstimateResponse } from '@src/store/lookup/Types';
import { FC, useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';

interface LookupQuotaEstimateProps {
  onValidChange: (isValidQuota: boolean) => void;
  estimateData: {
    project: string;
    dictionaryName: string;
    zoneId: string;
  };
  onChangeEstimateData: (data: LookupEstimateResponse | null) => void;
}

export const LookupQuotaEstimate: FC<LookupQuotaEstimateProps> = ({ onValidChange, estimateData, onChangeEstimateData }) => {
  const { project, zoneId, dictionaryName } = estimateData;
  const [blockers, setBlockers] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const isStrictValidation = useSelector(getValidationStrictFeatureSettingLimits);

  const resetEstimateDate = useCallback(() => {
    setBlockers([]);
    setWarnings([]);
    onChangeEstimateData(null);
  }, [onChangeEstimateData]);

  useEffect(() => {
    if (project && zoneId && dictionaryName) {
      const url = `/v2/project/${project}/lookup/quota/estimate`;
      BackendProvider.request('POST', url, null, null, JSON.stringify({ zoneId, dictionaryName }), false, SystemType.legacy_api_path_without_version)
        .then(async (response) => {
          if (response.ok) {
            const quotaData: LookupEstimateResponse = await response.json();
            setBlockers(quotaData.blockers);
            setWarnings(quotaData.warnings);
            onChangeEstimateData(quotaData);
          } else {
            resetEstimateDate();
          }
        })
        .catch(() => {
          resetEstimateDate();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionaryName, project, zoneId]);

  useEffect(() => {
    if (isStrictValidation) {
      // Если блокеров нет, то считаем что квота валидна
      onValidChange(!blockers.length);
    } else {
      onValidChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockers.length, isStrictValidation]);

  return (
    <>
      {warnings?.length > 0 && (
        <Alert severity="warning" style={{ margin: '10px 0' }}>
          {warnings.join('. ')}
        </Alert>
      )}
      {blockers?.length > 0 && (
        <Alert severity="error" style={{ margin: '10px 0' }}>
          {blockers.join('. ')}
        </Alert>
      )}
    </>
  );
};

import { Alert } from '@material-ui/lab';
import BackendProvider from '@src/services/BackendProvider';
import { getValidationStrictFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { DictionaryEstimateResponse } from '@src/store/lookup/Types';
import { FC, useEffect, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';

interface DictionaryQuotaEstimateProps {
  onValidChange: (isValidQuota: boolean) => void;
  estimateData: {
    project: string;
    name: string;
    zoneId: string;
    tableData: string;
  };
}

export const DictionaryQuotaEstimate: FC<DictionaryQuotaEstimateProps> = ({ onValidChange, estimateData }) => {
  const { project, name, zoneId, tableData } = estimateData;
  const [blockers, setBlockers] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const isStrictValidation = useSelector(getValidationStrictFeatureSettingLimits);

  useEffect(() => {
    if (project && name && zoneId) {
      const url = `/internal/index/analytical/dictionary/quota/${project}/name/${name}/zone/${zoneId}/estimate`;
      BackendProvider.request('POST', url, null, null, tableData)
        .then(async (response) => {
          if (response.ok) {
            const quotaData: DictionaryEstimateResponse = await response.json();
            setBlockers(quotaData.blockers);
            setWarnings(quotaData.warnings);
          } else {
            setBlockers([]);
            setWarnings([]);
          }
        })
        .catch(() => {
          setBlockers([]);
          setWarnings([]);
        });
    }
  }, [name, project, tableData, zoneId]);

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

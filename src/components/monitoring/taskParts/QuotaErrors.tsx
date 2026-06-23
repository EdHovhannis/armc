import { Alert } from '@material-ui/lab';
import { AnalyticalQuotaResponse } from '@src/store/monitoring/Types';
import { FC } from 'react';
import * as React from 'react';

interface QuotaErrorsProps {
  quotaData: AnalyticalQuotaResponse | null;
}

export const QuotaErrors: FC<QuotaErrorsProps> = ({ quotaData }) => {
  if (!quotaData) {
    return null;
  }

  return (
    <>
      {quotaData.warnings?.length > 0 && (
        <Alert severity="warning" style={{ margin: '16px 0 0' }}>
          {quotaData?.warnings.join('. ')}
        </Alert>
      )}
      {quotaData.blockers?.length > 0 && (
        <Alert severity="error" style={{ margin: '16px 0' }}>
          {quotaData.blockers.join('. ')}
        </Alert>
      )}
    </>
  );
};

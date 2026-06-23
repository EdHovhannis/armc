import { Typography, TextField } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import { getEnableFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { Cluster, Quota } from '../../types';

interface IQuotaFields {
  quota: Quota;
  valid: boolean;
  classes: ClassNameMap;
  changeHandler<T extends keyof Cluster>(property: T, value: Cluster[T]): void;
}

const QuotaFields: React.FC<IQuotaFields> = ({ quota, valid, classes, changeHandler }: IQuotaFields) => {
  const isLimitEnabled = useSelector(getEnableFeatureSettingLimits);
  const quotaHandler = <T extends keyof Quota>(property: T, value: Quota[T]) => {
    const newQuota: Quota = quota;
    newQuota[property] = value;
    changeHandler('quota', newQuota);
  };

  return (
    <div className={classes.container}>
      <Typography>Настройка квот</Typography>
      <TextField
        type="number"
        className={classes.input}
        label="Количество партиций"
        value={quota.partitionsNumber}
        error={!valid}
        helperText={!valid && 'Количество партиций должно быть больше 0'}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => quotaHandler('partitionsNumber', Number(e.target.value))}
        disabled={isLimitEnabled}
      />
    </div>
  );
};

export default QuotaFields;

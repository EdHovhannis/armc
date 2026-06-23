import { FormControl, Input, InputLabel, MenuItem, Select, Checkbox, FormControlLabel, Box } from '@material-ui/core';
import * as React from 'react';

import { IS_SAVEPOINTS_FEATURE_ENABLED } from '../../../shared/constants';

interface QuotaStrategyProps {
  recoveryStrategy: string;
  recoveryStrategyChanged: (strategy: string) => void;
}

const STRATEGIES = IS_SAVEPOINTS_FEATURE_ENABLED
  ? ['REPLICATION_FACTOR', 'BACKUPS_SAVEPOINTS_NO_REPLICAS', 'BACKUPS_SAVEPOINTS_DOWNGRADE_REPLICAS', 'BACKUPS_DOWNGRADE_REPLICAS']
  : ['REPLICATION_FACTOR', 'BACKUPS_DOWNGRADE_REPLICAS'];

const QuotaStrategy: React.FC<QuotaStrategyProps> = ({ recoveryStrategy, recoveryStrategyChanged }) => {
  return (
    <FormControl fullWidth style={{ marginTop: 4, margin: 6 }}>
      <InputLabel id="recovery-strategy">Стратегия восстановления</InputLabel>
      <Select
        labelId="recovery-strategy"
        value={recoveryStrategy}
        fullWidth
        onChange={(event) => {
          const newStrategy = event.target.value as string;
          recoveryStrategyChanged(newStrategy);
        }}
        input={<Input />}
      >
        {STRATEGIES.map((method, ind) => (
          <MenuItem value={method} key={ind}>
            {method}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default QuotaStrategy;

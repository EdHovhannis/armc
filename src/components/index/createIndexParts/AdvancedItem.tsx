import { FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import * as React from 'react';

import { AdvancedPipeline } from '../../../store/pipeline/Types';

interface AdvancedItemProps {
  advanced: AdvancedPipeline;
  onAdvancedChange: (advanced: AdvancedPipeline) => void;
  isCompositeParams?: boolean;
  toggleCompositeParams: (toggle: boolean) => void;
}

const AdvancedItem: React.FC<AdvancedItemProps> = ({ advanced, onAdvancedChange, isCompositeParams, toggleCompositeParams }) => {
  const handleChange = (field: keyof AdvancedPipeline, value: string | number) => {
    let processedValue: string | number | null = value;

    if (typeof value === 'number' && isNaN(value)) {
      processedValue = null;
    }

    onAdvancedChange({
      ...advanced,
      [field]: processedValue,
    });
  };

  return (
    <Grid container direction={'column'} style={{ flexWrap: 'nowrap', width: '50%', padding: '24px' }}>
      <Grid style={{ marginTop: 6 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isCompositeParams}
              onChange={(event) => {
                toggleCompositeParams(event.target.checked);
              }}
              color="primary"
              name="checkedB"
            />
          }
          label="Индекс является частью составного индекса"
        />
      </Grid>
      {isCompositeParams && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: '20px',
            width: '50%',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Имя alias"
            value={advanced.globalReadAlias || ''}
            onChange={(e) => handleChange('globalReadAlias', e.target.value)}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Список узлов Solr"
            value={advanced.collectionNodes || ''}
            onChange={(e) => handleChange('collectionNodes', e.target.value)}
          />
        </div>
      )}
    </Grid>
  );
};

export default AdvancedItem;

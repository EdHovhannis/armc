import { Grid, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import { KafkaTopic } from '../../store/kafka/Types';

export interface IDlqOption {
  topics: KafkaTopic[];
  value: KafkaTopic | undefined;
  onChange(projectId: number | null | undefined, name: string | null): void;
  getOptionLabel(option: KafkaTopic): string;
}

const DlqOption: React.FC<IDlqOption> = ({ topics, value, onChange, getOptionLabel }: IDlqOption) => {
  return (
    <Grid container>
      <Autocomplete
        id="dlq"
        options={topics}
        style={{ width: '100%' }}
        defaultValue={value}
        getOptionLabel={(option: KafkaTopic) => getOptionLabel(option)}
        onChange={(_, topic: KafkaTopic) => onChange(topic?.projectId, topic?.name)}
        renderInput={(params) => <TextField {...params} label="Топик" variant="outlined" />}
      />
    </Grid>
  );
};

export default DlqOption;

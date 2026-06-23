import { Grid, Typography } from '@material-ui/core';
import * as React from 'react';

import { AdvancedPipeline } from '../../store/pipeline/Types';

export interface IAdvancedOptions {
  advanced: AdvancedPipeline;
}

const AdvancedOptions: React.FC<IAdvancedOptions> = ({ advanced }: IAdvancedOptions) => {
  const fields = [
    {
      label: 'Имя alias',
      value: advanced.globalReadAlias,
    },
    {
      label: 'Количество шардов',
      value: advanced.collectionShards,
    },
    {
      label: 'Максимальный размер шарда',
      value: advanced.maxShardSizeBytes,
    },
    {
      label: 'Количество потоков',
      value: advanced.sinkNumThreads,
    },
    {
      label: 'Размер пачки записи документов',
      value: advanced.sinkBatchSize,
    },
    {
      label: 'Параллелизм вычитки',
      value: advanced.sourcesParallelism,
    },
    {
      label: 'Параллелизм записи',
      value: advanced.nodesAndSinkParallelism,
    },
    {
      label: 'Список узлов Solr',
      value: advanced.collectionNodes,
    },
  ];

  return (
    <Grid container direction="column">
      {fields.map((field, index) => (
        <Grid item key={index}>
          {field.value ? (
            <Typography
              variant="body2"
              display="block"
              style={{
                width: '100%',
                fontSize: '15px',
              }}
            >
              {field.label}: {field.value}
            </Typography>
          ) : (
            <></>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default AdvancedOptions;

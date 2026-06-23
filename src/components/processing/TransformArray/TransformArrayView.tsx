import { IconButton, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';

import { ArchiveProcessing, ArchiveSchema } from '../../../store/archive/Types';
import { ProcessingPipeline, SchemaPipeline } from '../../../store/pipeline/Types';

import { TransformChild } from './Child';
import { ITransformEvents, ITransformTableData, transformTypeNumber } from './types';

export interface ITransformArrayView extends ITransformEvents {
  data: ITransformTableData[];
  schema: SchemaPipeline | ArchiveSchema;
  processing: ProcessingPipeline | ArchiveProcessing;
  typesDictionary: Record<transformTypeNumber, string>;

  displayError(msg: string): any;
}

export const TransformArrayView: React.FC<ITransformArrayView> = ({ data, displayError, schema, processing, typesDictionary, ...tableEvents }) => {
  return (
    <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
      {data.map(({ arrayNames, fields, id }, index) => {
        return (
          <TransformChild
            key={id}
            transformArrayData={data}
            arrayNames={arrayNames}
            fields={fields}
            id={id}
            schema={schema}
            processing={processing}
            displayError={displayError}
            parentIndex={index}
            typesDictionary={typesDictionary}
            {...tableEvents}
          />
        );
      })}
      {!data.length && <Typography>Массивы требующие преобразования не добавлены</Typography>}
      <IconButton onClick={tableEvents.onAddArray} className="add-row-btn" color="primary" style={{ marginTop: 12, marginLeft: -16 }}>
        <AddIcon />
      </IconButton>
    </Grid>
  );
};

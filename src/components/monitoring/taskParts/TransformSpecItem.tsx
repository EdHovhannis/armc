import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import * as React from 'react';

import { TransformItem } from '../../../store/monitoring/Types';

import BasicSpecItem from './BasicSpecItem';

export default class TransformSpecItem extends BasicSpecItem<TransformItem> {
  getNewElement(): TransformItem {
    return { type: 'expression', name: '', expression: '' };
  }

  getKeyOfElement(element: TransformItem, index: number): string {
    return element.expression + element.name + element.type + index;
  }

  getContentElement(item: TransformItem, index: number) {
    return (
      <React.Fragment>
        <Grid item xs={3}>
          <TextField
            fullWidth
            disabled={!this.props.canEdit}
            label="target column"
            defaultValue={item.name}
            onChange={(e) => {
              item.name = e.target.value;
            }}
          />
        </Grid>
        <Grid item xs={9}>
          <TextField
            fullWidth
            disabled={!this.props.canEdit}
            label="expression"
            style={{
              marginLeft: 12,
            }}
            defaultValue={item.expression}
            onChange={(e) => {
              item.expression = e.target.value;
            }}
          />
        </Grid>
      </React.Fragment>
    );
  }
}

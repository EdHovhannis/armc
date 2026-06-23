import { Fab, Tooltip } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import * as React from 'react';

export function DoneFab(props) {
  const title = props.title || '';
  const style = props.style || { position: 'fixed', bottom: 12, right: 12, zIndex: 12 };

  return (
    <Tooltip title={title}>
      <Fab {...props} color="primary" aria-label="Done" style={style}>
        <Check />
      </Fab>
    </Tooltip>
  );
}

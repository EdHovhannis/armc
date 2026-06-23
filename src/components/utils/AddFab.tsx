import { Tooltip } from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';

export function AddFab(props) {
  const title = props.title || '';
  const style = props.style || {
    position: 'fixed',
    bottom: 74,
    right: 24,
    zIndex: 12,
  };

  return (
    <Tooltip title={title}>
      <div style={style}>
        <Fab {...props} color={'primary'} style={style}>
          <AddIcon />
        </Fab>
      </div>
    </Tooltip>
  );
}

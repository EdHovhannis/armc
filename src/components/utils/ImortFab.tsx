import { Tooltip } from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import * as React from 'react';

export function ImportFab(props) {
  const title = props.title || '';
  const style = props.style || {
    position: 'fixed',
    bottom: 136,
    right: 24,
    zIndex: 12,
  };

  return (
    <Tooltip title={title}>
      <div style={style}>
        <Fab {...props} color={'primary'} style={style}>
          <InboxIcon />
        </Fab>
      </div>
    </Tooltip>
  );
}

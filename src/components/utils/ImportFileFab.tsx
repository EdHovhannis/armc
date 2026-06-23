import * as React from 'react';

import { ImportFab } from './ImortFab';

export function ImportFileFab(props) {
  return (
    <React.Fragment>
      <input {...props} type="file" id="outlined-button-file" style={{ display: 'none' }} />
      <label htmlFor="outlined-button-file">
        <ImportFab {...props} component="span" />
      </label>
    </React.Fragment>
  );
}

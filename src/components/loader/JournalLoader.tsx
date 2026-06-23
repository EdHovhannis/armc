import { Grid } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';

export default class JournalLoader extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  render(): React.ReactNode {
    return (
      <Grid container style={{ width: '100%', marginTop: 32, paddingBottom: 32 }} justifyContent="center" alignItems="center">
        <Grid item>
          <CircularProgress disableShrink />
        </Grid>
      </Grid>
    );
  }
}

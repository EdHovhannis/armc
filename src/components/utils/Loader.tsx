import { Grid } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';

interface LoaderProps {
  style?: any;
}

export class Loader extends React.Component<LoaderProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      style: this.props.style ? this.props.style : { position: 'fixed', left: '50%', top: '45%' },
    };
  }

  render() {
    return (
      <Grid container style={{ width: '100%', marginTop: 32, paddingBottom: 32 }} justifyContent="center" alignItems="center">
        <Grid item>
          <CircularProgress style={this.state.style} disableShrink />
        </Grid>
      </Grid>
    );
  }
}

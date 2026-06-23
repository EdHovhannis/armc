import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowRight } from '@material-ui/icons';
import { Component } from 'react';
import * as React from 'react';

interface NextNavigationProps {
  nextString: string;
  titleString: string;
  goNextClicked: () => void;
}

export default class NextNavigation extends Component<NextNavigationProps, any> {
  render(): React.ReactNode {
    return (
      <Grid container direction={'row'} style={{ marginTop: 8 }} justifyContent={'space-between'}>
        <Grid item>
          <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 12 }}>
            {this.props.titleString}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            style={{ marginLeft: 8, marginTop: 5 }}
            onClick={() => {
              this.props.goNextClicked();
            }}
          >
            <Typography style={{ marginLeft: 4 }}>{this.props.nextString}</Typography>
            <KeyboardArrowRight style={{ width: 18, height: 18 }} />
          </Button>
        </Grid>
      </Grid>
    );
  }
}

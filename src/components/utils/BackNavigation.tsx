import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { Component } from 'react';
import * as React from 'react';

interface BackNavigationProps {
  backString: string;
  titleString: string;
  goBackClicked: () => void;
}

export default class BackNavigation extends Component<BackNavigationProps, any> {
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
              this.props.goBackClicked();
            }}
          >
            <KeyboardArrowLeft style={{ width: 18, height: 18 }} />
            <Typography style={{ marginLeft: 4 }}>{this.props.backString}</Typography>
          </Button>
        </Grid>
      </Grid>
    );
  }
}

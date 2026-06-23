import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Settings, Visibility } from '@material-ui/icons';
import * as React from 'react';
import { Component } from 'react';

export interface TracingSearchNavigationProps {
  openSettingsClicked: () => void;
  exportDisabled: boolean;
  exportHandler: () => void;
}

export default class TraceSearchNavigation extends Component<TracingSearchNavigationProps, any> {
  render() {
    return (
      <Grid container>
        <Grid>
          <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
            Поиск трейсов
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            style={{ marginLeft: 24, marginTop: 5 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              this.props.openSettingsClicked();
            }}
          >
            <Settings style={{ width: 18, height: 18 }} />
            <Typography style={{ marginLeft: 4 }}>Параметры</Typography>
          </Button>
        </Grid>
        <Grid item xs style={{ textAlign: 'right' }}>
          <Button variant="outlined" disabled={this.props.exportDisabled} onClick={() => this.props.exportHandler()}>
            Экспорт
          </Button>
        </Grid>
      </Grid>
    );
  }
}

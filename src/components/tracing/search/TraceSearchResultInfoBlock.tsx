import { createTheme, Grid, ThemeProvider } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles, createStyles } from '@material-ui/core/styles';
import * as moment from 'moment';
import * as React from 'react';

import TraceUtils from '../../../store/tracingSearch/TraceUtils';

const styles = (theme) =>
  createStyles({
    topBox: {
      width: '100%',
      borderBottom: '4px solid',
      borderColor: theme.palette.primary.main + ' !important',
    },
    relativeDurationBox: {
      height: '100%',
      opacity: 0.4,
      backgroundColor: theme.palette.secondary.main,
    },
    serviceInfoBox: {
      display: 'flex',
      flexDirection: 'row' as any,
      justifyContent: 'space-between',
      padding: 6,
    },
    serviceInfoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row' as any,
    },
    serviceInfoItem: {
      marginRight: 8,
    },
  });

class TraceSearchResultInfoBlock extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      hoveredTraceId: '',
    };
  }

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    return this.props.key != nextProps.key || this.props.summary != nextProps.summary || this.props.maxDuration != nextProps.maxSummary;
  }

  render() {
    const { classes } = this.props;
    return (
      <Paper
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={() => {
          this.props.traceSelected(this.props.summary.traceId);
        }}
      >
        <div className={this.props.classes.topBox} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              width: ((this.props.summary.endTime - this.props.summary.startTime) / this.props.maxDuration) * 100 + '%',
            }}
            className={this.props.classes.relativeDurationBox}
          />
          <div className={classes.serviceInfoBox}>
            <div className={classes.serviceInfoRow}>
              <Typography className={classes.serviceInfoItem} noWrap>
                {this.props.summary.rootService}
              </Typography>
              <Typography className={classes.serviceInfoItem} noWrap>
                {this.props.summary.rootSpan}
              </Typography>
              <Typography color="primary" noWrap>
                {this.props.summary.traceId}
              </Typography>
            </div>
            <div>
              <Typography color="inherit">{this.props.summary.durationStr}</Typography>
            </div>
          </div>
        </div>
        <div>
          <Grid container style={{ width: '100%', padding: 8 }} justifyContent="space-between" spacing={1}>
            <Grid item xs={2}>
              <Chip label={this.props.summary.spanCount + ' spans'} variant="outlined" size="small" />
            </Grid>

            <Grid item xs={8} container spacing={1}>
              {Object.keys(this.props.summary.servicesSummary).map((key) => {
                return (
                  <Grid item key={key}>
                    <ThemeProvider
                      theme={createTheme({
                        palette: {
                          primary: TraceUtils.getServiceNameColor(key),
                        },
                      })}
                    >
                      <Chip avatar={<Avatar>{this.props.summary.servicesSummary[key]}</Avatar>} label={key} color="primary" size="small"></Chip>
                    </ThemeProvider>
                  </Grid>
                );
              })}
            </Grid>
            <Grid item xs={2}>
              <Typography color="secondary" variant="body2">
                {moment(this.props.summary.startTime / 1000)
                  .local()
                  .format('DD/MM/YYYY HH:mm:ss.SSS')
                  .toString()}
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(TraceSearchResultInfoBlock);

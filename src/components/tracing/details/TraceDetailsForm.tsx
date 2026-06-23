import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { grey } from '@material-ui/core/colors';
import { fade, withStyles, createStyles } from '@material-ui/core/styles';
import { saveAs } from 'file-saver';
import * as React from 'react';
import { ReactRouterProps } from 'react-router';

import TraceUtils from '../../../store/tracingSearch/TraceUtils';
import { Trace, TraceNode, TraceSummary, TraceTree } from '../../../store/tracingSearch/Types';
import { withRouter, RouterProps } from '../../../utils/withRouter';
import JournalLoader from '../../loader/JournalLoader';

import TraceDetailsTableRow from './TraceDetailsTableRow';

export interface TraceDetailsFormProps {
  tree: TraceTree | undefined;
  selectedTrace: Trace | undefined;
  traceLoadInProgress: boolean;
}

export interface TraceDetailsFormDispatchProps {
  selectTrace: (traceId: string) => void;
  fetchTrace: (datasourceId: string, traceId: string, navigate: (path: string) => void) => void;
  fetchTraceWithTime: (datasourceId: string, traceId: string, startTs: number, endTs: number, navigate: (path: string) => void) => void;
}

export interface TraceDetailsFormState {
  childrenClosed: Set<string>;
}

const styles = createStyles({
  row: {
    '&:hover': {
      backgroundColor: fade(grey['500'], 0.2),
    },
  },
  hideBox: {
    '&:hover': {
      boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
    },
  },
});

const serviceNameWidth = 300;

class TraceDetailsForm extends React.Component<TraceDetailsFormProps & TraceDetailsFormDispatchProps & RouterProps, TraceDetailsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      childrenClosed: new Set<string>(),
    };
    if (this.props.params.id) {
      this.props.selectTrace(this.props.params.id);
      if (!this.props.tree) {
        if (this.props.searchParams.toString()) {
          const startTs = this.props.searchParams.get('startTs');
          const endTs = this.props.searchParams.get('endTs');
          if (this.props.params.datasource && startTs && endTs) {
            this.props.fetchTraceWithTime(
              this.props.params.datasource,
              this.props.params.id,
              parseInt(startTs, 10),
              parseInt(endTs, 10),
              this.props.navigate,
            );
          }
        } else if (this.props.params.datasource) {
          this.props.fetchTrace(this.props.params.datasource, this.props.params.id, this.props.navigate);
        }
      }
    }
  }

  exportHandler = (trace: Trace | undefined) => {
    if (trace && this.props.params.id) {
      const blob = new Blob([JSON.stringify(trace)], { type: 'text/json' });
      saveAs(blob, `${this.props.params.id}.json`);
    }
  };

  render() {
    if (this.props.traceLoadInProgress) {
      return <JournalLoader />;
    }

    if (!this.props.tree) {
      return null;
    }
    const { id } = this.props.params;
    const orderedSpans: Array<[TraceNode, number]> = [];
    const closed: Set<string> = new Set<string>();

    TraceUtils.iterateTraceTree(this.props.tree, (node, depth) => {
      const currId = node.span.id;
      if (this.state.childrenClosed.has(currId) || closed.has(currId)) {
        node.childrens.forEach((child) => {
          closed.add(child.span.id);
        });
      }

      if (!closed.has(currId)) {
        orderedSpans.push([node, depth]);
      }
    });

    return (
      <React.Fragment>
        <Grid container style={{ width: '100%' }} justifyContent="space-between" alignItems="flex-end" direction="row" spacing={0}>
          <Grid item container style={{ width: '100%' }} justifyContent="flex-start" alignItems="flex-start" direction="row" spacing={1} xs>
            <Grid item>
              <Paper style={{ padding: 6 }}>
                <Typography>Идентификатор : {this.props.tree.summary.traceId}</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper style={{ padding: 6 }}>
                <Typography>
                  Длительность: {TraceUtils.createDurationStr(this.props.tree!.summary.endTime - this.props.tree!.summary.startTime)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper style={{ padding: 6 }}>
                <Typography>Количество операций : {this.props.tree!.summary.spanCount}</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid item style={{ marginRight: 10 }}>
            <Button variant="outlined" onClick={() => this.exportHandler(this.props.selectedTrace)}>
              Экспорт
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                if (this.props.searchParams.toString()) {
                  const startTs = this.props.searchParams.get('startTs');
                  const endTs = this.props.searchParams.get('endTs');
                  if (this.props.params.datasource && startTs && endTs) {
                    this.props.fetchTraceWithTime(
                      this.props.params.datasource,
                      this.props.params.id,
                      parseInt(startTs, 10),
                      parseInt(endTs, 10),
                      this.props.navigate,
                    );
                  }
                } else if (this.props.params.datasource) {
                  this.props.fetchTrace(this.props.params.datasource, this.props.params.id, this.props.navigate);
                }
              }}
            >
              Обновить
            </Button>
          </Grid>
        </Grid>

        <Paper style={{ width: '100%', marginTop: 12 }}>
          {this.renderHeader(this.props.tree.summary.endTime - this.props.tree.summary.startTime)}
          {this.renderTable(orderedSpans, closed, this.props.tree.summary)}
        </Paper>
      </React.Fragment>
    );
  }

  renderHeader(duration: number) {
    return (
      <Box borderBottom={2} borderColor="grey.500">
        <Grid container style={{ width: '100%' }} justifyContent="flex-start" alignItems="flex-start" spacing={0}>
          <Grid item>
            <Box style={{ padding: 4, width: serviceNameWidth }} borderRight={1} borderColor="grey.500">
              <Typography noWrap>Сервис</Typography>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box style={{ width: '100%', padding: 4 }} borderRight={1} borderColor="grey.500">
              <Typography noWrap>Операция</Typography>
            </Box>
          </Grid>
          <Grid item xs>
            <Box style={{ width: '100%', height: '100%' }}>
              <Grid container style={{ width: '100%' }} justifyContent="flex-start" alignItems="flex-start" spacing={0}>
                <Grid item xs={3}>
                  <Box borderRight={1} borderColor="grey.500" style={{ padding: 4 }}>
                    <Typography noWrap>0 ms</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box borderRight={1} borderColor="grey.500" style={{ padding: 4 }}>
                    <Typography noWrap>{TraceUtils.createDurationStr(duration / 3)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box borderRight={1} borderColor="grey.500" style={{ padding: 4 }}>
                    <Typography noWrap>{TraceUtils.createDurationStr(duration * (2 / 3))}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box style={{ padding: 4 }}>
                    <Typography noWrap>{TraceUtils.createDurationStr(duration)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }

  renderTable(nodes: Array<[TraceNode, number]>, closedSpans: Set<string>, summary: TraceSummary) {
    return nodes.map((value: [TraceNode, number], index) => {
      if (value[0].span?.annotations)
        value[0].span.annotations = value[0].span?.annotations?.filter(
          (row, index) => index === value[0].span?.annotations?.findIndex((other) => row.timestamp === other.timestamp && row.value === other.value),
        );
      if (!closedSpans.has(TraceUtils.getSpanKey(value[0].span))) {
        return (
          <TraceDetailsTableRow
            childsClosed={this.state.childrenClosed.has(value[0].span.id)}
            onChildOpen={() => {
              this.state.childrenClosed.add(value[0].span.id);
              this.setState({
                childrenClosed: this.state.childrenClosed,
              });
            }}
            onChildClose={() => {
              this.state.childrenClosed.delete(value[0].span.id);
              this.setState({
                childrenClosed: this.state.childrenClosed,
              });
            }}
            serviceNameWidth={serviceNameWidth}
            key={TraceUtils.getSpanKey(value[0].span)}
            node={value}
            index={index}
            closedSpans={closedSpans}
            summary={summary}
          />
        );
      }
    });
  }
}

export default withStyles(styles)(withRouter(TraceDetailsForm));

import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { grey } from '@material-ui/core/colors';
import { fade, withStyles, createStyles } from '@material-ui/core/styles';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import * as moment from 'moment';
import * as React from 'react';
import { ReactRouterProps, Route, RouteProps } from 'react-router';

import TraceUtils from '../../../store/tracingSearch/TraceUtils';
import { Annotation, Span, TraceNode, TraceSummary } from '../../../store/tracingSearch/Types';

const leftMarginPerDepth = 24;

const styles = createStyles({
  row: {
    '&:hover': {
      backgroundColor: fade(grey['500'], 0.2),
    },
  },
  hideBox: {
    '&:hover': {
      boxShadow: 'inset 0px 1px 3px 0px rgba(0,0,0,0.2),inset 0px 1px 1px 0px rgba(0,0,0,0.14),inset 0px 2px 1px -1px rgba(0,0,0,0.12)',
    },
  },
  tableBorder: {
    borderRight: '1px solid',
    borderColor: 'rgb(158, 158, 158) !important;',
  },
  marginDepthBlock: {
    width: leftMarginPerDepth,
    height: '32px',
    display: 'inline-block',
    borderRight: '1px solid',
    borderColor: 'rgba(158, 158, 158, 0.4) !important',
  },
});

interface DetailsTableRowProps {
  serviceNameWidth: number;
  childsClosed: boolean;
  node: [TraceNode, number];
  summary: TraceSummary;
}

interface DetailsTableRowState {
  detailsOpened: boolean;
}

interface TraceDetailsTableRowDispatchProps {
  onChildOpen: () => void;
  onChildClose: () => void;
}

class TraceDetailsTableRow extends React.Component<DetailsTableRowProps & ReactRouterProps, DetailsTableRowState> {
  constructor(props) {
    super(props);

    this.state = {
      detailsOpened: false,
    };
  }

  shouldComponentUpdate(nextProps: Readonly<DetailsTableRowProps>, nextState: Readonly<DetailsTableRowState>, nextContext: any): boolean {
    return (
      this.props.serviceNameWidth != nextProps.serviceNameWidth ||
      this.props.childsClosed != nextProps.childsClosed ||
      this.props.node != nextProps.node ||
      this.props.summary != nextProps.summary ||
      this.state.detailsOpened != nextState.detailsOpened
    );
  }

  render() {
    const { node, summary, serviceNameWidth } = this.props;
    return (
      <React.Fragment>
        <div
          style={{ width: '100%', cursor: 'pointer' }}
          className={this.props.classes.row}
          key={TraceUtils.getSpanKey(node[0].span)}
          onClick={(e) => {
            this.setState({
              detailsOpened: !this.state.detailsOpened,
            });
          }}
        >
          <Grid container style={{ width: '100%', height: 32 }} justifyContent="flex-start" alignItems="flex-start" spacing={0}>
            <Grid item>
              <div style={{ width: serviceNameWidth, height: 32 }} className={this.props.classes.tableBorder}>
                {this.renderServiceName(node[0], node[1])}
              </div>
            </Grid>
            <Grid item xs={2}>
              <div style={{ width: '100%' }} className={this.props.classes.tableBorder}>
                <Typography noWrap style={{ padding: 4, width: '100%' }}>
                  {node[0].span.name}
                </Typography>
              </div>
            </Grid>
            <Grid item xs>
              <div style={{ width: '100%', position: 'relative' }}>{this.renderTimeline(node[0], node[1], summary.startTime, summary.endTime)}</div>
            </Grid>
          </Grid>
        </div>
        {this.state.detailsOpened && this.renderDetails(node[0], node[1])}
      </React.Fragment>
    );
  }

  renderDetails(node: TraceNode, depth: number) {
    const prefixMarks: any[] = [];
    for (let i = 0; i < depth; i++) {
      prefixMarks.push(
        <Box
          style={{
            position: 'absolute',
            height: '100%',
            marginLeft: leftMarginPerDepth * i,
            width: leftMarginPerDepth,
          }}
          borderRight={1}
          bgcolor={fade(grey[500], 0.08)}
          borderColor={fade(grey[500], 0.4)}
        />,
      );
    }

    prefixMarks.push(
      <Box
        style={{
          position: 'absolute',
          height: '100%',
          marginLeft: leftMarginPerDepth * depth,
          width: leftMarginPerDepth,
        }}
        bgcolor={fade(grey[500], 0.08)}
      />,
    );

    return (
      <Box style={{ width: '100%' }} borderTop={1} borderBottom={1} bgcolor="white" borderColor="grey.500">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {prefixMarks}
          <Box
            style={{
              width: this.props.serviceNameWidth - (leftMarginPerDepth * depth + leftMarginPerDepth - 2),
              height: '100%',
              position: 'absolute',
              marginLeft: leftMarginPerDepth * depth + leftMarginPerDepth - 2,
            }}
            borderLeft={3}
            borderColor={TraceUtils.getServiceNameColor(node.span.serviceName)[500]}
            bgcolor={fade(TraceUtils.getServiceNameColor(node.span.serviceName)[500], 0.05)}
          />
          {this.renderDetailsData(node, depth)}
        </div>
      </Box>
    );
  }

  renderDetailsData(node: TraceNode, depth: number) {
    return (
      <React.Fragment>
        <Box
          style={{ display: 'flex', flexGrow: 1, marginLeft: this.props.serviceNameWidth - 1, zIndex: 5, height: 3 }}
          borderLeft={1}
          borderColor="grey.500"
          bgcolor={fade(TraceUtils.getServiceNameColor(node.span.serviceName)[500], 1)}
        ></Box>
        <Box
          style={{ display: 'flex', flexGrow: 1, marginLeft: this.props.serviceNameWidth - 1, zIndex: 5 }}
          bgcolor="white"
          borderLeft={1}
          borderColor="grey.500"
        >
          <div style={{ width: '100%' }}>
            <div style={{ padding: 8 }}>
              <Typography variant="h6">{node.span.serviceName + '  ' + node.span.name}</Typography>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">Время</TableCell>
                  <TableCell size="small">Отн. Время</TableCell>
                  <TableCell size="small">Аннотация</TableCell>
                  <TableCell size="small">Адрес</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {node.span.annotations!.map((annotation) => {
                  return (
                    <TableRow key={annotation.timestamp + annotation.value}>
                      <TableCell size="small">
                        {moment(annotation.timestamp / 1000).format('MM/DD HH:mm:ss.SSS') + annotation.timestamp.toString().slice(-3)}
                      </TableCell>
                      <TableCell size="small">{TraceUtils.createDurationStr(annotation.timestamp - node.span.timestamp)}</TableCell>
                      <TableCell size="small">{annotation.value}</TableCell>
                      <TableCell size="small">{annotation.endpoint}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">Тег</TableCell>
                  <TableCell size="small">Значение</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(node.span.tags).map((key) => {
                  return (
                    <TableRow key={key}>
                      <TableCell size="small">{key}</TableCell>
                      <TableCell size="small">{node.span.tags[key]}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Box>
      </React.Fragment>
    );
  }

  renderServiceName(node: TraceNode, depth: number) {
    const hasChildrens = node.childrens.length !== 0;
    const prefixMarks: any[] = [];

    for (let i = 0; i < depth; i++) {
      prefixMarks.push(<div className={this.props.classes.marginDepthBlock} />);
    }

    return (
      <div style={{ width: '100%', height: 32, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div
          style={{
            display: 'inline-block',
            width: depth * leftMarginPerDepth + leftMarginPerDepth - 2,
            cursor: hasChildrens ? 'pointer' : '',
            height: 32,
          }}
          className={hasChildrens ? this.props.classes.hideBox : undefined}
          onClick={(e) => {
            if (!hasChildrens) return;

            if (this.props.childsClosed) {
              this.props.onChildClose();
            } else {
              this.props.onChildOpen();
            }

            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {prefixMarks}
          <div style={{ height: 32, width: 32, display: 'inline-block' }}>
            {hasChildrens && this.props.childsClosed && <ArrowDownIcon style={{ height: 32, width: leftMarginPerDepth }} />}
            {hasChildrens && !this.props.childsClosed && <ArrowUpIcon style={{ height: 32, width: leftMarginPerDepth }} />}
          </div>
        </div>
        <div style={{ display: 'inline-block', height: 32, paddingTop: 2, paddingBottom: 2 }}>
          <div
            style={{
              width: 3,
              height: 28,
              backgroundColor: TraceUtils.getServiceNameColor(node.span.serviceName)[500],
            }}
          />
        </div>
        <div style={{ display: 'inline-block', marginLeft: 4 }}>
          <Typography noWrap style={{ width: '100%', marginBottom: 4 }}>
            {node.span.serviceName}
          </Typography>
        </div>
      </div>
    );
  }

  renderSpanDuration(span: Span, leftMarginPerc, widthPerc) {
    if (leftMarginPerc > 50) {
      return (
        <Typography variant={'caption'} style={{ position: 'absolute', right: `${100 - (leftMarginPerc + widthPerc) + 1}%` }}>
          {TraceUtils.createDurationStr(span.duration)}
        </Typography>
      );
    }

    return (
      <Typography variant={'caption'} style={{ position: 'absolute', marginLeft: `${leftMarginPerc + 1}%` }}>
        {TraceUtils.createDurationStr(span.duration)}
      </Typography>
    );
  }

  renderTimeline(node: TraceNode, depth: number, startTime: number, endTime: number) {
    const { annotations } = node.span;

    const duration = endTime - startTime;

    // annotations must always present here and be filled during preprocessing
    const clientStart = annotations!.find((annotation) => annotation.value === 'Client Start');
    const serverStart = annotations!.find((annotation) => annotation.value === 'Server Start');
    const clientFinish = annotations!.find((annotation) => annotation.value === 'Client Finish');
    const serverFinish = annotations!.find((annotation) => annotation.value === 'Server Finish');

    // here we have beautifully merged node of server and client spans
    if (clientStart && serverStart && clientFinish && serverFinish) {
      const clientDuration = clientFinish.timestamp - clientStart.timestamp;
      const serverDuration = serverFinish.timestamp - serverStart.timestamp;

      const clientLengthPercentage = clientDuration / duration;
      const serverLengthPercentage = serverDuration / duration;

      const clientLeftMargin = (clientStart.timestamp - startTime) / duration;
      const serverLeftMargin = (serverStart.timestamp - startTime) / duration;

      return (
        <div style={{ width: '100%', height: 28, padding: 8, position: 'relative' }}>
          <div style={{ width: '100%', height: 28, position: 'relative' }}>
            <Box
              width={clientLengthPercentage}
              style={{ position: 'absolute', marginLeft: clientLeftMargin * 100 + '%', height: 16 }}
              bgcolor={fade(grey[500], 0.3)}
              borderRadius="4px"
            ></Box>
            <Box
              width={serverLengthPercentage}
              style={{ position: 'absolute', marginLeft: serverLeftMargin * 100 + '%', height: 16 }}
              bgcolor={TraceUtils.getServiceNameColor(node.span.serviceName)[500]}
            ></Box>
            {this.renderSpanDuration(node.span, clientLeftMargin * 100, clientLengthPercentage)}
          </div>
        </div>
      );
    }

    const lengthInPercentage = node.span.duration / duration;
    const leftMargin = (node.span.timestamp - startTime) / duration;

    return (
      <div style={{ width: '100%', height: 32, padding: 4, paddingTop: 8, position: 'relative' }}>
        <div style={{ width: '100%', height: 28, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              marginLeft: leftMargin * 100 + '%',
              paddingRight: 4,
              height: 16,
              width: lengthInPercentage * 100 + '%',
              backgroundColor: TraceUtils.getServiceNameColor(node.span.serviceName)[500],
              borderRadius: 4,
            }}
          ></div>
          {this.renderSpanDuration(node.span, leftMargin * 100, lengthInPercentage)}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TraceDetailsTableRow);

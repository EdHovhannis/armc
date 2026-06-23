import { withStyles, createStyles } from '@material-ui/core/styles';
import * as React from 'react';
import autoBind from 'react-autobind';
import { ReactRouterProps } from 'react-router';

import { SearchResult } from '../../../store/tracingSearch/Types';
import JournalLoader from '../../loader/JournalLoader';

import TraceSearchResultInfoBlock from './TraceSearchResultInfoBlock';

export interface TraceSearchResultFormProps {
  searchInProgress: boolean;
  searchResult: SearchResult | undefined;
}

export interface TraceSearchResultDispatchFormProps {
  traceSelected: (traceId: string) => void;
}

class TraceSearchResultFormState {
  hoveredTraceId: string;
}

const styles = (theme) =>
  createStyles({
    resultContainer: {
      display: 'flex' as any,
      width: '100%',
      flexDirection: 'column' as any,
    },
    resultBlock: {
      marginBottom: 16,
    },
  });

class TraceSearchResultForm extends React.Component<
  TraceSearchResultFormProps & TraceSearchResultDispatchFormProps & ReactRouterProps,
  TraceSearchResultFormState
> {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      hoveredTraceId: '',
    };
  }

  shouldComponentUpdate(
    nextProps: Readonly<TraceSearchResultFormProps & TraceSearchResultDispatchFormProps>,
    nextState: Readonly<TraceSearchResultFormState>,
    nextContext: any,
  ): boolean {
    return this.props.searchInProgress != nextProps.searchInProgress || this.props.searchResult != nextProps.searchResult;
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.resultContainer}>
          {this.props.searchInProgress && <JournalLoader />}
          {!this.props.searchInProgress &&
            this.props.searchResult &&
            this.props.searchResult!.summaryList.map((traceSummary, index) => (
              <div className={classes.resultBlock}>
                <TraceSearchResultInfoBlock
                  key={traceSummary.traceId}
                  summary={traceSummary}
                  maxDuration={this.props.searchResult!.maxDuration}
                  traceSelected={this.props.traceSelected}
                />
              </div>
            ))}
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(TraceSearchResultForm);

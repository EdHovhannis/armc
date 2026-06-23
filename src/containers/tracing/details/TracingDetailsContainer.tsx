import * as React from 'react';
import { connect } from 'react-redux';

import TraceDetailsForm, { TraceDetailsFormDispatchProps, TraceDetailsFormProps } from '../../../components/tracing/details/TraceDetailsForm';
import * as tracingActions from '../../../store/tracingSearch/Actions';
import * as tracingSelectors from '../../../store/tracingSearch/Reducer';

function mapStateToProps(state): TraceDetailsFormProps {
  return {
    tree: tracingSelectors.fetchedTraceTree(state),
    selectedTrace: tracingSelectors.fetchedTrace(state),
    traceLoadInProgress: tracingSelectors.traceFetchInProgress(state),
  };
}

function mapDispatchToProps(dispatch: any): TraceDetailsFormDispatchProps {
  return {
    fetchTrace: (datasourceId: string, traceId: string, navigate: (path: string) => void) => {
      dispatch(tracingActions.fetchTrace(datasourceId, traceId, undefined, undefined, navigate));
    },
    fetchTraceWithTime: (datasourceId: string, traceId: string, startTs: number, endTs: number, navigate: (path: string) => void) => {
      dispatch(tracingActions.fetchTrace(datasourceId, traceId, startTs, endTs, navigate));
    },
    selectTrace: (traceId) => {
      dispatch(tracingActions.selectTraceById(traceId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TraceDetailsForm);

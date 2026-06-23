import * as React from 'react';
import { connect } from 'react-redux';

import TopicViewerForm, { TopicViewerDispatchProps, TopicViewerProps } from '../../../components/kafka/viewer/TopicViewerForm';
import * as kafkaActions from '../../../store/kafka/Actions';
import * as kafkaSelectors from '../../../store/kafka/Reducer';
import * as kafkaViewerActions from '../../../store/kafkaViewer/Actions';
import * as kafkaViewerSelectors from '../../../store/kafkaViewer/Reducer';
import { KafkaQuery, KafkaRecord } from '../../../store/kafkaViewer/Types';

function mapStateToProps(state): TopicViewerProps {
  return {
    topics: kafkaSelectors.getTopics(state),
    receiveInProgress: kafkaSelectors.receiveInProgress(state),
    offsetType: kafkaViewerSelectors.getOffsetType(state),
    maxRowsInResult: kafkaViewerSelectors.getMaxRows(state),
    filterValue: kafkaViewerSelectors.getFilterValue(state),
    filterType: kafkaViewerSelectors.getFilterType(state) || 'contain',
    maxRowsToScan: kafkaViewerSelectors.getMaxRowsToScan(state),
    topicId: kafkaViewerSelectors.getTopicId(state),
    recordIsFetching: kafkaViewerSelectors.getRecordsIsFetching(state),
  };
}

function mapDispatchToProps(dispatch: any): TopicViewerDispatchProps {
  return {
    fetchTopics() {
      dispatch(kafkaActions.fetchTopics());
    },
    filterValueChanged(filter: string) {
      dispatch(kafkaViewerActions.filterValueChanged(filter));
    },
    filterTypeChanged(type: string) {
      dispatch(kafkaViewerActions.filterTypeChanged(type));
    },
    maxRowsChanged(maxRows: number) {
      dispatch(kafkaViewerActions.maxRowsChanged(maxRows));
    },
    maxRowsToScanChanged(maxRowsToScan: number) {
      dispatch(kafkaViewerActions.maxRowsToScanChanged(maxRowsToScan));
    },
    offsetTypeChanged(offsetType: string) {
      dispatch(kafkaViewerActions.offsetChanged(offsetType));
    },
    topicIdChanged(topic: number) {
      dispatch(kafkaViewerActions.topicChanged(topic));
    },
    searchRequested(topic: number, query: KafkaQuery, okCallback: (records: Array<KafkaRecord>) => void) {
      dispatch(kafkaViewerActions.fetchRecords(topic, query, okCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TopicViewerForm);

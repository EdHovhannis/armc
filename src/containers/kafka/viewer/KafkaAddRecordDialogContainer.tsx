import * as React from 'react';
import { connect } from 'react-redux';

import KafkaAddRecordDialog, { KafkaAddRecordDialogDispatchProps, KafkaAddRecordDialogProps } from '../../../components/kafka/KafkaAddRecordDialog';
import * as kafkaActions from '../../../store/kafka/Actions';

function mapStateToProps(state): KafkaAddRecordDialogProps {
  return {};
}

function mapDispatchToProps(dispatch: any): KafkaAddRecordDialogDispatchProps {
  return {
    onAddRecordToTopic: (topicId: number, key: string, record: string, successCallback) => {
      dispatch(kafkaActions.addRecordToTopic(topicId, key, record, successCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(KafkaAddRecordDialog);

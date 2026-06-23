import { connect } from 'react-redux';

import KafkaCreateDialog, { KafkaCreateDialogDispatchProps, KafkaCreateDialogProps } from '../../components/kafka/KafkaCreateDialog';
import * as clusterSelectors from '../../store/clusters/Reducer';
import * as kafkaActions from '../../store/kafka/Actions';
import * as notificationActions from '../../store/notification/Actions';
import * as projectSelectors from '../../store/project/Reducer';

function mapStateToProps(state): KafkaCreateDialogProps {
  return {
    projects: projectSelectors.getProjects(state),
    clusters: clusterSelectors.getProjectClusters(state),
  };
}

function mapDispatchToProps(dispatch: any): KafkaCreateDialogDispatchProps {
  return {
    onTopicCreate: ({ name, partitions, replication, projectId, clusterId, topicFullName, successCallback, limits }) => {
      dispatch(kafkaActions.createTopic({ name, partitions, replication, projectId, clusterId, topicFullName, successCallback, limits }));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(KafkaCreateDialog);

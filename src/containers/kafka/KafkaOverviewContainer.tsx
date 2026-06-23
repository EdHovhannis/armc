import { connect } from 'react-redux';

import KafkaOverview, { KafkaOverviewDispatchProps, KafkaOverviewProps } from '../../components/kafka/KafkaOverview';
import * as authSelectors from '../../store/auth/Reducer';
import * as clusterActions from '../../store/clusters/Actions';
import * as clusterSelectors from '../../store/clusters/Reducer';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';

function mapStateToProps(state): KafkaOverviewProps {
  return {
    projects: projectSelectors.getProjects(state),
    topics: kafkaSelectors.getTopics(state),
    isLoading: kafkaSelectors.receiveInProgress(state) || clusterSelectors.isClustersLoading(state),
    isAdmin: authSelectors.isAdmin(state),
    filter: kafkaSelectors.getKafkaFilter(state),
    clusters: clusterSelectors.getClusters(state),
    user: authSelectors.user(state),
    enabledLimits: false,
  };
}

function mapDispatchToProps(dispatch: any): KafkaOverviewDispatchProps {
  return {
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    fetchUserProjects: () => {
      dispatch(projectActions.fetchKafkaProjects());
    },
    handleDeleteClick: (topicId, okCallback?, errorCallback?) => {
      dispatch(kafkaActions.deleteTopic(topicId, okCallback, errorCallback));
    },
    setKafkaFilter(filter) {
      dispatch(kafkaActions.setKafkaFilter(filter));
    },
    fetchClusters: () => {
      dispatch(clusterActions.fetchClusters());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(KafkaOverview);

import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router';

import TopicConfigurationItem from '../../components/kafka/TopicConfigurationItem';
import { TopicInfoFormProps } from '../../components/kafka/TopicInfoForm';
import { checkAuthType } from '../../store/auth/Actions';
import * as authSelectors from '../../store/auth/Reducer';
import { AuthType, User } from '../../store/auth/Types';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { ACLFilter, ClientACLRecord, KafkaTopic } from '../../store/kafka/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';

interface KafkaViewProps extends TopicInfoFormProps {
  isAdmin: boolean;
  authType?: AuthType;
  user: User | undefined;
  isLoading: boolean;
  topic?: KafkaTopic;
  topics: Array<KafkaTopic>;
  aclEnable: boolean;
  aclRecords?: Array<ClientACLRecord>;
}

interface KafkaViewDispatchProps {
  fetchTopics: () => void;
  fetchUserProjects: () => void;
  displayError(msg: string): void;
  addACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?: () => void) => void;
  deleteACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?: () => void) => void;
  updateACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?: () => void) => void;
  getAclRecords: (topicName: string, projectShortName: string, successCallback?: () => void, aclFilter?: ACLFilter) => void;
  fetchKafkaTopic: (topicName: string, projectShortName: string, okCallback?: (topic: KafkaTopic) => void) => void;
  checkAclEnable: (clusterId: number, okCallback?: (isAclEnable: boolean) => void, errorCallback?: (error: any) => void) => void;
  updateTopic: (topic: KafkaTopic, onSuccess?: () => void) => void;
  checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => void;
}

function KafkaTopicViewWithParams(props: KafkaViewProps & KafkaViewDispatchProps) {
  const params = useParams();
  const [canEdit, setCanEdit] = React.useState(false);
  const [authType, setAuthType] = React.useState<AuthType | undefined>(props.authType);

  React.useEffect(() => {
    if (!authType) {
      props.checkAuthType(
        (type: AuthType) => setAuthType(type),
        (errorMessage) => props.displayError(errorMessage),
      );
    }
  }, [authType]);

  React.useEffect(() => {
    props.fetchUserProjects();
    const topicName = params.topicName;
    const projectShortName = params.projectShortName;

    if (topicName && projectShortName) {
      props.fetchKafkaTopic(topicName, projectShortName, (topic) => {
        if (!topic) {
          console.error('Topic not found:', { topicName, projectShortName });
          props.displayError('Топик не найден');
          return;
        }
        setCanEdit(topic.canEdit);
      });
    }
  }, [params.topicName, params.projectShortName]);

  React.useEffect(() => {
    if (props.topic) {
      props.checkAclEnable(Number(props.topic.clusterId), (isAclEnable: boolean) => {
        if (isAclEnable && params.topicName && params.projectShortName) {
          props.getAclRecords(params.topicName, params.projectShortName);
        }
      });
    }
  }, [props.topic]);

  const refreshACL = () => {
    if (params.topicName && params.projectShortName) {
      props.getAclRecords(params.topicName, params.projectShortName);
    }
  };

  return (
    <React.Fragment>
      <TopicConfigurationItem
        deleteACL={props.deleteACL}
        aclRecords={props.aclRecords!}
        refreshACL={refreshACL}
        isAdmin={props.isAdmin}
        authType={authType || 'autz'}
        canEdit={canEdit}
        projectShortName={params.projectShortName!}
        topic={props.topic!}
        projects={props.projects}
        updateTopic={props.updateTopic}
        isLoading={props.isLoading}
        displayError={props.displayError}
        aclEnable={props.aclEnable}
        addACL={props.addACL}
        updateACL={props.updateACL}
      />
    </React.Fragment>
  );
}

function mapStateToProps(state: any): KafkaViewProps {
  return {
    projects: projectSelectors.getProjects(state),
    topics: kafkaSelectors.getTopics(state),
    isAdmin: authSelectors.isAdmin(state),
    authType: authSelectors.authType(state),
    user: authSelectors.user(state),
    topic: kafkaSelectors.getCurrentTopic(state),
    isLoading: kafkaSelectors.isLoading(state),
    aclRecords: kafkaSelectors.getCurrentACL(state),
    aclEnable: kafkaSelectors.getAclEnable(state),
  };
}

function mapDispatchToProps(dispatch: any): KafkaViewDispatchProps {
  return {
    checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
      dispatch(checkAuthType(okCallback, errorCallback));
    },
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    addACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?: () => void) => {
      dispatch(kafkaActions.addACL(topicName, projectShortName, aclRecords, successCallback));
    },
    deleteACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?: () => void) => {
      dispatch(kafkaActions.deleteACL(topicName, projectShortName, aclRecords, successCallback));
    },
    updateACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?: () => void, matchType?: string) => {
      dispatch(kafkaActions.updateACL(topicName, projectShortName, aclRecords, successCallback, matchType));
    },
    getAclRecords: (topicName: string, projectShortName: string, successCallback?: () => void, aclFilter?: ACLFilter) => {
      dispatch(kafkaActions.getACLRecordsWithFilter(topicName, projectShortName, successCallback, aclFilter));
    },
    fetchUserProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    fetchKafkaTopic: (topicName, projectShortName, okCallback?) => {
      dispatch(kafkaActions.getTopicByNameAndProjectShortName(topicName, projectShortName, okCallback));
    },
    checkAclEnable: (clasterId: number, okCallback?, errorCallback?) => {
      dispatch(kafkaActions.getAclEnable(clasterId, okCallback, errorCallback));
    },
    updateTopic: (topic, onSuccess) => {
      dispatch(kafkaActions.updateTopic(topic.id, topic, onSuccess));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(KafkaTopicViewWithParams);

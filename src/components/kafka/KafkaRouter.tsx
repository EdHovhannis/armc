import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import KafkaAllView from '../../containers/kafka/KafkaOverviewContainer';
import KafkaTopicView from '../../containers/kafka/KafkaTopicView';
import TopicViewerView from '../../containers/kafka/viewer/TopicViewerContainer';
import useEditableProjectsByResourceTypeAndResourceAction from '../../hooks/useEditableProjectsByResourceTypeAndResourceAction';
import { LoadingSpinner } from '../constraint/utils/LoadingSpinner';
import { ResourceAction, ResourceType } from '../shared/types/ResourceTypes';

const KafkaRouter = () => {
  const editableProjects = useEditableProjectsByResourceTypeAndResourceAction({
    resourceType: ResourceType.KAFKA_TOPIC,
    resourceAction: ResourceAction.EDIT,
  });

  return (
    <React.Fragment>
      <div style={{ flexGrow: 1, marginTop: 16 }}>
        <Routes>
          <Route
            path="topics"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <KafkaAllView editableProjects={editableProjects} />
              </Suspense>
            }
          />
          <Route
            path="viewer/:id"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <TopicViewerView />
              </Suspense>
            }
          />
          <Route
            path="viewer"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <TopicViewerView />
              </Suspense>
            }
          />
          <Route
            path="topics/:topicName/:projectShortName"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <KafkaTopicView />
              </Suspense>
            }
          />
          <Route path="" element={<Navigate to="/kafka/topics" />} />
        </Routes>
      </div>
    </React.Fragment>
  );
};

export default KafkaRouter;

import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';
import { ResourceAction, ResourceType } from '../../components/shared/types/ResourceTypes';
import useEditableProjectsByResourceTypeAndResourceAction from '../../hooks/useEditableProjectsByResourceTypeAndResourceAction';

import AllFlowsView from './AllFlowsView';
import FlowEditorView from './PipelineEditorView';

const FlowRouter = () => {
  const editableProjects = useEditableProjectsByResourceTypeAndResourceAction({
    resourceType: ResourceType.FLOW,
    resourceAction: ResourceAction.EDIT,
  });

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AllFlowsView editableProjects={editableProjects} />
            </Suspense>
          }
        />
        <Route
          path="/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <FlowEditorView editableProjects={editableProjects} />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
};

export default FlowRouter;

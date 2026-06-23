import { ResourceAction, ResourceType } from '@src/components/shared/types/ResourceTypes';
import useEditableProjectsByResourceTypeAndResourceAction from '@src/hooks/useEditableProjectsByResourceTypeAndResourceAction';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';

import DatasourceView from './DatasourceView';
import SupervisorsView from './SupervisorsView';
import TaskEditorView from './TaskEditorView';

const MonitoringView: FC = () => {
  const editableProjects = useEditableProjectsByResourceTypeAndResourceAction({
    resourceType: ResourceType.ANALYTICAL_INDEX,
    resourceAction: ResourceAction.EDIT,
  });

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SupervisorsView editableProjects={editableProjects} />
            </Suspense>
          }
        />
        <Route
          path="datasources"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <DatasourceView />
            </Suspense>
          }
        />
        <Route
          path="task/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <TaskEditorView editableProjects={editableProjects} />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
};

export default MonitoringView;

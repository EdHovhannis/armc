import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';
import { ResourceAction, ResourceType } from '../../components/shared/types/ResourceTypes';
import useEditableProjectsByResourceTypeAndResourceAction from '../../hooks/useEditableProjectsByResourceTypeAndResourceAction';

import ArchiveEditorView from './ArchiveEditorView';
import ArchiveTasks from './ArchiveTasks';

const ArchiveRouter: FC = () => {
  const editableProjects = useEditableProjectsByResourceTypeAndResourceAction({
    resourceType: ResourceType.ARCHIVE_INDEX,
    resourceAction: ResourceAction.EDIT,
  });

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ArchiveTasks editableProjects={editableProjects} />
          </Suspense>
        }
      />
      <Route
        path="/:name"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ArchiveEditorView editableProjects={editableProjects} />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default ArchiveRouter;

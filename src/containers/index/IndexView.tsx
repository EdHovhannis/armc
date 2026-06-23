import { ResourceAction, ResourceType } from '@src/components/shared/types/ResourceTypes';
import useEditableProjectsByResourceTypeAndResourceAction from '@src/hooks/useEditableProjectsByResourceTypeAndResourceAction';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';

import IndexEditorView from './IndexEditorView';
import IndexSearchView from './IndexSearchView';
import IndexTasks from './IndexTasks';

const IndexView = () => {
  const IndexTasksView = IndexTasks as React.ComponentType<any>;
  const IndexEditor = IndexEditorView as React.ComponentType<any>;
  const IndexSearch = IndexSearchView as React.ComponentType<any>;

  const editableProjects = useEditableProjectsByResourceTypeAndResourceAction({
    resourceType: ResourceType.FULL_TEXT_INDEX,
    resourceAction: ResourceAction.EDIT,
  });

  return (
    <React.Fragment>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <IndexTasksView editableProjects={editableProjects} />
            </Suspense>
          }
        />
        <Route
          path="/search"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <IndexTasksView editableProjects={editableProjects} />
            </Suspense>
          }
        />
        <Route
          path=":id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <IndexEditor editableProjects={editableProjects} />
            </Suspense>
          }
        />
        <Route
          path="search/:collection/:projectShortName"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <IndexSearch />
            </Suspense>
          }
        />
      </Routes>
    </React.Fragment>
  );
};

export default IndexView;

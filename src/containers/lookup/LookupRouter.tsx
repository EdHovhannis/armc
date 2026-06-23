import React, { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';
import { ResourceType, ResourceAction } from '../../components/shared/types/ResourceTypes';
import useEditableProjectsByResourceTypeAndResourceAction from '../../hooks/useEditableProjectsByResourceTypeAndResourceAction';

import DictionaryPageView from './DictionaryPageView';
import DictionaryView from './DictionaryView';

const LookupRouter: FC = () => {
  const editableProjects = useEditableProjectsByResourceTypeAndResourceAction({
    resourceType: ResourceType.DICTIONARY,
    resourceAction: ResourceAction.EDIT,
  });

  return (
    <React.Fragment>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <DictionaryView editableProjects={editableProjects} />
            </Suspense>
          }
        />
        <Route
          path="/:name"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <DictionaryPageView editableProjects={editableProjects} />
            </Suspense>
          }
        />
      </Routes>
    </React.Fragment>
  );
};

export default LookupRouter;

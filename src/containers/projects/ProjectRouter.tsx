import { LoadingSpinner } from '@src/components/constraint/utils/LoadingSpinner';
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router';

import SettingView from '../settings/SettingView';

import ProjectInfoView from './ProjectInfoView';

const ProjectRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SettingView currentTab={0} />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SettingView />
          </Suspense>
        }
      />
      <Route
        path="/:id"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectInfoView />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default ProjectRouter;

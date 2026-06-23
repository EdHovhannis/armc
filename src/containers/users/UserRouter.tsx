import { LoadingSpinner } from '@src/components/constraint/utils/LoadingSpinner';
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router';

import SettingView from '../settings/SettingView';

import UserInfoView from './abyss/UserInfoView';

const UserRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SettingView currentTab={2} />
          </Suspense>
        }
      />
      <Route
        path="/:id"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <UserInfoView />
          </Suspense>
        }
      />
      <Route
        path="/localUsers"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SettingView currentTab={3} />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default UserRouter;

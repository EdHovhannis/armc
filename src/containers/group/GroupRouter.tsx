import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';
import SettingView from '../settings/SettingView';

import TeamInfoView from './GroupInfoView';
export default class GroupRouter extends React.Component {
  render() {
    return (
      <React.Fragment>
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
                <TeamInfoView />
              </Suspense>
            }
          />
        </Routes>
      </React.Fragment>
    );
  }
}

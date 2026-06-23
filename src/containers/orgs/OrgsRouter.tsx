import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';
import SettingView from '../settings/SettingView';

import OrgPage from './OrgPage';

export default class OrgsRouter extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SettingView currentPageAfterUser="orgs" />
            </Suspense>
          }
        />
        <Route
          path="/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <OrgPage />
            </Suspense>
          }
        />
      </Routes>
    );
  }
}

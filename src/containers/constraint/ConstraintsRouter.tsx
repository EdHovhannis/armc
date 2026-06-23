import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';

import BlockObjectContainer from './BlockObjectContainer';
import ConstraintsPageView from './ConstraintsPageView';
import OverloadedConstraintsPageView from './OverloadedConstraintsPageView';
export default class ConstraintsRouter extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ConstraintsPageView />
              </Suspense>
            }
          />
          <Route
            path="/overloaded"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <OverloadedConstraintsPageView />
              </Suspense>
            }
          />
          {this.props.isLegacyMode && (
            <Route
              path="/blocks"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <BlockObjectContainer />
                </Suspense>
              }
            />
          )}
        </Routes>
      </React.Fragment>
    );
  }
}

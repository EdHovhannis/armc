import { withStyles, createStyles } from '@material-ui/core/styles';
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';

import { LoadingSpinner } from '../../components/constraint/utils/LoadingSpinner';

import TracingDatasourceContainer from './datasources/TracingDatasourceContainer';
import TracingOverviewContainer from './datasources/TracingOverviewContainer';
import TracingDetailsContainer from './details/TracingDetailsContainer';
import TracingSearchContainer from './search/TracingSearchContainer';

const styles = (theme) =>
  createStyles({
    menuLink: {
      color: '#69707D',
      marginLeft: 24,
      whiteSpace: 'nowrap' as any,
      textDecoration: 'none',
      overflowX: 'hidden' as any,
    },
  });

class TracingRouter extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{ flexGrow: 1, marginTop: 16 }}>
        <Routes>
          <Route
            path="/overview"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <TracingOverviewContainer />
              </Suspense>
            }
          />
          <Route
            path="/datasource/:id"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <TracingDatasourceContainer />
              </Suspense>
            }
          />
          <Route
            path="/search"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <TracingSearchContainer />
              </Suspense>
            }
          />
          <Route
            path="/trace/:datasource/:id"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <TracingDetailsContainer />
              </Suspense>
            }
          />
          <Route path="" element={<Navigate to="/tracing/search" />} />
        </Routes>
      </div>
    );
  }
}

export default withStyles(styles)(TracingRouter);

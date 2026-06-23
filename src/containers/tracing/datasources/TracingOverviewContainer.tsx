import * as projectSelectors from '@src/store/project/Reducer';
import * as React from 'react';
import { connect } from 'react-redux';

import TracingOverview, {
  TracingOverviewDispatchProps,
  TracingOverviewProps,
} from '../../../components/tracing/datasources/TracingDatasourceOverview';
import * as authSelectors from '../../../store/auth/Reducer';
import * as tracingActions from '../../../store/tracingDatasources/Actions';
import * as tracingSelectors from '../../../store/tracingDatasources/Reducer';

function mapStateToProps(state): TracingOverviewProps {
  return {
    datasources: tracingSelectors.getDatasources(state),
    isLoading: tracingSelectors.isDatasourcesLoading(state),
    user: authSelectors.user(state),
    isAdmin: authSelectors.isAdmin(state),
    projects: projectSelectors.getProjects(state),
  };
}

function mapDispatchToProps(dispatch: any): TracingOverviewDispatchProps {
  return {
    handleDeleteClick: (datasourceId, okCallback?, errorCallback?) => {
      dispatch(tracingActions.deleteDatasource(datasourceId, okCallback, errorCallback));
    },
    fetchDatasources: () => {
      dispatch(tracingActions.fetchDatasources());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TracingOverview);

import * as React from 'react';
import { connect } from 'react-redux';

import TracingCreateDialog, {
  TracingCreateDialogDispatchProps,
  TracingCreateDialogProps,
} from '../../../components/tracing/datasources/TracingDatasourceCreateDialog';
import * as monitoringActions from '../../../store/monitoring/Actions';
import * as monitoringSelectors from '../../../store/monitoring/Reducer';
import * as projectActions from '../../../store/project/Actions';
import * as projectSelectors from '../../../store/project/Reducer';
import * as tracingActions from '../../../store/tracingDatasources/Actions';

function mapStateToProps(state): TracingCreateDialogProps {
  return {
    isProjectsLoading: projectSelectors.isLoading(state),
    isSupervisorsLoading: monitoringSelectors.supervisorsIsLoading(state),
    projects: projectSelectors.getProjects(state),
    supervisors: monitoringSelectors.getAllTasks(state).filter((superv) => superv.info.instances && superv.info.instances.length > 0),
  };
}

function mapDispatchToProps(dispatch: any): TracingCreateDialogDispatchProps {
  return {
    onCreate: (
      name: string,
      projectId: number,
      traceSupervisorId: number,
      callsSupervisorId,
      treeSupervisorId,
      successCallback: () => void,
      errorCallback: (error) => void,
    ) => {
      dispatch(
        tracingActions.createDatasource(name, projectId, traceSupervisorId, callsSupervisorId, treeSupervisorId, successCallback, errorCallback),
      );
    },
    fetchProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    fetchSupervisors: () => {
      dispatch(monitoringActions.fetchAllSupervisors());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TracingCreateDialog);

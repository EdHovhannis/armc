import * as React from 'react';
import { connect } from 'react-redux';

import JournalLoader from '../../../components/loader/JournalLoader';
import TracingDatasourceForm from '../../../components/tracing/datasources/TracingDatasourceForm';
import { withParams, WithParamsProps } from '../../../components/utils/withParams';
import { authType } from '../../../store/auth/Reducer';
import { AuthType } from '../../../store/auth/Types';
import * as monitoringActions from '../../../store/monitoring/Actions';
import * as monitoringSelectors from '../../../store/monitoring/Reducer';
import { DruidSupervisorInfo } from '../../../store/monitoring/Types';
import * as projectActions from '../../../store/project/Actions';
import * as projectSelectors from '../../../store/project/Reducer';
import { Project } from '../../../store/project/Types';
import * as tracingActions from '../../../store/tracingDatasources/Actions';
import * as tracingSelectors from '../../../store/tracingDatasources/Reducer';
import { TracingSupervisorDescription } from '../../../store/tracingDatasources/Types';

interface TracingDatasourceContainerProps {
  projects: Array<Project> | undefined;
  supervisors: Array<DruidSupervisorInfo> | undefined;
  datasources: Map<number, TracingSupervisorDescription> | undefined;
  isLoading: boolean;
  authType: AuthType;
}

interface TracingDatasourceContainerDispatchProps {
  fetchProjects: () => void;
  fetchSupervisors: () => void;
  fetchDatasource: (id: number) => void;
  onDatasourceUpdate: (id: number, name: string, traceSupervisorId: number, callsSupervisorId?: number, treeSupervisorId?: number) => void;
}

class TracingDatasourceContainer extends React.Component<
  TracingDatasourceContainerProps & TracingDatasourceContainerDispatchProps & WithParamsProps,
  any
> {
  constructor(props: TracingDatasourceContainerProps & TracingDatasourceContainerDispatchProps & WithParamsProps) {
    super(props);
    const id = Number(this?.props?.id) || 0;
    this.state = {
      id: id,
    };
  }

  componentDidMount(): void {
    const { datasources } = this.props;
    if (!datasources || datasources.has(this.state.id)) {
      this.props.fetchDatasource(this.state.id);
    }

    this.props.fetchSupervisors();
    this.props.fetchProjects();
  }

  render() {
    const { projects, supervisors, datasources, isLoading } = this.props;
    const { id } = this.state;

    if (isLoading) {
      return <JournalLoader />;
    }

    if (projects == null || supervisors == null || datasources == null || !datasources.has(id)) {
      return null;
    }

    const datasource = datasources.get(id);
    return (
      <TracingDatasourceForm
        onDatasourceUpdate={(id: number, name: string, traceSupervisorId: number, callsSupervisorId?: number, treeSupervisorId?: number) => {
          this.props.onDatasourceUpdate(id, name, traceSupervisorId, callsSupervisorId, treeSupervisorId);
        }}
        projects={projects}
        datasource={datasource}
        id={id}
        supervisors={supervisors}
        isLegacy={this.props.authType === 'legacy'}
      />
    );
  }
}

function mapStateToProps(state: any): TracingDatasourceContainerProps {
  const dsLoading = tracingSelectors.isDatasourceLoading(state) || tracingSelectors.isDatasourcesLoading(state);
  const monitoringSupervisorsLoading = monitoringSelectors.supervisorsIsLoading(state);
  return {
    datasources: tracingSelectors.getDatasources(state),
    isLoading: dsLoading || monitoringSupervisorsLoading,
    supervisors: monitoringSelectors.getAllTasks(state),
    projects: projectSelectors.getProjects(state),
    authType: authType(state),
  };
}

function mapDispatchToProps(dispatch: any): TracingDatasourceContainerDispatchProps {
  return {
    fetchDatasource(id: number) {
      dispatch(tracingActions.fetchDatasource(id));
    },
    fetchProjects() {
      dispatch(projectActions.fetchAllProjects());
    },
    onDatasourceUpdate(id: number, name: string, traceSupervisorId: number, callsSupervisorId?: number, treeSupervisorId?: number) {
      dispatch(tracingActions.updateDatasource(id, name, traceSupervisorId, callsSupervisorId, treeSupervisorId));
    },
    fetchSupervisors() {
      dispatch(monitoringActions.fetchAllSupervisors());
    },
  };
}

export default withParams(connect(mapStateToProps, mapDispatchToProps)(TracingDatasourceContainer));

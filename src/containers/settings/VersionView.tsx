import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import VersionsForm from '../../components/settings/VersionsForm';
import { Loader } from '../../components/utils/Loader';
import * as pvmAuthActions from '../../store/apiKeys/Actions';
import * as pvmAuthSelectors from '../../store/apiKeys/Reducer';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import * as clientApiActions from '../../store/config/Actions';
import * as clientApiSelectors from '../../store/config/Reducer';
import { Versions } from '../../store/config/Types';
import * as processingActions from '../../store/flow/Actions';
import * as processingSelectors from '../../store/flow/Reducer';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import * as pvmBaseActions from '../../store/project/Actions';
import * as pvmBaseSelectors from '../../store/project/Reducer';
import * as traceQueryActions from '../../store/tracingDatasources/Actions';
import * as traceQuerySelectors from '../../store/tracingDatasources/Reducer';

interface VersionViewProps {
  flowVersion: Versions[];
  indexVersion: Versions[];
  kafkaVersion: Versions[];
  monitoringVersion: Versions[];
  archiveVersion: Versions[];
  pvmBaseVersion: Versions[];
  clientApiVersion: Versions[];
  traceVersion: Versions[];
  pvmAuthVersion: Versions[];
  isLoading: boolean;
}

interface VersionViewDispatchProps {
  getFlowVersion: () => void;
  getIndexVersion: () => void;
  getKafkaVersion: () => void;
  getMonitoringVersion: () => void;
  getArchiveVersion: () => void;
  getPvmBaseVersion: () => void;
  getClientApiVersion: () => void;
  getTraceVersion: () => void;
  getPvmAuthVersion: () => void;
}

class VersionView extends React.Component<VersionViewDispatchProps & VersionViewProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.getFlowVersion();
    this.props.getIndexVersion();
    this.props.getKafkaVersion();
    this.props.getMonitoringVersion();
    this.props.getArchiveVersion();
    this.props.getPvmBaseVersion();
    this.props.getClientApiVersion();
    this.props.getTraceVersion();
    this.props.getPvmAuthVersion();
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <VersionsForm
        flowVersion={this.props.flowVersion}
        indexVersion={this.props.indexVersion}
        kafkaVersion={this.props.kafkaVersion}
        monitoringVersion={this.props.monitoringVersion}
        archiveVersion={this.props.archiveVersion}
        pvmBaseVersion={this.props.pvmBaseVersion}
        clientApiVersion={this.props.clientApiVersion}
        traceVersion={this.props.traceVersion}
        pvmAuthVersion={this.props.pvmAuthVersion}
      />
    );
  }
}

function mapStateToProps(state): VersionViewProps {
  return {
    isLoading:
      pvmBaseSelectors.isVersionLoading(state) ||
      processingSelectors.isVersionLoading(state) ||
      indexSelectors.isVersionLoading(state) ||
      kafkaSelectors.isVersionLoading(state) ||
      monitoringSelectors.isVersionLoading(state) ||
      archiveSelectors.isVersionLoading(state) ||
      traceQuerySelectors.isVersionLoading(state) ||
      clientApiSelectors.isVersionLoading(state) ||
      pvmAuthSelectors.isVersionLoading(state),
    flowVersion: processingSelectors.getVersion(state),
    indexVersion: indexSelectors.getVersion(state),
    kafkaVersion: kafkaSelectors.getVersion(state),
    monitoringVersion: monitoringSelectors.getVersion(state),
    archiveVersion: archiveSelectors.getVersion(state),
    pvmBaseVersion: pvmBaseSelectors.getVersion(state),
    traceVersion: traceQuerySelectors.getVersion(state),
    clientApiVersion: clientApiSelectors.getVersion(state),
    pvmAuthVersion: pvmAuthSelectors.getVersion(state),
  } as VersionViewProps;
}

function mapDispatchToProps(dispatch: any): VersionViewDispatchProps {
  return {
    getFlowVersion: () => {
      dispatch(processingActions.getVersion());
    },
    getIndexVersion: () => {
      dispatch(indexActions.getVersion());
    },
    getKafkaVersion: () => {
      dispatch(kafkaActions.getVersion());
    },
    getMonitoringVersion: () => {
      dispatch(monitoringActions.getVersion());
    },
    getArchiveVersion: () => {
      dispatch(archiveActions.getVersion());
    },
    getPvmBaseVersion: () => {
      dispatch(pvmBaseActions.getVersion());
    },
    getClientApiVersion: () => {
      dispatch(clientApiActions.getVersion());
    },
    getTraceVersion: () => {
      dispatch(traceQueryActions.getVersion());
    },
    getPvmAuthVersion: () => {
      dispatch(pvmAuthActions.getVersion());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VersionView);

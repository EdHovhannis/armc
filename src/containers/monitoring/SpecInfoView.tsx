import * as React from 'react';
import { connect } from 'react-redux';

import DruidSpecTaskConfigurationDialog from '../../components/monitoring/DruidSpecTaskConfigurationDialog';
import { Loader } from '../../components/utils/Loader';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { SupervisorDruidConfigurationInfo } from '../../store/monitoring/Types';

interface SpecInfoViewProps {
  zoneId?: string;
  id: number;
  instanceName: string;
  isCreation?: boolean;
  close: () => void;
}

interface SpecInfoViewStateProps {
  isLoading: boolean;
  indexConfiguration?: SupervisorDruidConfigurationInfo;
}

interface SpecInfoViewDispatchProps {
  getCurrentIndexTaskConfigurationDruidInfo: (
    id: number,
    zoneId: string,
    okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getExpectedIndexTaskConfigurationDruidInfo: (
    id: number,
    zoneId: string,
    okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

interface SpecInfoViewState {
  error?: string;
  detailError?: any;
}

class SpecInfoView extends React.Component<SpecInfoViewStateProps & SpecInfoViewDispatchProps & SpecInfoViewProps, SpecInfoViewState> {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      detailError: '',
    };
  }

  componentDidMount() {
    if (this.props.zoneId) {
      if (!this.props.isCreation) {
        this.props.getCurrentIndexTaskConfigurationDruidInfo(
          this.props.id,
          this.props.zoneId,
          () => {},
          (errorMsg) => {
            this.setState({
              error: errorMsg.message,
              detailError: errorMsg.details,
            });
          },
        );
      } else {
        this.props.getExpectedIndexTaskConfigurationDruidInfo(
          this.props.id,
          this.props.zoneId,
          () => {},
          (errorMsg) => {
            this.setState({
              error: errorMsg.message,
              detailError: errorMsg.details,
            });
          },
        );
      }
    }
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <DruidSpecTaskConfigurationDialog
          id={this.props.id}
          zoneId={this.props.zoneId}
          error={this.state.error}
          detailError={this.state.detailError}
          indexConfiguration={this.props.indexConfiguration}
          instanceName={this.props.instanceName}
          isCreation={this.props.isCreation || false}
          close={this.props.close}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): SpecInfoViewStateProps {
  return {
    isLoading: monitoringSelectors.isDruidConfigurationLoading(state),
    indexConfiguration: monitoringSelectors.getIndexTaskConfigurationDruidInfo(state),
  };
}

function mapDispatchToProps(dispatch: any): SpecInfoViewDispatchProps {
  return {
    getCurrentIndexTaskConfigurationDruidInfo: (id, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.getCurrentIndexTaskConfigurationDruidInfoFromDruid(id, zoneId, okCallback, errorCallback));
    },
    getExpectedIndexTaskConfigurationDruidInfo: (id, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.getExpectedIndexTaskConfigurationDruidInfo(id, zoneId, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SpecInfoView);

import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalConfigInfo } from '../../components/globalConfigurations/GlobalConfigInfo';
import { Loader } from '../../components/utils/Loader';
import * as monitoringSelector from '../../store/monitoring/Reducer';
import { GlobalConfigs } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';

interface GlobalConfigFormContainerProps {
  zoneId: string;
  isActualConfig: boolean;
  overrideConfig: (globalConfig: GlobalConfigs, isNew: boolean, version: string) => void;
}

interface GlobalConfigFormContainerDispatchProps {
  displayError: (msg: string) => void;
}

interface GlobalConfigFormContainerStateProps {
  isLoading: boolean;
  monitoringGlobalConfigs?: GlobalConfigs;
}

class GlobalConfigFormContainer extends React.Component<
  GlobalConfigFormContainerDispatchProps & GlobalConfigFormContainerStateProps & GlobalConfigFormContainerProps,
  any
> {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <GlobalConfigInfo
          zoneId={this.props.zoneId}
          isActualConfig={this.props.isActualConfig}
          monitoringGlobalConfigs={this.props.monitoringGlobalConfigs}
          displayError={this.props.displayError}
          overrideConfig={this.props.overrideConfig}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): GlobalConfigFormContainerStateProps {
  return {
    isLoading: monitoringSelector.isGlobalConfigLoading(state) || monitoringSelector.isGlobalConfigVersionsLoading(state),
    monitoringGlobalConfigs: monitoringSelector.getGlobalConfigs(state),
  };
}

function mapDispatchToProps(dispatch: any): GlobalConfigFormContainerDispatchProps {
  return {
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalConfigFormContainer);

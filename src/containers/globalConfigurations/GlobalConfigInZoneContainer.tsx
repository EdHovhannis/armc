import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalConfigInZoneInfo } from '../../components/globalConfigurations/GlobalConfigInZoneInfo';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelector from '../../store/monitoring/Reducer';
import { GlobalConfigs, GlobalConfigVersion } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';

interface GlobalConfigInZoneContainerProps {
  zoneId: string;
  currentGlobalVersion: string;
}

interface GlobalConfigInZoneContainerDispatchProps {
  displayError: (msg: string) => void;
  getGlobalConfigurationForDruid: (
    zoneId: string,
    okCallback?: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigByVersion: (
    version: string,
    okCallback?: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  overwriteGlobalConfigurationsForDruid: (
    config: GlobalConfigs,
    okCallback?: (version: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigsVersions: (
    zoneId: string,
    okCallback?: (versions: string[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  setGlobalConfigurationActive: (
    zoneId: string,
    version: string,
    okCallback: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigurationVersionForDruid: (
    okCallback?: (globalVersion: GlobalConfigVersion[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

interface GlobalConfigInZoneContainerStateProps {
  isLoading: boolean;
  globalConfigVersions: string[];
}

class GlobalConfigInZoneContainer extends React.Component<
  GlobalConfigInZoneContainerDispatchProps & GlobalConfigInZoneContainerStateProps & GlobalConfigInZoneContainerProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getGlobalConfigsVersions(this.props.zoneId);
    this.props.getGlobalConfigurationForDruid(this.props.zoneId);
  }

  componentDidUpdate(
    prevProps: Readonly<GlobalConfigInZoneContainerDispatchProps & GlobalConfigInZoneContainerStateProps & GlobalConfigInZoneContainerProps>,
    prevState: Readonly<any>,
    snapshot?: any,
  ) {
    if (prevProps.zoneId !== this.props.zoneId) {
      this.props.getGlobalConfigsVersions(this.props.zoneId);
      this.props.getGlobalConfigurationForDruid(this.props.zoneId);
    }
  }

  render() {
    return (
      <React.Fragment>
        <GlobalConfigInZoneInfo
          getGlobalConfigurationVersionForDruid={this.props.getGlobalConfigurationVersionForDruid}
          setGlobalConfigurationActive={this.props.setGlobalConfigurationActive}
          getGlobalConfigurationForDruid={this.props.getGlobalConfigurationForDruid}
          getGlobalConfigsVersions={this.props.getGlobalConfigsVersions}
          zoneId={this.props.zoneId}
          currentGlobalVersion={this.props.currentGlobalVersion}
          getGlobalConfigByVersion={this.props.getGlobalConfigByVersion}
          overwriteGlobalConfigurationsForDruid={this.props.overwriteGlobalConfigurationsForDruid}
          globalConfigVersions={this.props.globalConfigVersions}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): GlobalConfigInZoneContainerStateProps {
  return {
    isLoading: monitoringSelector.isGlobalConfigLoading(state) || monitoringSelector.isGlobalConfigVersionsLoading(state),
    globalConfigVersions: monitoringSelector.getGlobalConfigVersions(state),
  };
}

function mapDispatchToProps(dispatch: any): GlobalConfigInZoneContainerDispatchProps {
  return {
    overwriteGlobalConfigurationsForDruid: (config, okCallback, errorCallback) => {
      dispatch(monitoringActions.overwriteGlobalConfigurationsForDruid(config, okCallback, errorCallback));
    },
    getGlobalConfigsVersions: (zoneId: string, okCallback?, errorCallback?) => {
      dispatch(monitoringActions.getGlobalConfigsVersions(zoneId, okCallback, errorCallback));
    },
    getGlobalConfigByVersion: (version, okCallback, errorCallback) => {
      dispatch(monitoringActions.getGlobalConfigByVersion(version, okCallback, errorCallback));
    },
    getGlobalConfigurationForDruid: (
      zoneId: string,
      okCallback?: (config: GlobalConfigs) => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(monitoringActions.getGlobalConfigurationsForDruid(zoneId, okCallback, errorCallback));
    },
    setGlobalConfigurationActive: (zoneId, version, okCallback, errorCallback) => {
      dispatch(monitoringActions.setGlobalConfigurationActive(zoneId, version, okCallback, errorCallback));
    },
    getGlobalConfigurationVersionForDruid: (okCallback, errorCallback) => {
      dispatch(monitoringActions.getGlobalConfigurationVersionForDruid(okCallback, errorCallback));
    },
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalConfigInZoneContainer);

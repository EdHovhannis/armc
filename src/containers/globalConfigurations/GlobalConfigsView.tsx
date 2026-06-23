import * as React from 'react';
import { connect } from 'react-redux';

import GlobalConfigsForm from '../../components/globalConfigurations/GlobalConfigsForm';
import { Loader } from '../../components/utils/Loader';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelector from '../../store/monitoring/Reducer';
import { GlobalConfigs, GlobalConfigVersion } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';

interface GlobalConfigsViewProps {
  globalConfigVersions: string[];
  currentGlobalVersion: Map<string, string>;
  zone: Zone;
  currentZone: string;
  isLoading: boolean;
}

interface GlobalConfigsViewDispatchProps {
  getGlobalConfigurationsForDruid: (
    zoneId: string,
    okCallback?: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigsVersions: (
    zoneId: string,
    okCallback?: (versions: string[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigurationVersionForDruid: (
    okCallback?: (globalVersion: GlobalConfigVersion[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  displayError: (msg: string) => void;
  deleteUnusedGlobalConfigurations: (
    zoneId: string,
    okCallback: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  fetchAllZone: (okCallback?, errorCallback?) => void;
  saveCurrentGlobalConfigZone: (zone: string) => void;
}

interface GlobalConfigsViewState {}

class GlobalConfigsView extends React.Component<GlobalConfigsViewProps & GlobalConfigsViewDispatchProps, GlobalConfigsViewState> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchAllZone();
    this.props.getGlobalConfigurationVersionForDruid();
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <GlobalConfigsForm
          currentZone={this.props.currentZone}
          saveCurrentGlobalConfigZone={this.props.saveCurrentGlobalConfigZone}
          zone={this.props.zone}
          getGlobalConfigsVersions={this.props.getGlobalConfigsVersions}
          getGlobalConfigurationsForDruid={this.props.getGlobalConfigurationsForDruid}
          deleteUnusedGlobalConfigurations={this.props.deleteUnusedGlobalConfigurations}
          currentGlobalVersion={this.props.currentGlobalVersion}
          displayError={this.props.displayError}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): GlobalConfigsViewProps {
  return {
    isLoading: zoneSelectors.isLoading(state) || monitoringSelector.isGlobalConfigVersionLoading(state),
    globalConfigVersions: monitoringSelector.getGlobalConfigVersions(state),
    currentGlobalVersion: monitoringSelector.getGlobalConfigVersion(state),
    currentZone: monitoringSelector.getCurrentGlobalConfigZone(state),
    zone: zoneSelectors.getZones(state),
  };
}

function mapDispatchToProps(dispatch: any): GlobalConfigsViewDispatchProps {
  return {
    getGlobalConfigurationsForDruid: (
      zoneId,
      okCallback?: (config: GlobalConfigs) => void,
      errorCallback?: (errorMsg: { message: string; details?: string }) => void,
    ) => {
      dispatch(monitoringActions.getGlobalConfigurationsForDruid(zoneId, okCallback, errorCallback));
    },
    getGlobalConfigsVersions: (zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.getGlobalConfigsVersions(zoneId, okCallback, errorCallback));
    },
    getGlobalConfigurationVersionForDruid: (okCallback, errorCallback) => {
      dispatch(monitoringActions.getGlobalConfigurationVersionForDruid(okCallback, errorCallback));
    },
    deleteUnusedGlobalConfigurations: (zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.deleteUnusedGlobalConfigurations(zoneId, okCallback, errorCallback));
    },
    fetchAllZone(fetchedCallback?: (zone: Zone) => void): any {
      dispatch(zoneActions.fetchAllZone(fetchedCallback));
    },
    saveCurrentGlobalConfigZone: (zone) => {
      dispatch(monitoringActions.saveCurrentGlobalConfigZone(zone));
    },
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalConfigsView);

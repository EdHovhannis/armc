import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import SettingForm, { SettingFormProps } from '../../components/settings/SettingForm';
import { checkAuthType } from '../../store/auth/Actions';
import * as authSelectors from '../../store/auth/Reducer';
import { AuthType } from '../../store/auth/Types';
import * as configActions from '../../store/config/Actions';
import * as configSelectors from '../../store/config/Reducer';
import * as notificationActions from '../../store/notification/Actions';

interface SettingViewProps extends SettingFormProps {
  currentTab?: number;
  currentPageAfterUser?: string;
}

interface SettingsViewDispatchProps {
  displayError: (msg: string) => void;
  fetchPVMConfig: () => void;
  checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => void;
}

interface SettingsViewState {
  authType?: AuthType;
}

class SettingView extends React.Component<SettingViewProps & SettingsViewDispatchProps, SettingsViewState> {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      authType: this.props.authType,
    };
  }

  componentDidMount() {
    if (this.props.pvmMode) {
      this.props.fetchPVMConfig();
    }
    if (!this.props.authType) {
      this.props.checkAuthType(
        (type: AuthType) => this.setState({ authType: type }),
        (error: string) => this.props.displayError(error),
      );
    }
  }

  render() {
    return (
      <SettingForm
        currentPageAfterUser={this.props.currentPageAfterUser}
        currentTab={this.props.currentTab}
        isAdmin={this.props.isAdmin}
        authType={this.state.authType}
        displayError={this.props.displayError}
        pvmMode={this.props.pvmMode}
        isLocalUsersEnable={this.props.isLocalUsersEnable}
        minCountMask={this.props.minCountMask}
      />
    );
  }
}

function mapStateToProps(state, ownProps): SettingViewProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    pvmMode: configSelectors.isPvmModeEnabled(state),
    authType: authSelectors.authType(state),
    isLocalUsersEnable: configSelectors.isLocalUsersEnabled(state),
    minCountMask: configSelectors.getMinCountMask(state),
    currentTab: ownProps.currentTab,
    currentPageAfterUser: ownProps.currentPageAfterUser,
  };
}

function mapDispatchToProps(dispatch: any): SettingsViewDispatchProps {
  return {
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
    fetchPVMConfig: () => {
      dispatch(configActions.fetchPVMConfig());
    },
    checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
      dispatch(checkAuthType(okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingView);

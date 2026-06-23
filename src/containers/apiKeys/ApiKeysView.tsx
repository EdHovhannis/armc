import AuthService from '@src/services/AuthService';
import { AuthType } from '@src/store/auth/Types';
import * as React from 'react';
import { connect } from 'react-redux';

import ApiKeysOverview from '../../components/apiKeys/ApiKeysOverview';
import * as apiKeyActions from '../../store/apiKeys/Actions';
import * as apiKeySelectors from '../../store/apiKeys/Reducer';
import { APIkeyInfo, APIkeyParameters } from '../../store/apiKeys/Types';
import { checkAuthType } from '../../store/auth/Actions';
import { authType } from '../../store/auth/Reducer';
import * as notificationActions from '../../store/notification/Actions';

export interface ApiKeysViewProps {
  isLoading: boolean;
  apiKeysInfo: APIkeyInfo[];
  authType?: string;
}

export interface ApiKeysViewDispatchProps {
  getApiKeysInfo: (okCallback?, errorCallback?) => void;
  generateKey: (user: string, apiKeyParams: APIkeyParameters, okCallback, errorCallback) => void;
  updateKey: (user: string, parameters: APIkeyParameters | null, okCallback, errorCallback) => void;
  deleteKey: (user: string, okCallback, errorCallback) => void;
  displayError: (error: string) => void;
  displayInfo: (info: string) => void;
  checkAuthType: () => void;
}

export interface ApiKeysViewState {
  authType?: string;
}

class ApiKeysView extends React.Component<ApiKeysViewDispatchProps & ApiKeysViewProps, ApiKeysViewState> {
  constructor(props) {
    super(props);
    this.state = {
      authType: this.props.authType,
    };
  }

  componentDidMount() {
    this.props.getApiKeysInfo();
    if (!this.props.authType) {
      AuthService.checkAuthType(
        (type: AuthType) => this.setState((prev) => ({ ...prev, authType: type })),
        (error: string) => this.props.displayError(error),
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        <ApiKeysOverview
          deleteKey={this.props.deleteKey}
          generateKey={this.props.generateKey}
          isLoading={this.props.isLoading}
          apiKeysInfo={this.props.apiKeysInfo}
          displayError={this.props.displayError}
          refetch={() => this.props.getApiKeysInfo()}
          displayInfo={this.props.displayInfo}
          updateKey={this.props.updateKey}
          isLegacyMode={this.state.authType === 'legacy'}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): ApiKeysViewProps {
  return {
    isLoading: apiKeySelectors.isApiKeyInfosLoading(state),
    apiKeysInfo: apiKeySelectors.getApiKeyInfos(state),
    authType: authType(state),
  };
}

function mapDispatchToProps(dispatch: any): ApiKeysViewDispatchProps {
  return {
    getApiKeysInfo: (okCallback, errorCallback) => {
      dispatch(apiKeyActions.getApiKeyInfo(okCallback, errorCallback));
    },
    deleteKey: (user, okCallback, errorCallback) => {
      dispatch(apiKeyActions.deleteKey(user, okCallback, errorCallback));
    },
    generateKey: (user, apiKeyParams, okCallback, errorCallback) => {
      dispatch(apiKeyActions.generateKey(apiKeyParams, user, okCallback, errorCallback));
    },
    updateKey: (user, parameters, okCallback, errorCallback) => {
      dispatch(apiKeyActions.updateKey(parameters, user, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displayInfo: (info) => {
      dispatch(notificationActions.info(info));
    },
    checkAuthType: () => {
      dispatch(checkAuthType());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ApiKeysView);

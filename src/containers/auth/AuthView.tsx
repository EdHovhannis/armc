import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import AuthForm, { AuthFormDispatchProps, AuthFormProps } from '../../components/auth/AuthForm';
import { ApplicationState } from '../../store/Store';
import * as authActions from '../../store/auth/Actions';
import * as configActions from '../../store/config/Actions';
import * as configSelectors from '../../store/config/Reducer';
import * as notificationActions from '../../store/notification/Actions';

export interface AuthViewProps extends AuthFormProps {}

export interface AuthViewDispatchProps extends AuthFormDispatchProps {
  fetchConfig();
}

class AuthView extends React.Component<AuthFormDispatchProps & AuthViewProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
    props.fetchConfig();
  }

  render() {
    return (
      <AuthForm
        onSignInClicked={this.props.onSignInClicked}
        onRegisterClicked={this.props.onRegisterClicked}
        onError={this.props.onError}
        registerEnabled={this.props.registerEnabled}
      />
    );
  }
}

function mapStateToProps(state: ApplicationState): AuthFormProps {
  return {
    registerEnabled: configSelectors.isRegisterEnabled(state),
  };
}

function mapDispatchToProps(dispatch: any): AuthViewDispatchProps {
  return {
    onRegisterClicked: (username: string, password: string) => {
      dispatch(authActions.register(username, password));
    },
    onSignInClicked: (username: string, password: string) => {
      dispatch(authActions.authorize(username, password));
    },
    onError: (message: string) => {
      dispatch(notificationActions.error(message));
    },
    fetchConfig() {
      dispatch(configActions.fetchConfig());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthView);

import AuthService from '@src/services/AuthService';
import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import { LocalUserForm } from '../../../components/users/pvm/LocalUserForm';
import { checkAuthType } from '../../../store/auth/Actions';
import { authType } from '../../../store/auth/Reducer';
import { AuthType, User } from '../../../store/auth/Types';
import * as notificationActions from '../../../store/notification/Actions';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

export interface LocalUsersViewProps {
  users: User[];
  isLoading: boolean;
  authType?: string;
}

interface LocalUsersViewDispatchProps {
  fetchLocalUsers: () => void;
  checkAuthType: () => void;
  displayError: (error: string) => void;
  addUser: (userName: string, okCallback?, errorCallback?) => void;
  deleteUser: (userName: string, okCallback?, errorCallback?) => void;
}

interface LocalUsersViewState {
  authType?: string;
}

class LocalUsersView extends React.Component<LocalUsersViewProps & LocalUsersViewDispatchProps, LocalUsersViewState> {
  constructor(props: LocalUsersViewProps & LocalUsersViewDispatchProps) {
    super(props);
    autoBind(this);
    this.state = {
      authType: this.props.authType,
    };
  }

  componentDidMount() {
    this.props.fetchLocalUsers();
    if (!this.props.authType) {
      AuthService.checkAuthType(
        (type: AuthType) => this.setState((prev) => ({ ...prev, authType: type })),
        (error: string) => this.props.displayError(error),
      );
    }
  }

  render() {
    return (
      <LocalUserForm
        refetch={() => {
          this.props.fetchLocalUsers();
        }}
        displayError={this.props.displayError}
        addUser={this.props.addUser}
        deleteUser={this.props.deleteUser}
        users={this.props.users}
        isLoading={this.props.isLoading}
        isLegacyMode={this.state.authType === 'legacy'}
      />
    );
  }
}

function mapStateToProps(state): LocalUsersViewProps {
  return {
    users: userSelectors.getLocalUsers(state),
    isLoading: userSelectors.isLocalUsersLoading(state),
    authType: authType(state),
  };
}

function mapDispatchToProps(dispatch: any): LocalUsersViewDispatchProps {
  return {
    fetchLocalUsers: () => {
      dispatch(userActions.fetchLocalUsers());
    },
    checkAuthType: () => {
      dispatch(checkAuthType());
    },
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
    addUser: (userName: string, okCallback?, errorCallback?) => {
      dispatch(userActions.addLocalUser(userName, okCallback, errorCallback));
    },
    deleteUser: (userName: string, okCallback?, errorCallback?) => {
      dispatch(userActions.deleteLocalUser(userName, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LocalUsersView);

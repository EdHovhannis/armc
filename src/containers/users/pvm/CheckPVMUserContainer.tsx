import * as React from 'react';
import { connect } from 'react-redux';

import { CheckPVMUserForm } from '../../../components/users/pvm/CheckPVMUserForm';
import { User } from '../../../store/auth/Types';
import * as configSelectors from '../../../store/config/Reducer';
import * as notificationActions from '../../../store/notification/Actions';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

interface CheckPVMUserContainerDispatchProps {
  displayError: (error: string) => void;
  fetchUser: (user_id: number, okCallback?, errorCallback?) => void;
}

interface CheckPVMUserContainerStateProps {
  minCountMask: number;
  user?: User;
  isLoading: boolean;
}

interface CheckPVMUserContainerProps {
  choseUser: (user: User) => void;
}

class CheckPVMUserContainer extends React.Component<
  CheckPVMUserContainerDispatchProps & CheckPVMUserContainerProps & CheckPVMUserContainerStateProps,
  any
> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CheckPVMUserForm
        minCountMask={this.props.minCountMask}
        displayError={this.props.displayError}
        choseUser={this.props.choseUser}
        fetchUser={this.props.fetchUser}
        isLoading={this.props.isLoading}
      />
    );
  }
}

function mapStateToProps(state): CheckPVMUserContainerStateProps {
  return {
    user: userSelectors.getSelectedUser(state),
    minCountMask: configSelectors.getMinCountMask(state),
    isLoading: userSelectors.isUserLoadInProgress(state),
  };
}

function mapDispatchToProps(dispatch: any): CheckPVMUserContainerDispatchProps {
  return {
    fetchUser(user_id: number, okCallback?, errorCallback?) {
      dispatch(userActions.fetchUser(user_id, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckPVMUserContainer);

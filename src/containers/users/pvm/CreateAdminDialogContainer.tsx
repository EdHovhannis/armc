import * as React from 'react';
import { connect } from 'react-redux';

import CreateAdminDialog, { CreateAdminDialogProps } from '../../../components/users/pvm/CreateAdminDialog';
import { User } from '../../../store/auth/Types';
import * as configSelectors from '../../../store/config/Reducer';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

export interface CreateAdminDialogContainerDispatchProps {
  fetchUser: (user_id: number, okCallback?: () => void, errorCallback?: () => void) => void;
}

export interface CreateAdminDialogContainerStateProps {
  minCountMask: number;
  user?: User;
  isLoading: boolean;
}

class CreateAdminDialogContainer extends React.Component<
  CreateAdminDialogContainerDispatchProps & CreateAdminDialogContainerStateProps & CreateAdminDialogProps,
  any
> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CreateAdminDialog
        fetchUser={this.props.fetchUser}
        user={this.props.user}
        isLoading={this.props.isLoading}
        onChange={this.props.onChange}
        close={this.props.close}
        minCountMask={this.props.minCountMask}
        displayError={this.props.displayError}
      />
    );
  }
}

function mapStateToProps(state): CreateAdminDialogContainerStateProps {
  return {
    user: userSelectors.getSelectedUser(state),
    minCountMask: configSelectors.getMinCountMask(state),
    isLoading: userSelectors.isUserLoadInProgress(state),
  };
}

function mapDispatchToProps(dispatch: any): CreateAdminDialogContainerDispatchProps {
  return {
    fetchUser(user_id: number, okCallback?, errorCallback?) {
      dispatch(userActions.fetchUser(user_id, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAdminDialogContainer);

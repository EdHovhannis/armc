import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';

import UserInfoForm, { UserInfoFormProps } from '../../../components/users/abyss/UserInfoForm';
import { withParams, WithParamsProps } from '../../../components/utils/withParams';
import * as authSelectors from '../../../store/auth/Reducer';
import * as rolesActions from '../../../store/role/Actions';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

interface UserInfoProps extends UserInfoFormProps {
  loadInProgress: boolean;
  canSetAdmin: boolean;
}

interface UserInfoDispatchProps {
  fetchUser(user_id?: string): void;
  setAdmin(userId: number, isAdmin: boolean): void;
}

class UserInfoView extends React.Component<UserInfoProps & UserInfoDispatchProps & WithParamsProps, any> {
  constructor(props: UserInfoProps & UserInfoDispatchProps & WithParamsProps) {
    super(props);
    autoBind(this);
    const userId = this.props.id;
    this.props.fetchUser(userId);
  }

  render() {
    const { user, canSetAdmin, isLoading, setAdmin } = this.props;

    return (
      <UserInfoForm
        canSetAdmin={canSetAdmin}
        user={user}
        isLoading={isLoading}
        handleAdminToggle={(isAdmin: boolean) => {
          if (user) {
            const userId = Number(user.id);
            setAdmin(userId, Boolean(isAdmin));
          }
        }}
      />
    );
  }
}

function mapStateToProps(state: any): UserInfoProps {
  return {
    user: userSelectors.getSelectedUser(state),
    loadInProgress: userSelectors.isUserLoadInProgress(state),
    canSetAdmin: authSelectors.isAdmin(state),
    isLoading: userSelectors.isUserLoadInProgress(state),
  };
}

function mapDispatchToProps(dispatch: any): UserInfoDispatchProps {
  return {
    fetchUser(user_id: number): void {
      dispatch(userActions.fetchUser(user_id));
    },
    setAdmin(userId: number, isAdmin: boolean): void {
      dispatch(rolesActions.setAdmin(userId, isAdmin));
    },
  };
}

export default withParams(connect(mapStateToProps, mapDispatchToProps)(UserInfoView));

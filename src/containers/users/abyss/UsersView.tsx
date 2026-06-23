import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import UsersForm, { UsersFormProps } from '../../../components/users/abyss/UsersForm';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

interface UsersViewDispatchProps {
  fetchUsers: () => void;
}

class UsersView extends React.Component<UsersFormProps & UsersViewDispatchProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
    this.props.fetchUsers();
  }

  render() {
    return <UsersForm users={this.props.users} isLoading={this.props.isLoading} />;
  }
}

function mapStateToProps(state): UsersFormProps {
  return {
    users: userSelectors.getAllUsers(state),
    isLoading: userSelectors.usersIsFetching(state),
  };
}

function mapDispatchToProps(dispatch: any): UsersViewDispatchProps {
  return {
    fetchUsers: () => {
      dispatch(userActions.fetchUsers());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersView);

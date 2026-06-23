import * as React from 'react';
import { connect } from 'react-redux';

import { FindUserContent } from '../../../components/users/pvm/FindUserContent';
import { User } from '../../../store/auth/Types';
import * as configSelectors from '../../../store/config/Reducer';
import * as notificationActions from '../../../store/notification/Actions';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

interface FindUserContentContainerDispatchProps {
  displayError: (error: string) => void;
  searchUser: (mask: string, okCallback?, errorCallback?) => void;
}

interface FindUserContentContainerStateProps {
  minCountMask: number;
  maxCountUser: number;
  users: User[];
  isUserLoading: boolean;
}

interface FindUserContentContainerProps {
  choseUser: (user: User) => void;
}

class FindUserContentContainer extends React.Component<
  FindUserContentContainerDispatchProps & FindUserContentContainerStateProps & FindUserContentContainerProps,
  any
> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <FindUserContent
        maxCountUser={this.props.maxCountUser}
        minCountMask={this.props.minCountMask}
        displayError={this.props.displayError}
        choseUser={this.props.choseUser}
        searchUser={this.props.searchUser}
        usersIsLoading={this.props.isUserLoading}
        users={this.props.users}
      />
    );
  }
}

function mapStateToProps(state): FindUserContentContainerStateProps {
  return {
    users: userSelectors.getSearchedUsers(state),
    minCountMask: configSelectors.getMinCountMask(state),
    isUserLoading: userSelectors.usersIsLoading(state),
    maxCountUser: configSelectors.getMaxCountUser(state),
  };
}

function mapDispatchToProps(dispatch: any): FindUserContentContainerDispatchProps {
  return {
    searchUser(mask: string, okCallback?, errorCallback?) {
      dispatch(userActions.searchUsersByMask(mask, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FindUserContentContainer);

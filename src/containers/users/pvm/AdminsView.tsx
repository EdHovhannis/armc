import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import { AdminsForm } from '../../../components/users/pvm/AdminsForm';
import * as notificationActions from '../../../store/notification/Actions';
import * as rolesActions from '../../../store/role/Actions';
import * as userActions from '../../../store/user/Actions';
import * as userSelectors from '../../../store/user/Reducer';

interface AdminsViewProps {
  admins: string[];
  isLoading: boolean;
}

interface AdminsViewDispatchProps {
  fetchAdmins: () => void;
  setAdmin: (userId: string, isAdmin: boolean, okCallback?) => void;
  displayError: (msg: string) => void;
}

class AdminsView extends React.Component<AdminsViewDispatchProps & AdminsViewProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchAdmins();
  }

  render() {
    return (
      <AdminsForm
        setAdmin={this.props.setAdmin}
        admins={this.props.admins}
        refetch={() => {
          this.props.fetchAdmins();
        }}
        displayError={this.props.displayError}
        isLoading={this.props.isLoading}
      />
    );
  }
}

function mapStateToProps(state): AdminsViewProps {
  return {
    admins: userSelectors.getAdmins(state),
    isLoading: userSelectors.adminsIsFetching(state),
  };
}

function mapDispatchToProps(dispatch: any): AdminsViewDispatchProps {
  return {
    fetchAdmins: () => {
      dispatch(userActions.fetchAllAdmins());
    },
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
    setAdmin(userId, isAdmin, okCallback?) {
      dispatch(rolesActions.setAdmin(userId, isAdmin, okCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminsView);

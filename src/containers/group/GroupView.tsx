import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import GroupsForm, { GroupsFormProps } from '../../components/groups/GroupsForm';
import * as authSelectors from '../../store/auth/Reducer';
import * as teamActions from '../../store/group/Actions';
import * as teamSelectors from '../../store/group/Reducer';
import * as notificationActions from '../../store/notification/Actions';

interface GroupViewProps extends GroupsFormProps {
  isAdmin: boolean;
}

interface GroupViewDispatchProps {
  fetchTeams: () => void;
  createTeam: (team_name: string, okCallback?) => void;
  displayError: (msg: string) => void;
}

class GroupInfoView extends React.Component<GroupViewDispatchProps & GroupViewProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchTeams();
  }

  render() {
    return (
      <GroupsForm
        isAdmin={this.props.isAdmin}
        groups={this.props.groups.filter((group) => {
          return group.canManageAccess || group.canManageUsers || this.props.isAdmin;
        })}
        createGroup={(team) =>
          this.props.createTeam(team, () => {
            this.props.fetchTeams();
          })
        }
        displayError={(msg) => this.props.displayError(msg)}
        isLoading={this.props.isLoading}
      />
    );
  }
}

function mapStateToProps(state): GroupViewProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    groups: teamSelectors.getGroups(state),
    isLoading: teamSelectors.isGroupsLoading(state),
  };
}

function mapDispatchToProps(dispatch: any): GroupViewDispatchProps {
  return {
    fetchTeams: () => {
      dispatch(teamActions.fetchGroups());
    },
    createTeam(team: string, okCallback?) {
      dispatch(teamActions.createNewTeam(team, okCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupInfoView);

import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import OrgsForm from '../../components/orgs/OrgsForm';
import * as authSelectors from '../../store/auth/Reducer';
import * as orgsActions from '../../store/orgs/Actions';
import * as orgsSelectors from '../../store/orgs/Reducer';
import { MigrateStatus, Org } from '../../store/orgs/Types';

interface OrgsFormProps {
  isAdmin: boolean;
  orgs: Array<Org>;
  isLoading: boolean;
  statusMigration: MigrateStatus;
}

interface OrgsViewDispatchProps {
  fetchOrgs: () => void;
  createOrg: (orgName: string, projectId: string, okCallback?) => void;
  deleteOrg: (orgId: number, okCallback?) => void;
  getStatusMigration: () => void;
  startMigration: () => void;
}

class OrgsView extends React.Component<OrgsFormProps & OrgsViewDispatchProps & any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchOrgs();
    this.props.getStatusMigration();
  }

  render() {
    return (
      <OrgsForm
        isAdmin={this.props.isAdmin}
        statusMigration={this.props.statusMigration}
        orgs={this.props.orgs}
        isLoading={this.props.isLoading}
        createOrg={(orgName: string, projectId: string, okCallback?) => {
          this.props.createOrg(orgName, projectId, okCallback);
        }}
        deleteOrg={this.props.deleteOrg}
        refetch={() => {
          this.props.fetchOrgs();
        }}
        refetchStatusMegration={this.props.getStatusMigration}
        startMigration={this.props.startMigration}
      />
    );
  }
}

function mapStateToProps(state): OrgsFormProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    orgs: orgsSelectors.getOrgs(state),
    isLoading: orgsSelectors.isOrgsLoading(state),
    statusMigration: orgsSelectors.getDataStatusMigration(state),
  };
}

function mapDispatchToProps(dispatch: any): OrgsViewDispatchProps {
  return {
    fetchOrgs: () => {
      dispatch(orgsActions.fetchOrgs());
    },
    createOrg(orgName: string, projectId: string, okCallback?) {
      dispatch(orgsActions.createOrg(orgName, projectId, okCallback));
    },
    deleteOrg(orgId: number, okCallback?) {
      dispatch(orgsActions.deleteOrg(orgId, okCallback));
    },
    getStatusMigration: () => {
      dispatch(orgsActions.getStatusMigration());
    },
    startMigration(okCallback?) {
      dispatch(orgsActions.startMigration(okCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgsView);

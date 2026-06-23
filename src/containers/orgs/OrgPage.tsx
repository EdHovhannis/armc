import { Grid } from '@material-ui/core';
import BackNavigation from '@src/components/utils/BackNavigation';
import { withRouter } from '@src/utils/withRouter';
import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import OrgPageForm, { OrgPageFormProps } from '../../components/orgs/OrgPageForm';
import { Loader } from '../../components/utils/Loader';
import { withParams, WithParamsProps } from '../../components/utils/withParams';
import * as authSelectors from '../../store/auth/Reducer';
import { User } from '../../store/auth/Types';
import * as configSelectors from '../../store/config/Reducer';
import * as orgsActions from '../../store/orgs/Actions';
import * as orgsSelectors from '../../store/orgs/Reducer';
import { Org, IndicatorUser } from '../../store/orgs/Types';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import * as userSelectors from '../../store/user/Reducer';

interface OrgPageViewProps extends OrgPageFormProps {
  isAdmin: boolean;
  isUsersLoading: boolean;
  isDatasourcesLoading: boolean;
  isOrgLoading: boolean;
}

interface OrgPageDispatchProps {
  saveOrg(org: Org): void;
  addUserToCurrentOrg(user: User, orgId: number, role: string): void;
  fetchUsersInOrg(orgId: number): void;
  fetchDatasourcesInOrg(orgId: number): void;
  removeUserFromCurrentOrg(sub: string, orgId: number): void;
  fetchOrgById(orgId: number): void;
  updateRoleForUser(user: IndicatorUser, newRole: string, orgId: number, okCallback?: any): void;
  fetchProjects: (callback?: any) => void;
  addDatasourceToOrg(datasourceName: string, urlSettings: string, selectedProjectNewDatasource: string, orgId: number): void;
}

class OrgPage extends React.Component<OrgPageViewProps & OrgPageDispatchProps & WithParamsProps, any> {
  constructor(props: OrgPageViewProps & OrgPageDispatchProps & WithParamsProps) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    const orgId = Number(this?.props?.id) || 0;
    this.props.fetchUsersInOrg(orgId);
    this.props.fetchOrgById(orgId);
    this.props.fetchDatasourcesInOrg(orgId);
    this.props.fetchProjects();
  }

  render(): React.ReactNode {
    if (this.props.isOrgLoading || this.props.isUsersLoading) {
      return <Loader />;
    } else {
      return this.renderOrgInfo();
    }
  }

  renderOrgInfo() {
    return (
      <React.Fragment>
        <BackNavigation
          backString={'Организации'}
          titleString={''}
          goBackClicked={() => {
            this.props.navigate('/settings/orgs');
          }}
        />
        <Grid container style={{ width: '100%', marginTop: '1vw' }} spacing={3} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <OrgPageForm
              pvmMode={this.props.pvmMode}
              isAdmin={this.props.isAdmin}
              org={this.props.org}
              users={this.props.users}
              orgUsers={this.props.orgUsers}
              orgDatasources={this.props.orgDatasources}
              projects={this.props.projects}
              addUserToCurrentOrg={(user, role) => {
                this.props.addUserToCurrentOrg(user, this.props.org.id, role);
              }}
              removeUserFromCurrentOrg={(userId) => {
                this.props.removeUserFromCurrentOrg((userId || '') as string, this.props.org.id);
              }}
              saveCurrentOrg={() => {
                this.props.saveOrg(this.props.org);
              }}
              updateRoleForUser={(user, newRole) => {
                const orgId = Number(this?.props?.id) || 0;
                this.props.updateRoleForUser(user, newRole, this.props.org.id, () => {
                  this.props.fetchUsersInOrg(orgId);
                });
              }}
              addDatasourceToOrg={(datasourceName, urlSettings, selectedProjectNewDatasource) => {
                this.props.addDatasourceToOrg(datasourceName, urlSettings, selectedProjectNewDatasource, this.props.org.id);
              }}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state: any): OrgPageViewProps {
  return {
    isAdmin: authSelectors.isAdmin(state),
    users: userSelectors.getAllUsers(state),
    isUsersLoading: orgsSelectors.isUsersLoading(state),
    isDatasourcesLoading: orgsSelectors.isDatasourcesLoading(state),
    pvmMode: configSelectors.isPvmModeEnabled(state),
    orgUsers: orgsSelectors.getUsersInOrg(state),
    orgDatasources: orgsSelectors.getDatasourcesInOrg(state),
    org: orgsSelectors.getCurrentOrg(state) || {
      id: 0,
      name: '',
      projectId: '',
    },
    isOrgLoading: orgsSelectors.isOrgLoading(state),
    projects: projectSelectors.getProjects(state),
  };
}

function mapDispatchToProps(dispatch: any): OrgPageDispatchProps {
  return {
    saveOrg: (org: Org): void => {
      dispatch(orgsActions.updateOrgById(org));
    },
    addUserToCurrentOrg: (user: User, orgId: number, role: string): void => {
      dispatch(orgsActions.addUserToCurrentOrg(user.id, orgId, role));
    },
    fetchUsersInOrg: (orgId: number, okCallback?: any): void => {
      dispatch(orgsActions.fetchUsersInOrg(orgId, okCallback));
    },
    fetchDatasourcesInOrg: (orgId: number, okCallback?: any): void => {
      dispatch(orgsActions.fetchDatasourcesInOrg(orgId, okCallback));
    },
    removeUserFromCurrentOrg: (sub: string, orgId: number): void => {
      dispatch(orgsActions.removeUserFromOrg(sub, orgId));
    },
    fetchOrgById: (orgId: number): void => {
      dispatch(orgsActions.fetchOrgById(orgId));
    },
    updateRoleForUser: (user: IndicatorUser, newRole: string, orgId: number, okCallback?: any): void => {
      dispatch(orgsActions.updateRoleForUser(user, newRole, orgId, okCallback));
    },
    fetchProjects: (callback?: any): void => {
      dispatch(projectActions.fetchAllProjects(callback));
    },
    addDatasourceToOrg: (datasourceName: string, urlSettings: string, selectedProjectNewDatasource: string, orgId: number): void => {
      dispatch(orgsActions.addDatasourceToOrg(datasourceName, urlSettings, selectedProjectNewDatasource, orgId));
    },
  };
}

export default withRouter(withParams(connect(mapStateToProps, mapDispatchToProps)(OrgPage)));

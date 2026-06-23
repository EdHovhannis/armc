import { Grid, Tab } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar/AppBar';
import ApartmentIcon from '@material-ui/icons/Apartment';
import BlurCircularIcon from '@material-ui/icons/BlurCircular';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FolderIcon from '@material-ui/icons/Folder';
import GroupIcon from '@material-ui/icons/Group';
import InfoIcon from '@material-ui/icons/Info';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutline from '@material-ui/icons/PersonOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import SpeedIcon from '@material-ui/icons/Speed';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import GroupInfoView from '@src/containers/group/GroupInfoView';
import OrgPage from '@src/containers/orgs/OrgPage';
import ProjectInfoView from '@src/containers/projects/ProjectInfoView';
import UserInfoView from '@src/containers/users/abyss/UserInfoView';
import { AuthType } from '@src/store/auth/Types';
import { withRouter } from '@src/utils/withRouter';
import * as React from 'react';
import { Routes, Route, Navigate, NavigateFunction } from 'react-router';

import ApiKeysView from '../../containers/apiKeys/ApiKeysView';
import GlobalConfigsView from '../../containers/globalConfigurations/GlobalConfigsView';
import GroupView from '../../containers/group/GroupView';
import OrgsView from '../../containers/orgs/OrgsView';
import OverdraftStateView from '../../containers/overdraft/OverdraftConfigView';
import ProjectsView from '../../containers/projects/ProjectsView';
import VersionView from '../../containers/settings/VersionView';
import UsersView from '../../containers/users/abyss/UsersView';
import AdminsView from '../../containers/users/pvm/AdminsView';
import LocalUsersView from '../../containers/users/pvm/LocalUsersView';
import { ClustersList } from '../clusters/ClustersList';
import { LoadingSpinner } from '../constraint/utils/LoadingSpinner';
import { StyledSettingsTab, StyledSettingsTabs } from '../utils/StyledSettingsTabs';

import { HealthCheckSettings } from './HealthChecks/HealthCheckSettings';

export interface SettingFormState {
  currentTab: number;
  pvmMode: boolean;
  isLocalUsersEnable: boolean;
  currentPageAfterUser?: string;
}

export interface SettingFormProps {
  isAdmin: boolean;
  currentTab?: number;
  currentPageAfterUser?: string;
  pvmMode: boolean;
  authType?: AuthType;
  isLocalUsersEnable: boolean;
  minCountMask: number;
  navigate?: NavigateFunction;
}

export interface SettingFormDispatchProps {
  displayError: (msg: string) => void;
}

class SettingForm extends React.Component<SettingFormProps & SettingFormDispatchProps, SettingFormState> {
  isLegacyMode: boolean = this.props.authType === 'legacy';

  constructor(props: SettingFormProps & SettingFormDispatchProps) {
    super(props);
    this.state = {
      currentTab: this.props.currentTab ? this.props.currentTab : 0,
      isLocalUsersEnable: this.props.isLocalUsersEnable,
      pvmMode: this.props.pvmMode,
    };
  }

  schemeParts = [
    {
      name: 'Проекты',
      value: <ProjectsView />,
      icon: <FolderIcon />,
      path: '/settings/projects',
      show: this.props.isAdmin,
    },
    {
      name: 'Кластеры',
      value: <ClustersList />,
      icon: <BlurCircularIcon />,
      path: '/settings/clusters',
      show: this.props.isAdmin,
    },
    {
      name: 'Группы',
      value: <GroupView />,
      icon: <GroupIcon />,
      path: '/settings/groups',
      show: this.isLegacyMode,
    },
    {
      name: this.props.pvmMode ? 'Администраторы' : 'Пользователи',
      value: this.props.pvmMode ? <AdminsView /> : <UsersView />,
      icon: <PersonIcon />,
      path: '/settings/users',
      show: this.props.isAdmin && this.isLegacyMode,
    },
    {
      name: 'Локальные пользователи',
      value: <LocalUsersView />,
      icon: <PersonOutline />,
      path: '/settings/localUsers',
      show: this.props.isAdmin && this.props.pvmMode,
    },
    {
      name: 'API ключи',
      value: <ApiKeysView />,
      icon: <VpnKeyIcon />,
      path: '/settings/apiKeys',
      show: this.props.isAdmin,
    },
    {
      name: 'Организации',
      value: <OrgsView />,
      icon: <ApartmentIcon />,
      path: '/settings/orgs',
      show: this.props.isAdmin,
    },
    {
      name: 'Скорость обработки',
      value: <OverdraftStateView />,
      icon: <SpeedIcon />,
      path: '/settings/overdraftspeed',
      show: this.props.isAdmin,
    },
    {
      name: 'Глобальная конфигурация',
      value: <GlobalConfigsView />,
      icon: <SettingsIcon />,
      path: '/settings/globals',
      show: this.props.isAdmin,
    },
    {
      name: 'Версии',
      value: <VersionView />,
      icon: <InfoIcon />,
      path: '/settings/versions',
      show: this.props.isAdmin,
    },
    {
      name: 'Настройки здоровья',
      value: <HealthCheckSettings />,
      icon: <FavoriteIcon />,
      path: '/settings/healthchecks',
      show: this.props.isAdmin,
    },
  ];

  componentDidMount(): void {
    const visibleParts = this.schemeParts.filter((part) => part.show);
    const currenntTabIndex = visibleParts?.findIndex((item) => location.pathname.includes(item.path));
    this.setState({ currentTab: currenntTabIndex || 0 });
  }

  render() {
    const visibleParts = this.schemeParts.filter((part) => part.show);
    return (
      <React.Fragment>
        <Grid container justifyContent="center">
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={6} style={{ maxWidth: '100%' }}>
              <AppBar position="static">
                <StyledSettingsTabs
                  centered
                  variant="scrollable"
                  value={this.state.currentTab}
                  onChange={(event, value) => {
                    this.setState({ currentTab: value });
                  }}
                >
                  {visibleParts.map((part) => {
                    return (
                      <StyledSettingsTab
                        key={part.name}
                        label={part.name}
                        icon={part.icon}
                        onClick={() => {
                          this.props.navigate?.(part.path);
                        }}
                      />
                    );
                  })}
                </StyledSettingsTabs>
              </AppBar>
            </Grid>
          </Grid>
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={10} style={{ maxWidth: '100%' }}>
              <Routes>
                {visibleParts.map((item) => {
                  return (
                    <Route
                      key={item.name}
                      path={item.path.replace('/settings', '')}
                      element={<React.Suspense fallback={<LoadingSpinner />}>{item.value}</React.Suspense>}
                    />
                  );
                })}
                <Route
                  path="/projects/:id"
                  element={
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <ProjectInfoView />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/groups/:id"
                  element={
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <GroupInfoView />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <UserInfoView />
                    </React.Suspense>
                  }
                />
                <Route
                  path="/orgs/:id"
                  element={
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <OrgPage />
                    </React.Suspense>
                  }
                />
                <Route path="/" element={<Navigate to={`/settings/projects`} replace />} />
              </Routes>
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withRouter(SettingForm);

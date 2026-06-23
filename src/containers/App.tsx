import { Divider, List, ListItem, ListItemIcon, ListItemText, Theme, Tooltip } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import withStyles from '@material-ui/core/styles/withStyles';
import { RemoveCircle } from '@material-ui/icons';
import AssessmentIcon from '@material-ui/icons/Assessment';
import BackupIcon from '@material-ui/icons/Backup';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CloudIcon from '@material-ui/icons/Cloud';
import TracingIcon from '@material-ui/icons/DeviceHub';
import GradientIcon from '@material-ui/icons/Gradient';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ReportIcon from '@material-ui/icons/Report';
import RestoreIcon from '@material-ui/icons/Restore';
import SearchIcon from '@material-ui/icons/Search';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import StorageIcon from '@material-ui/icons/Storage';
import UpdateIcon from '@material-ui/icons/Update';
import WarningIcon from '@material-ui/icons/Warning';
import { clsx, notification } from '@sds-eng/base';
import { AuthType } from '@src/store/auth/Types';
import { RouterProps, withRouter } from '@src/utils/withRouter';
import React, { Suspense } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link as RouterLink, Route, Routes } from 'react-router';

import { LoadingSpinner } from '../components/constraint/utils/LoadingSpinner';
import KafkaRouter from '../components/kafka/KafkaRouter';
import { IS_SAVEPOINTS_FEATURE_ENABLED } from '../components/shared/constants';
import { Loader } from '../components/utils/Loader';
import TracingRouter from '../containers/tracing/TracingRouter';
import * as authActions from '../store/auth/Actions';
import * as authSelectors from '../store/auth/Reducer';
import * as configActions from '../store/config/Actions';
import * as configSelectors from '../store/config/Reducer';
import * as configFeatureSettings from '../store/featureSettings/Actions';
import {
  FEATURE_SETTINGS_LIMITS_FEATURE,
  FEATURE_SETTINGS_LIMITS_SETTING,
  FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_FEATURE,
  FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_SETTING,
} from '../store/featureSettings/constants';
import * as notificationActions from '../store/notification/Actions';

import PVMNonAuthorizedPage from './PVMNonAuthorizedPage';
import ArchiveRouter from './archive/ArchiveRouter';
import AuthView from './auth/AuthView';
import BackupsRouter from './backups/BackupsRouter';
import BlockObjectContainer from './constraint/BlockObjectContainer';
import ConstraintsRouter from './constraint/ConstraintsRouter';
import IndexView from './index/IndexView';
import LookupRouter from './lookup/LookupRouter';
import MonitoringView from './monitoring/MonitoringView';
import FlowRouter from './processing/FlowRouter';
import SettingView from './settings/SettingView';

import './styles.css';

const drawerWidth = 320;
const drawerCloseWidth = 72;

const styles = (theme: Theme) => ({
  content: {
    overflow: 'auto',
    height: '100%',
    width: `calc(100% - ${drawerCloseWidth}px)`,
    padding: '8px 16px 16px 0',
  },
  contentShort: {
    overflow: 'auto',
    height: '100%',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '8px 16px 8px 0',
  },
  drawerPaper: {
    overflowX: 'hidden',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    width: drawerCloseWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  arrowRightButton: {
    bottom: 5,
    position: 'fixed',
    marginRight: 10,
  },
  arrowRightButtonHidden: {
    display: 'none',
  },
  arrowLeftButton: {
    bottom: 5,
    position: 'fixed',
    marginRight: 0,
  },
  arrowLeftButtonHidden: {
    display: 'none',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...theme.mixins.toolbar,
  },
});

export const ERROR_500_MESSAGE = 'Внутренняя ошибка сервиса. Обратитесь к администратору.';
export const ERROR_SOME_SERVICES_ARE_NOT_AVAILABLE = 'Некоторые сервисы в данный момент недоступны.';
export const ERROR_502_MESSAGE = 'Сервис не отвечает. Пожалуйста, обратитесь к администратору.';
const TEMPORARY_NOTIFY = 'temporaryNotify';
const NOTIFICATION_TITLE = 'Вы были перенаправлены по временной ссылке со старой версии UI. Обновите ваши ссылки.';

export const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 500,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

interface AppState {
  isOpened: boolean;
  authType?: AuthType;
}

interface AppProps {
  isAuthenticated: boolean;
  isAuthPerformed: boolean;
  isLocalUsersEnable: boolean;
  pvmMode: boolean;
  pvm: boolean;
  user: any;
  authType?: AuthType;
  logout: () => void;
  checkAuth: () => void;
  fetchConfig: () => void;
  fetchEnabledLimits: () => void;
  fetchValidationStrictLimits: () => void;
  displayInfo: (msg: string) => void;
  displayError: (msg: string) => void;
  classes: any;
  basename: string;
  checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => void;
}

class App extends React.Component<AppProps & RouterProps, AppState> {
  menuItemsInput = [
    {
      icon: <InboxIcon />,
      text: 'Топики',
      link: '/kafka/topics',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
  ];
  menuItemProcessing = [
    {
      icon: <GradientIcon />,
      text: 'Обработка',
      link: '/flow',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
  ];
  menuItemsData = [
    {
      icon: <SearchIcon />,
      text: 'Полнотекстовый индекс',
      link: '/index',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <AssessmentIcon />,
      text: 'Аналитический индекс',
      link: '/monitoring',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <MenuBookIcon />,
      text: 'Справочники',
      link: '/dictionary',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <StorageIcon />,
      text: 'Архив',
      link: '/archive',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
  ];
  menuItemsForAdmin = [
    {
      icon: <SettingsApplicationsIcon />,
      text: 'Настройки',
      link: '/settings',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <SettingsApplicationsIcon />,
      text: 'Настройки',
      link: '/groups',
      isOnlyForAdmin: false,
      isOnlyForUser: true,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <ReportIcon />,
      text: 'Ограничения',
      link: '/constraint',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <RemoveCircle />,
      text: 'Блокировки',
      link: '/blocks',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy'],
    },
  ];
  menuItemTracing = [
    {
      icon: <TracingIcon />,
      text: 'Трейсинг',
      link: '/tracing/search',
      isOnlyForAdmin: false,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
  ];
  menuItemBackups = [
    {
      icon: <BackupIcon />,
      text: 'Восстановление',
      link: '/backups/control',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <CloudIcon />,
      text: 'Резервные копии',
      link: '/backups/list',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    {
      icon: <UpdateIcon />,
      text: 'Задачи восстановления',
      link: '/backups/tasks',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
    ...(IS_SAVEPOINTS_FEATURE_ENABLED
      ? [
          {
            icon: <RestoreIcon />,
            text: 'Восстановления (savepoint)',
            link: '/backups/savepoints',
            isOnlyForAdmin: true,
            isOnlyForUser: false,
            runMode: ['legacy', 'autz'],
          },
        ]
      : []),
    {
      icon: <WarningIcon />,
      text: 'Инциденты',
      link: '/backups/incidents',
      isOnlyForAdmin: true,
      isOnlyForUser: false,
      runMode: ['legacy', 'autz'],
    },
  ];

  constructor(props: AppProps) {
    super(props);
    autoBind(this);
    this.state = {
      isOpened: false,
      authType: this.props.authType,
    };
    this.renderMenuList = this.renderMenuList.bind(this);
  }

  componentDidMount() {
    const search = new URLSearchParams(this.props.location.search);
    const hasNotify = search.get(TEMPORARY_NOTIFY) === 'true';
    if (hasNotify) {
      search.delete(TEMPORARY_NOTIFY);
      notification(
        { title: NOTIFICATION_TITLE, status: 'info' },
        { autoClose: false, onClick: () => this.props.navigate({ search: search.toString() }) },
      );
    }
    if (!this.props.authType) {
      this.props.checkAuthType(
        (type: AuthType) => this.setState((prev) => ({ ...prev, authType: type })),
        (error: string) => this.props.displayError(error),
      );
    }
    this.props.fetchEnabledLimits();
    this.props.fetchValidationStrictLimits();
  }

  renderMenuList(menuList: any[]) {
    if (this.props.user.admin) {
      return menuList
        .filter((element) => element.runMode.includes(this.state.authType) && !element.isOnlyForUser)
        .map((element) => {
          return (
            <ListItem style={{ paddingLeft: 24 }} button key={element.text} component={RouterLink} {...({ to: element.link } as any)}>
              <ListItemIcon>{element.icon}</ListItemIcon>
              <ListItemText primary={element.text} />
            </ListItem>
          );
        });
    } else {
      return menuList
        .filter(
          (element) => element.runMode.includes(this.state.authType) && !element.isOnlyForAdmin && !(this.props.pvmMode && element.isOnlyForUser),
        )
        .map((element) => {
          return (
            <ListItem style={{ paddingLeft: 24 }} button key={element.text} component={RouterLink} {...({ to: element.link } as any)}>
              <ListItemIcon>{element.icon}</ListItemIcon>
              <ListItemText primary={element.text} />
            </ListItem>
          );
        });
    }
  }

  render() {
    if (!this.props.isAuthPerformed) {
      this.props.checkAuth();
      return <Loader />;
    }

    if (!this.props.isAuthenticated) {
      if (this.props.pvmMode) {
        return <PVMNonAuthorizedPage />;
      } else {
        return this.renderAuthView();
      }
    } else return this.renderMainView();
  }

  renderMainView() {
    const { classes } = this.props;
    const isLegacyMode = this.state.authType === 'legacy';

    const handleDrawerOpen = () => {
      this.setState((prev) => ({ ...prev, isOpened: true }));
    };
    const handleDrawerClose = () => {
      this.setState((prev) => ({ ...prev, isOpened: false }));
    };

    return (
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !this.state.isOpened && classes.drawerPaperClose),
          }}
          open={this.state.isOpened}
        >
          <List>{this.renderMenuList(this.menuItemsInput)} </List>
          <Divider />
          <List>{this.renderMenuList(this.menuItemProcessing)}</List>
          <Divider />
          <List>{this.renderMenuList(this.menuItemsData)}</List>
          <Divider />
          <List>{this.renderMenuList(this.menuItemTracing)}</List>
          <Divider />
          <List>{this.renderMenuList(this.menuItemBackups)}</List>
          {this.props.user.admin && <Divider />}
          <List>{this.renderMenuList(this.menuItemsForAdmin)}</List>
          <div className={classes.toolbarIcon}>
            <IconButton
              edge="start"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(classes.arrowRightButton, this.state.isOpened && classes.arrowRightButtonHidden)}
            >
              <ChevronRightIcon />
            </IconButton>
            <IconButton onClick={handleDrawerClose} className={clsx(classes.arrowLeftButton, !this.state.isOpened && classes.arrowLeftButtonHidden)}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
        </Drawer>
        <main className={this.state.isOpened ? classes.contentShort : classes.content}>
          <Routes>
            <Route
              path="/kafka/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <KafkaRouter />
                </Suspense>
              }
            />
            <Route
              path="/flow/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <FlowRouter />
                </Suspense>
              }
            />
            <Route path="/index/*" element={<IndexView />} />
            <Route
              path="/monitoring/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <MonitoringView />
                </Suspense>
              }
            />
            <Route
              path="/dictionary/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <LookupRouter />
                </Suspense>
              }
            />
            <Route
              path="/archive/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ArchiveRouter />
                </Suspense>
              }
            />
            <Route
              path="/tracing/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TracingRouter />
                </Suspense>
              }
            />
            {this.props.user.admin && (
              <Route
                path="/backups/*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BackupsRouter />
                  </Suspense>
                }
              />
            )}
            {this.props.user.admin && (
              <Route
                path="/settings/*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <SettingView />
                  </Suspense>
                }
              />
            )}
            {this.props.user.admin && (
              <Route
                path="/constraint/*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ConstraintsRouter isLegacyMode={isLegacyMode} />
                  </Suspense>
                }
              />
            )}
            {this.props.user.admin && isLegacyMode && (
              <Route
                path="/blocks/*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BlockObjectContainer />
                  </Suspense>
                }
              />
            )}
          </Routes>
        </main>
      </div>
    );
  }

  renderAuthView() {
    return <AuthView />;
  }

  getDisplayId() {
    let val = this.props.user.id;
    if (val.length > 20) {
      val = val.substr(0, 20) + '...';
    }
    return val;
  }

  getDisplayName() {
    let val = this.props.user.name;
    if (val.length > 20) {
      val = val.substr(0, 20) + '...';
    }
    return val;
  }
}

function mapStateToProps(state: any) {
  return {
    isAuthenticated: authSelectors.isAuthenticated(state),
    isAuthPerformed: authSelectors.isAuthPerformed(state),
    isLocalUsersEnable: configSelectors.isLocalUsersEnabled(state),
    pvmMode: configSelectors.isPvmModeEnabled(state),
    user: authSelectors.user(state),
    authType: authSelectors.authType(state),
  };
}

function mapDispatchProps(dispatch: any) {
  return {
    logout: () => {
      dispatch(authActions.logout());
    },
    checkAuth: () => {
      dispatch(authActions.checkAuth());
    },
    checkAuthType: (okCallback?: (type: AuthType) => void, errorCallback?: (errorMessage: string) => void) => {
      dispatch(authActions.checkAuthType(okCallback, errorCallback));
    },
    fetchConfig: () => {
      dispatch(configActions.fetchConfig());
    },
    fetchEnabledLimits: () => {
      dispatch(
        configFeatureSettings.fetchCurrentFeatureSettings({ setting: FEATURE_SETTINGS_LIMITS_SETTING, feature: FEATURE_SETTINGS_LIMITS_FEATURE }),
      );
    },
    fetchValidationStrictLimits: () => {
      dispatch(
        configFeatureSettings.fetchCurrentFeatureSettings({
          setting: FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_SETTING,
          feature: FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_FEATURE,
        }),
      );
    },
    displayInfo: (msg: string) => {
      dispatch(notificationActions.info(msg));
    },
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
  };
}

export default connect(mapStateToProps, mapDispatchProps)(withStyles(styles)(withRouter(App)));

import { applyMiddleware, combineReducers, createStore, Reducer, compose } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import thunk from 'redux-thunk';

import * as almgr from './almgr/Reducer';
import * as apiKey from './apiKeys/Reducer';
import * as archive from './archive/Reducer';
import * as auth from './auth/Reducer';
import * as clusters from './clusters/Reducer';
import * as collector from './collector/Reducer';
import * as config from './config/Reducer';
import * as constraint from './constraint/Reducer';
import * as featureSettings from './featureSettings/Reducer';
import * as processing from './flow/Reducer';
import * as team from './group/Reducer';
import * as index from './index/Reducer';
import * as kafka from './kafka/Reducer';
import * as kafkaViewer from './kafkaViewer/Reducer';
import * as lookup from './lookup/Reducer';
import * as monitoring from './monitoring/Reducer';
import * as notification from './notification/Reducer';
import * as orgs from './orgs/Reducer';
import * as osiris from './osiris/Reducer';
import * as overdraft from './overdraft/Reducer';
import * as pipeline from './pipeline/Reducer';
import * as project from './project/Reducer';
import * as role from './role/Reducer';
import * as tracingDatasource from './tracingDatasources/Reducer';
import * as tracing from './tracingSearch/Reducer';
import * as unimon from './unimon/Reducer';
import * as user from './user/Reducer';
import * as zone from './zone/Reducer';

export interface ApplicationState {
  auth: auth.AuthStoreState;
  kafka: kafka.KafkaStoreState;
  kafkaViewer: kafkaViewer.KafkaViewerStoreState;
  project: project.ProjectStoreState;
  notification: notification.NotificationState;
  team: team.GroupStoreState;
  orgs: orgs.OrgStoreState;
  user: user.UsersStoreState;
  index: index.IndexStoreState;
  tracingDatasource: tracingDatasource.TracingDatasourceStoreState;
  tracing: tracing.TracingStoreState;
  role: role.RoleStoreState;
  monitoring: monitoring.MonitoringStoreState;
  processing: processing.ProcessingStoreState;
  config: config.ConfigStoreState;
  pipeline: pipeline.PipelineStoreState;
  archive: archive.ArchiveStoreState;
  lookup: lookup.LookupStoreState;
  constraint: constraint.ConstraintStoreState;
  unimon: unimon.UnimonStoreState;
  osiris: osiris.OsirisStoreState;
  almgr: almgr.AlmgrStoreState;
  apiKey: apiKey.ApiKeyStoreState;
  zone: zone.ZoneState;
  overdraft: overdraft.OverdraftStoreState;
  collector: collector.CollectorStoreState;
  clusters: clusters.ClustersStoreState;
  featureSettings: featureSettings.FeatureSettingsStore;
}

export const reducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  auth: auth.reducer,
  kafka: kafka.reducer,
  kafkaViewer: kafkaViewer.reducer,
  project: project.reducer,
  notification: notification.reducer,
  team: team.reducer,
  orgs: orgs.reducer,
  user: user.reducer,
  role: role.reducer,
  index: index.reducer,
  tracing: tracing.reducer,
  tracingDatasource: tracingDatasource.reducer,
  monitoring: monitoring.reducer,
  config: config.reducer,
  processing: processing.reducer,
  pipeline: pipeline.reducer,
  lookup: lookup.reducer,
  archive: archive.reducer,
  constraint: constraint.reducer,
  unimon: unimon.reducer,
  almgr: almgr.reducer,
  osiris: osiris.reducer,
  apiKey: apiKey.reducer,
  zone: zone.reducer,
  overdraft: overdraft.reducer,
  collector: collector.reducer,
  clusters: clusters.reducer,
  featureSettings: featureSettings.reducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['kafkaViewer'],
};

export const persistedReducer = persistReducer(persistConfig, reducers);

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)));

export const persistor = persistStore(store);

// Реальные ответы стенда, снятые через прокси хоста (2026-06-16).
// Используются mock-адаптером axios когда включён флаг __ARMC_MOCK__ (см. ./index.ts).
// Это срез для локальной вёрстки без доступа к стенду, не полный дамп.

import { ArchiveConfiguration } from '@src/Entities/Archives/types';
import { ProjectItem } from '@src/Entities/Project/types';
import { TopicItem } from '@src/Entities/Topic/types';

const INDEX_ACTIONS = ['VIEW', 'EDIT', 'DATA_EXPORT'] as const;
const FLOW_ACTIONS = ['VIEW', 'EDIT'] as const;

// базовый срез реальных конфигураций: с экземплярами и без, с метками, с null-ретеншеном.
// у rust2 версия экземпляра намеренно разведена с версией конфигурации - проверить оранжевую иконку обновления
const baseConfigurations: ArchiveConfiguration[] = [
  {
    id: 25,
    name: 'coord-logs',
    project: 'abyss_st2',
    version: '2026-03-03T13:36:25.212Z',
    maxSizeBytes: 10737418240,
    maxDataRateBytesPerSec: 102400,
    maxStorageTimeSec: 104857,
    labels: ['jenkins_processed'],
    instances: [
      {
        id: 25,
        zoneId: 'PRIMARY',
        version: '2026-03-03T13:36:25.212Z',
        processingRate: 1.0,
        maxSizeBytes: 10737418240,
        maxDataRateBytesPerSec: 102400,
        maxStorageTimeSec: 104857,
        overdraftPercent: 0,
        metadata: { maxAvailableOverdraft: 50 },
        status: {
          storage: { currentSizeBytes: 7516362282, maxSizeBytes: 10737418240 },
          indexing: { status: 'RUNNING' },
        },
      },
    ],
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
  {
    id: 79,
    name: 'fast14.02',
    project: 'Fast_Key',
    version: '2026-02-14T10:43:04.160Z',
    maxSizeBytes: 2147483648,
    maxDataRateBytesPerSec: 307200,
    maxStorageTimeSec: 6990,
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
  {
    id: 98,
    name: 'fast16.02-2',
    project: 'Fast_Key',
    version: '2026-02-16T10:53:24.766Z',
    maxSizeBytes: 2147483648,
    maxDataRateBytesPerSec: 7168,
    maxStorageTimeSec: 299593,
    instances: [
      {
        id: 70,
        zoneId: 'PRIMARY',
        version: '2026-02-16T10:53:24.766Z',
        processingRate: 1.0,
        maxSizeBytes: 2147483648,
        maxDataRateBytesPerSec: 7168,
        maxStorageTimeSec: 299593,
        overdraftPercent: 0,
        metadata: { maxAvailableOverdraft: 50 },
        status: {
          storage: { currentSizeBytes: 0, maxSizeBytes: 2147483648 },
          indexing: { status: 'UNDEFINED' },
        },
      },
    ],
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
  {
    id: 101,
    name: 'tst111',
    project: 'AQA',
    version: '2026-02-16T11:21:33.831Z',
    maxSizeBytes: 104857600,
    maxDataRateBytesPerSec: 10,
    maxStorageTimeSec: 10485760,
    instances: [
      {
        id: 73,
        zoneId: 'PRIMARY',
        version: '2026-02-16T11:21:33.831Z',
        processingRate: 1.0,
        maxSizeBytes: 104857600,
        maxDataRateBytesPerSec: 10,
        maxStorageTimeSec: 10485760,
        overdraftPercent: 0,
        metadata: { maxAvailableOverdraft: 50 },
        status: {
          storage: { currentSizeBytes: 9, maxSizeBytes: 104857600 },
          indexing: { status: 'UNDEFINED' },
        },
      },
    ],
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
  {
    id: 471,
    name: 'rust2',
    project: 'abyss_st2',
    version: '2026-03-21T10:06:21.428Z',
    maxSizeBytes: 2147483648,
    maxDataRateBytesPerSec: 2097152,
    maxStorageTimeSec: 104,
    labels: ['test', 'jenkins_processed'],
    instances: [
      {
        id: 318,
        zoneId: 'PRIMARY',
        // версия экземпляра отстаёт от версии конфигурации - срабатывает hasVersionMismatch
        version: '2026-02-01T08:00:00.000Z',
        processingRate: 1.0,
        maxSizeBytes: 2147483648,
        maxDataRateBytesPerSec: 2097152,
        maxStorageTimeSec: 104,
        overdraftPercent: 0,
        metadata: { maxAvailableOverdraft: 50 },
        status: {
          storage: { currentSizeBytes: 0, maxSizeBytes: 2147483648 },
          indexing: { status: 'RUNNING' },
        },
      },
      {
        id: 319,
        zoneId: 'SECONDARY',
        version: '2026-03-21T10:06:21.428Z',
        processingRate: 1.0,
        maxSizeBytes: 2147483648,
        maxDataRateBytesPerSec: 2097152,
        maxStorageTimeSec: 104,
        overdraftPercent: 0,
        metadata: { maxAvailableOverdraft: 50 },
        status: {
          storage: { currentSizeBytes: 846015, maxSizeBytes: 2147483648 },
          indexing: { status: 'FAILED' },
        },
      },
    ],
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
  {
    id: 557,
    name: 'aqa_task_23-03-26_17-10-18-1018_1cd4f7',
    project: 'AQA',
    version: '2026-03-23T14:10:19.150Z',
    maxSizeBytes: 2097152,
    maxDataRateBytesPerSec: 10240,
    maxStorageTimeSec: null,
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
  {
    id: 662,
    name: 'rust',
    project: 'abyss_st2',
    version: '2026-03-28T06:29:49.416Z',
    maxSizeBytes: 734003200,
    maxDataRateBytesPerSec: 100,
    maxStorageTimeSec: 7340032,
    labels: ['jenkins_processed'],
    instances: [
      {
        id: 947,
        zoneId: 'PRIMARY',
        version: '2026-03-28T06:29:49.416Z',
        processingRate: 1.0,
        maxSizeBytes: 734003200,
        maxDataRateBytesPerSec: 100,
        maxStorageTimeSec: 7340032,
        overdraftPercent: 0,
        metadata: { maxAvailableOverdraft: 50 },
        status: {
          storage: { currentSizeBytes: 846015, maxSizeBytes: 734003200 },
          indexing: { status: 'RUNNING' },
        },
      },
    ],
    indexActions: [...INDEX_ACTIONS],
    flowActions: [...FLOW_ACTIONS],
  },
];

// добиваем до 31 конфигурации (реальный page-count со стенда), чтобы работала пагинация на нескольких страницах
const padConfigurations = (): ArchiveConfiguration[] => {
  const padded = [...baseConfigurations];
  let nextId = 1000;
  while (padded.length < 31) {
    const source = baseConfigurations[padded.length % baseConfigurations.length]!;
    padded.push({
      ...source,
      id: nextId,
      name: `${source.name}_copy${nextId}`,
      instances: undefined,
      labels: undefined,
    });
    nextId += 1;
  }
  return padded;
};

export const archiveConfigurationsFixture: ArchiveConfiguration[] = padConfigurations();

export const projectsFixture: ProjectItem[] = [
  { id: 1, name: 'abyss_st2', shortName: 'abyss_st2', canManageAccess: true },
  { id: 6, name: 'AQA', shortName: 'AQA', canManageAccess: true },
  { id: 32, name: 'Fast_Name', shortName: 'Fast_Key', canManageAccess: true },
  { id: 33, name: 'Fast2', shortName: 'Fast2', canManageAccess: true },
  { id: 37, name: 'bolshakov_test', shortName: 'bolshakov_test', canManageAccess: true },
  { id: 221, name: 'eldar', shortName: 'eldar', canManageAccess: true },
  { id: 66, name: 'UIAQA_name', shortName: 'UIAQA', canManageAccess: true },
];

const buildTopic = (partial: Pick<TopicItem, 'id' | 'name' | 'topicFullName' | 'projectId'> & Partial<TopicItem>): TopicItem => ({
  partitions: 1,
  replication: 1,
  canManageAccess: true,
  canEdit: true,
  shadow: false,
  clusterId: 1,
  clusterName: 'default_cluster',
  plannedRate: null,
  plannedVolume: null,
  plannedRetentionTime: null,
  retentionType: null,
  ...partial,
});

export const topicsFixture: TopicItem[] = [
  buildTopic({
    id: 6,
    name: 'coordinator_audit_health_check',
    topicFullName: 'abyss_st2.coordinator_audit_health_check',
    projectId: 1,
    plannedRate: 102400,
    plannedVolume: 1073741824,
    retentionType: 'BY_SIZE',
  }),
  buildTopic({
    id: 7,
    name: 'coordinator_audit_events',
    topicFullName: 'abyss_st2.coordinator_audit_events',
    projectId: 1,
    plannedRate: 102400,
    plannedVolume: 1073741824,
    retentionType: 'BY_SIZE',
  }),
  buildTopic({
    id: 10,
    name: 'coordinator-logs',
    topicFullName: 'abyss_st2.coordinator-logs',
    projectId: 1,
    plannedRate: 102400,
    plannedVolume: 1073741824,
    retentionType: 'BY_SIZE',
  }),
  buildTopic({
    id: 195,
    name: 'rust',
    topicFullName: 'abyss_st2.rust',
    projectId: 1,
    plannedRate: 100,
    plannedVolume: 10485760,
    plannedRetentionTime: 7200,
    retentionType: 'BY_TIME_AND_SIZE',
  }),
  buildTopic({
    id: 350,
    name: 'rust2',
    topicFullName: 'abyss_st2.rust2',
    projectId: 1,
    partitions: 40,
    plannedRate: 10000,
    plannedRetentionTime: 60,
    retentionType: 'BY_TIME',
  }),
  buildTopic({
    id: 426,
    name: 'aqa_topic_23-03-26_12-54-04-544_d0025ba',
    topicFullName: 'AQA.aqa_topic_23-03-26_12-54-04-544_d0025ba',
    projectId: 6,
  }),
  buildTopic({
    id: 3568,
    name: 'test_eldar',
    topicFullName: 'eldar.test_eldar',
    projectId: 221,
    plannedRate: 1048576,
    plannedVolume: 1048576,
    retentionType: 'BY_SIZE',
  }),
  buildTopic({
    id: 3580,
    name: '24.04',
    topicFullName: 'Fast_Key.24.04',
    projectId: 32,
    plannedRate: 10485760,
    plannedVolume: 10485760,
    retentionType: 'BY_SIZE',
  }),
  buildTopic({
    id: 3662,
    name: 'avro_topic',
    topicFullName: 'abyss_st2.avro_topic',
    projectId: 1,
    plannedRate: 1000,
    plannedVolume: 1048576000,
    retentionType: 'BY_SIZE',
  }),
];

export const restrictionsOverviewFixture = [
  { objectType: 'INDEX', objectName: 'aqa_task_23-03-26_17-10-18-1018_1cd4f7', objectId: '557', projectKey: 'AQA' },
];

// ответ GET .../config (форма со стенда abyss). name подставляется из запроса в mock-роуте
export const archiveConfigFixture = {
  name: 'aqa_task_23-03-26_17-10-18-1018_1cd4f7',
  source: {
    kafka: [{ project: 'AQA', name: 'aqa_topic_23-03-26_17-10-18-1018_cff63e' }],
    format: { type: 'JSON', schemaName: null },
  },
  quota: { maxDataRateBytesPerSec: 10240, maxSizeBytes: 2097152, maxStorageTimeSec: null },
  processing: { flatten: { exclude: ['flattenBlock', 'flattenBlock2'] } },
  schema: {
    fields: [
      { name: 'time', type: 'DATE', format: 'UNIX_TIMESTAMP_MILLIS' },
      { name: 'stringField', type: 'STRING' },
      { name: 'textField', type: 'TEXT' },
      { name: 'intField', type: 'INT' },
    ],
    dynamicFields: null,
  },
  primaryTimeField: { type: 'CUSTOM', field: 'time', lateMessageRejectionPeriod: 'P1D', earlyMessageRejectionPeriod: 'P1D' },
  deadLetterQueue: null,
  labels: null,
  metadata: { maxAvailableOverdraft: 50 },
};

export const restrictionsFixture = { maxSearchTimeIntervalSec: 345600 };

export const featureFlagEnabledFixture = { value: 'true' };

import * as moment from 'moment';

import { SearchTimeInterval } from '../pipeline/Types';

export interface IndexQuota {
  projectShortName: string;
  currentVolume: number;
  maxVolume: number;
  currentRate: number;
  maxRate: number;
}

export interface FullTextTaskInstancesMetadata {
  maxAvailableOverdraft: number;
}

export interface FullTextTaskInstances {
  id: number;
  version: string;
  zoneId: string;
  overdraftPercent: number;
  metadata: FullTextTaskInstancesMetadata;
  maxDataRateBytesPerSec: number;
  maxSizeBytes?: number;
  maxStorageTimeSec?: number;
  backupCount?: number;
  savepointCount?: number;
  woBackup?: boolean;
}

export interface FulltextTask {
  id: number;
  project: string;
  name: string;
  labels?: string[];
  instances?: FullTextTaskInstances[];
  version: string;
  maxDataRateBytesPerSec: number;
  maxSizeBytes?: number;
  maxStorageTimeSec?: number;
  indexActions: string[];
  flowActions: string[];
}

export interface EstimatedIndexQuota {
  currentQuota: IndexQuota;
  plannedVolume: number;
  plannedRate: number;
  approximatedRealIndexSizeBytes: number;
  approximatedStoreTimeSec: number;
  quotaAllowed: boolean;
}

export interface Field {
  name: string;
}

export interface Filter {
  field: string;
  value: string;
}

export interface LuceneQuery {
  query: string;
  filter?: Filter[];
  searchTimeInterval: SearchTimeInterval;
  limit?: number;
  fields?: string[];
  sort?: any;
}

export interface TimeRange {
  start: () => moment.Moment;
  end: () => moment.Moment;
}

export const TYPES = ['STRING', 'TEXT', 'INT', 'DOUBLE', 'LONG', 'DATE', 'UUID', 'BOOLEAN'];

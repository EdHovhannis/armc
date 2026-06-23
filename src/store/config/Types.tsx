export interface Config {
  registerEnabled?: boolean;
  pvmMode?: boolean;
  minCountMask?: number;
  maxCountUser?: number;
  localUserEnable?: boolean;
  basePath?: string;
}

export interface Versions {
  artifact: string;
  version: string;
  gitCommitHash: string;
  timestamp: string;
}

export interface IndexConfig {
  maxSourceCount?: number;
  dataLateRejectionPeriod?: string;
  dataEarlyRejectionPeriod?: string;
  maxMessageFilterCount?: number;
  maxAvailableGlobalConfigurationsForUser?: number;
  lateMessageRejectionPeriod: string;
  earlyMessageRejectionPeriod: string;
  sourceEditEnabled?: boolean;
  backupsEnabled?: boolean;
}
export type IHealthChecksZone = 'PRIMARY' | 'SECONDARY';
export type IHealthChecksZones = Array<'PRIMARY' | 'SECONDARY'>;
export type IHealthChecksService =
  | 'AUTZ_POLICY_SERVICE'
  | 'FLOW'
  | 'FULLTEXT'
  | 'TRACE_QUERY'
  | 'MONITORING'
  | 'PVM_SECURITY'
  | 'KAFKA'
  | 'PVM_BASE'
  | 'ARCHIVE';

export interface IHealthChecks {
  service: IHealthChecksService;
  manualHealth: 'ON' | 'OFF';
  zone: IHealthChecksZone;
  subsystemHealth: {
    policy_service: 'ON' | 'OFF';
  };
}
export interface IHealthChecksForTable {
  rowType: IHealthChecksService;
  PRIMARY: 'ON' | 'OFF';
  SECONDARY: 'ON' | 'OFF';
}

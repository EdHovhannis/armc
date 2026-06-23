export enum OsirisQuotaType {
  CHECK_QUOTA = 'CHECK_QUOTA',
  TRAFFIC_QUOTA = 'TRAFFIC_QUOTA',
}

export interface OsirisCheckQuotaRequest {
  id?: number;
  quotaType: {
    name: OsirisQuotaType;
  };
  max: number;
}

export interface OsirisTrafficQuotaRequest extends OsirisCheckQuotaRequest {
  over: number;
  maxSecondsInOver: number;
}

export interface OsirisCheckQuotaProject {
  id?: number;
  quotaType: {
    name: OsirisQuotaType;
  };
  max: number;
  spent: number;
}

export interface OsirisTrafficQuotaProject extends OsirisCheckQuotaProject {
  over: number;
  maxSecondsInOver: number;
}

export interface OsirisQuota extends OsirisTrafficQuotaProject {
  project: string;
}

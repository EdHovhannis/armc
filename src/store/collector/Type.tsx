export interface CollectorProjectQuota {
  createTs: string;
  createdUserId: string;
  limitTrafficPerMin: number;
  limitTrafficBytesPerMin: number;
  modifiedUserId: string;
  modifyTs: string;
  projectName: string;
  quotaId: string;
  version: number;
}

import { AnalyticalQuotaResponse, ConfigQuotaUsage, InstanceQuotaUsage } from '@src/store/monitoring/Types';

export interface SupervisorInstanceQuotaOverrideDialogProps {
  open: boolean;
  handleClose: () => void;
  supervisorId?: number;
  supervisorName?: string;
  projectName?: string;
  zone: string;
  instanceQuotaUsage?: InstanceQuotaUsage;
  configQuotaUsage?: ConfigQuotaUsage;
  onUpdate?: () => void;
}

export interface SupervisorInstanceQuotaOverrideDialogState {
  taskCount: number | undefined;
  replicas: number;
  quotaEstimate: AnalyticalQuotaResponse | null;
  loading: boolean;
  isValid: boolean;
  hasOverride: boolean;
}

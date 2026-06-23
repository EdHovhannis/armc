export interface TracingSupervisorDescription {
  id: number;
  name: string;
  projectId: number;
  traceSupervisorId: number;
  callsSupervisorId?: number;
  treeSupervisorId?: number;
  canEdit: boolean;
  canManageAccess: boolean;
}

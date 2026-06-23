export type ArchiveIndexStatus = 'RUNNING' | 'STOPPED' | 'FAILED' | 'UNDEFINED' | 'WITHOUT_RESPONSE';

export type ArchiveIndexZone = 'PRIMARY' | 'SECONDARY';

export interface ArchiveIndexRow {
  id: string;
  configuration: string;
  zone: ArchiveIndexZone;
  status: ArchiveIndexStatus;
  memoryUsed: string;
  memoryAllocated: string;
  maxWriteSpeed: string;
  maxIndexSize: string;
  maxRetention: string;
  hasVersionMismatch?: boolean;
  configVersion?: string;
  instanceVersion?: string;
}

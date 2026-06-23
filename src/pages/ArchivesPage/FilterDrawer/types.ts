import { CompareOperator, IsOperator, SelectOperator } from '@src/Shared/types/filter';

import { ArchiveIndexStatus, ArchiveIndexZone } from '../types';

export interface FilterFormValues {
  configuration: { operator: SelectOperator; values: string[] };
  projectKey: { operator: SelectOperator; values: string[] };
  status: { operator: SelectOperator; values: ArchiveIndexStatus[] };
  labels: { operator: SelectOperator; values: string[] };
  zone: { operator: IsOperator; value: ArchiveIndexZone | '' };
  configVersion: { operator: IsOperator; value: string };
  processingSpeed: { operator: CompareOperator; value: string };
  maxWriteSpeed: { operator: SelectOperator; from: string; to: string; unit: string };
  maxIndexSize: { operator: SelectOperator; from: string; to: string; unit: string };
  maxRetention: { operator: SelectOperator; from: string; to: string; unit: string };
}

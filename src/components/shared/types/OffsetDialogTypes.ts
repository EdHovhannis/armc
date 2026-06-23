export interface ConsumerGroup {
  name: string;
  displayName: string;
}
export interface ConsumerGroups {
  consumerGroup: ConsumerGroup;
  projectName: string;
  indexName: string;
  zoneId: string;
  topic: string;
  type: IndexType;
}

export interface OffsetDialogData {
  topicName: string;
  currentConsumerGroup: ConsumerGroup;
  zoneIds: Array<string>;
  consumerGroups: Array<ConsumerGroups>;
}
export interface IOffsetDialogProps {
  open: boolean;
  handleClose: () => void;
  offsetData: Array<OffsetDialogData>;
  urlForSaveOffset: string;
  name?: string;
  project?: string;
  indexType: IndexType;
  zoneId?: string;
}

export enum IndexType {
  CUSTOM = 'CUSTOM',
  FULLTEXT_INDEX = 'FULLTEXT_INDEX',
  ARCHIVE = 'ARCHIVE',
}

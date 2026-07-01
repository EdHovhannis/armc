export interface OffsetConsumerGroup {
  name: string;
  displayName: string;
}

export interface OffsetConsumerGroupEntry {
  consumerGroup: OffsetConsumerGroup;
  projectName: string;
  indexName: string;
  zoneId: string;
  topic: string;
  type: string;
}

export interface OffsetTopicData {
  topicName: string;
  currentConsumerGroup: OffsetConsumerGroup;
  zoneIds: string[];
  consumerGroups: OffsetConsumerGroupEntry[];
}

export interface OffsetSetItem {
  sourceConsumerGroupId: string;
  topicName: string;
  projectName: string;
}

import { useEffect, useState } from 'react';

import { KafkaArchiveSource } from '../../../store/archive/Types';
import { KafkaTopic } from '../../../store/kafka/Types';

import { EstimateTopic } from './types';

export const useGetSelectedTopicsData = (selectedSource: KafkaArchiveSource[], allSources: KafkaTopic[]) => {
  const [topicData, setTopicData] = useState<{
    selectedTopics: EstimateTopic[];
    sumBytesPerSec: number;
    sumPartitions: number;
  }>({
    selectedTopics: [],
    sumBytesPerSec: 0,
    sumPartitions: 0,
  });

  useEffect(() => {
    const selectedTopics: EstimateTopic[] = [];
    let sumBytesPerSec = 0;
    let sumPartitions = 0;

    selectedSource.forEach(({ project, name }) => {
      selectedTopics.push({ project, name });
      const topic = allSources.find((item) => item.name === name);
      if (topic) {
        sumBytesPerSec += topic.plannedRate || 0;
        sumPartitions += topic.partitions || 0;
      }
    });

    setTopicData({
      selectedTopics,
      sumBytesPerSec,
      sumPartitions,
    });
  }, [selectedSource, allSources]);

  return topicData;
};

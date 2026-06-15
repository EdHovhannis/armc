import { combine, createStore } from 'effector';

import { fetchTopicsFx } from './api';
import { TopicItem } from './types';

export const $topics = createStore<Array<TopicItem>>([]);
$topics.on(fetchTopicsFx.doneData, (_, payload) => payload.data);

export const $optionsTopic = combine($topics, (topics) =>
  topics.map((topic) => ({ value: topic.topicFullName.replace('.', '/'), label: topic.topicFullName.replace('.', '/'), id: topic.id })),
);

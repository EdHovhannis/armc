import { combine, createStore } from 'effector';

import { fetchProjectsFx } from './api';
import { ProjectItem } from './types';

export const $projects = createStore<Array<ProjectItem>>([]);
$projects.on(fetchProjectsFx.doneData, (_, payload) => payload.data);

export const $optionsProject = combine($projects, (projects) =>
  projects.map(({ name, shortName }) => {
    return { name, label: name, value: shortName };
  }),
);

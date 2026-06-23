import { Reducer } from 'redux';
import { ActionType, getType } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { ApplicationState } from '../Store';
import { Versions } from '../config/Types';

import * as actions from './Actions';
import { ProjectWithRole } from './Actions';
import { Project } from './Types';

export interface ProjectStoreState {
  actionInProgress: boolean;
  projects: Project[];
  projectsWithRole: ProjectWithRole[];
  selectedProject: Project;
  filter: FilterMenuItem[] | undefined;
  version: Versions[] | string | undefined;
  isVersionLoading: boolean;
}

const initialState: ProjectStoreState = {
  actionInProgress: false,
  selectedProject: {
    shortName: '',
    id: 0,
    name: 'loading',
    canManageAccess: false,
  },
  filter: undefined,
  projectsWithRole: [],
  projects: [],
  version: [],
  isVersionLoading: true,
};

export type Actions = ActionType<typeof actions>;

function updateProjects(projects: Project[], project: Project): Project[] {
  const findedTeams = projects.filter((e_team) => project.id === e_team.id);

  if (findedTeams.length > 0) {
    findedTeams[0] = project;
  } else projects.push(project);

  return projects;
}

export const reducer: Reducer<ProjectStoreState> = (state: ProjectStoreState = initialState, action: Actions) => {
  switch (action.type) {
    case getType(actions.reqStart):
      return { ...state, actionInProgress: true };

    case getType(actions.reqFinished):
      return { ...state, actionInProgress: false };

    case getType(actions.fetchAllProjectsAction.success):
      return {
        ...state,
        projects: [...action.payload],
        actionInProgress: false,
      };
    case getType(actions.fetchAllProjectsAction.failure):
      return {
        ...state,
        projects: [],
        actionInProgress: false,
      };

    case getType(actions.fetchAllProjectsActionWithRole.success):
      return {
        ...state,
        projectsWithRole: [...action.payload],
        actionInProgress: false,
      };

    case getType(actions.fetchProjectByIdAction.success):
      return {
        ...state,
        selectedProject: action.payload,
        actionInProgress: false,
      };
    case getType(actions.fetchProjectByIdAction.failure):
      return {
        ...state,
        selectedProject: undefined,
        actionInProgress: false,
      };

    case getType(actions.updateProjectByIdAction.success):
      return {
        ...state,
        projects: updateProjects(state.projects, action.payload),
        selectedProject: action.payload,
      };

    case getType(actions.getVersionAction.request):
      return { ...state, isVersionLoading: true };

    case getType(actions.getVersionAction.success):
      return {
        ...state,
        version: action.payload,
        isVersionLoading: false,
      };

    case getType(actions.getVersionAction.failure):
      return {
        ...state,
        version: undefined,
        isVersionLoading: false,
      };

    case getType(actions.deleteProjectByIdAction.success):
      return {
        ...state,
        projects: state.projects.filter((proj) => proj.id !== action.payload),
      };

    case getType(actions.createProjectAction.success):
      return {
        ...state,
        projects: [...state.projects, action.payload],
        actionInProgress: false,
      };

    case getType(actions.setProjectFilterAction):
      return { ...state, filter: action.payload };

    default:
      return state;
  }
};

export function getProjects(state: ApplicationState): Project[] {
  return state.project.projects;
}

export function getProjectsWithRole(state: ApplicationState): ProjectWithRole[] {
  return state.project.projectsWithRole;
}

export function getSelectedProject(state: ApplicationState): Project {
  return state.project.selectedProject;
}

export function isLoading(state: ApplicationState): boolean {
  return state.project.actionInProgress;
}

export function getVersion(state: ApplicationState): Versions[] | string | undefined {
  return state.project.version;
}

export function getProjectFilter(state: ApplicationState): FilterMenuItem[] | undefined {
  return state.project.filter;
}

export function isVersionLoading(state: ApplicationState): boolean {
  return state.project.isVersionLoading;
}

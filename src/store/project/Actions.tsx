import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import ProjectService from '../../services/ProjectService';
import RoleService from '../../services/RoleService';
import { User } from '../auth/Types';
import { Versions } from '../config/Types';
import * as notificationActions from '../notification/Actions';
import { Resource, Role } from '../role/Types';

import { Project } from './Types';

export const reqStart = createStandardAction('@project/REQ_START')<void>();
export const reqFinished = createStandardAction('@project/REQ_FINISH')<void>();
export const setProjectFilterAction = createStandardAction('@project/SET_FILTER')<FilterMenuItem[] | undefined>();

export interface ProjectWithRole extends Project {
  hasRole: boolean;
}

export const fetchAllProjectsAction = createAsyncAction('@project/FETCH_PROJECTS', '@project/FETCH_PROJECTS_SUCC', '@project/FETCH_PROJECTS_FAIL')<
  void,
  Project[],
  string
>();

export const fetchAllProjectsActionWithRole = createAsyncAction(
  '@project/FETCH_PROJECTS_WITH_ROLE',
  '@project/FETCH_PROJECTS_WITH_ROLE_SUCC',
  '@project/FETCH_PROJECTS_WITH_ROLE_FAIL',
)<void, ProjectWithRole[], string>();

export const fetchProjectByIdAction = createAsyncAction('@project/FETCH_PROJECT_REQ', '@project/FETCH_PROJECT_SUCC', '@project/FETCH_PROJECT_FAIL')<
  void,
  Project,
  string
>();

export const deleteProjectByIdAction = createAsyncAction('@project/DEL_PROJECT_REQ', '@project/DEL_PROJECT_SUCC', '@project/DEL_PROJECT_FAIL')<
  void,
  number,
  string
>();

export const updateProjectByIdAction = createAsyncAction('@project/UPD_PROJECT_REQ', '@project/UPD_PROJECT_SUCC', '@project/UPD_PROJECT_FAIL')<
  void,
  Project,
  string
>();

export const createProjectAction = createAsyncAction('@project/CREATE_PROJECT_REQ', '@project/CREATE_PROJECT_SUCC', '@project/CREATE_PROJECT_FAIL')<
  void,
  Project,
  string
>();

export const getVersionAction = createAsyncAction('@project/VERSION_REQ', '@project/VERSION_SUCC', '@project/VERSION_FAIL')<
  void,
  Versions[] | string,
  void
>();

export const getVersion = () => {
  return (dispatch, getState) => {
    dispatch(getVersionAction.request());
    ProjectService.getVersion(
      (data, res) => {
        if (res) {
          dispatch(getVersionAction.success(res));
        } else {
          dispatch(getVersionAction.success(data));
        }
      },
      (str) => {
        dispatch(getVersionAction.failure());
      },
    );
  };
};

export function fetchAllProjects(fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    ProjectService.fetchProjects(
      (projects: Project[]) => {
        dispatch(fetchAllProjectsAction.success(projects));
        if (fetchedCallback) fetchedCallback(projects);
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchAllProjectsAction.failure(error));
        dispatch(reqFinished());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchKafkaProjects(fetchedCallback?: (projects: Array<Project>) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    ProjectService.fetchKafkaProjects(
      (projects: Project[]) => {
        dispatch(fetchAllProjectsAction.success(projects));
        if (fetchedCallback) fetchedCallback(projects);
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchAllProjectsAction.failure(error));
        dispatch(reqFinished());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchProjectById(id, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    ProjectService.fetchProjectById(
      id,
      (project: Project) => {
        dispatch(fetchProjectByIdAction.success(project));
        if (okCallback) {
          okCallback(project);
        }
      },
      (error) => {
        dispatch(reqFinished());
        dispatch(fetchProjectByIdAction.failure(error));
        dispatch(notificationActions.error(error));
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
  };
}

export function deleteProjectById(id) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    ProjectService.deleteProjectById(
      id,
      () => {
        dispatch(deleteProjectByIdAction.success(id));
        dispatch(notificationActions.success('Проект был успешно удалён'));
      },
      (error) => {
        dispatch(reqFinished());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function updateProjectById(id: number, project: Project) {
  return (dispatch, getState) => {
    dispatch(updateProjectByIdAction.request());
    ProjectService.updateProjectById(
      id,
      project,
      () => {
        dispatch(updateProjectByIdAction.success(project));
        dispatch(notificationActions.success('Проект был успешно обновлён'));
      },
      (error) => {
        dispatch(updateProjectByIdAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function createProject(name: string, shortName: string) {
  return (dispatch, getState) => {
    dispatch(reqStart());
    const project: Project = {
      id: -1,
      name: name,
      shortName: shortName,
      canManageAccess: false,
    };
    ProjectService.createProject(
      project,
      (id) => {
        project.id = id;
        dispatch(createProjectAction.success(project));
        dispatch(notificationActions.success('Проект был успешно создан'));
      },
      (error) => {
        dispatch(reqFinished());
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function setProjectFilter(filter: FilterMenuItem[] | undefined) {
  return (dispatch, getState) => {
    dispatch(setProjectFilterAction(filter));
  };
}

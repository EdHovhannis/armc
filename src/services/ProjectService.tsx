import { Versions } from '../store/config/Types';
import { Project, EditableProject } from '../store/project/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис проектов в данный момент недоступен. Обратитесь к администратору.';

export default class ProjectService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/project/metadata/version');

    if (result.ok) {
      const data = await result.text();
      try {
        const res = JSON.parse(data);
        okCallback(data, res);
      } catch (e) {
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchProjects(okCallback: (projects: Project[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/project/list');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Project[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchEditableProjectsForAddingNewElement(
    resourceType: string,
    resourceAction: string,
    okCallback: (projects: EditableProject[]) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', `/project/resourceType/${resourceType}/resourceAction/${resourceAction}`);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as EditableProject[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchKafkaProjects(okCallback: (projects: Project[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/project/list');

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Project[]);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchProjectById(project: number, okCallback: (project: Project) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/project/' + project);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Project);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` c id ${project}`);
      errorCallback(message.message);
    }
  }

  static async fetchProjectByName(project: string, okCallback: (project: Project) => void, errorCallback?: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/project/name/' + project);

    if (result.ok) {
      const data = await result.json();
      okCallback(data as Project);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${project}`);
      if (errorCallback) errorCallback(message.message);
    }
  }

  static async deleteProjectById(project_id: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', '/internal/project/' + project_id);
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` c id ${project_id}`);
      errorCallback(message.message);
    }
  }

  static async updateProjectById(project_id: number, project: Project, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/project/' + project_id + '/update', null, null, JSON.stringify(project));
    if (result.ok) okCallback();
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${project.shortName}`);
      errorCallback(message.message);
    }
  }

  static async createProject(project: Project, okCallback: (generatedId: number) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', '/internal/project/create', null, null, JSON.stringify(project));

    if (result.ok) okCallback(await result.json());
    else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}

import {
  AnalyticConstraint,
  ArchiveConstraint,
  BasicAnalyticConstraint,
  BasicArchiveConstraint,
  BasicFulltextConstraint,
  BlockedUnit,
  BlockFilterParams,
  Blocks,
  ClusterConstraint,
  ConstraintFilterParams,
  ConstraintShort,
  ConstraintType,
  FulltextConstraint,
  OBJECT_TYPE,
  ProjectConstraint,
} from '../store/constraint/Types';
import { Unit } from '../store/role/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

export const ERROR_502_MESSAGE = 'Сервис не отвечает. Пожалуйста, обратитесь к администратору.';

const apiFulltextPath = '/internal/index/fulltext';
const apiArchivePath = '/internal/index/archive';
const apiAnalyticPath = '/internal/index/analytical';

export default class ConstraintService {
  static async fetchAllConstraints(
    constraintFilterParams: ConstraintFilterParams | undefined,
    okCallback: (constraints: ConstraintShort[]) => void,
    errorCallback: (message: string) => void,
  ) {
    let needFulltext = true,
      needAnalytic = true,
      needArchive = true;
    let params = null;
    if (constraintFilterParams) {
      if (constraintFilterParams.constraintType) {
        needFulltext = constraintFilterParams.constraintType.includes(ConstraintType.fulltext);
        needAnalytic = constraintFilterParams.constraintType.includes(ConstraintType.analytic);
        needArchive = constraintFilterParams.constraintType.includes(ConstraintType.archive);
      }
      if (constraintFilterParams.objectType) {
        params = {
          objectType: constraintFilterParams.objectType,
        };
      }
      if (constraintFilterParams.projects) {
        if (params) {
          params.projectKeys = constraintFilterParams.projects.join(',').toString();
        } else {
          params = {
            projectKeys: constraintFilterParams.projects.join(',').toString(),
          };
        }
      }
    }

    let resultFulltext, resultArchive, resultAnalytic;

    if (needFulltext) {
      resultFulltext = await BackendProvider.request('GET', apiFulltextPath + '/restrictions/overview', null, params);
    }
    if (needArchive) {
      resultArchive = await BackendProvider.request('GET', apiArchivePath + '/restrictions/overview', null, params);
    }
    if (needAnalytic) {
      resultAnalytic = await BackendProvider.request('GET', apiAnalyticPath + '/restrictions/overview', null, params);
    }

    const data: ConstraintShort[] = [];
    let errors = '';
    let isError = false;

    if (needAnalytic) {
      if (resultAnalytic.ok) {
        const analytic = await resultAnalytic.json();
        analytic.map((constraint) => {
          constraint.constraintType = ConstraintType.analytic;
          data.push(constraint);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с аналитическим сервисом: ';
        const message = await ErrorHandling.handleError(resultAnalytic, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    if (needFulltext) {
      if (resultFulltext.ok) {
        const fulltext = await resultFulltext.json();
        fulltext.map((constraint) => {
          constraint.constraintType = ConstraintType.fulltext;
          data.push(constraint);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с полнотекстовым сервисом: ';
        const message = await ErrorHandling.handleError(resultFulltext, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    if (needArchive) {
      if (resultArchive.ok) {
        const archive = await resultArchive.json();
        archive.map((constraint) => {
          constraint.constraintType = ConstraintType.archive;
          data.push(constraint);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с архивным сервисом: ';
        const message = await ErrorHandling.handleError(resultArchive, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    data.map((constraint) => {
      if (constraint.objectType === OBJECT_TYPE.PROJECT) {
        constraint.objectName = '-';
      }
    });
    okCallback(data);
    if (isError) {
      errorCallback(errors);
    }
  }

  static async fetchConstraintForObject(
    taskId: number,
    type: ConstraintType,
    okCallback: (constraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint) => void,
    errorCallback: (message: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('GET', apiFulltextPath + '/restrictions/index/' + taskId);
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('GET', apiArchivePath + '/restrictions/index/' + taskId);
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('GET', apiAnalyticPath + '/restrictions/index/' + taskId);
        break;
    }

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchConstraintForCluster(okCallback: (constraint: ClusterConstraint) => void, errorCallback: (message: { message: string }) => void) {
    const resultFulltext = await BackendProvider.request('GET', apiFulltextPath + '/restrictions');
    const resultArchive = await BackendProvider.request('GET', apiArchivePath + '/restrictions');
    const resultAnalytic = await BackendProvider.request('GET', apiAnalyticPath + '/restrictions');

    const data: ClusterConstraint = {};
    let errors = { message: '' };
    let isError = false;

    if (resultAnalytic.ok) {
      const analytic = await resultAnalytic.json();
      data.analytic = analytic;
    } else {
      isError = true;
      const erText = 'Ошибка во время взаимодействия с аналитическим сервисом: ';
      const message = await ErrorHandling.handleError(resultAnalytic, ERROR_502_MESSAGE);
      const mes = message.message;
      errors = { ...mes, message: erText + mes.message + '\n' };
    }
    if (resultFulltext.ok) {
      const fulltext = await resultFulltext.json();
      data.fulltext = fulltext;
    } else {
      isError = true;
      const erText = 'Ошибка во время взаимодействия с полнотекстовым сервисом: ';
      const message = await ErrorHandling.handleError(resultFulltext, ERROR_502_MESSAGE);
      const mes = message.message;
      errors = { ...mes, message: erText + mes.message + '\n' };
    }
    if (resultArchive.ok) {
      const archive = await resultArchive.json();
      data.archive = archive;
    } else {
      isError = true;
      const erText = 'Ошибка во время взаимодействия с архивным сервисом: ';
      const message = await ErrorHandling.handleError(resultArchive, ERROR_502_MESSAGE);
      const mes = message.message;
      errors = { ...mes, message: erText + mes.message + '\n' };
    }
    okCallback(data);
    if (isError) {
      errorCallback(errors);
    }
  }

  static async fetchConstraintForProject(
    projectShortName: string,
    okCallback: (constraint: ProjectConstraint) => void,
    errorCallback: (message: string) => void,
  ) {
    const resultFulltext = await BackendProvider.request('GET', apiFulltextPath + '/restrictions/project/' + projectShortName);
    const resultArchive = await BackendProvider.request('GET', apiArchivePath + '/restrictions/project/' + projectShortName);
    const resultAnalytic = await BackendProvider.request('GET', apiAnalyticPath + '/restrictions/project/' + projectShortName);

    const data: ProjectConstraint = {};
    let errors = '';
    let isError = false;

    if (resultAnalytic.ok) {
      const analytic = await resultAnalytic.json();
      data.analytic = analytic;
    } else {
      isError = true;
      errors += 'Ошибка во время взаимодействия с аналитическим сервисом: ';
      const message = await ErrorHandling.handleError(resultAnalytic, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errors += message.message + '\n';
    }
    if (resultFulltext.ok) {
      const fulltext = await resultFulltext.json();
      data.fulltext = fulltext;
    } else {
      isError = true;
      errors += 'Ошибка во время взаимодействия с полнотекстовым сервисом: ';
      const message = await ErrorHandling.handleError(resultFulltext, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errors += message.message + '\n';
    }
    if (resultArchive.ok) {
      const archive = await resultArchive.json();
      data.archive = archive;
    } else {
      isError = true;
      errors += 'Ошибка во время взаимодействия с архивным сервисом: ';
      const message = await ErrorHandling.handleError(resultArchive, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errors += message.message + '\n';
    }
    okCallback(data);
    if (isError) {
      errorCallback(errors);
    }
  }

  static async updateConstraintOnObject(
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('PATCH', apiFulltextPath + '/restrictions/index/' + taskId, null, null, JSON.stringify(patch));
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('PATCH', apiArchivePath + '/restrictions/index/' + taskId, null, null, JSON.stringify(patch));
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('PATCH', apiAnalyticPath + '/restrictions/index/' + taskId, null, null, JSON.stringify(patch));
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async updateConstraintOnProject(
    projectShortName: string,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request(
          'PATCH',
          apiFulltextPath + '/restrictions/project/' + projectShortName,
          null,
          null,
          JSON.stringify(patch),
        );
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request(
          'PATCH',
          apiArchivePath + '/restrictions/project/' + projectShortName,
          null,
          null,
          JSON.stringify(patch),
        );
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request(
          'PATCH',
          apiAnalyticPath + '/restrictions/project/' + projectShortName,
          null,
          null,
          JSON.stringify(patch),
        );
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async updateClusterConstraint(
    constraint: BasicArchiveConstraint | BasicAnalyticConstraint | BasicFulltextConstraint,
    type: ConstraintType,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('PATCH', apiFulltextPath + '/restrictions', null, null, JSON.stringify(constraint));
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('PATCH', apiArchivePath + '/restrictions', null, null, JSON.stringify(constraint));
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('PATCH', apiAnalyticPath + '/restrictions', null, null, JSON.stringify(constraint));
        break;
    }

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async clearObjectConstraint(objectId: number, objectType: OBJECT_TYPE, type: ConstraintType, okCallback, errorCallback) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('DELETE', apiFulltextPath + `/restrictions/${objectType.toLowerCase()}/${objectId}`);
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('DELETE', apiArchivePath + `/restrictions/${objectType.toLowerCase()}/${objectId}`);
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('DELETE', apiAnalyticPath + `/restrictions/${objectType.toLowerCase()}/${objectId}`);
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }

  static async fetchAllBlockedUsers(
    blockFilterParams: BlockFilterParams | undefined,
    okCallback: (users: BlockedUnit[]) => void,
    errorCallback: (message: string) => void,
  ) {
    let needFulltext = true,
      needAnalytic = true,
      needArchive = true;
    if (blockFilterParams) {
      if (blockFilterParams.constraintType) {
        needFulltext = blockFilterParams.constraintType.includes(ConstraintType.fulltext);
        needAnalytic = blockFilterParams.constraintType.includes(ConstraintType.analytic);
        needArchive = blockFilterParams.constraintType.includes(ConstraintType.archive);
      }
    }

    let resultFulltext, resultArchive, resultAnalytic;
    if (needFulltext) resultFulltext = await BackendProvider.request('GET', apiFulltextPath + '/blocking');
    if (needArchive) resultArchive = await BackendProvider.request('GET', apiArchivePath + '/blocking');
    if (needAnalytic) resultAnalytic = await BackendProvider.request('GET', apiAnalyticPath + '/blocking');

    const data: BlockedUnit[] = [];
    let errors = '';
    let isError = false;

    if (needAnalytic) {
      if (resultAnalytic.ok) {
        const analytic: BlockedUnit[] = await resultAnalytic.json();
        analytic.map((unit) => {
          unit.constraintType = ConstraintType.analytic;
          data.push(unit);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с аналитическим сервисом: ';
        const message = await ErrorHandling.handleError(resultAnalytic, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    if (needFulltext) {
      if (resultFulltext.ok) {
        const fulltext: BlockedUnit[] = await resultFulltext.json();
        fulltext.map((unit) => {
          unit.constraintType = ConstraintType.fulltext;
          data.push(unit);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с полнотекстовым сервисом: ';
        const message = await ErrorHandling.handleError(resultFulltext, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    if (needArchive) {
      if (resultArchive.ok) {
        const archive: BlockedUnit[] = await resultArchive.json();
        archive.map((unit) => {
          unit.constraintType = ConstraintType.archive;
          data.push(unit);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с архивным сервисом: ';
        const message = await ErrorHandling.handleError(resultArchive, ERROR_502_MESSAGE);
        errors += message + '\n';
      }
    }

    okCallback(data);
    if (isError) {
      errorCallback(errors);
    }
  }

  static async fetchAllBlocks(
    blockFilterParams: BlockFilterParams | undefined,
    okCallback: (blocks: Blocks[]) => void,
    errorCallback: (message: string) => void,
  ) {
    let needFulltext = true,
      needAnalytic = true,
      needArchive = true;
    let params = null;
    if (blockFilterParams) {
      if (blockFilterParams.constraintType) {
        needFulltext = blockFilterParams.constraintType.includes(ConstraintType.fulltext);
        needAnalytic = blockFilterParams.constraintType.includes(ConstraintType.analytic);
        needArchive = blockFilterParams.constraintType.includes(ConstraintType.archive);
      }
      if (blockFilterParams.objectType) {
        params = {
          objectType: blockFilterParams.objectType,
        };
      }
      if (blockFilterParams.projects) {
        if (params) {
          params.projectKeys = blockFilterParams.projects.join(',').toString();
        } else {
          params = {
            projectKeys: blockFilterParams.projects.join(',').toString(),
          };
        }
      }
      if (blockFilterParams.subjectType) {
        if (params) {
          params.subjectType = blockFilterParams.subjectType;
        } else {
          params = {
            subjectType: blockFilterParams.subjectType,
          };
        }
      }
    }

    let resultFulltext, resultArchive, resultAnalytic;
    if (needFulltext) resultFulltext = await BackendProvider.request('GET', apiFulltextPath + '/blocking/overview', null, params);
    if (needArchive) resultArchive = await BackendProvider.request('GET', apiArchivePath + '/blocking/overview', null, params);
    if (needAnalytic) resultAnalytic = await BackendProvider.request('GET', apiAnalyticPath + '/blocking/overview', null, params);

    const data: Blocks[] = [];
    let errors = '';
    let isError = false;

    if (needAnalytic) {
      if (resultAnalytic.ok) {
        const analytic: Blocks[] = await resultAnalytic.json();
        analytic.map((block) => {
          block.constraintType = ConstraintType.analytic;
          data.push(block);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с аналитическим сервисом: ';
        const message = await ErrorHandling.handleError(resultAnalytic, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    if (needFulltext) {
      if (resultFulltext.ok) {
        const fulltext: Blocks[] = await resultFulltext.json();
        fulltext.map((block) => {
          block.constraintType = ConstraintType.fulltext;
          data.push(block);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с полнотекстовым сервисом: ';
        const message = await ErrorHandling.handleError(resultFulltext, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    if (needArchive) {
      if (resultArchive.ok) {
        const archive: Blocks[] = await resultArchive.json();
        archive.map((block) => {
          block.constraintType = ConstraintType.archive;
          data.push(block);
        });
      } else {
        isError = true;
        errors += 'Ошибка во время взаимодействия с архивным сервисом: ';
        const message = await ErrorHandling.handleError(resultArchive, ERROR_502_MESSAGE);
        errors += message.message + '\n';
      }
    }

    okCallback(data);
    if (isError) {
      errorCallback(errors);
    }
  }

  static async getBlocksOnObject(
    taskId: number,
    type: ConstraintType,
    okCallback: (blocks: BlockedUnit[]) => void,
    errorCallback: (error: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('GET', apiFulltextPath + `/blocking/index/${taskId}`);
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('GET', apiArchivePath + `/blocking/index/${taskId}`);
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('GET', apiAnalyticPath + `/blocking/index/${taskId}`);
        break;
    }

    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getBlocksOnProject(
    projectShortName: string,
    type: ConstraintType,
    okCallback: (blocks: BlockedUnit[]) => void,
    errorCallback: (error: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('GET', apiFulltextPath + '/blocking/project/' + projectShortName);
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('GET', apiArchivePath + '/blocking/project/' + projectShortName);
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('GET', apiAnalyticPath + '/blocking/project/' + projectShortName);
        break;
    }
    if (result.ok) {
      const data = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async blockSubjectOnObject(
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    description: string,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request(
          'POST',
          isProject
            ? apiFulltextPath + `/blocking/project/${projectId}/subject/${subjectType}/${subjectId}`
            : apiFulltextPath + `/blocking/index/${taskId}/subject/${subjectType}/${subjectId}`,
          null,
          null,
          JSON.stringify({ description: description }),
        );
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request(
          'POST',
          isProject
            ? apiArchivePath + `/blocking/project/${projectId}/subject/${subjectType}/${subjectId}`
            : apiArchivePath + `/blocking/index/${taskId}/subject/${subjectType}/${subjectId}`,
          null,
          null,
          JSON.stringify({ description: description }),
        );
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request(
          'POST',
          isProject
            ? apiAnalyticPath + `/blocking/project/${projectId}/subject/${subjectType}/${subjectId}`
            : apiAnalyticPath + `/blocking/index/${taskId}/subject/${subjectType}/${subjectId}`,
          null,
          null,
          JSON.stringify({ description: description }),
        );
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectId}`);
      errorCallback(message.message);
    }
  }

  static async blockSubject(subjectId: number, subjectType: Unit, type: ConstraintType, description: string, okCallback, errorCallback) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request(
          'POST',
          apiFulltextPath + `/blocking/subject/${subjectType}/${subjectId}`,
          null,
          null,
          JSON.stringify({ description: description }),
        );
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request(
          'POST',
          apiArchivePath + `/blocking/subject/${subjectType}/${subjectId}`,
          null,
          null,
          JSON.stringify({ description: description }),
        );
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request(
          'POST',
          apiAnalyticPath + `/blocking/subject/${subjectType}/${subjectId}`,
          null,
          null,
          JSON.stringify({ description: description }),
        );
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deleteBlockFromUserOnObject(
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    okCallback,
    errorCallback,
  ) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request(
          'DELETE',
          isProject
            ? apiFulltextPath + `/blocking/project/${projectId}/subject/${subjectType}/${subjectId}`
            : apiFulltextPath + `/blocking/index/${taskId}/subject/${subjectType}/${subjectId}`,
        );
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request(
          'DELETE',
          isProject
            ? apiArchivePath + `/blocking/project/${projectId}/subject/${subjectType}/${subjectId}`
            : apiArchivePath + `/blocking/index/${taskId}/subject/${subjectType}/${subjectId}`,
        );
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request(
          'DELETE',
          isProject
            ? apiAnalyticPath + `/blocking/project/${projectId}/subject/${subjectType}/${subjectId}`
            : apiAnalyticPath + `/blocking/index/${taskId}/subject/${subjectType}/${subjectId}`,
        );
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE, ` ${projectId}`);
      errorCallback(message);
    }
  }

  static async unblockSubject(subjectId: number, subjectType: Unit, type: ConstraintType, okCallback, errorCallback) {
    let result;
    switch (type) {
      case ConstraintType.fulltext:
        result = await BackendProvider.request('DELETE', apiFulltextPath + `/blocking/subject/${subjectType}/${subjectId}`);
        break;
      case ConstraintType.archive:
        result = await BackendProvider.request('DELETE', apiArchivePath + `/blocking/subject/${subjectType}/${subjectId}`);
        break;
      case ConstraintType.analytic:
        result = await BackendProvider.request('DELETE', apiAnalyticPath + `/blocking/subject/${subjectType}/${subjectId}`);
        break;
    }
    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message);
    }
  }
}

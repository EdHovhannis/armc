import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import ConstraintService from '../../services/ConstraintService';
import * as notificationActions from '../notification/Actions';
import { Unit } from '../role/Types';

import {
  AnalyticConstraint,
  ArchiveConstraint,
  ClusterConstraint,
  FulltextConstraint,
  ConstraintShort,
  ConstraintType,
  Blocks,
  ProjectConstraint,
  BasicArchiveConstraint,
  BasicAnalyticConstraint,
  BasicFulltextConstraint,
  BlockedUnit,
  OBJECT_TYPE,
  ConstraintFilterParams,
  BlockFilterParams,
} from './Types';

export const setConstraintFilterAction = createStandardAction('@constraint/SET_CONSTRAINT_FILTER')<FilterMenuItem[] | undefined>();
export const setBlockFilterAction = createStandardAction('@constraint/SET_BLOCK_FILTER')<FilterMenuItem[] | undefined>();

export const fetchConstraintAction = createAsyncAction('@constraint/FETCH_ALL_REQ', '@constraint/FETCH_ALL_SUCC', '@constraint/FETCH_ALL_FAIL')<
  void,
  ConstraintShort[],
  string
>();

export const fetchConstraintForProjectAction = createAsyncAction(
  '@constraint/FETCH_FOR_PROJECT_REQ',
  '@constraint/FETCH_FOR_PROJECT_SUCC',
  '@constraint/FETCH_FOR_PROJECT_FAIL',
)<void, ProjectConstraint, string>();

export const fetchConstraintForClusterAction = createAsyncAction(
  '@constraint/FETCH_FOR_CLUSTER_REQ',
  '@constraint/FETCH_FOR_CLUSTER_SUCC',
  '@constraint/FETCH_FOR_CLUSTER_FAIL',
)<void, ClusterConstraint | undefined, string>();

export const fetchConstraintForObjectAction = createAsyncAction(
  '@constraint/FETCH_FOR_CLUSTER_REQ',
  '@constraint/FETCH_FOR_CLUSTER_SUCC',
  '@constraint/FETCH_FOR_CLUSTER_FAIL',
)<void, ArchiveConstraint | FulltextConstraint | AnalyticConstraint, string>();

export const updateConstraintOnObjectAction = createAsyncAction(
  '@constraint/SET_CONSTRAINT_OBJECT_REQ',
  '@constraint/SET_CONSTRAINT_OBJECT_SUCC',
  '@constraint/SET_CONSTRAINT_OBJECT_FAIL',
)<void, void, string>();

export const updateConstraintOnProjectAction = createAsyncAction(
  '@constraint/SET_CONSTRAINT_PROJECT_REQ',
  '@constraint/SET_CONSTRAINT_PROJECT_SUCC',
  '@constraint/SET_CONSTRAINT_PROJECT_FAIL',
)<void, void, string>();

export const clearObjectConstraintAction = createAsyncAction(
  '@constraint/CLEAR_OBJECT_CONSTRAINT_REQ',
  '@constraint/CLEAR_OBJECT_CONSTRAINT_SUCC',
  '@constraint/CLEAR_OBJECT_CONSTRAINT_FAIL',
)<void, void, string>();

export const updateClusterConstraintAction = createAsyncAction(
  '@constraint/UPDATE_CLUSTER_CONSTRAINT_REQ',
  '@constraint/UPDATE_CLUSTER_CONSTRAINT_SUCC',
  '@constraint/UPDATE_CLUSTER_CONSTRAINT_FAIL',
)<void, void, string>();

export const fetchBlocksAction = createAsyncAction(
  '@constraint/FETCH_ALL_BLOCKS_REQ',
  '@constraint/FETCH_ALL_BLOCKS_SUCC',
  '@constraint/FETCH_ALL_BLOCKS_FAIL',
)<void, Blocks[], string>();

export const fetchBlockedUnitsOnProjectAction = createAsyncAction(
  '@constraint/FETCH_BLOCKS_ON_PROJECT_REQ',
  '@constraint/FETCH_BLOCKS_ON_PROJECT_SUCC',
  '@constraint/FETCH_BLOCKS_ON_PROJECT_FAIL',
)<void, BlockedUnit[], string>();

export const fetchBlockedUnitsOnObjectAction = createAsyncAction(
  '@constraint/FETCH_BLOCKS_ON_OBJECT_REQ',
  '@constraint/FETCH_BLOCKS_ON_OBJECT_SUCC',
  '@constraint/FETCH_BLOCKS_ON_OBJECT_FAIL',
)<void, BlockedUnit[], string>();

export const fetchBlockedUsersAction = createAsyncAction(
  '@constraint/FETCH_ALL_BLOCKED_USERS_REQ',
  '@constraint/FETCH_ALL_BLOCKED_USERS_SUCC',
  '@constraint/FETCH_ALL_BLOCKED_USERS_FAIL',
)<void, BlockedUnit[], string>();

export const unblockObjectAction = createAsyncAction(
  '@constraint/UNBLOCK_OBJECT_REQ',
  '@constraint/UNBLOCK_OBJECT_SUCC',
  '@constraint/UNBLOCK_OBJECT_FAIL',
)<void, void, string>();

export const unblockSubjectAction = createAsyncAction(
  '@constraint/UNBLOCK_SUBJECT_REQ',
  '@constraint/UNBLOCK_SUBJECT_SUCC',
  '@constraint/UNBLOCK_SUBJECT_FAIL',
)<void, void, string>();

export const blockObjectAction = createAsyncAction('@constraint/BLOCK_OBJECT_REQ', '@constraint/BLOCK_OBJECT_SUCC', '@constraint/BLOCK_OBJECT_FAIL')<
  void,
  void,
  string
>();

export const blockSubjectAction = createAsyncAction(
  '@constraint/BLOCK_SUBJECT_REQ',
  '@constraint/BLOCK_SUBJECT_SUCC',
  '@constraint/BLOCK_SUBJECT_FAIL',
)<void, void, string>();

export function fetchAllConstraints(constraintFilterParams: ConstraintFilterParams | undefined, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchConstraintAction.request());
    ConstraintService.fetchAllConstraints(
      constraintFilterParams,
      (constraints: ConstraintShort[]) => {
        dispatch(fetchConstraintAction.success(constraints));
        if (okCallback) {
          okCallback(constraints);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchConstraintAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchConstraintForProject(projectShortName: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchConstraintForProjectAction.request());
    ConstraintService.fetchConstraintForProject(
      projectShortName,
      (constraint) => {
        dispatch(fetchConstraintForProjectAction.success(constraint));
        if (okCallback) {
          okCallback(constraint);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchConstraintForProjectAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchConstraintForObject(taskId: number, type: ConstraintType, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchConstraintForObjectAction.request());
    ConstraintService.fetchConstraintForObject(
      taskId,
      type,
      (constraint) => {
        dispatch(fetchConstraintForObjectAction.success(constraint));
        if (okCallback) {
          okCallback(constraint);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          dispatch(notificationActions.error(error));
        }
        dispatch(fetchConstraintForObjectAction.failure(error));
      },
    );
  };
}

export function fetchDefaultConstraint(okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchConstraintForClusterAction.request());
    ConstraintService.fetchConstraintForCluster(
      (constraint) => {
        dispatch(fetchConstraintForClusterAction.success(constraint));
        if (okCallback) {
          okCallback(constraint);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchConstraintForClusterAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchAllBlocks(blockFilterParams: BlockFilterParams | undefined, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchBlocksAction.request());
    ConstraintService.fetchAllBlocks(
      blockFilterParams,
      (blocks) => {
        dispatch(fetchBlocksAction.success(blocks));
        if (okCallback) {
          okCallback(blocks);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchBlocksAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getBlocksOnProject(
  projectShortName: string,
  type: ConstraintType,
  okCallback: (blocks: BlockedUnit[]) => void,
  errorCallback: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(fetchBlockedUnitsOnProjectAction.request());
    ConstraintService.getBlocksOnProject(
      projectShortName,
      type,
      (blocks) => {
        dispatch(fetchBlockedUnitsOnProjectAction.success(blocks));
        if (okCallback) {
          okCallback(blocks);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchBlockedUnitsOnProjectAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function getBlocksOnObject(
  taskId: number,
  type: ConstraintType,
  okCallback: (blocks: BlockedUnit[]) => void,
  errorCallback: (error: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(fetchBlockedUnitsOnObjectAction.request());
    ConstraintService.getBlocksOnObject(
      taskId,
      type,
      (blocks) => {
        dispatch(fetchBlockedUnitsOnObjectAction.success(blocks));
        if (okCallback) {
          okCallback(blocks);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchBlockedUnitsOnObjectAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function fetchAllBlockedUsers(blockFilterParams?: BlockFilterParams | undefined, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchBlockedUsersAction.request());
    ConstraintService.fetchAllBlockedUsers(
      blockFilterParams,
      (units) => {
        dispatch(fetchBlockedUsersAction.success(units));
        if (okCallback) {
          okCallback(units);
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(fetchBlockedUsersAction.failure(error));
        dispatch(notificationActions.error(error));
      },
    );
  };
}

export function deleteBlockFromUserOnObject(
  subjectId: number,
  subjectType: Unit,
  projectId: number,
  taskId: number,
  isProject: boolean,
  type: ConstraintType,
  okCallback,
  errorCallback,
) {
  return (dispatch, getState) => {
    dispatch(unblockObjectAction.request());
    ConstraintService.deleteBlockFromUserOnObject(
      subjectId,
      subjectType,
      projectId,
      taskId,
      isProject,
      type,
      () => {
        dispatch(unblockObjectAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(unblockObjectAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function unblockSubject(subjectId: number, subjectType: Unit, type: ConstraintType, okCallback, errorCallback) {
  return (dispatch, getState) => {
    dispatch(unblockSubjectAction.request());
    ConstraintService.unblockSubject(
      subjectId,
      subjectType,
      type,
      () => {
        dispatch(unblockSubjectAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(unblockSubjectAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

// export function unblockUser(userId: number, okCallback, errorCallback) {
//   return (dispatch, getState) => {
//     dispatch(unblockUserAction.request());
//     ConstraintService.unblockUser(userId, () => {
//       dispatch(unblockUserAction.success());
//       if (okCallback) {
//         okCallback()
//       }
//     }, error => {
//       if (errorCallback) {
//         errorCallback(error);
//       }
//       dispatch(unblockUserAction.failure(error));
//       // dispatch(notificationActions.error(error))
//     });
//   }
// }

export function updateClusterConstraint(
  constraint: BasicArchiveConstraint | BasicAnalyticConstraint | BasicFulltextConstraint,
  type: ConstraintType,
  okCallback: () => void,
  errorCallback: (message: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(updateClusterConstraintAction.request());
    ConstraintService.updateClusterConstraint(
      constraint,
      type,
      () => {
        dispatch(updateClusterConstraintAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(updateClusterConstraintAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function updateConstraintOnObject(
  taskId: number,
  type: ConstraintType,
  patch: any,
  okCallback: () => void,
  errorCallback: (message: string) => void,
) {
  return (dispatch, getState) => {
    dispatch(updateConstraintOnObjectAction.request());
    ConstraintService.updateConstraintOnObject(
      taskId,
      type,
      patch,
      () => {
        dispatch(updateConstraintOnObjectAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(updateConstraintOnObjectAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function updateConstraintOnProject(
  projectShortName: string,
  type: ConstraintType,
  patch: any,
  okCallback: () => void,
  errorCallback: (message: string) => void,
) {
  //updateConstraintOnProjectAction
  return (dispatch, getState) => {
    dispatch(updateConstraintOnProjectAction.request());
    ConstraintService.updateConstraintOnProject(
      projectShortName,
      type,
      patch,
      () => {
        dispatch(updateConstraintOnProjectAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(updateConstraintOnProjectAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function blockSubject(subjectId: number, subjectType: Unit, type: ConstraintType, description: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(blockSubjectAction.request());
    ConstraintService.blockSubject(
      subjectId,
      subjectType,
      type,
      description,
      () => {
        dispatch(blockSubjectAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(blockSubjectAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function blockSubjectOnObject(
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
  return (dispatch, getState) => {
    dispatch(blockObjectAction.request());
    ConstraintService.blockSubjectOnObject(
      subjectId,
      subjectType,
      projectId,
      taskId,
      isProject,
      type,
      description,
      () => {
        dispatch(blockObjectAction.success());
        dispatch(notificationActions.success('Блокировка создана успешно'));
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(blockObjectAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function clearObjectConstraint(objectId: number, objectType: OBJECT_TYPE, type: ConstraintType, okCallback, errorCallback) {
  return (dispatch, getState) => {
    dispatch(clearObjectConstraintAction.request());
    ConstraintService.clearObjectConstraint(
      objectId,
      objectType,
      type,
      () => {
        dispatch(clearObjectConstraintAction.success());
        if (okCallback) {
          okCallback();
        }
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
        dispatch(clearObjectConstraintAction.failure(error));
        // dispatch(notificationActions.error(error))
      },
    );
  };
}

export function setConstraintFilter(filter: FilterMenuItem[] | undefined) {
  return (dispatch, getState) => {
    dispatch(setConstraintFilterAction(filter));
  };
}

export function setBlockFilter(filter: FilterMenuItem[] | undefined) {
  return (dispatch, getState) => {
    dispatch(setBlockFilterAction(filter));
  };
}

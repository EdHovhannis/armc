import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { createAsyncAction, createStandardAction } from 'typesafe-actions';

import { FilterMenuItem } from '../../components/utils/FilterMenu';
import LookupService, { PAPA_CONFIG } from '../../services/LookupService';
import ProjectService from '../../services/ProjectService';
import RoleService from '../../services/RoleService';
import { User } from '../auth/Types';
import * as notificationActions from '../notification/Actions';
import { Resource, Role } from '../role/Types';

import { DictionaryWithRole } from './Reducer';
import { Dictionary, DictionaryQuota, Lookup, LookupQuota, ShortInfo } from './Types';

export const setDictionaryFilterAction = createStandardAction('@lookup/SET_FILTER')<FilterMenuItem[] | undefined>();

export const createLookupAction = createAsyncAction('@lookup/SUBMIT_REQ', '@lookup/SUBMIT_SUCC', '@lookup/SUBMIT_FAIL')<void, void, string>();

export const updateLookupAction = createAsyncAction('@lookup/UPDATE_REQ', '@lookup/UPDATE_SUCC', '@lookup/UPDATE_FAIL')<void, void, string>();

export const fetchLookupAction = createAsyncAction('@lookup/LOOKUP_REQ', '@lookup/LOOKUP_SUCC', '@lookup/LOOKUP_FAIL')<void, Lookup, string>();

export const deleteLookupAction = createAsyncAction('@lookup/DELETE_REQ', '@lookup/DELETE_SUCC', '@lookup/DELETE_FAIL')<void, void, string>();

export const listLookupsAction = createAsyncAction('@lookup/LIST_LOOKUP_REQ', '@lookup/LIST_LOOKUP_SUCC', '@lookup/LIST_LOOKUP_FAIL')<
  void,
  ShortInfo[],
  string
>();

export const listDictionaryLookupsAction = createAsyncAction(
  '@lookup/LIST_DICTIONARY_LOOKUP_REQ',
  '@lookup/LIST_DICTIONARY_LOOKUP_SUCC',
  '@lookup/LIST_DICTIONARY_LOOKUP_FAIL',
)<void, ShortInfo[], string>();

export const createLookupQuotaAction = createAsyncAction(
  '@lookup/SUBMIT_LOOKUP_QUOTA_REQ',
  '@lookup/SUBMIT_LOOKUP_QUOTA_SUCC',
  '@lookup/SUBMIT_LOOKUP_QUOTA_FAIL',
)<void, void, string>();

export const getDictionaryIdAction = createAsyncAction(
  '@dictionary/GET_DICTIONARY_ID_REQ',
  '@dictionary/GET_DICTIONARY_IDA_SUCC',
  '@dictionary/GET_DICTIONARY_ID_FAIL',
)<void, number, string>();

export const fetchLookupQuotaAction = createAsyncAction('@lookup/LOOKUP_QUOTA_REQ', '@lookup/LOOKUP_QUOTA_SUCC', '@lookup/LOOKUP_QUOTA_FAIL')<
  void,
  LookupQuota,
  string
>();

export const listLookupQuotasAction = createAsyncAction(
  '@lookup/LIST_LOOKUP_QUOTA_REQ',
  '@lookup/LIST_LOOKUP_QUOTA_SUCC',
  '@lookup/LIST_LOOKUP_QUOTA_FAIL',
)<void, LookupQuota[], string>();

export const createDictionaryQuotaAction = createAsyncAction(
  '@lookup/SUBMIT_DICTIONARY_QUOTA_REQ',
  '@lookup/SUBMIT_DICTIONARY_QUOTA_SUCC',
  '@lookup/SUBMIT_DICTIONARY_QUOTA_FAIL',
)<void, void, string>();

export const fetchDictionaryQuotaAction = createAsyncAction(
  '@lookup/DICTIONARY_QUOTA_REQ',
  '@lookup/DICTIONARY_QUOTA_SUCC',
  '@lookup/DICTIONARY_QUOTA_FAIL',
)<void, DictionaryQuota, string>();

export const listDictionaryQuotasAction = createAsyncAction(
  '@lookup/LIST_DICTIONARY_QUOTA_REQ',
  '@lookup/LIST_DICTIONARY_QUOTA_SUCC',
  '@lookup/LIST_DICTIONARY_QUOTA_FAIL',
)<void, DictionaryQuota[], string>();

export const createDictionaryAction = createAsyncAction('@lookup/CREATE_REQ', '@lookup/CREATE_SUCC', '@lookup/CREATE_FAIL')<void, void, string>();

export const updateDictionaryAction = createAsyncAction('@lookup/UPDATE_REQ', '@lookup/UPDATE_SUCC', '@lookup/UPDATE_FAIL')<void, void, string>();

export const deleteDictionaryAction = createAsyncAction('@lookup/DELETE_REQ', '@lookup/DELETE_SUCC', '@lookup/DELETE_FAIL')<void, void, string>();

export const listDictionariesAction = createAsyncAction(
  '@lookup/LIST_DICTIONARY_REQ',
  '@lookup/LIST_DICTIONARY_SUCC',
  '@lookup/LIST_DICTIONARY_FAIL',
)<void, Dictionary[], string>();

export const listDictionariesWithRolesAction = createAsyncAction(
  '@lookup/LIST_DICTIONARY_ROLES_REQ',
  '@lookup/LIST_DICTIONARY_ROLES_SUCC',
  '@lookup/LIST_DICTIONARY_ROLES_FAIL',
)<void, DictionaryWithRole[], string>();

export const fetchDictionaryAction = createAsyncAction('@lookup/DICTIONARY_REQ', '@lookup/DICTIONARY_SUCC', '@lookup/DICTIONARY_FAIL')<
  void,
  any[],
  string
>();
export const fetchDictionaryOrderAction = createAsyncAction('@lookup/DICTIONARY_REQ', '@lookup/DICTIONARY_ORDER_SUCC', '@lookup/DICTIONARY_FAIL')<
  void,
  string[],
  string
>();

export function createLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(createLookupAction.request());
    LookupService.createLookup(
      projectShortName,
      name,
      zone,
      lookup,
      () => {
        dispatch(createLookupAction.success());
        dispatch(notificationActions.success('Lookup ' + name + ' успешно создан.'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(createLookupAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function getLookup(projectShortName: string, name: string, zone: string, successCallback: (lookup: Lookup) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchLookupAction.request());
    LookupService.getLookup(
      projectShortName,
      name,
      zone,
      (lookup) => {
        dispatch(fetchLookupAction.success(lookup));
        // dispatch(notificationActions.success("Lookup " + name + " успешно создан."));
        successCallback(lookup);
      },
      (errorMessage) => {
        dispatch(fetchLookupAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function updateLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(updateLookupAction.request());
    LookupService.updateLookup(
      projectShortName,
      name,
      zone,
      lookup,
      () => {
        dispatch(updateLookupAction.success());
        dispatch(notificationActions.success('Lookup ' + name + ' успешно обновлен.'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(updateLookupAction.failure(errorMessage));
        dispatch(notificationActions.error(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
      },
    );
  };
}

export function deleteLookup(projectShortName: string, name: string, zone: string, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(deleteLookupAction.request());
    LookupService.deleteLookup(
      projectShortName,
      name,
      zone,
      () => {
        dispatch(deleteLookupAction.success());
        dispatch(notificationActions.success('Lookup ' + name + ' успешно удален.'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(deleteLookupAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function fetchListLookups(okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(listLookupsAction.request());
    LookupService.fetchAllLookups(
      (tasks) => {
        dispatch(listLookupsAction.success(tasks));
        if (okCallback) okCallback(tasks);
      },
      (errorMessage: any) => {
        dispatch(listLookupsAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }));
      },
    );
  };
}

export function fetchListDictionaryLookups(projectShortName: string, dictionary: string, zone: string, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(listDictionaryLookupsAction.request());
    LookupService.getAllDictionaryLookups(
      projectShortName,
      dictionary,
      zone,
      (tasks) => {
        dispatch(listDictionaryLookupsAction.success(tasks));
        if (okCallback) okCallback(tasks);
      },
      (errorMessage: any) => {
        dispatch(listDictionaryLookupsAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }));
      },
    );
  };
}

export function createLookupQuota(projectShortName: string, maxCount: number, successCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(createLookupQuotaAction.request());
    LookupService.createLookupQuota(
      projectShortName,
      maxCount,
      () => {
        dispatch(createLookupQuotaAction.success());
        if (successCallback) successCallback();
      },
      (errorMessage) => {
        dispatch(createLookupQuotaAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function getLookupQuota(projectShortName: string, successCallback?: (lookupQuota: LookupQuota) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchLookupQuotaAction.request());
    LookupService.getLookupQuota(
      projectShortName,
      (lookupQuota) => {
        dispatch(fetchLookupQuotaAction.success(lookupQuota));
        // dispatch(notificationActions.success("Lookup " + name + " успешно создан."));
        if (successCallback) successCallback(lookupQuota);
      },
      (errorMessage) => {
        dispatch(fetchLookupQuotaAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function fetchListLookupQuotas(okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(listLookupQuotasAction.request());
    LookupService.getListLookupQuota(
      (quotas) => {
        dispatch(listLookupQuotasAction.success(quotas));
        if (okCallback) okCallback(quotas);
      },
      (errorMessage) => {
        dispatch(listLookupQuotasAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error('Ошибка при получении квоты на lookup: ' + errorMessage.message));
      },
    );
  };
}

export function createDictionary(projectShortName: string, name: string, zone: string, data: string, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(createDictionaryAction.request());
    LookupService.createDictionary(
      projectShortName,
      name,
      zone,
      data,
      () => {
        dispatch(createDictionaryAction.success());
        dispatch(notificationActions.success('Справочник ' + name + ' успешно создан.'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(createDictionaryAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function updateDictionary(projectShortName: string, name: string, zone: string, data: string, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(updateDictionaryAction.request());
    LookupService.updateDictionary(
      projectShortName,
      name,
      zone,
      data,
      () => {
        dispatch(updateDictionaryAction.success());
        dispatch(notificationActions.success('Справочник ' + name + ' успешно обновлен.'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(updateLookupAction.failure(errorMessage));
        dispatch(notificationActions.error(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
      },
    );
  };
}

export function deleteDictionary(projectShortName: string, name: string, zone: string, successCallback, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(deleteDictionaryAction.request());
    LookupService.deleteDictionary(
      projectShortName,
      name,
      zone,
      () => {
        dispatch(deleteDictionaryAction.success());
        dispatch(notificationActions.success('Справочник ' + name + ' успешно удален.'));
        successCallback();
      },
      (errorMessage) => {
        dispatch(deleteDictionaryAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function getDictionary(projectShortName: string, name: string, zone: string, successCallback?: (data: any[]) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchDictionaryAction.request());
    LookupService.getDictionary(
      projectShortName,
      name,
      zone,
      true,
      (data, order) => {
        dispatch(fetchDictionaryAction.success(data));
        dispatch(fetchDictionaryOrderAction.success(order));
        if (successCallback) successCallback(data);
      },
      (errorMessage) => {
        dispatch(fetchDictionaryAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function downloadDictionary(projectShortName: string, name: string, zone: string) {
  return (dispatch, getState) => {
    LookupService.getDictionary(
      projectShortName,
      name,
      zone,
      false,
      (data: any[]) => {
        data = Papa.unparse(data, PAPA_CONFIG);
        const blob = new Blob([data], { type: 'text/csv' });
        saveAs(blob, projectShortName + '_' + name + '_' + zone + '.csv');
        dispatch(notificationActions.success('Справочник ' + projectShortName + '/' + name + '/' + zone + ' сохранен'));
      },
      (errorMessage) => {
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function fetchListDictionary(okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(listDictionariesAction.request());
    LookupService.fetchAllDictionary(
      (dictionaries) => {
        dispatch(listDictionariesAction.success(dictionaries));
        if (okCallback) okCallback(dictionaries);
      },
      (errorMessage: any) => {
        dispatch(listDictionariesAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }));
      },
    );
  };
}

export function fetchListDictionaryWithRoles(user: User, okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(listDictionariesWithRolesAction.request());
    const dictCopy: DictionaryWithRole[] = [];
    LookupService.fetchAllDictionary(
      (dictionaries) => {
        if (dictionaries.length === 0) {
          dispatch(listDictionariesWithRolesAction.success(dictCopy));
          if (okCallback) okCallback(dictCopy);
        } else {
          dictionaries.map((dictionary, ind) => {
            dictionary.instances.map((instance) => {
              LookupService.getDictionaryId(
                dictionary.project,
                dictionary.name,
                instance.zoneId,
                (id) => {
                  ProjectService.fetchProjectByName(
                    dictionary.project,
                    (project) => {
                      RoleService.checkUserHasRoleForResourceWithParent(
                        user.id,
                        Resource.DICTIONARY,
                        id,
                        Resource.PROJECT,
                        project.id,
                        Role.DICTIONARY_EDITOR,
                        (isRole) => {
                          dictionary['canEdit'] = isRole || user.admin;
                          dictCopy.push(dictionary);
                          if (dictionaries.length === dictCopy.length) {
                            dispatch(listDictionariesWithRolesAction.success(dictCopy));
                          }
                        },
                        (errorMessage: any) => {
                          dispatch(listDictionariesWithRolesAction.failure(errorMessage));
                          if (errorCallback) errorCallback(errorMessage);
                          dispatch(
                            notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }),
                          );
                        },
                      );
                    },
                    (errorMessage: any) => {
                      dispatch(listDictionariesWithRolesAction.failure(errorMessage));
                      if (errorCallback) errorCallback(errorMessage);
                      dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }));
                    },
                  );
                },
                (errorMessage: any) => {
                  dispatch(listDictionariesWithRolesAction.failure(errorMessage));
                  if (errorCallback) errorCallback(errorMessage);
                  dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }));
                },
              );
            });
          });
          if (okCallback) okCallback(dictCopy);
        }
      },
      (errorMessage: any) => {
        dispatch(listDictionariesWithRolesAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error({ ...errorMessage, message: `Ошибка при получении всех lookup: ${errorMessage.message}` }));
      },
    );
  };
}

export function createDictionaryQuota(projectShortName: string, maxSize: number, successCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(createDictionaryQuotaAction.request());
    LookupService.createDictionaryQuota(
      projectShortName,
      maxSize,
      () => {
        dispatch(createDictionaryQuotaAction.success());
        if (successCallback) successCallback();
      },
      (errorMessage) => {
        dispatch(createDictionaryQuotaAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(fetchDictionaryQuotaAction.request());
    LookupService.getDictionaryQuota(
      projectShortName,
      (quota) => {
        dispatch(fetchDictionaryQuotaAction.success(quota));
        // dispatch(notificationActions.success("Lookup " + name + " успешно создан."));
        if (successCallback) successCallback(quota);
      },
      (errorMessage) => {
        dispatch(fetchDictionaryQuotaAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        // dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function getDictionaryId(projectShortName: string, name: string, zone: string, successCallback?: (id: number) => void, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(getDictionaryIdAction.request());
    LookupService.getDictionaryId(
      projectShortName,
      name,
      zone,
      (id) => {
        dispatch(getDictionaryIdAction.success(id));
        // dispatch(notificationActions.success("Lookup " + name + " успешно создан."));
        if (successCallback) successCallback(id);
      },
      (errorMessage) => {
        dispatch(getDictionaryIdAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error(errorMessage));
      },
    );
  };
}

export function fetchListDictionaryQuotas(okCallback?, errorCallback?) {
  return (dispatch, getState) => {
    dispatch(listDictionaryQuotasAction.request());
    LookupService.getListDictionaryQuota(
      (quotas) => {
        dispatch(listDictionaryQuotasAction.success(quotas));
        if (okCallback) okCallback(quotas);
      },
      (errorMessage) => {
        dispatch(listDictionaryQuotasAction.failure(errorMessage));
        if (errorCallback) errorCallback(errorMessage);
        dispatch(notificationActions.error('Ошибка при получении квоты на справочники: ' + errorMessage.message));
      },
    );
  };
}

export function setDictionaryFilter(filter: FilterMenuItem[] | undefined) {
  return (dispatch, getState) => {
    dispatch(setDictionaryFilterAction(filter));
  };
}

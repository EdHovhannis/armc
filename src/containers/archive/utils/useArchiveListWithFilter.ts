import { debounce } from 'lodash';

import { COLUMN_TYPE, FilterMenuItem } from '../../../components/utils/FilterMenu';
import { ShortArchiveTaskWithRole } from '../../../store/archive/Actions';
import { ArchiveTaskInstanceStatus, ArchiveTaskRequestStatus } from '../../../store/archive/Types';
import { Utils } from '../../../utils/Utils';

const extractInstanceIds = (archives: ShortArchiveTaskWithRole[]): string[] => {
  return archives.reduce((acc, archive) => {
    return acc.concat(archive.instancesIds || []);
  }, [] as string[]);
};

type SignalOrCallback = AbortSignal | ((err: any) => void);

// получение всех статусов по всем архивам для отображения в фильтре (1 поток),
// для получения статусов на текущей странице (2й поток)
export const fetchArhiveStatuses = (
  archivesList: ShortArchiveTaskWithRole[],
  isPagination: boolean,
  paginationAbortController: AbortController | null,
  fetchArchiveTasksInstanceStatuses: (ids: string[], signal?: SignalOrCallback | undefined, callBack?: (err: any) => void) => void,
  displayError: (error: any) => void,
) => {
  // Отмена предыдущего запроса пагинации
  if (paginationAbortController && isPagination) {
    paginationAbortController.abort();
  }

  // получить все архивы
  const archives = archivesList;
  // собираем все Id instances, чтобы проще получать доступ к элементам archiveTaskInstances Map в Redux
  const ids = extractInstanceIds(archives);

  if (isPagination) {
    return fetchArchiveTasksInstanceStatuses(ids, paginationAbortController?.signal, (error) => {
      displayError(error);
    });
  } else {
    // получить статусы по всем архивам и добавить их redux
    return fetchArchiveTasksInstanceStatuses(ids, (error) => {
      displayError(error);
    });
  }
};
const getArchivesWithFilter = (filter: FilterMenuItem[] | undefined, archives: ShortArchiveTaskWithRole[]): ShortArchiveTaskWithRole[] => {
  if (filter) {
    let tmpArchives: ShortArchiveTaskWithRole[] = archives;
    filter
      .filter((filter) => filter.field !== 'label')
      .map((filter) => {
        tmpArchives = Utils.isMeetsConditionsArchive(filter, tmpArchives);
      });
    return tmpArchives;
  } else {
    return archives;
  }
};

const checkMetaWithFilter = (
  filter: FilterMenuItem[] | undefined,
  archive: ShortArchiveTaskWithRole,
  statuses: Map<string, ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus>,
): boolean => {
  let res = true;
  if (filter) {
    filter
      .filter((filt) => filt.field_type === COLUMN_TYPE.OTHER)
      .map((filter) => {
        res = res && Utils.isMeetsConditionsArchiveMeta(filter, archive, statuses);
      });
    return res;
  } else {
    return true;
  }
};

// Debounced функция для запроса статусов при поиске
const debouncedFetchStatuses = debounce(
  (filteredArchives, isPagination, paginationAbortController, fetchArchiveTasksInstanceStatuses, displayError) => {
    fetchArhiveStatuses(filteredArchives, isPagination, paginationAbortController, fetchArchiveTasksInstanceStatuses, displayError);
  },
  500,
);

export const useArchiveListWithFilter = (
  archivesProps: ShortArchiveTaskWithRole[] | undefined,
  filterState: FilterMenuItem[] | undefined,
  nameFilterState: string | undefined,
  setState: (state: any) => void,
  isAdmin: boolean,
  pageState: number,
  rowsPerPageState: number,
  statuses: Map<string, ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus>,
  paginationAbortController: AbortController | null,
  fetchArchiveTasksInstanceStatuses: (id: any) => void,
  displayError: (error: any) => void,
  isPagination = false,
  isSearchChange = false, // Новый параметр: true, если изменение связано с поиском
) => {
  // Проверяем, что данные загружены
  if (!archivesProps || archivesProps.length === 0) {
    return;
  }

  const archives = getArchivesWithFilter(filterState, archivesProps)
    .filter((archive) => {
      if (!nameFilterState) {
        return true;
      }
      const toLowerNameFilter = nameFilterState.toLowerCase();
      return archive.name.toLowerCase().includes(toLowerNameFilter) || archive.project.toLowerCase().includes(toLowerNameFilter);
    })
    .filter((archive) => checkMetaWithFilter(filterState, archive, statuses)); // Используем filterState, не filterProps

  setState({
    listOfArchives: archives,
  });
  return archives;
};

import * as React from 'react';
import { connect } from 'react-redux';

import DictionaryOverview from '../../components/lookup/DictionaryOverview';
import { FilterMenuItem } from '../../components/utils/FilterMenu';
import { Loader } from '../../components/utils/Loader';
import * as authSelectors from '../../store/auth/Reducer';
import { authType } from '../../store/auth/Reducer';
import { User } from '../../store/auth/Types';
import * as lookupActions from '../../store/lookup/Actions';
import * as lookupSelectors from '../../store/lookup/Reducer';
import { Dictionary } from '../../store/lookup/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';

type DictionaryViewProps = {
  dictionaries: Dictionary[];
  projects: Project[];
  zone: Zone;
  isAdmin: boolean;
  isLoading: boolean;
  user: User;
  filter: FilterMenuItem[] | undefined;
  authType: string;
  editableProjects: EditableProject[];
} & typeof mapDispatchToProps;

const DictionaryView: React.FC<DictionaryViewProps> = ({
  dictionaries,
  projects,
  zone,
  isAdmin,
  isLoading,
  user,
  filter,
  authType,
  downloadDictionary,
  createDictionary,
  updateDictionary,
  deleteDictionary,
  getDictionaryQuota,
  getDictionaryId,
  fetchListDictionary,
  fetchAllProjects,
  fetchZones,
  setDictionaryFilter,
  displayError,
  editableProjects,
}) => {
  React.useEffect(() => {
    fetchZones(); // Фетчит зоны
    fetchListDictionary(); // Получаем список словарей
    fetchAllProjects(); // Загружаем проекты
  }, []);

  if (isLoading) return <Loader />;

  return (
    <React.Fragment>
      <DictionaryOverview
        filter={filter}
        setDictionaryFilter={setDictionaryFilter}
        getDictionaryQuota={getDictionaryQuota}
        user={user}
        isAdmin={isAdmin}
        isLegacyMode={authType === 'legacy'}
        downloadDictionary={downloadDictionary}
        displayError={displayError}
        dictionaries={dictionaries}
        projects={projects}
        zone={zone}
        createDictionary={createDictionary}
        updateDictionary={updateDictionary}
        deleteDictionary={deleteDictionary}
        getDictionaryId={getDictionaryId}
        fetchListDictionary={fetchListDictionary}
        editableProjects={editableProjects}
      />
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    dictionaries: lookupSelectors.getDictionaries(state) || [],
    projects: projectSelectors.getProjects(state),
    zone: zoneSelectors.getZones(state),
    isAdmin: authSelectors.isAdmin(state),
    authType: authType(state),
    isLoading: lookupSelectors.isLoading(state),
    user: authSelectors.user(state),
    filter: lookupSelectors.getDictionaryFilter(state),
  };
}

const mapDispatchToProps = {
  downloadDictionary: lookupActions.downloadDictionary,
  createDictionary: lookupActions.createDictionary,
  updateDictionary: lookupActions.updateDictionary,
  deleteDictionary: lookupActions.deleteDictionary,
  getDictionaryQuota: lookupActions.getDictionaryQuota,
  fetchAllProjects: projectActions.fetchAllProjects,
  getDictionaryId: lookupActions.getDictionaryId,
  fetchListDictionary: lookupActions.fetchListDictionary,
  fetchZones: zoneActions.fetchAllZone,
  setDictionaryFilter: lookupActions.setDictionaryFilter,
  displayError: (msg) => notificationActions.error(msg),
};

export default connect(mapStateToProps, mapDispatchToProps)(DictionaryView);

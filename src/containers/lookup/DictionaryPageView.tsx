import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router';

import { CreateDictionaryPage } from '../../components/lookup/CreateDictionaryPage';
import DictionaryPage from '../../components/lookup/DictionaryPage';
import { Loader } from '../../components/utils/Loader';
import { withNavigation, WithNavigationProps } from '../../components/utils/withNavigation';
import * as authSelectors from '../../store/auth/Reducer';
import { User } from '../../store/auth/Types';
import * as lookupActions from '../../store/lookup/Actions';
import * as lookupSelectors from '../../store/lookup/Reducer';
import { Dictionary, DictionaryQuota, Lookup, ShortInfo } from '../../store/lookup/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';

export enum TaskType {
  new,
  view,
}

export interface DictionaryPageViewDispatchProps {
  fetchProjects(): any;

  fetchZones(fetchedCallback?: (zone: Zone) => void): any;

  fetchAllProjects(fetchedCallback?: (projects: Array<Project>) => void): any;

  getDictionaryId(projectShortName: string, name: string, zone: string, successCallback?: (id: number) => void, errorCallback?): any;

  getDictionary(projectShortName: string, name: string, zone: string, successCallback?: (data: any[]) => void, errorCallback?): any;

  fetchListDictionary(): any;

  createLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?): any;

  deleteLookup(projectShortName: string, name: string, zone: string, successCallback, errorCallback?): any;

  fetchListLookups(okCallback?, errorCallback?): any;

  fetchListDictionaryLookups(projectShortName: string, dictionary: string, zone: string, okCallback?, errorCallback?): any;

  getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?): any;

  updateLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?): any;

  getLookup(projectShortName: string, name: string, zone: string, successCallback: (lookup: Lookup) => void, errorCallback?): any;

  displayError(message: string): any;

  displaySuccess(message: string): any;
  dictionaryOrder: string[];
}

export interface DictionaryPageViewProps {
  isAdmin: boolean;
  user: User | undefined;
  dictionary: any[];
  projects: Project[];
  lookups: ShortInfo[];
  dictionaries: Dictionary[];
  currentLookup?: Lookup;
  dictionaryLookups: ShortInfo[];
  isLoading: boolean;
  zone: Zone;
  dictionaryOrder: string[];
}

export interface DictionaryPageViewExtProps extends DictionaryPageViewProps {
  editableProjects: EditableProject[];
}

export interface DictionaryPageViewStat {
  type: TaskType;
  name: string;
  isDictionaryEditor?: boolean;
  isLookupManager?: boolean;
  openLookupDialog?: boolean;
  selectedLookup?: ShortInfo;
  editLookup?: boolean;
}

class DictionaryPageView extends React.Component<
  DictionaryPageViewDispatchProps & DictionaryPageViewExtProps & WithNavigationProps,
  DictionaryPageViewStat
> {
  constructor(props) {
    super(props);
    autoBind(this);

    const name = this.props.params?.name;

    if (name === 'new') {
      this.state = { type: TaskType.new, name: '' };
    } else {
      this.state = { type: TaskType.view, name: name.toString() };
    }
  }

  componentDidMount() {
    this.props.fetchZones();
    this.props.fetchAllProjects();
    this.props.fetchListLookups();
    this.props.fetchListDictionary();
    const name = this.props.params?.name;
    const projectShortName = this.props.location?.state?.detail;
    const zone = this.props.location?.state?.zone;

    if (name !== 'new') {
      this.props.fetchProjects();
      this.props.getDictionary(projectShortName, name, zone);
      this.props.fetchListDictionaryLookups(projectShortName, name, zone);
      this.props.getDictionaryId(projectShortName, name, zone, (id) => {
        const dictionary = this.props.dictionaries.find((d) => d.id === id);
        this.setState((prev) => ({
          ...prev,
          isDictionaryEditor: dictionary?.editable || false,
          isLookupManager: dictionary?.canCreateLookup || false,
        }));
      });
    }
  }

  render() {
    if (this.props.isLoading) return <Loader />;

    return (
      <React.Fragment>
        {this.state.type === TaskType.new ? (
          <CreateDictionaryPage
            getDictionaryQuota={this.props.getDictionaryQuota}
            projects={this.props.projects}
            editableProjects={this.props.editableProjects}
            zones={this.props.zone}
            displayError={this.props.displayError}
            displaySuccess={this.props.displaySuccess}
            redirect={() => {
              this.props.navigate('/dictionary');
            }}
          />
        ) : (
          <DictionaryPage
            editableProjects={this.props.editableProjects}
            isDictionaryEditor={this.state.isDictionaryEditor || this.props.isAdmin}
            isLookupManager={this.state.isLookupManager || this.props.isAdmin}
            getDictionary={this.props.getDictionary}
            displaySuccess={this.props.displaySuccess}
            editLookup={this.state.editLookup || false}
            editLookupChanged={(editLookup) => {
              this.setState({ editLookup: editLookup });
            }}
            currentLookup={this.props.currentLookup}
            selectedLookup={this.state.selectedLookup}
            selectedLookupChanged={(selectedLookup) => {
              this.setState({ selectedLookup: selectedLookup });
            }}
            getLookup={this.props.getLookup}
            updateLookup={this.props.updateLookup}
            lookupMenu={this.state.openLookupDialog}
            lookupMenuChanged={(lookupMenu) => {
              this.setState({ openLookupDialog: lookupMenu });
            }}
            lookups={this.props.dictionaryLookups}
            dictionary={this.props.dictionary}
            deleteLookup={this.props.deleteLookup}
            fetchListDictionaryLookups={this.props.fetchListDictionaryLookups}
            createLookup={this.props.createLookup}
            displayError={this.props.displayError}
            name={this.state.name}
            zone={this.props.location?.state?.zone}
            projects={this.props.projects}
            projectShortName={this.props.location?.state?.detail}
            currentDictionaryOrder={this.props.dictionaryOrder}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): DictionaryPageViewProps {
  return {
    projects: projectSelectors.getProjects(state),
    user: authSelectors.user(state),
    currentLookup: lookupSelectors.getLookup(state),
    lookups: lookupSelectors.getLookups(state) || [],
    dictionaries: lookupSelectors.getDictionaries(state) || [],
    dictionaryLookups: lookupSelectors.getDictionaryLookups(state),
    isLoading: lookupSelectors.isLoading(state),
    dictionary: lookupSelectors.getDictionary(state) || [],
    dictionaryOrder: lookupSelectors.getDictionaryOrder(state) || [],
    isAdmin: authSelectors.isAdmin(state),
    zone: zoneSelectors.getZones(state),
  };
}

function mapDispatchToProps(dispatch): DictionaryPageViewDispatchProps {
  return {
    fetchProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    fetchZones(fetchedCallback?: (zone: Zone) => void): any {
      dispatch(zoneActions.fetchAllZone(fetchedCallback));
    },
    fetchAllProjects(fetchedCallback?: (projects: Array<Project>) => void): any {
      dispatch(projectActions.fetchAllProjects(fetchedCallback));
    },
    fetchListDictionaryLookups(projectShortName: string, dictionary: string, zone: string, okCallback?, errorCallback?) {
      dispatch(lookupActions.fetchListDictionaryLookups(projectShortName, dictionary, zone, okCallback, errorCallback));
    },
    fetchListDictionary() {
      dispatch(lookupActions.fetchListDictionary());
    },
    createLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?): any {
      dispatch(lookupActions.createLookup(projectShortName, name, zone, lookup, successCallback, errorCallback));
    },
    getDictionaryId(projectShortName: string, name: string, zone: string, successCallback?: (id: number) => void, errorCallback?): any {
      dispatch(lookupActions.getDictionaryId(projectShortName, name, zone, successCallback, errorCallback));
    },
    fetchListLookups(okCallback?, errorCallback?): any {
      dispatch(lookupActions.fetchListLookups(okCallback, errorCallback));
    },
    getDictionary(
      projectShortName: string,
      name: string,
      zone: string,
      successCallback?: (data: any[], order: string[]) => void,
      errorCallback?,
    ): any {
      dispatch(lookupActions.getDictionary(projectShortName, name, zone, successCallback, errorCallback));
    },
    updateLookup(projectShortName: string, name: string, zone: string, lookup: Lookup, successCallback, errorCallback?): any {
      dispatch(lookupActions.updateLookup(projectShortName, name, zone, lookup, successCallback, errorCallback));
    },
    getLookup(projectShortName: string, name: string, zone: string, successCallback: (lookup: Lookup) => void, errorCallback?): any {
      dispatch(lookupActions.getLookup(projectShortName, name, zone, successCallback, errorCallback));
    },
    deleteLookup(projectShortName: string, name: string, zone: string, successCallback, errorCallback?): any {
      dispatch(lookupActions.deleteLookup(projectShortName, name, zone, successCallback, errorCallback));
    },
    getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?): any {
      dispatch(lookupActions.getDictionaryQuota(projectShortName, successCallback, errorCallback));
    },
    displayError(message: string): any {
      dispatch(notificationActions.error(message));
    },
    displaySuccess(message: string): any {
      dispatch(notificationActions.success(message));
    },
  };
}

const DictionaryPageViewWithParams = (
  props: Omit<DictionaryPageViewExtProps, 'params' | 'location'> & DictionaryPageViewDispatchProps & WithNavigationProps,
) => {
  const params = useParams();
  const location = useLocation();

  return <DictionaryPageView {...props} params={params} location={location} />;
};

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(DictionaryPageViewWithParams));

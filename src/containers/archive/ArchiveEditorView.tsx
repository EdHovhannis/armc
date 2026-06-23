import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { useParams, useLocation } from 'react-router';

import ArchiveEditorEmptyForm from '../../components/archive/ArchiveEditorEmptyForm';
import { ArchiveEditorForm } from '../../components/archive/ArchiveEditorForm';
import { Loader } from '../../components/utils/Loader';
import { withNavigation, WithNavigationProps } from '../../components/utils/withNavigation';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchivalQuota, ArchiveInputFormatListEnum, ArchiveQuotaEstimation, ArchiveTask, ShortArchiveTaskWithId } from '../../store/archive/Types';
import * as authSelectors from '../../store/auth/Reducer';
import { AuthType, User } from '../../store/auth/Types';
import * as flowActions from '../../store/flow/Actions';
import { resetUnitsAction } from '../../store/flow/Actions';
import * as flowSelectors from '../../store/flow/Reducer';
import { FlowServiceConfigs } from '../../store/flow/Types';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import * as kafkaViewerActions from '../../store/kafkaViewer/Actions';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';
import { ArchiveUtils } from '../../utils/ArchiveUtils';

export enum TaskType {
  new,
  import,
  update,
}

export interface ArchiveEditorDispatchProps {
  selectNewTask();

  fetchAllProjects(okCallback?): any;

  fetchTopics();

  fetchDateFormats();

  fetchTimeZones();

  fetchRecords(topicId: number, numRecords: number, callback: any): any;

  fetchQuota(projectShortName: string, okCallback: (quota: ArchivalQuota) => void, errorCallback?: (error: string) => void): any;

  getArchiveId(projectShortName: string, name: string, callback?: (id: number) => void, errorCallback?: (msg: string) => void): any;

  fetchArchiveTaskByProjectNameAndName(
    projectShortName: string,
    name: string,
    okCallback?: (task: ArchiveTask) => void,
    errorCallback?: (errorMsg: string) => void,
  ): any;

  checkQuota(
    projectShortName: string,
    size: number,
    rate: number,
    fetchedCallback?: (quota: ArchiveQuotaEstimation) => void,
    notFetchedCallback?: (msg: string) => void,
    index?: string,
  ): any;

  createSchema(topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback): any;

  displayError(error: string): any;

  displaySuccess(message: string): any;

  getInputFormatList();

  getSchemaNames();

  resetUnits: () => void;
}

export interface ArchiveEditorViewProps {
  archives: ShortArchiveTaskWithId[];
  topics: KafkaTopic[];
  user: User;
  authType: AuthType;
  isAdmin: boolean;
  projects: Project[];
  timeZones: string[];
  dateFormats: string[];
  archiveTask: ArchiveTask;
  isLoading: boolean;
  isResourcesLoading: boolean;
  isLoadingSchema: boolean;
  isDisableNextButton: boolean;
  inputFormatList: ArchiveInputFormatListEnum[];
  schemaNames: string[];
  flowServiceConfigs: FlowServiceConfigs;
  params: {
    name?: string;
  };
  location: {
    state?: {
      detail?: string;
    };
  };
  editableProjects: EditableProject[];
}

export interface ArchiveEditorViewState {
  type: TaskType;
  name: string;
  projectShortName: string;
  canEdit: boolean;
}

export class ArchiveEditorView extends React.Component<
  ArchiveEditorViewProps & ArchiveEditorDispatchProps & WithNavigationProps,
  ArchiveEditorViewState
> {
  constructor(props: ArchiveEditorViewProps & ArchiveEditorDispatchProps & WithNavigationProps) {
    super(props);
    autoBind(this);

    const name = this.props.params.name || '';
    const projectShortName = this.props.location?.state?.detail || '';

    if (name === 'new') {
      this.props.selectNewTask();
      this.state = {
        type: TaskType.new,
        name: '',
        projectShortName: '',
        canEdit: true,
      };
    } else if (name === 'import') {
      this.state = {
        type: TaskType.import,
        name: '',
        projectShortName: '',
        canEdit: true,
      };
    } else {
      this.state = {
        type: TaskType.update,
        name: name.toString(),
        projectShortName: projectShortName,
        canEdit: false,
      };
    }
  }

  componentDidMount() {
    this.props.fetchAllProjects();
    this.props.fetchTopics();
    this.props.fetchDateFormats();
    this.props.fetchTimeZones();
    this.props.getSchemaNames();
    this.props.getInputFormatList();

    const name = this.props.params.name || '';
    const projectShortName = this.props.location?.state?.detail || '';

    if (name !== 'new' && name !== 'import') {
      this.props.fetchArchiveTaskByProjectNameAndName(projectShortName, name);
      this.props.getArchiveId(projectShortName, name, (id) => {
        const archiveById = this.props.archives.find((arc) => arc.id === id);
        const canEdit = archiveById?.indexActions.includes('EDIT') || false;
        const canEditFlow = archiveById?.flowActions.includes('EDIT') || false;
        this.setState({ canEdit: (canEdit && canEditFlow) || this.props.user.admin });
      });
    }
  }

  render() {
    if (this.props.isResourcesLoading) {
      return <Loader />;
    }
    if (this.props.params.name !== 'new' && this.props.params.name !== 'import') {
      if (this.props.isLoading) return <Loader />;
      if (!this.props.archiveTask) {
        return (
          <ArchiveEditorEmptyForm
            message={`Для архива ${this.state.name} не найдена конфигурация потока.`}
            captionButton="Вернуться к списку"
            redirect={() => {
              this.props.navigate('/archive');
            }}
          />
        );
      }
    }

    return (
      <React.Fragment>
        <ArchiveEditorForm
          isDisableNextButton={this.props.isDisableNextButton}
          canEdit={this.state.canEdit}
          taskType={this.state.type}
          archiveTask={this.state.type === TaskType.new ? ArchiveUtils.getEmptyArchive() : this.props.archiveTask}
          projectShortName={this.state.projectShortName}
          topics={this.props.topics}
          projects={this.props.projects}
          allProjects={this.props.projects}
          timeZones={this.props.timeZones}
          dateFormats={this.props.dateFormats}
          isAdmin={this.props.isAdmin}
          isLoadingSchema={this.props.isLoadingSchema}
          fetchRecords={this.props.fetchRecords}
          fetchQuota={this.props.fetchQuota}
          // fetchArchiveTaskByProjectNameAndName={this.props.fetchArchiveTaskByProjectNameAndName}
          checkQuota={this.props.checkQuota}
          createSchema={this.props.createSchema}
          displayError={this.props.displayError}
          displaySuccess={this.props.displaySuccess}
          redirect={() => {
            this.props.navigate('/archive');
          }}
          inputFormatList={this.props.inputFormatList}
          schemaNames={this.props.schemaNames}
          resetUnits={this.props.resetUnits}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state: any): Omit<ArchiveEditorViewProps, 'params' | 'location'> {
  if (!state) {
    return {
      topics: [],
      projects: [],
      dateFormats: [],
      timeZones: [],
      user: {} as User,
      isDisableNextButton: false,
      archiveTask: {} as ArchiveTask,
      isLoading: false,
      isResourcesLoading: false,
      isAdmin: false,
      isLoadingSchema: false,
      inputFormatList: [],
      schemaNames: [],
      flowServiceConfigs: {} as FlowServiceConfigs,
    };
  }

  const user = authSelectors.user(state);
  if (!user) {
    throw new Error('User is not defined');
  }

  return {
    archives: archiveSelectors.getArchivesWithRoles(state),
    topics: kafkaSelectors.getTopics(state) || [],
    projects: projectSelectors.getProjects(state) || [],
    dateFormats: kafkaSelectors.getDateFormats(state) || [],
    timeZones: flowSelectors.getTimeZones(state) || [],
    user: user,
    authType: authSelectors.authType(state),
    isDisableNextButton: archiveSelectors.isQuotaLoading(state) || false,
    archiveTask: archiveSelectors.getCurrentArchiveTask(state) || ({} as ArchiveTask),
    isLoading: archiveSelectors.isTaskLoading(state) || false,
    isResourcesLoading: kafkaSelectors.receiveInProgress(state) || projectSelectors.isLoading(state) || false,
    isAdmin: authSelectors.isAdmin(state) || false,
    isLoadingSchema: kafkaSelectors.isLoadingSchema(state) || false,
    inputFormatList: archiveSelectors.getArchiveInputFormatList(state) || [],
    schemaNames: archiveSelectors.getArchiveSchemaNames(state) || [],
    flowServiceConfigs: flowSelectors.getFlowServiceConfigs(state) || ({} as FlowServiceConfigs),
  };
}

function mapDispatchToProps(dispatch: any): ArchiveEditorDispatchProps {
  return {
    fetchAllProjects: (okCallback?) => {
      dispatch(projectActions.fetchAllProjects(okCallback));
    },
    createSchema: (topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback) => {
      dispatch(kafkaActions.createSchema(topicId, flatten, false, excludedFields, successCallback));
    },
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    fetchDateFormats: () => {
      dispatch(kafkaActions.fetchDateFormats());
    },
    fetchTimeZones: () => {
      dispatch(flowActions.fetchTimeZones());
    },
    fetchRecords: (topicId, numRecords, callback) => {
      const kafkaQuery = {
        maxRowsInResult: numRecords,
        maxRowsToScan: numRecords,
        offset: 'LATEST',
        filter: {
          type: 'true',
        },
      };
      dispatch(kafkaViewerActions.fetchRecords(topicId, kafkaQuery, callback));
    },
    getArchiveId(projectShortName: string, name: string, callback?: (id: number) => void, errorCallback?: (msg: string) => void): any {
      dispatch(archiveActions.getArchiveId(projectShortName, name, callback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    displaySuccess: (meessage) => {
      dispatch(notificationActions.success(meessage));
    },
    fetchArchiveTaskByProjectNameAndName: (projectShortName: string, name: string, okCallback?, errorCallback?) => {
      dispatch(archiveActions.getArchiveTaskInfo(projectShortName, name, okCallback, errorCallback));
    },
    selectNewTask() {
      dispatch(archiveActions.selectNewArchiveTaskAction());
    },
    fetchQuota(projectShortName: string, okCallback, errorCallback?): any {
      dispatch(archiveActions.fetchQuota(projectShortName, okCallback, errorCallback));
    },
    checkQuota(projectShortName: string, size: number, rate: number, fetchedCallback?, notFetchedCallback?, index?: string): any {
      dispatch(archiveActions.fetchEstimateQuota(projectShortName, size, rate, fetchedCallback, notFetchedCallback, index));
    },
    getInputFormatList: () => {
      dispatch(archiveActions.getArchiveInputFormatList());
    },
    getSchemaNames: () => {
      dispatch(archiveActions.getArchiveSchemaNames());
    },
    resetUnits: () => {
      dispatch(resetUnitsAction());
    },
  };
}

// Создаем обертку для компонента, которая будет получать параметры маршрута
const ArchiveEditorViewWithRouter = (
  props: Omit<ArchiveEditorViewProps, 'params' | 'location'> & ArchiveEditorDispatchProps & WithNavigationProps,
) => {
  const params = useParams<{ name?: string }>();
  const location = useLocation();

  return <ArchiveEditorView {...props} params={params} location={location} />;
};

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(ArchiveEditorViewWithRouter));

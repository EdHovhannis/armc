import { AuthType } from '@src/store/auth/Types';
import { fetchAllZone } from '@src/store/zone/Actions';
import { merge } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams, useNavigate } from 'react-router';

import AnalyticalEditorEmptyForm from '../../components/monitoring/AnalyticalEditorEmptyForm';
import TaskEditor from '../../components/monitoring/TaskEditor';
import { Loader } from '../../components/utils/Loader';
import * as authSelectors from '../../store/auth/Reducer';
import * as configActions from '../../store/config/Actions';
import * as configSelectors from '../../store/config/Reducer';
import { IndexConfig } from '../../store/config/Types';
import * as kafkaActions from '../../store/kafka/Actions';
import * as kafkaSelectors from '../../store/kafka/Reducer';
import { KafkaTopic } from '../../store/kafka/Types';
import * as kafkaViewerActions from '../../store/kafkaViewer/Actions';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidSupervisor, GenericSupervisorInfo, TaskData } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as projectActions from '../../store/project/Actions';
import * as projectSelectors from '../../store/project/Reducer';
import { EditableProject, Project } from '../../store/project/Types';
import { AnalyticIndexUtils } from '../../utils/AnalyticIndexUtils';

import TaskProvider from './TaskProvider';

export interface TaskEditorDispatchProps {
  fetchProjects: () => void;
  fetchTopics: () => void;
  selectNewTask: () => void;
  fetchSupervisors: () => void;
  fetchTask: (task_id: number) => void;
  submitTask: (
    team_id: number,
    topic_id: number,
    isTracing: boolean,
    taskData: TaskData,
    successCallback: () => void,
    errorCallback: (error: string) => void,
  ) => void;
  updateTask: (
    task_id: number,
    team_id: number,
    topic_id: number,
    isTracing: boolean,
    taskData: TaskData,
    okCallback: () => void,
    errorCallback: (error: string) => void,
  ) => void;
  fetchRecords: (topicId: number, numRecords: number, callback: (data: any) => void) => void;
  displayError: (msg: string) => void;
  fetchAnalyticalServiceConfig: (okCallback?: (config: IndexConfig) => void, errorCallback?: (message: string) => void) => void;
  fetchZones: () => void;
}

enum TaskType {
  new,
  import,
  update,
}

export interface TaskEditorProps {
  projects: Project[];
  topics: KafkaTopic[];
  selectedTask: DruidSupervisor;
  isLoading: boolean;
  isAdmin: boolean;
  authType: AuthType;
  genericTask: GenericSupervisorInfo;
  analyticalServiceConfig?: IndexConfig;
  editableProjects: EditableProject[];
}

interface TaskEditorViewState {
  type: TaskType;
  id: number;
  isUpdate: boolean;
}

function TaskEditorView(props: TaskEditorDispatchProps & TaskEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = React.useState<TaskEditorViewState>(() => {
    if (id === 'new') {
      props.selectNewTask();
      return { type: TaskType.new, id: -1, isUpdate: false };
    } else if (id === 'import') {
      return { type: TaskType.import, id: -1, isUpdate: false };
    } else {
      const taskId = Number(id);
      if (isNaN(taskId)) {
        throw new Error('Invalid task ID');
      }
      props.fetchTask(taskId);
      return { type: TaskType.update, id: taskId, isUpdate: true };
    }
  });

  React.useEffect(() => {
    props.fetchAnalyticalServiceConfig(undefined, (error) => {
      props.displayError(`Ошибка загрузки конфигурации: ${error}`);
      navigate('/monitoring');
    });
    props.fetchProjects();
    props.fetchTopics();
    props.fetchZones();
  }, []);

  if (props.isLoading || !props.analyticalServiceConfig) {
    return <Loader />;
  }

  if (state.type === TaskType.import && !AnalyticIndexUtils.validateImportTask(props.selectedTask)) {
    return (
      <AnalyticalEditorEmptyForm
        message={`Импортировать задачу не удалось, так как json в файле не является конфигурацией аналитических индексов.`}
        captionButton="Вернуться к списку"
        redirect={() => navigate('/monitoring')}
      />
    );
  }

  const config = props.analyticalServiceConfig as IndexConfig;
  return (
    <TaskEditor
      analyticalServiceConfig={config}
      isAdmin={props.isAdmin}
      isLegacyMode={props.authType === 'legacy'}
      displayError={props.displayError}
      isUpdate={state.isUpdate}
      genericTask={state.type === TaskType.new ? TaskProvider.getEmptyGenericInfo() : props.genericTask}
      resourceId={state.id}
      initialTask={state.type === TaskType.new ? TaskProvider.getDruidTask() : merge({}, TaskProvider.getDruidTask(), props.selectedTask)}
      submitTask={(project_id, topic_id, isTracing, task) => {
        if (state.type !== TaskType.update) {
          props.submitTask(
            project_id,
            topic_id,
            isTracing,
            task,
            () => {
              navigate('/monitoring');
            },
            (error) => {
              props.displayError(error);
            },
          );
        } else {
          props.updateTask(
            state.id,
            project_id,
            topic_id,
            isTracing,
            task,
            () => {
              navigate('/monitoring');
            },
            (error) => {
              props.displayError(error);
            },
          );
        }
      }}
      fetchRecords={props.fetchRecords}
      topics={props.topics}
      projects={props.projects}
    />
  );
}

function mapStateToProps(state: any): TaskEditorProps {
  const analyticalServiceConfig = configSelectors.getAnalyticalServiceConfig(state);

  return {
    isAdmin: authSelectors.isAdmin(state),
    authType: authSelectors.authType(state),
    projects: projectSelectors.getProjects(state),
    topics: kafkaSelectors.getTopics(state),
    selectedTask: monitoringSelectors.getCurrentTask(state) || TaskProvider.getDruidTask(),
    isLoading: monitoringSelectors.isLoading(state) || configSelectors.isAnalyticalServiceConfigLoading(state),
    genericTask: monitoringSelectors.getGenericCurrentTask(state) || TaskProvider.getEmptyGenericInfo(),
    analyticalServiceConfig,
  };
}

function mapDispatchToProps(dispatch: any): TaskEditorDispatchProps {
  return {
    fetchProjects: () => {
      dispatch(projectActions.fetchAllProjects());
    },
    fetchTopics: () => {
      dispatch(kafkaActions.fetchTopics());
    },
    selectNewTask: () => {
      dispatch(monitoringActions.actionStarted());
      dispatch(monitoringActions.selectNewTask());
    },
    fetchSupervisors: () => {
      dispatch(monitoringActions.fetchAllSupervisors());
    },
    fetchTask: (task_id: number) => {
      dispatch(monitoringActions.fetchConfigById(task_id));
    },
    submitTask: (team_id, topic_id, isTracing, taskData, successCallback, errorCallback) => {
      dispatch(monitoringActions.submitConfig(team_id, topic_id, isTracing, taskData, successCallback, errorCallback));
    },
    updateTask: (task_id, team_id, topic_id, isTracing, taskData, okCallback, errorCallback) => {
      dispatch(monitoringActions.updateConfig(task_id, team_id, topic_id, isTracing, taskData, okCallback, errorCallback));
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
    displayError: (msg) => {
      dispatch(notificationActions.error(msg));
    },
    fetchAnalyticalServiceConfig: (okCallback, errorCallback) => {
      dispatch(configActions.fetchAnalyticalServiceConfig(okCallback, errorCallback));
    },
    fetchZones: () => {
      dispatch(fetchAllZone());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskEditorView);

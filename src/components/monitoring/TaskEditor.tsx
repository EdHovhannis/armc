import { Fab, Grid, Tooltip } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar/AppBar';
import { CallMerge, PlaylistAdd, Security, Shuffle, ViewColumn, NoteAdd, Info, Check, Compare } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import SettingsIcon from '@material-ui/icons/Settings';
import * as _ from 'lodash';
import * as React from 'react';

import DruidSpecDiffContainer from '../../containers/monitoring/DruidSpecDiffContainer';
import SpecViewItemContainer from '../../containers/monitoring/SpecViewItemContainer';
import TaskProvider from '../../containers/monitoring/TaskProvider';
import PermissionUserView from '../../containers/permissions/PermissionUserView';
import { IndexConfig } from '../../store/config/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import {
  AdditionalConfig,
  DimensionItem,
  DruidSupervisor,
  FlattenItem,
  GenericSupervisorInfo,
  MetricItem,
  TaskData,
  TransformItem,
} from '../../store/monitoring/Types';
import { Project } from '../../store/project/Types';
import { Resource, Role } from '../../store/role/Types';
import { GlobalConfigsUtil } from '../../utils/GlobalConfigsUtil';
import { DoneFab } from '../utils/DoneFab';
import { StyledSettingsTab, StyledSettingsTabs } from '../utils/StyledSettingsTabs';

import AdditionalConfigurationItem from './taskParts/AdditionalConfigurationItem';
import ColumnsSpecItem from './taskParts/ColumnsSpecItem';
import DataSourceConfigurationItem from './taskParts/DataSourceConfigurationItem';
import FilterEditor from './taskParts/FilterEditor';
import FlattenSpecItem from './taskParts/FlattenSpecItem';
import MetricsSpecItem from './taskParts/MetricsSpecItem';
import TaskConfigurationItem from './taskParts/TaskConfigurationItem';
import TransformSpecItem from './taskParts/TransformSpecItem';

const DUPLICATE_ERROR_MESSAGE = 'Названия полей с вкладок Столбцы (поле Столбец) и Метрики (поле Целевая колонка) не должны совпадать.';
export interface Schema {
  stringFields: Array<string>;
  longFields: Array<string>;
  doubleFields: Array<string>;
  timestampFields: Array<string>;
  flattenFields: Array<FlattenItem>;
  nonFlattenFields: Array<string>;
  allFields: Array<string>;
}

export interface TaskEditorState extends TaskData {
  currentTab: number;
  isRawEdit: boolean;
  autoMode: boolean;
  topicId: number;
  isTracing: boolean;
  projectId: number;
  schema?: Schema;
  tags?: Array<string>;
  samples?: any;
  timestampFields: Array<any>;
  tagsDimension?: Array<string>;
  additionalIoConfig: string;
  additionalTuningConfig: string;
  openDiffDialog: boolean;
  isValidQuota: boolean;
}

export interface TaskEditorProps {
  resourceId: number;
  isUpdate: boolean;

  submitTask(team_id: number, topic_id: number, isTracing: boolean, task: TaskData);

  fetchRecords(topicId: number, numRecords: number, callback);

  displayError(msg: string);

  initialTask: DruidSupervisor;
  projects: Project[];
  topics: KafkaTopic[];
  genericTask: GenericSupervisorInfo;
  isAdmin: boolean;
  isLegacyMode: boolean;
  analyticalServiceConfig?: IndexConfig;
}

export default class TaskEditor extends React.Component<TaskEditorProps, TaskEditorState> {
  schemeParts: Array<any>;

  constructor(props) {
    super(props);

    const task: DruidSupervisor = props.initialTask;
    this.state = {
      filter: task.data.filter,
      labels: task.data.labels,
      flattenData: task.data.flattenData,
      transformData: task.data.transformData,
      dimensionData: task.data.dimensionData,
      dimensionExclusions: task.data.dimensionExclusions,
      metricsData: task.data.metricsData,
      granularitySpec: task.data.granularitySpec,
      overrideConfig: task.data.overrideConfig,
      ioConfig: task.data.ioConfig,
      tuningConfig: task.data.tuningConfig || TaskProvider.getEmptyTuningConfig(),
      datasource: props.initialTask.datasource,
      topicId: props.initialTask.topicId,
      projectId: props.initialTask.projectId,
      timestampSpec: task.data.timestampSpec,
      isTracing: props.initialTask.is_tracing || false,
      currentTab: 0,
      isRawEdit: false,
      autoMode:
        task.data.dimensionData.length === 0
          ? !(task.data.dimensionExclusions?.some((dim) => dim === '""') || task.data.dimensionExclusions?.length === 0)
          : false,
      tags: [],
      timestampFields: [],
      tagsDimension: [],
      additionalIoConfig: GlobalConfigsUtil.parseMonitoringConfig(task.data.overrideConfig?.ioConfig),
      additionalTuningConfig: GlobalConfigsUtil.parseMonitoringConfig(task.data.overrideConfig?.tuningConfig),
      openDiffDialog: false,
      isValidQuota: true,
    };

    this.createTaskData = this.createTaskData.bind(this);
    this.createTaskDataWithIoAndTuning = this.createTaskDataWithIoAndTuning.bind(this);
  }

  createTaskData(ioConfig: any, tuningConfig: any): TaskData {
    const overrideConfig: AdditionalConfig = {
      ioConfig: ioConfig,
      tuningConfig: tuningConfig,
    };
    const flattenData = _.cloneDeep(this.state.flattenData);
    const dimensionData = _.cloneDeep(this.state.dimensionData);
    const metricsData = _.cloneDeep(this.state.metricsData);
    const ioConfigConf = _.clone(this.state.ioConfig);
    if (flattenData.length > 0) {
      flattenData.map((row) => {
        delete row.tableData;
      });
    }
    if (metricsData.length > 0) {
      metricsData.map((row) => {
        delete row.tableData;
      });
    }
    if (dimensionData.length > 0) {
      dimensionData.map((row) => {
        delete row.tableData;
      });
    }
    if (this.state.ioConfig.earlyMessageRejectionPeriod == null || this.state.ioConfig.earlyMessageRejectionPeriod == '') {
      ioConfigConf.earlyMessageRejectionPeriod = this.props.analyticalServiceConfig?.dataEarlyRejectionPeriod || 'P1D';
    }
    if (this.state.ioConfig.lateMessageRejectionPeriod == null || this.state.ioConfig.lateMessageRejectionPeriod == '') {
      ioConfigConf.lateMessageRejectionPeriod = this.props.analyticalServiceConfig?.dataLateRejectionPeriod || 'P1D';
    }

    const data: TaskData = {
      granularitySpec: this.state.granularitySpec,
      datasource: this.state.datasource,
      timestampSpec: this.state.timestampSpec,
      ioConfig: ioConfigConf,
      flattenData: flattenData,
      filter: this.state.filter,
      transformData: this.state.transformData,
      dimensionData: dimensionData,
      dimensionExclusions: this.state.autoMode ? this.state.dimensionExclusions : [],
      metricsData: metricsData,
      tuningConfig: this.state.tuningConfig,
      labels: this.state.labels,
      overrideConfig: overrideConfig,
    };
    return data;
  }

  createTaskDataWithIoAndTuning(): TaskData {
    let ioConfig, tuningConfig;
    try {
      ioConfig = this.state.ioConfig ? GlobalConfigsUtil.serializeMonitoringConfig(this.state.additionalIoConfig) : {};
    } catch (e) {
      ioConfig = {};
    }
    try {
      tuningConfig = this.state.tuningConfig ? GlobalConfigsUtil.serializeMonitoringConfig(this.state.additionalTuningConfig) : {};
    } catch (e) {
      tuningConfig = {};
    }
    return this.createTaskData(ioConfig, tuningConfig);
  }

  buildParts() {
    const canEdit = this.props.isAdmin || this.props.genericTask.canEdit;
    this.schemeParts = [
      {
        name: 'Источник данных',
        value: (
          <DataSourceConfigurationItem
            displayError={this.props.displayError}
            canEdit={canEdit}
            fetchRecords={this.props.fetchRecords}
            projects={this.props.projects}
            initialState={{
              ioConfig: this.state.ioConfig,
              topicId: this.state.topicId,
              samples: this.state.samples,
            }}
            topics={this.props.topics}
            ioConfigChanged={(config) => this.setState({ ioConfig: config })}
            saveSamples={(samples) => this.setState({ samples: samples })}
            topicChanged={(topic_id) => this.setState({ topicId: topic_id })}
            createsSchema={(schema) => this.setState({ schema: schema })}
            analyticalServiceConfig={this.props.analyticalServiceConfig}
          />
        ),
        icon: <GetAppIcon />,
      },
      {
        name: 'Сглаживание',
        value: (
          <FlattenSpecItem
            displayError={this.props.displayError}
            canEdit={canEdit}
            schemaChanged={(schema) => {
              this.setState({ schema: schema });
            }}
            tagsChanged={(tags) => {
              this.setState({ tags: tags });
            }}
            topic={this.state.topicId}
            tags={this.state.tags}
            data={this.state.flattenData}
            schema={this.state.schema}
            dataChanged={(data: Array<FlattenItem>) => {
              this.setState({ flattenData: data });
            }}
          />
        ),
        icon: <PlaylistAdd />,
      },
      {
        name: 'Столбцы',
        value: (
          <ColumnsSpecItem
            shouldBeFlattened={this.state.flattenData && this.state.flattenData.length > 0}
            displayError={this.props.displayError}
            flattenTags={this.state.tags}
            topic={this.state.topicId}
            schemaChanged={(schema) => {
              this.setState({ schema: schema });
            }}
            isUpdate={this.props.isUpdate}
            autoMode={this.state.autoMode}
            autoModeChanged={(autoMode) => {
              this.setState({ autoMode: autoMode });
            }}
            tags={this.state.tagsDimension}
            tagsChanged={(tags) => {
              this.setState({ tagsDimension: tags });
            }}
            dimensionExclusions={this.state.dimensionExclusions}
            dimensionExclusionsChange={(dimensionExclusions) => {
              this.setState({ dimensionExclusions: dimensionExclusions });
            }}
            schema={this.state.schema}
            canEdit={canEdit}
            data={this.state.dimensionData}
            metricsData={this.state.metricsData}
            errorMessage={DUPLICATE_ERROR_MESSAGE}
            dataChanged={(data: Array<DimensionItem>) => {
              this.setState({ dimensionData: data });
            }}
          />
        ),
        icon: <ViewColumn />,
      },
      {
        name: 'Метрики',
        value: (
          <MetricsSpecItem
            displayError={this.props.displayError}
            canEdit={canEdit}
            data={this.state.metricsData}
            dimensionData={this.state.dimensionData}
            errorMessage={DUPLICATE_ERROR_MESSAGE}
            dataChanged={(data: Array<MetricItem>) => {
              this.setState({ metricsData: data });
            }}
          />
        ),
        icon: <CallMerge />,
      },
      {
        name: 'Трансформации',
        value: (
          <TransformSpecItem
            canEdit={canEdit}
            data={this.state.transformData}
            dataChanged={(data: Array<TransformItem>) => {
              this.setState({ transformData: data });
            }}
          />
        ),
        icon: <Shuffle />,
      },
      {
        name: 'Фильтрация',
        value: (
          <FilterEditor
            displayError={this.props.displayError}
            canEdit={canEdit}
            isRawEdit={this.state.isRawEdit}
            defaultFilter={this.state.filter}
            filterChanged={(filter, isRawEdit) => {
              this.setState({ filter: filter, isRawEdit: isRawEdit });
            }}
          />
        ),
        icon: <Shuffle />,
      },
      {
        name: 'Дополнительно',
        value: (
          <AdditionalConfigurationItem
            canEdit={canEdit}
            ioConfig={this.state.additionalIoConfig}
            tuningConfig={this.state.additionalTuningConfig}
            changeIoConfig={(ioConfig) => {
              this.setState({ additionalIoConfig: ioConfig });
            }}
            changeTuningConfig={(tuningConfig) => {
              this.setState({ additionalTuningConfig: tuningConfig });
            }}
          />
        ),
        icon: <NoteAdd />,
      },
      {
        name: 'Конфигурация',
        value: (
          <TaskConfigurationItem
            canEdit={canEdit}
            isAdmin={this.props.isAdmin}
            isUpdate={this.props.isUpdate}
            initialState={{
              datasourceName: this.state.datasource,
              tuningConfig: this.state.tuningConfig,
              ioConfig: this.state.ioConfig,
              granularitySpec: this.state.granularitySpec,
              timestampSpec: this.state.timestampSpec,
              project_id: this.state.projectId,
              isTracing: this.state.isTracing,
            }}
            additionalIoConfig={this.state.additionalIoConfig}
            timeFields={this.state.schema?.timestampFields}
            timestampFields={this.state.timestampFields}
            timestampFieldsChange={(timestampFields) => {
              this.setState({ timestampFields: timestampFields });
            }}
            labels={this.state.labels}
            changeLabels={(labels) => {
              this.setState({ labels: labels.length > 0 ? labels : null });
            }}
            displayError={this.props.displayError}
            projects={this.props.projects}
            granularityChanged={(spec) => this.setState({ granularitySpec: spec })}
            ioConfigChanged={(config) => this.setState({ ioConfig: config })}
            timestampSpecChanged={(spec) => this.setState({ timestampSpec: spec })}
            datasourceNameChanged={(name) => this.setState({ datasource: name })}
            projectChanged={(team_id) => this.setState({ projectId: team_id })}
            tuningConfigChanged={(conf) => this.setState({ tuningConfig: conf })}
            isTracingChanged={(isTracing) => this.setState({ isTracing: isTracing })}
            onChangeQuotaValid={(isValidQuota: boolean) => this.setState({ isValidQuota })}
          />
        ),
        icon: <SettingsIcon />,
      },
      {
        name: 'Просмотр спецификации',
        value: (
          <SpecViewItemContainer topic_id={this.state.topicId} project_id={this.state.projectId} taskData={this.createTaskDataWithIoAndTuning()} />
        ),
        icon: <Info />,
      },
    ];
    if (this.props.isLegacyMode) {
      this.schemeParts.push({
        name: 'Безопасность',
        value: (
          <PermissionUserView
            canEditAccess={this.props.isAdmin || this.props.genericTask.canManageAccess}
            roles={[Role.MON_EDITOR, Role.MON_VIEWER]}
            resourceId={this.props.resourceId}
            resource={Resource.MONITORING}
            showSharedToggle
          />
        ),
        icon: <Security />,
      });
    }
  }

  render() {
    this.buildParts();
    const excludingIndex = this.props.isLegacyMode ? [this.schemeParts.length - 1, this.schemeParts.length - 2] : [this.schemeParts.length - 1];
    return (
      <React.Fragment>
        <Grid container justifyContent="center" spacing={2} style={{ width: '100%', marginTop: 12 }}>
          <Grid item xs={10}>
            <AppBar position="static">
              <StyledSettingsTabs
                style={{ maxWidth: '100%' }}
                variant="scrollable"
                value={this.state.currentTab}
                onChange={(event, value) => {
                  this.setState({ currentTab: value });
                }}
                scrollButtons="auto"
              >
                {this.schemeParts.map((part, index) => {
                  if (!this.props.isAdmin) {
                    if (index === 6) {
                      return;
                    }
                  }
                  if (this.state.topicId != -1) {
                    if (!excludingIndex.includes(index)) {
                      return <StyledSettingsTab label={part.name} icon={part.icon} />;
                    }
                  } else {
                    if (!excludingIndex.includes(index)) {
                      if (index === 0) return <StyledSettingsTab label={part.name} icon={part.icon} />;
                      else return <StyledSettingsTab label={part.name} icon={part.icon} disabled={true} />;
                    }
                  }
                })}
                {this.props.isAdmin && (
                  <StyledSettingsTab
                    label={'Просмотр спецификации'}
                    icon={<Info />}
                    disabled={!(this.state.datasource && this.state.topicId && this.state.projectId)}
                  />
                )}
                {this.props.isLegacyMode && this.props.resourceId >= 0 && <StyledSettingsTab label={'Безопасность'} icon={<Security />} />}
              </StyledSettingsTabs>
            </AppBar>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" spacing={2} style={{ width: '100%', marginTop: 12 }}>
          <Grid item xs={10}>
            {
              this.schemeParts[
                this.props.isAdmin ? this.state.currentTab : this.state.currentTab === 6 ? 7 : this.state.currentTab === 7 ? 9 : this.state.currentTab
              ].value
            }
          </Grid>
        </Grid>

        {this.state.openDiffDialog && (
          <DruidSpecDiffContainer
            close={() => {
              this.setState({ openDiffDialog: false });
            }}
            taskData={this.createTaskDataWithIoAndTuning()}
            topicId={this.state.topicId}
            projectId={this.state.projectId}
            supervisorId={this.props.resourceId}
          />
        )}

        {this.props.isAdmin && this.state.datasource && this.state.topicId && this.state.projectId && this.props.resourceId >= 0 && (
          <Tooltip title={'Просмотреть разницу спецификаций'}>
            <Fab
              onClick={(e) => {
                this.setState({ openDiffDialog: true });
              }}
              color="primary"
              aria-label="Done"
              style={{ position: 'fixed', bottom: 84, right: 12, zIndex: 12 }}
            >
              <Compare />
            </Fab>
          </Tooltip>
        )}

        {(this.props.isAdmin || this.props.genericTask.canEdit) && (
          <DoneFab
            onClick={(e) => {
              if (this.state.datasource === '' || this.state.datasource == null) {
                this.props.displayError('Имя таблицы не может быть пустое');
                return;
              }
              if (this.state.timestampSpec.column === '' || this.state.timestampSpec.column == null) {
                this.props.displayError('Колонка времени не может быть пустой');
                return;
              }
              if (this.state.projectId === -1 || this.state.projectId == null) {
                this.props.displayError('Обязательно нужно выбрать проект');
                return;
              }
              if (this.state.topicId === -1 || this.state.topicId == null) {
                this.props.displayError('Топик обязательно должен быть выбран');
                return;
              }
              if (!this.state.isValidQuota) {
                this.props.displayError('Сохранения без внесения изменений и повторной успешной валидации невозможно.');
                return;
              }
              let ioConfig, tuningConfig;
              try {
                ioConfig = this.state.additionalIoConfig ? GlobalConfigsUtil.serializeMonitoringConfig(this.state.additionalIoConfig) : {};
              } catch (e) {
                this.props.displayError('Ошибка в формате вводимых данных в ioConfig.');
                return;
              }
              try {
                tuningConfig = this.state.additionalTuningConfig
                  ? GlobalConfigsUtil.serializeMonitoringConfig(this.state.additionalTuningConfig)
                  : {};
              } catch (e) {
                this.props.displayError('Ошибка в формате вводимых данных в tuningConfig.');
                return;
              }

              this.props.submitTask(this.state.projectId, this.state.topicId, this.state.isTracing, this.createTaskData(ioConfig, tuningConfig));
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

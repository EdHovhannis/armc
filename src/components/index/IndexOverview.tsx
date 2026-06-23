import { Avatar, IconButton, FormControlLabel, Switch } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Refresh } from '@material-ui/icons';
import * as React from 'react';

import { AuthType, User } from '../../store/auth/Types';
import { ConstraintType } from '../../store/constraint/Types';
import { FulltextTask } from '../../store/index/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import { OverdraftConfig } from '../../store/overdraft/Types';
import { Pipeline, PipelineMeta, PipelineShort, PipelineStatus } from '../../store/pipeline/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { Unit } from '../../store/role/Types';
import { Zone } from '../../store/zone/Types';
import { IndexOverviewDataNew, IndexUtils } from '../../utils/IndexUtils';
import { Utils, speedIcon } from '../../utils/Utils';
import WaitingDialog from '../WaitingDialog';
import { AddFab } from '../utils/AddFab';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { ImportFileFab } from '../utils/ImportFileFab';
import { Loader } from '../utils/Loader';
import ResetOverdraftDialog from '../utils/ResetOverdraftDialog';
import { StyledTab, StyledTabs } from '../utils/StyledTabs';

import IndexOverviewConfigTable from './IndexOverviewConfigTable';
import IndexOverviewInstancesTable from './IndexOverviewInstancesTable';
import { IndexStatisticView } from './IndexStatisticView';

export interface IndexOverviewProps {
  filter: FilterMenuItem[] | undefined;
  fulltextTasks: FulltextTask[];
  allLabels: string[];
  isRefetch: boolean;
  user: User;
  allZones: Zone;
  topics: KafkaTopic[];
  isAdmin: boolean;
  authType: AuthType;
  projects: Array<Project>;
  isLoading: boolean;
  statuses: Map<string, PipelineStatus>;
  fulltextOverdraftConfig?: OverdraftConfig;
  editableProjects: EditableProject[];

  getFulltextOverdraftConfig: (okCallback?: (overdraft: OverdraftConfig) => void, errorCallback?: (error: string) => void) => void;
  fetchZones(fetchedCallback?: (zone: Zone) => void): any;
  listPipelines: (okCallback: (pipelines: PipelineShort[]) => void, errorCallback: (errorMsg: string) => void) => void;
  listFulltextTasks: (labels?: string[], okCallback?: (data?: unknown) => void, errorCallback?: (error: string) => void, woBackup?: boolean) => void;
  getAllFulltextLabelsList: (okCallback?: (data?: unknown) => void, errorCallback?: (error: string) => void) => void;
  getPipelineInfo: (
    projectShortName: string,
    name: string,
    okCallback?: (pipeline: Pipeline) => void,
    errorCallback?: (errorMsg: string) => void,
  ) => void;
  fetchPipelineMeta: (
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (pipeline: PipelineMeta) => void,
    errorCallback?: (errorMsg: string) => void,
  ) => void;
  deletePipelineById: (
    projectShortName: string,
    name: string,
    zoneId?: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  downloadPipeline: (projectShortName: string, name: string) => void;
  resumeTask: (
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  forceRotate: (
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  suspendTask: (
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  refreshInstanceFulltext: (
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  addInstanceFulltext: (
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  setIndexFilter: (filter: FilterMenuItem[] | undefined, isRefetch: boolean) => void;
  fetchConstraintForObject: (
    taskId: number,
    type: ConstraintType,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  updateConstraintOnObject: (
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  blockSubjectOnObject: (
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    description: string,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  getFulltextTaskByProjectAndName: (
    projectShortName: string,
    indexName: string,
    okCallback?: (data?: unknown) => void,
    errorCallback?: (error: string) => void,
  ) => void;
  redirect: (where: string | any) => void;
  fetchUserProjects: () => void;
  fetchTopics: () => void;
  displayError: (error: any) => void;
  displaySuccess: (message: string) => void;
  displayInfo: (info: any) => void;
  importTask: (task: Pipeline) => void;
  getListPipelinesStatus: (okCallback?: (data?: unknown) => void, errorCallback?: (error: string) => void) => void;
  changeInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetZoneOverdraft: (zoneId: string, okCallback?: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => void;
}

interface IndexOverviewState {
  currentTab: number;
  pipelines: PipelineShort[];
  statuses: Map<string, PipelineStatus>;
  filter?: FilterMenuItem[];
  pipeline?: Pipeline;
  statisticIsOpen: boolean;
  statisticIsLoading: boolean;
  backupCount: number | null;
  savepointCount: number | null;
  pipelineName?: string;
  shortNameProject?: string;
  zoneId?: string;
  meta?: any;
  openDialogAllReset: boolean;
  waitForResetOverdraft?: boolean;
  successResetOverdraft?: boolean;
  completeResetOverdraft?: boolean;
  errorMessage?: string;
  detailsMessage?: string;
  searchText?: string;
  woBackup: boolean;
}

export class IndexOverview extends React.Component<IndexOverviewProps, IndexOverviewState> {
  schemeParts: Array<any>;
  isLegacyMode: boolean;

  constructor(props) {
    super(props);
    this.isLegacyMode = this.props.authType === 'legacy';
    this.state = {
      currentTab: 0,
      pipelines: [],
      statisticIsLoading: false,
      statisticIsOpen: false,
      statuses: new Map<string, PipelineStatus>(),
      filter: this.props.filter,
      openDialogAllReset: false,
      backupCount: null,
      savepointCount: null,
      woBackup: false,
    };
    // this.refetchPipelines = this.refetchPipelines.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount(): void {
    this.refetchPipelines();
    this.props.getAllFulltextLabelsList();
    this.props.fetchTopics();
    this.props.fetchUserProjects();
    this.props.fetchZones();
    this.props.getFulltextOverdraftConfig();
  }

  refetchPipelines = (): void => {
    this.props.listPipelines(
      (pipelines: PipelineShort[]) => {
        if (this.props.filter && this.props.filter?.length > 0) {
          this.props.listFulltextTasks(Utils.createLabelsFilter(this.props.filter));
        } else {
          this.props.listFulltextTasks();
        }
        this.props.getListPipelinesStatus(
          (statuses) => {
            this.setState({
              pipelines: pipelines,
              statuses: statuses,
            });
          },
          (error) => {
            this.setState({
              pipelines: pipelines,
            });
            this.props.displayError('Ошибка при запросе статусов полонотекстовых индексов: ' + error);
          },
        );
      },
      (err) => {},
    );
  };

  getWithFilter(filter: FilterMenuItem[] | undefined, data: IndexOverviewDataNew[], statuses: Map<string, PipelineStatus>): IndexOverviewDataNew[] {
    if (filter) {
      let tmpPipelines: IndexOverviewDataNew[] = data;
      filter
        .filter((filter) => filter.field !== 'label')
        .map((filter) => {
          tmpPipelines = Utils.isMeetsConditionsPipeline(filter, tmpPipelines);
          tmpPipelines = tmpPipelines.filter((data) => {
            return Utils.isMeetsConditionsMeta(
              filter,
              // @ts-ignore
              statuses.get(data.name + data.project + data.zoneId),
            );
          });
        });
      return tmpPipelines;
    } else {
      return data;
    }
  }

  statisticsLoad(rowData: IndexOverviewDataNew): void {
    this.setState({
      statisticIsOpen: true,
      statisticIsLoading: true,
    });
    this.props.fetchPipelineMeta(
      rowData.project,
      rowData.name,
      rowData.zoneId || '',
      (meta) => {
        this.setState({
          statisticIsLoading: false,
          meta: meta,
          pipelineName: rowData.name,
          shortNameProject: rowData.project,
          zoneId: rowData.zoneId,
          backupCount: rowData.backupCount || null,
          savepointCount: rowData.savepointCount || null,
        });
      },
      (errorMsg) => {
        this.props.displayError(errorMsg);
        this.setState({
          statisticIsOpen: false,
          statisticIsLoading: false,
        });
      },
    );
  }

  onSearch(searchText?: string) {
    this.setState({
      searchText,
    });
  }

  buildSupervisorsParts() {
    const { configData, instanceData } = IndexUtils.getIndexOverviewDataNew(this.state.pipelines, this.props.statuses, this.props.fulltextTasks);
    const dataForTable = this.getWithFilter(this.state.filter, instanceData, this.props.statuses);
    this.schemeParts = [
      {
        name: 'Конфигурации',
        value: (
          <IndexOverviewConfigTable
            user={this.props.user}
            isAdmin={this.props.isAdmin}
            isLegacyMode={this.isLegacyMode}
            isLoading={this.props.isLoading}
            displayError={this.props.displayError}
            displaySuccess={this.props.displaySuccess}
            listFulltextTasks={this.props.listFulltextTasks}
            getAllFulltextLabelsList={this.props.getAllFulltextLabelsList}
            refetchPipelines={this.refetchPipelines}
            getPipelineInfo={this.props.getPipelineInfo}
            filter={this.state.filter}
            redirect={this.props.redirect}
            downloadPipeline={this.props.downloadPipeline}
            getFulltextTaskByProjectAndName={this.props.getFulltextTaskByProjectAndName}
            fetchConstraintForObject={this.props.fetchConstraintForObject}
            allZones={this.props.allZones}
            addInstanceFulltext={this.props.addInstanceFulltext}
            updateConstraintOnObject={this.props.updateConstraintOnObject}
            blockSubjectOnObject={this.props.blockSubjectOnObject}
            fulltextTasks={this.props.fulltextTasks}
            deletePipelineById={this.props.deletePipelineById}
            refreshInstanceFulltext={this.props.refreshInstanceFulltext}
            statisticsLoad={(rowData) => this.statisticsLoad(rowData)}
            resumeTask={this.props.resumeTask}
            forceRotate={this.props.forceRotate}
            suspendTask={this.props.suspendTask}
            displayInfo={this.props.displayInfo}
            data={IndexUtils.getConfigTableData(dataForTable, instanceData)}
            instancesData={instanceData}
            fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
            changeInstanceOverdraft={this.props.changeInstanceOverdraft}
            resetInstanceOverdraft={this.props.resetInstanceOverdraft}
            searchText={this.state.searchText}
            onSearch={this.onSearch}
          />
        ),
      },
      {
        name: 'Зоны',
        value: (
          <IndexOverviewInstancesTable
            user={this.props.user}
            isAdmin={this.props.isAdmin}
            isLoading={this.props.isLoading}
            displayError={this.props.displayError}
            listFulltextTasks={this.props.listFulltextTasks}
            getAllFulltextLabelsList={this.props.getAllFulltextLabelsList}
            refetchPipelines={this.refetchPipelines}
            getPipelineInfo={this.props.getPipelineInfo}
            filter={this.state.filter}
            fulltextTasks={this.props.fulltextTasks}
            deletePipelineById={this.props.deletePipelineById}
            refreshInstanceFulltext={this.props.refreshInstanceFulltext}
            resumeTask={this.props.resumeTask}
            forceRotate={this.props.forceRotate}
            suspendTask={this.props.suspendTask}
            displayInfo={this.props.displayInfo}
            data={this.getWithFilter(this.state.filter, instanceData, this.props.statuses)}
            fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
            changeInstanceOverdraft={this.props.changeInstanceOverdraft}
            resetInstanceOverdraft={this.props.resetInstanceOverdraft}
            searchText={this.state.searchText}
            onSearch={this.onSearch}
          />
        ),
      },
    ];
  }

  getSourceFilterValues() {
    let topics: string[] = [];
    let topicsObject: Array<{ name: string }> = [];

    this.state.pipelines.map((pipe) => {
      if (pipe.sources) {
        pipe.sources.kafka?.map((source) => {
          const topic = `${source.projectShortName}\/${source.topicName}`;
          if (!topics.includes(topic)) topics = [...topics, topic];
        });
      } else {
        topics.push('<invalid>');
      }
    });

    Utils.getAllPossibleValues(topics).map((topic) => (topicsObject = [...topicsObject, { name: topic }]));

    return topicsObject;
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }

    this.buildSupervisorsParts();

    const tasksList = (
      <React.Fragment>
        <Grid
          container
          style={{ width: '100%', marginTop: '1vw', margin: '1px' }}
          justifyContent="center"
          spacing={8}
          alignItems="center"
          direction="column"
        >
          <Grid
            style={{ width: '93%', alignSelf: 'center', marginTop: -6, position: 'relative' }}
            container
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Grid style={{ marginTop: 6, position: 'absolute', right: '180px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.woBackup}
                    onChange={(event) => {
                      this.setState({ ...this.state, woBackup: event.target.checked });
                      const isRiskedIndex = JSON.stringify(event.target.checked);
                      this.props.listFulltextTasks([`woBackup=${isRiskedIndex}`]);
                    }}
                    color="primary"
                    name="checkedB"
                  />
                }
                label="индексы с риском потери данных"
              />
            </Grid>
            <Grid item style={{ width: this.props.isAdmin ? 'calc(100% - 108px)' : 'calc(100% - 50px)' }}>
              <FilterMenu
                filter={this.props.filter}
                onChange={(filters) => {
                  const labels = Utils.createLabelsFilter(filters);
                  this.props.setIndexFilter(filters.length === 0 ? undefined : filters, labels.length > 0);
                  this.setState({
                    filter: filters.length === 0 ? undefined : filters,
                  });
                  if (labels.length > 0) {
                    this.props.listFulltextTasks(labels);
                  } else if (this.props.isRefetch) {
                    this.refetchPipelines();
                  }
                }}
                columns={[
                  {
                    name: 'Название',
                    field: 'name',
                    variants: Utils.getAllPossibleValues(
                      this.state.pipelines.map((pipe) => {
                        return pipe.name;
                      }),
                    ),
                  },
                  {
                    name: 'Проект',
                    field: 'shortName',
                    variants: this.props.projects.filter((project) => {
                      return Utils.getAllPossibleValues(
                        this.state.pipelines.map((pipe) => {
                          return pipe.projectShortName;
                        }),
                      ).includes(project.shortName);
                    }),
                  },
                  {
                    name: 'Источник данных',
                    field: 'name',
                    variants: this.getSourceFilterValues(),
                  },
                  {
                    name: 'Статус',
                    field: 'status',
                    variants: ['RUNNING', 'STOPPED', 'FAILED', 'UNDEFINED'],
                  },
                  {
                    name: 'Метки',
                    field: 'label',
                    variants: this.props.allLabels,
                    onlyInOperator: true,
                  },
                  {
                    name: 'Зона',
                    field: 'zone',
                    variants: this.props.allZones.availableZones,
                    onlyIsOperator: true,
                  },
                  {
                    name: 'Версия',
                    field: 'version',
                    variants: ['Совпадает', 'Не совпадает'],
                    onlyIsOperator: true,
                  },
                  {
                    name: 'Скорость обработки (%)',
                    field: 'overdraft',
                    comparisonOperators: true,
                  },
                ]}
              />
            </Grid>
            {this.props.isAdmin && (
              <Grid item style={{ width: '48px', marginTop: 6 }}>
                <IconButton
                  onClick={() => {
                    this.setState({ openDialogAllReset: true });
                  }}
                >
                  <Avatar src={speedIcon} style={{ width: 24, height: 24 }} alt="Сбросить овердрафт" />
                </IconButton>
              </Grid>
            )}
            <Grid item style={{ width: '48px', marginTop: 6 }}>
              <IconButton
                onClick={() => {
                  if (this.state.statisticIsOpen) {
                    this.setState({ statisticIsLoading: true });
                    if (this.state.shortNameProject && this.state.pipelineName && this.state.zoneId) {
                      this.props.fetchPipelineMeta(
                        this.state.shortNameProject,
                        this.state.pipelineName,
                        this.state.zoneId,
                        (meta) => {
                          this.setState({
                            meta: meta,
                            statisticIsLoading: false,
                          });
                        },
                        (errorMsg) => {
                          this.props.displayError(errorMsg);
                        },
                      );
                    }
                  }
                  this.refetchPipelines();
                }}
              >
                <Refresh id={'refreshButton'} color={'primary'} />
              </IconButton>
            </Grid>
          </Grid>
          <div style={{ display: 'flex', width: '93%', justifyContent: 'center' }}>
            <Grid container justifyContent="center" style={{ width: '100%' }} alignItems="flex-start" direction="row">
              <Grid item style={{ width: this.state.statisticIsOpen ? '75%' : '100%' }}>
                <Grid container justifyContent="center">
                  <Grid spacing={2} style={{ width: '100%' }}>
                    <Grid item xs={6} style={{ maxWidth: '100%' }}>
                      <StyledTabs
                        value={this.state.currentTab}
                        onChange={(event, value) => {
                          this.setState({ currentTab: value });
                        }}
                      >
                        {this.schemeParts.map((part, index) => {
                          if (index !== this.schemeParts.length) return <StyledTab key={part.name} label={part.name} />;
                        })}
                      </StyledTabs>
                    </Grid>
                  </Grid>
                  <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
                    <Grid item xs={10} style={{ maxWidth: '100%' }}>
                      {typeof this.state.currentTab === 'number' &&
                        this.schemeParts[this.state.currentTab] &&
                        this.schemeParts[this.state.currentTab].value}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              {this.state.statisticIsOpen && (
                <Grid item style={{ width: '25%' }}>
                  <IndexStatisticView
                    pipelineName={this.state.pipelineName || ''}
                    meta={this.state.meta}
                    zoneId={this.state.zoneId || ''}
                    isLoading={this.state.statisticIsLoading}
                    data={this.getWithFilter(
                      this.state.filter,
                      IndexUtils.getIndexOverviewDataNew(this.state.pipelines, this.props.statuses, this.props.fulltextTasks),
                      this.props.statuses,
                    )}
                    backupCount={this.state.backupCount}
                    savepointCount={this.state.savepointCount}
                    shortNameProject={this.state.shortNameProject}
                    close={() => {
                      this.setState({
                        statisticIsOpen: false,
                        statisticIsLoading: false,
                        pipelineName: undefined,
                        zoneId: undefined,
                        meta: undefined,
                        shortNameProject: undefined,
                        backupCount: null,
                        savepointCount: null,
                      });
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </div>
        </Grid>
      </React.Fragment>
    );

    // Наличие проектов говорит о том, что можно создавать
    const hasProjects = this.props.editableProjects.length > 0;

    return (
      <React.Fragment>
        <div style={{ display: 'flex', direction: 'row' as any, marginTop: 6 }}>
          <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
            Список полнотекстовых индексов
          </Typography>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
          <Grid
            container
            style={{ width: '100%', marginTop: '1vw', margin: '1px' }}
            justifyContent="center"
            spacing={8}
            alignItems="center"
            direction="column"
          >
            {tasksList}

            <ResetOverdraftDialog
              open={this.state.openDialogAllReset}
              handleClose={() => this.setState({ openDialogAllReset: false })}
              handleResetOverdraft={(zone) => {
                this.setState({
                  waitForResetOverdraft: true,
                  successResetOverdraft: false,
                  completeResetOverdraft: false,
                });
                this.props.resetZoneOverdraft(
                  zone,
                  () => {
                    this.setState({
                      successResetOverdraft: true,
                      completeResetOverdraft: true,
                    });
                  },
                  (errorMsg: { message: string; details?: string }) => {
                    this.setState({
                      completeResetOverdraft: true,
                      successResetOverdraft: false,
                      errorMessage: 'Ошибка при сбросе овердрафта в зоне ' + zone + ': ' + errorMsg.message,
                      detailsMessage: errorMsg.details,
                    });
                  },
                );
              }}
              zones={this.props.allZones.availableZones}
              displayError={this.props.displayError}
            />

            <WaitingDialog
              customFormat={true}
              title={`Сброс овердрафта в зоне`}
              open={!!this.state.waitForResetOverdraft}
              onClose={() => {
                this.setState({
                  waitForResetOverdraft: false,
                  errorMessage: '',
                });
                if (this.state.successResetOverdraft) {
                  this.refetchPipelines();
                  this.setState({ openDialogAllReset: false });
                }
              }}
              complete={!!this.state.completeResetOverdraft}
              success={!!this.state.successResetOverdraft}
              successMessage={'Все овердрафты в зоне сброшены'}
              errorMessage={this.state.errorMessage || ''}
              needDetailedInfo={true}
              details={this.state.detailsMessage}
            />

            {(this.props.isAdmin || hasProjects) && (
              <ImportFileFab
                title={'Импортировать полнотекстовый индекс из файла'}
                onChange={(event: any) => {
                  const file = event.target.files[0];
                  if (!file) return;

                  const fileReader = new FileReader();
                  fileReader.readAsText(file);

                  fileReader.onload = () => {
                    if (fileReader.result != null) {
                      try {
                        const data: Pipeline = JSON.parse(fileReader.result.toString());
                        this.props.importTask(data);
                        this.props.redirect('/index/import');
                      } catch (e) {
                        this.props.displayError('Ошибка при чтении JSON: некорректный формат данных внутри файла.');
                        event.target.value = '';
                      }
                    }
                  };
                }}
              />
            )}

            {(this.props.isAdmin || hasProjects) && (
              <AddFab
                title={'Создать полнотекстовый индекс'}
                onClick={() => {
                  this.props.redirect('/index/new');
                }}
              />
            )}
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

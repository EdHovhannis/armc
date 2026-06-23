import MaterialTable from '@material-table/core';
import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import * as React from 'react';

import { ArchivalQuota } from '../../store/archive/Types';
import { CollectorProjectQuota } from '../../store/collector/Type';
import { FlowQuota } from '../../store/flow/Types';
import { IndexQuota } from '../../store/index/Types';
import { KafkaQuota } from '../../store/kafka/Types';
import { DictionaryQuota, LookupQuota } from '../../store/lookup/Types';
import { MonitoringQuota } from '../../store/monitoring/Types';
import { OsirisCheckQuotaProject, OsirisQuotaType, OsirisTrafficQuotaProject } from '../../store/osiris/Type';
import { Project } from '../../store/project/Types';
import { UnimonProjectQuota } from '../../store/unimon/Type';
import SizeConverter from '../../utils/SizeConverter';
import { PERCENT_VALUES, tableIcons, Utils } from '../../utils/Utils';
import { AddFab } from '../utils/AddFab';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { Loader } from '../utils/Loader';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import CreateProjectForm from './CreateProjectForm';
export interface ProjectMeta {
  id: number;
  name: string;
  partitions: number;
  monTasks: number;
  flowTasks: number;
  volume: number;
  rate: number;
  lookup: number;
  dictionary: number;
  archVolume: number;
  archRate: number;
}

export interface ProjectsFormProps {
  isLoading: boolean;
  isAdmin: boolean;
  filter: FilterMenuItem[] | undefined;
  projects: Array<Project>;
  kafkaQuotas: Map<number, KafkaQuota>;
  indexQuotas: any;
  archiveQuotas: Map<string, ArchivalQuota>;
  monitoringQuotas: Map<number, MonitoringQuota>;
  processingQuotas: Map<number, FlowQuota>;
  dictionaryQuotas: Map<string, DictionaryQuota>;
  lookupQuotas: Map<string, LookupQuota>;
  unimonQuotas: Map<string, UnimonProjectQuota>;
  osirisTrafficQuotas: Map<string, OsirisTrafficQuotaProject>;
  osirisCheckQuotas: Map<string, OsirisCheckQuotaProject>;
  collectorQuotas: CollectorProjectQuota[];
}

export interface ProjectsFormDispatchProps {
  createProject(projectName: string, shortName: string);

  displayError(mdg: string);

  setProjectFilter(filter: FilterMenuItem[] | undefined): any;
}

export interface ProjectsFormState {
  opened: boolean;
  filter: FilterMenuItem[] | undefined;
}

class ProjectsForm extends React.Component<ProjectsFormProps & ProjectsFormDispatchProps & WithNavigationProps, ProjectsFormState> {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      filter: this.props.filter,
    };
  }

  getKafkaQuotaForProject(projectId): KafkaQuota {
    const quota: KafkaQuota | undefined = this.props.kafkaQuotas[projectId];
    let fQuota: KafkaQuota;
    if (!quota) {
      fQuota = {
        projectId: projectId,
        currentPartitions: 0,
        maxPartitions: 0,
        clusters: [],
      };
    } else {
      if (quota.clusters.length > 0) {
        fQuota = {
          projectId: quota.projectId,
          currentPartitions: quota.currentPartitions,
          maxPartitions: quota.maxPartitions,
          clusters: quota.clusters,
        };
      } else {
        fQuota = quota;
      }
    }
    return fQuota;
  }

  getIndexQuotaForProject(projectShortName): IndexQuota {
    const quota: IndexQuota | undefined = this.props.indexQuotas[projectShortName];
    let iQuota: IndexQuota;
    if (!quota) {
      iQuota = {
        projectShortName: projectShortName,
        currentVolume: 0,
        maxVolume: 0,
        currentRate: 0,
        maxRate: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getDictionaryQuotaForProject(projectShortName): DictionaryQuota {
    const quota: DictionaryQuota | undefined = this.props.dictionaryQuotas[projectShortName];
    let iQuota: DictionaryQuota;
    if (!quota) {
      iQuota = {
        projectShortName: projectShortName,
        maxSizeBytes: 0,
        currentSizeBytes: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getLookupQuotaForProject(projectShortName): LookupQuota {
    const quota: LookupQuota | undefined = this.props.lookupQuotas[projectShortName];
    let iQuota: LookupQuota;
    if (!quota) {
      iQuota = {
        projectShortName: projectShortName,
        maxCount: 0,
        currentCount: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getArchiveQuotaForProject(projectShortName): ArchivalQuota {
    const quota: ArchivalQuota | undefined = this.props.archiveQuotas[projectShortName];
    let iQuota: ArchivalQuota;
    if (!quota) {
      iQuota = {
        currentDataRateBytesPerSec: 0,
        currentSizeBytes: 0,
        maxDataRateBytesPerSec: 0,
        maxSizeBytes: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getMonitoringQuotaForProject(projectId): MonitoringQuota {
    const quota: MonitoringQuota | undefined = this.props.monitoringQuotas[projectId];
    let fQuota: MonitoringQuota;
    if (!quota) {
      fQuota = {
        projectId: projectId,
        currentTaskCount: 0,
        maxTaskCount: 0,
      };
    } else {
      fQuota = quota;
    }
    return fQuota;
  }

  getProcessingQuotaForProject(projectId): FlowQuota {
    const quota: FlowQuota | undefined = this.props.processingQuotas[projectId];
    let fQuota: FlowQuota;
    if (!quota) {
      fQuota = {
        project_id: projectId,
        currentQuotaSize: 0,
        maxQuotaSize: 0,
      };
    } else {
      fQuota = quota;
    }
    return fQuota;
  }

  getUnimonQuotaForProject(projectShortName): UnimonProjectQuota {
    const quota: UnimonProjectQuota | undefined = this.props.unimonQuotas[projectShortName];
    let iQuota: UnimonProjectQuota;
    if (!quota) {
      iQuota = {
        currentUtilization: 0,
        limitTrafficPerMin: 0,
        overdraftMinutes: 0,
        overdraftPercent: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getOsirisCheckQuotaForProject(projectShortName): OsirisCheckQuotaProject {
    const quota: OsirisCheckQuotaProject | undefined = this.props.osirisCheckQuotas[projectShortName];
    let iQuota: OsirisCheckQuotaProject;
    if (!quota) {
      iQuota = {
        quotaType: {
          name: OsirisQuotaType.CHECK_QUOTA,
        },
        max: 0,
        spent: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getOsirisTrafficQuotaForProject(projectShortName): OsirisTrafficQuotaProject {
    const quota: OsirisTrafficQuotaProject | undefined = this.props.osirisTrafficQuotas[projectShortName];
    let iQuota: OsirisTrafficQuotaProject;
    if (!quota) {
      iQuota = {
        quotaType: {
          name: OsirisQuotaType.TRAFFIC_QUOTA,
        },
        over: 0,
        maxSecondsInOver: 0,
        max: 0,
        spent: 0,
      };
    } else {
      iQuota = quota;
    }
    return iQuota;
  }

  getCollectorQuotaForProject(projectShortName): string {
    const quota = this.props.collectorQuotas.find((projectQuota) => projectQuota.projectName === projectShortName);
    if (quota) return quota.limitTrafficPerMin.toString();
    return '0';
  }

  compareArrays(numArray1: number[], numArray2: number[]): number {
    const result = numArray1[0] - numArray2[0];
    if (result != 0) {
      return result;
    }
    return numArray1[1] - numArray2[1];
  }

  compareByRate(projectMetric1: string, projectMetric2: string): number {
    const metricValues1 = projectMetric1.split(' / ').map((value) => {
      const valueWithDelimiter = value.split(' ');
      const delimiter = valueWithDelimiter[1].split('/')[0];
      return SizeConverter.calculateBytesByDelimiter(valueWithDelimiter[0], delimiter);
    });
    const metricValues2 = projectMetric2.split(' / ').map((value) => {
      const valueWithDelimiter = value.split(' ');
      const delimiter = valueWithDelimiter[1].split('/')[0];
      return SizeConverter.calculateBytesByDelimiter(valueWithDelimiter[0], delimiter);
    });

    return this.compareArrays(metricValues1, metricValues2);
  }

  compareByValue(projectMetric1: string, projectMetric2: string): number {
    const metricValues1 = projectMetric1.split(' / ').map((value) => Number(value));
    const metricValues2 = projectMetric2.split(' / ').map((value) => Number(value));
    return this.compareArrays(metricValues1, metricValues2);
  }

  compareByVolume(projectMetric1: string, projectMetric2: string): number {
    const metricValues1 = projectMetric1.split(' / ').map((value) => {
      const valueWithDelimiter = value.split(' ');
      const delimiter = valueWithDelimiter[1];
      return SizeConverter.calculateBytesByDelimiter(valueWithDelimiter[0], delimiter);
    });
    const metricValues2 = projectMetric2.split(' / ').map((value) => {
      const split = value.split(' ');
      return SizeConverter.calculateBytesByDelimiter(split[0], split[1]);
    });

    return this.compareArrays(metricValues1, metricValues2);
  }

  getProjectsAfterFilter(filter: FilterMenuItem[] | undefined, projects: Project[]): Project[] {
    if (filter) {
      let tmpProjects: ProjectMeta[] = projects.map((project) => {
        return {
          id: project.id,
          name: project.name,
          partitions: this.getKafkaQuotaForProject(project.id).currentPartitions / this.getKafkaQuotaForProject(project.id).maxPartitions,
          monTasks: this.getMonitoringQuotaForProject(project.id).currentTaskCount / this.getMonitoringQuotaForProject(project.id).maxTaskCount,
          flowTasks: this.getProcessingQuotaForProject(project.id).currentQuotaSize / this.getProcessingQuotaForProject(project.id).maxQuotaSize,
          volume: this.getIndexQuotaForProject(project.shortName).currentVolume / this.getIndexQuotaForProject(project.shortName).maxVolume,
          rate: this.getIndexQuotaForProject(project.shortName).currentRate / this.getIndexQuotaForProject(project.shortName).maxRate,
          dictionary:
            this.getDictionaryQuotaForProject(project.shortName).currentSizeBytes / this.getDictionaryQuotaForProject(project.shortName).maxSizeBytes,
          lookup: this.getLookupQuotaForProject(project.shortName).currentCount / this.getLookupQuotaForProject(project.shortName).maxCount,
          archVolume:
            this.getArchiveQuotaForProject(project.shortName).currentSizeBytes / this.getArchiveQuotaForProject(project.shortName).maxSizeBytes,
          archRate:
            this.getArchiveQuotaForProject(project.shortName).currentDataRateBytesPerSec /
            this.getArchiveQuotaForProject(project.shortName).maxDataRateBytesPerSec,
        };
      });
      filter.map((filter) => {
        tmpProjects = Utils.isMeetsConditionsProjects(filter, tmpProjects);
      });
      return projects.filter((project) => tmpProjects.map((pr) => pr.id).includes(project.id));
    } else {
      return projects;
    }
  }

  render() {
    if (this.props.isLoading) return <Loader />;
    else return this.renderProjects();
  }

  renderProjects() {
    const filterTextField = (
      <Grid item style={{ width: '100%', alignSelf: 'center', padding: 6 }}>
        <FilterMenu
          filter={this.props.filter}
          onChange={(data) => {
            this.setState({ filter: data.length === 0 ? undefined : data });
            this.props.setProjectFilter(data.length === 0 ? undefined : data);
          }}
          columns={[
            {
              name: 'Проект',
              field: 'name',
              variants: this.props.projects,
            },
            {
              name: 'Утилизация партиций',
              field: 'partitions',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация аналитических индексов',
              field: 'monTasks',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация справочников',
              field: 'dictionary',
              variants: PERCENT_VALUES,
            },
            {
              name: "Утилизация lookup'ов",
              field: 'lookup',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация задач обработки',
              field: 'flowTasks',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация объема полнотекстового индекса',
              field: 'volume',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация скорости полнотекстового индекса',
              field: 'rate',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация объема архивного индекса',
              field: 'archVolume',
              variants: PERCENT_VALUES,
            },
            {
              name: 'Утилизация скорости архивного индекса',
              field: 'archRate',
              variants: PERCENT_VALUES,
            },
          ]}
        />
      </Grid>
    );

    return (
      <React.Fragment>
        <Grid
          container
          style={{ width: '100%', marginTop: '1vw', margin: '1px' }}
          justifyContent="center"
          spacing={8}
          alignItems="center"
          direction="column"
        >
          {filterTextField}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Paper style={{ width: '100%' }}>
              <MaterialTable
                icons={tableIcons}
                title="Проекты"
                options={{
                  pageSize: 20,
                  pageSizeOptions: [20, 50, 100],
                  emptyRowsWhenPaging: false,
                  padding: 'dense',
                  paging: true,
                  search: true,
                  showTitle: true,
                  actionsColumnIndex: -1,
                  header: true,
                }}
                columns={[
                  { title: 'id', field: 'id', hidden: true },
                  { title: 'Проект', field: 'name' },
                  { title: 'Ключ проекта', field: 'shortName' },
                  {
                    title: 'Кол-во партиций / Макс. кол-во партиций',
                    field: 'partitions',
                    customSort: (project1, project2) => this.compareByValue(project1.partitions, project2.partitions),
                  },
                  {
                    title: 'Кол-во задач аналитического индекса / Макс. кол-во задач аналитического индекса',
                    field: 'monTasks',
                    customSort: (project1, project2) => this.compareByValue(project1.monTasks, project2.monTasks),
                  },
                  {
                    title: 'Объём справочников / Макс. объём справочников',
                    field: 'dictionary',
                    customSort: (project1, project2) => this.compareByVolume(project1.dictionary, project2.dictionary),
                  },
                  {
                    title: "Кол-во lookup'ов / Макс. кол-во lookup'ов",
                    field: 'lookup',
                    customSort: (project1, project2) => this.compareByValue(project1.lookup, project2.lookup),
                  },
                  {
                    title: 'Кол-во задач обработки / Макс. кол-во задач обработки',
                    field: 'flowTasks',
                    customSort: (project1, project2) => this.compareByValue(project1.flowTasks, project2.flowTasks),
                  },
                  {
                    title: 'Объём индексов / Макс. объём индексов',
                    field: 'volume',
                    customSort: (project1, project2) => this.compareByVolume(project1.volume, project2.volume),
                  },
                  {
                    title: 'Скорость обработки полнотекстовых индексов / Макс. скорость обработки полнотекстовых индексов',
                    field: 'rate',
                    customSort: (project1, project2) => this.compareByRate(project1.rate, project2.rate),
                  },
                  {
                    title: 'Объём архива / Макс. объём архива',
                    field: 'archVolume',
                    customSort: (project1, project2) => this.compareByVolume(project1.archVolume, project2.archVolume),
                  },
                  {
                    title: 'Скорость обработки архивных данных / Макс. скорость обработки архивных данных',
                    field: 'archRate',
                    customSort: (project1, project2) => this.compareByRate(project1.archRate, project2.archRate),
                  },
                  {
                    title: 'Трафик на подключениях / Макс. трафик в минуту (UNIMON)',
                    field: 'unimonTrafic',
                    customSort: (project1, project2) => this.compareByValue(project1.unimonTrafic, project2.unimonTrafic),
                  },
                  {
                    title: 'Время овердрафта (мин.) (UNIMON)',
                    field: 'unimonOverdraftMin',
                  },
                  {
                    title: 'Процент овердрафта (UNIMON)',
                    field: 'unimonOverdraftPecent',
                  },
                  {
                    title: 'Кол-во проверок / Макс. кол-во проверок (OSIRIS)',
                    field: 'osirisCheck',
                    customSort: (project1, project2) => this.compareByValue(project1.osirisCheck, project2.osirisCheck),
                  },
                  {
                    title: 'Текущий трафик / Макс. допустимый трафик (OSIRIS)',
                    field: 'osirisTraffic',
                    customSort: (project1, project2) => this.compareByValue(project1.osirisTraffic, project2.osirisTraffic),
                  },
                  {
                    title: 'Время овердрафта (сек.) (OSIRIS)',
                    field: 'osirisOverdraftSec',
                  },
                  {
                    title: 'Процент овердрафта (OSIRIS)',
                    field: 'osirisOverdraftPercent',
                  },
                  {
                    title: 'Квота единого коллектора',
                    field: 'collectorQuota',
                  },
                ]}
                data={this.getProjectsAfterFilter(this.state.filter, this.props.projects)
                  .sort((pr1, pr2) => {
                    return pr1.id - pr2.id;
                  })
                  .map((project) => {
                    return {
                      id: project.id,
                      name: project.name,
                      shortName: project.shortName,
                      partitions:
                        this.getKafkaQuotaForProject(project.id).currentPartitions + ' / ' + this.getKafkaQuotaForProject(project.id).maxPartitions,
                      monTasks:
                        this.getMonitoringQuotaForProject(project.id).currentTaskCount +
                        ' / ' +
                        this.getMonitoringQuotaForProject(project.id).maxTaskCount,
                      flowTasks:
                        this.getProcessingQuotaForProject(project.id).currentQuotaSize +
                        ' / ' +
                        this.getProcessingQuotaForProject(project.id).maxQuotaSize,
                      volume:
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getIndexQuotaForProject(project.shortName).currentVolume),
                          false,
                        ) +
                        ' / ' +
                        SizeConverter.makeSizeString(SizeConverter.convertBytes(this.getIndexQuotaForProject(project.shortName).maxVolume), false),
                      rate:
                        SizeConverter.makeSizeString(SizeConverter.convertBytes(this.getIndexQuotaForProject(project.shortName).currentRate), true) +
                        ' / ' +
                        SizeConverter.makeSizeString(SizeConverter.convertBytes(this.getIndexQuotaForProject(project.shortName).maxRate), true),
                      dictionary:
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getDictionaryQuotaForProject(project.shortName).currentSizeBytes),
                          false,
                        ) +
                        ' / ' +
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getDictionaryQuotaForProject(project.shortName).maxSizeBytes),
                          false,
                        ),
                      lookup:
                        this.getLookupQuotaForProject(project.shortName).currentCount +
                        ' / ' +
                        this.getLookupQuotaForProject(project.shortName).maxCount,
                      archVolume:
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getArchiveQuotaForProject(project.shortName).currentSizeBytes),
                          false,
                        ) +
                        ' / ' +
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getArchiveQuotaForProject(project.shortName).maxSizeBytes),
                          false,
                        ),
                      archRate:
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getArchiveQuotaForProject(project.shortName).currentDataRateBytesPerSec),
                          true,
                        ) +
                        ' / ' +
                        SizeConverter.makeSizeString(
                          SizeConverter.convertBytes(this.getArchiveQuotaForProject(project.shortName).maxDataRateBytesPerSec),
                          true,
                        ),
                      unimonTrafic:
                        this.getUnimonQuotaForProject(project.shortName).currentUtilization +
                        '/' +
                        this.getUnimonQuotaForProject(project.shortName).limitTrafficPerMin,
                      unimonOverdraftMin: this.getUnimonQuotaForProject(project.shortName).overdraftMinutes,
                      unimonOverdraftPecent: this.getUnimonQuotaForProject(project.shortName).overdraftPercent,
                      osirisCheck:
                        this.getOsirisCheckQuotaForProject(project.shortName).spent + '/' + this.getOsirisCheckQuotaForProject(project.shortName).max,
                      osirisTraffic:
                        this.getOsirisTrafficQuotaForProject(project.shortName).spent +
                        ' / ' +
                        this.getOsirisTrafficQuotaForProject(project.shortName).max,
                      osirisOverdraftSec: this.getOsirisTrafficQuotaForProject(project.shortName).maxSecondsInOver,
                      osirisOverdraftPercent: this.getOsirisTrafficQuotaForProject(project.shortName).over,
                      collectorQuota: this.getCollectorQuotaForProject(project.shortName),
                    };
                  })}
                localization={{
                  toolbar: {
                    searchTooltip: 'Поиск',
                    searchPlaceholder: 'Найти проект',
                  },
                  body: {
                    emptyDataSourceMessage: 'Список проектов пуст',
                    addTooltip: '',
                    deleteTooltip: 'Удалить',
                    editTooltip: 'Редактировать',
                    editRow: {
                      deleteText: 'Вы уверены, что хотите удалить проект?',
                      cancelTooltip: 'Отмена',
                      saveTooltip: 'Подтвердить',
                    },
                  },
                  header: {
                    actions: '',
                  },
                }}
                onRowClick={(event, rowData) => {
                  if (!rowData) return;
                  this.props.navigate('/settings/projects/' + rowData.id);
                }}
              />
            </Paper>
          </div>
        </Grid>

        {this.props.isAdmin && <AddFab title={'Создать проект'} onClick={() => this.setState({ opened: true })} />}
        <CreateProjectForm
          open={this.state.opened}
          displayError={this.props.displayError}
          handleClose={() => this.setState({ opened: false })}
          handleProjectCreate={(projectName, shortName) => {
            this.props.createProject(projectName, shortName);
            this.setState({ opened: false });
          }}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(ProjectsForm);

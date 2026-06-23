import { Grid, IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import * as React from 'react';

import AllTasksView from '../../containers/monitoring/AllTasksView';
import SupervisorInstanceView from '../../containers/monitoring/SupervisorInstanceView';
import { KafkaTopic } from '../../store/kafka/Types';
import { DruidSupervisorInfo } from '../../store/monitoring/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { Utils } from '../../utils/Utils';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { StyledTab, StyledTabs } from '../utils/StyledTabs';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import AllTasksNavigation from './nav/AllTasksNavigation';

export interface SupervisorOverviewProps extends WithNavigationProps {
  zones: string[];
  globalConfigurationVersion: Map<string, string>;
  globalConfigVersions: string[];
  projects: Project[];
  topics: KafkaTopic[];
  filter: FilterMenuItem[] | undefined;
  allLabels: string[];
  isRefetch?: boolean;
  supervisors: Array<DruidSupervisorInfo>;
  editableProjects: EditableProject[];
  setMonitoringFilter: (filter: FilterMenuItem[] | undefined, isRefetchFilter: boolean) => void;
  refetchSupervisors: (labels?: string[]) => void;
  refetchAllLabels: () => void;
  fetchAllZone: (okCallback?, errorCallback?) => void;
}

export interface SupervisorOverviewStat {
  currentTab: number;
  filter?: FilterMenuItem[];
}

class SupervisorOverview extends React.Component<SupervisorOverviewProps, SupervisorOverviewStat> {
  schemeParts: Array<any>;

  constructor(props) {
    super(props);
    this.state = {
      filter: this.props.filter,
      currentTab: 0,
    };

    this.refetchSupervisors = this.refetchSupervisors.bind(this);
  }

  buildSupervisorsParts() {
    this.schemeParts = [
      {
        name: 'Конфигурации',
        value: (
          <AllTasksView
            supervisors={this.getSupervisorConfigWithFilter(this.state.filter, this.props.supervisors)}
            zones={this.props.zones}
            projects={this.props.projects}
            editableProjects={this.props.editableProjects}
            fetchSupervisors={this.refetchSupervisors}
            fetchAllLabels={this.props.refetchAllLabels}
            topics={this.props.topics}
            globalConfigurationVersion={this.props.globalConfigurationVersion}
          />
        ),
      },
      {
        name: 'Зоны',
        value: (
          <SupervisorInstanceView
            globalConfigurationVersion={this.props.globalConfigurationVersion}
            supervisors={this.getSupervisorInstancesWithFilter(this.state.filter, this.props.supervisors)}
            projects={this.props.projects}
            topics={this.props.topics}
            fetchSupervisors={() => {
              this.refetchSupervisors();
            }}
          />
        ),
      },
    ];
  }

  getSupervisorConfigWithFilter(filter: FilterMenuItem[] | undefined, supervisors: DruidSupervisorInfo[]): DruidSupervisorInfo[] {
    if (filter) {
      let tmpSupervisors: DruidSupervisorInfo[] = supervisors;
      filter
        .filter((filter) => filter.field !== 'label')
        .map((filter) => {
          tmpSupervisors = Utils.isMeetsConditionsSupervisorConfig(filter, tmpSupervisors, this.props.globalConfigurationVersion);
        });
      return tmpSupervisors;
    } else {
      return supervisors;
    }
  }

  getSupervisorInstancesWithFilter(filter: FilterMenuItem[] | undefined, supervisors: DruidSupervisorInfo[]): DruidSupervisorInfo[] {
    if (filter) {
      let tmpSupervisors: DruidSupervisorInfo[] = supervisors;
      filter
        .filter((filter) => filter.field !== 'label')
        .map((filter) => {
          tmpSupervisors = Utils.isMeetsConditionsSupervisorInstance(filter, tmpSupervisors, this.props.globalConfigurationVersion);
        });
      return tmpSupervisors;
    } else {
      return supervisors;
    }
  }

  refetchSupervisors() {
    if (this.state.filter) {
      const labels = Utils.createLabelsFilter(this.state.filter);
      if (labels.length > 0) {
        this.props.refetchSupervisors(labels);
      } else {
        this.props.refetchSupervisors();
      }
    } else {
      this.props.refetchSupervisors();
    }
  }

  render() {
    this.buildSupervisorsParts();

    return (
      <React.Fragment>
        <AllTasksNavigation
          openStatisticClicked={() => {
            this.props.navigate('/monitoring/datasources');
          }}
        />
        <Grid
          style={{ width: '100%', alignSelf: 'center', paddingLeft: 6, paddingRight: 6 }}
          container
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Grid item style={{ width: 'calc(100% - 54px)' }}>
            <FilterMenu
              filter={this.props.filter}
              onChange={(filters) => {
                const labels = Utils.createLabelsFilter(filters);
                const isFilters = filters.length > 0;
                this.setState(() => ({ filter: isFilters ? filters : undefined }));
                this.props.setMonitoringFilter(isFilters ? filters : undefined, labels.length > 0);
                if (labels.length > 0) {
                  this.props.refetchSupervisors(labels);
                } else if (this.props.isRefetch || !labels.length) {
                  this.props.refetchSupervisors();
                }
              }}
              columns={[
                {
                  name: 'Название',
                  field: 'datasource',
                  variants: Utils.getAllPossibleValues(
                    this.props.supervisors.map((supervisor) => {
                      return supervisor.info.datasource;
                    }),
                  ),
                },
                {
                  name: 'Проект',
                  field: 'id',
                  variants: this.props.projects.filter((project) => {
                    return Utils.getAllPossibleValues(
                      this.props.supervisors.map((supervisor) => {
                        return supervisor.info.projectId;
                      }),
                    ).includes(project.id);
                  }),
                },
                {
                  name: 'Источник данных',
                  field: 'id',
                  variants: this.props.topics.filter((topic) => {
                    return Utils.getAllPossibleValues(
                      this.props.supervisors.map((supervisor) => {
                        return supervisor.info.topicId;
                      }),
                    ).includes(topic.id);
                  }),
                },
                {
                  name: 'Статус',
                  field: 'status',
                  variants: ['ACTIVE', 'DISABLED'],
                },
                {
                  name: 'Метки',
                  field: 'label',
                  variants: this.props.allLabels,
                  onlyInOperator: true,
                },
                {
                  name: 'Зоны',
                  field: 'zone',
                  variants: this.props.zones,
                  onlyIsOperator: true,
                },
                {
                  name: 'Версия конфигурации',
                  field: 'version',
                  variants: ['Совпадает', 'Не совпадает'],
                  onlyIsOperator: true,
                },
                {
                  name: 'Глобальная версия конфигурации',
                  field: 'globalVersion',
                  variants: ['Совпадает', 'Не совпадает'],
                  onlyIsOperator: true,
                },
                {
                  name: 'Текущая глобальная версия конфигурации',
                  field: 'currentGlobalVersion',
                  variants: this.props.globalConfigVersions.filter((version) => {
                    return Utils.getAllPossibleGlobalConfigVersions(this.props.supervisors).includes(version);
                  }),
                  onlyIsOperator: true,
                },
              ]}
            />
          </Grid>
          <Grid item style={{ width: '48px', marginTop: 6 }}>
            <IconButton
              onClick={() => {
                this.refetchSupervisors();
              }}
            >
              <Refresh id={'refreshButton'} color={'primary'} />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container justifyContent="center">
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={6} style={{ maxWidth: '100%' }}>
              <StyledTabs
                value={this.state.currentTab}
                onChange={(event, value) => {
                  this.setState({ currentTab: value });
                }}
              >
                {this.schemeParts.map((part, index) => {
                  if (index !== this.schemeParts.length) {
                    return <StyledTab key={part.name} label={part.name} />;
                  }
                  return null;
                })}
              </StyledTabs>
            </Grid>
          </Grid>
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={10} style={{ maxWidth: '100%' }}>
              {typeof this.state.currentTab === 'number' && this.schemeParts[this.state.currentTab] && this.schemeParts[this.state.currentTab].value}
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withNavigation(SupervisorOverview);

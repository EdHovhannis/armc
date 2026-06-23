import { Grid, IconButton } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Refresh } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router';

import { AuthType, User } from '../../store/auth/Types';
import { FlowOverview, FlowInstanceExtended } from '../../store/flow/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { Zone } from '../../store/zone/Types';
import { Utils } from '../../utils/Utils';
import { AddFab } from '../utils/AddFab';
import FilterMenu, { FilterMenuItem } from '../utils/FilterMenu';
import { Loader } from '../utils/Loader';
import { StyledTab, StyledTabs } from '../utils/StyledTabs';

import FlowConfigurationList from './FlowConfigurationList';
import { FlowOverviewZoneList } from './FlowOverviewZoneList';

export interface AllFlowFormProps {
  isOverviewsLoading: boolean;
  projects: Project[];
  zone: Zone;
  overview: Array<FlowOverview>;
  flowInProgress: Set<number>;
  filter: FilterMenuItem[] | undefined;
  isAdmin: boolean;
  authType?: AuthType;
  user?: User;
  editableProjects: EditableProject[];
}

export interface AllFlowFormState {
  filter?: FilterMenuItem[];
  openPermissions: boolean;
  currentTab: number;
  flowId?: number;
  flowName?: string;
  canManageAccess?: boolean;
}

export interface AllFlowDispatchProps {
  suspendInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resumeInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteInstances: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  suspendClicked: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resumeClicked: (
    id: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteClicked: (id: number, callback?: () => void, errorCallback?: (errorMsg: { message: string; details?: string }) => void) => void;
  setFlowFilter: (filter: FilterMenuItem[] | undefined) => void;
  displayError: (error: string) => void;
  addInstanceFlow: (
    flowId: number,
    zoneId: string,
    startFlow: boolean,
    callback?: (id: number) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  updateInstanceFlow: (
    flowId: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteInstanceFlow: (
    flowId: number,
    zoneId: string,
    callback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  refetchOverview: () => void;
}

export default class AllFlowForm extends React.Component<AllFlowFormProps & AllFlowDispatchProps, AllFlowFormState> {
  tabs: Array<any>;
  isLegacyMode: boolean;

  constructor(props) {
    super(props);
    this.isLegacyMode = this.props.authType === 'legacy';
    this.state = {
      openPermissions: false,
      filter: this.props.filter,
      currentTab: 0,
    };
  }

  showTabs() {
    this.tabs = [
      {
        name: 'Конфигурации',
        value: (
          <FlowConfigurationList
            isLegacyMode={this.isLegacyMode}
            refetch={() => this.props.refetchOverview()}
            projects={this.props.projects}
            overview={this.getFlowPipelinesWithFilter(
              this.state.filter,
              this.props.overview.filter((overview) => {
                return overview.businessTask === 'NON';
              }),
            )}
            zones={this.props.zone.availableZones}
            handleDeleted={this.props.deleteClicked}
            displayError={this.props.displayError}
            addInstanceFlow={this.props.addInstanceFlow}
            updateVersionInstanceFlow={this.props.updateInstanceFlow}
            suspendClicked={this.props.suspendClicked}
            resumeClicked={this.props.resumeClicked}
            deleteInstanceFlow={this.props.deleteInstanceFlow}
          />
        ),
      },
      {
        name: 'Зоны',
        value: (
          <FlowOverviewZoneList
            data={this.getInstanceFlowWithFilter(
              this.state.filter,
              this.getDataForZoneListTab(
                this.props.projects,
                this.props.overview.filter((overview) => {
                  return overview.businessTask === 'NON';
                }),
              ),
            )}
            updateVersionInstanceFlow={this.props.updateInstanceFlow}
            suspendClicked={this.props.suspendClicked}
            resumeClicked={this.props.resumeClicked}
            deleteInstanceFlow={this.props.deleteInstanceFlow}
            suspendInstances={this.props.suspendInstances}
            resumeInstances={this.props.resumeInstances}
            deleteInstances={this.props.deleteInstances}
            refetchOverview={this.props.refetchOverview}
          />
        ),
      },
    ];
  }

  renderFlowOverview() {
    this.showTabs();
    // Наличие проектов говорит о том, что можно создавать или редактировать
    const hasProjects = this.props.editableProjects.length > 0;

    return (
      <React.Fragment>
        <div style={{ display: 'flex', direction: 'row' as any, marginTop: 12 }}>
          <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
            Список потоков обработки
          </Typography>
        </div>
        {this.renderFilterMenu()}
        <Grid container justifyContent="center">
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={6} style={{ maxWidth: '100%' }}>
              <StyledTabs
                value={this.state.currentTab}
                onChange={(event, value) => {
                  this.setState({ currentTab: value });
                }}
              >
                {this.tabs.map((part, index) => {
                  if (index !== this.tabs.length) return <StyledTab label={part.name} />;
                })}
              </StyledTabs>
            </Grid>
          </Grid>
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={10} style={{ maxWidth: '100%' }}>
              {this.tabs[this.state.currentTab].value}
            </Grid>
          </Grid>
        </Grid>
        {this.state.currentTab === 0 && (this.props.isAdmin || hasProjects) && (
          <AddFab title={'Создать поток'} component={Link} {...({ to: '/flow/new' } as any)} />
        )}
      </React.Fragment>
    );
  }

  render() {
    if (this.props.isOverviewsLoading) {
      return <Loader />;
    }

    return this.renderFlowOverview();
  }

  getFlowPipelinesWithFilter(filter: FilterMenuItem[] | undefined, flows: FlowOverview[]): FlowOverview[] {
    if (filter) {
      let tmpFlows: FlowOverview[] = flows;
      filter.map((filter) => {
        tmpFlows = Utils.isMeetsConditionsFlow(filter, tmpFlows);
      });
      return tmpFlows;
    } else {
      return flows;
    }
  }

  getInstanceFlowWithFilter(filter: FilterMenuItem[] | undefined, instances: FlowInstanceExtended[]): FlowInstanceExtended[] {
    if (filter) {
      let tmpInstances: FlowInstanceExtended[] = instances;
      filter.map((filter) => {
        tmpInstances = Utils.isMeetsConditionsFlowInstances(filter, tmpInstances);
      });
      return tmpInstances;
    } else {
      return instances;
    }
  }

  getDataForZoneListTab(projects: Project[], flows: FlowOverview[]): FlowInstanceExtended[] {
    const zoneList: FlowInstanceExtended[] = [];
    flows.forEach((flow) => {
      const project = projects.find((prj) => prj.id === flow.projectId);
      let projectName = '';
      if (project) {
        projectName = project.shortName;
      }
      flow.instances.forEach((instance) => {
        zoneList.push({
          ...instance,
          flowId: flow.id,
          flowName: flow.name,
          projectId: flow.projectId,
          projectName,
          versionConfig: flow.version,
          canEdit: flow.canEdit,
          canManageAccess: flow.canManageAccess,
          useGlobalConsumerGroup: flow.useGlobalConsumerGroup,
        });
      });
    });
    return zoneList;
  }

  renderFilterMenu() {
    const filterTextField = (
      <Grid container justifyContent="flex-end">
        <Grid item style={{ width: 'calc(100% - 60px)', marginTop: -6 }}>
          <FilterMenu
            filter={this.props.filter}
            onChange={(filters) => {
              this.setState({
                filter: filters.length === 0 ? undefined : filters,
              });
              this.props.setFlowFilter(filters.length === 0 ? undefined : filters);
            }}
            columns={[
              {
                name: 'Название',
                field: 'name',
                variants: Utils.getAllPossibleValues(
                  this.props.overview.map((flow) => {
                    return flow.name;
                  }),
                ),
              },
              {
                name: 'Проект',
                field: 'id',
                variants: this.props.projects.filter((project) => {
                  return Utils.getAllPossibleValues(
                    this.props.overview.map((flow) => {
                      return flow.projectId;
                    }),
                  ).includes(project.id);
                }),
              },
              {
                name: 'Зоны',
                field: 'zone',
                variants: this.props.zone.availableZones,
                onlyIsOperator: true,
              },
              {
                name: 'Id',
                field: 'id',
                variants: Utils.getAllPossibleValues(
                  this.props.overview.map((flow) => {
                    return flow.id;
                  }),
                ),
              },
              {
                name: 'Статус',
                field: 'status',
                variants: Utils.getAllPossibleValues(
                  this.props.overview
                    .map((flow) => {
                      const statuses = flow.instances ? flow.instances.map((instance) => instance.status) : [];
                      return statuses;
                    })
                    .flat(),
                ),
              },
              {
                name: 'Версия',
                field: 'version',
                variants: ['Совпадает', 'Не совпадает'],
                onlyIsOperator: true,
              },
            ]}
          />
        </Grid>
        <Grid item style={{ width: 60 }}>
          <IconButton onClick={() => this.props.refetchOverview()}>
            <Refresh id={'refreshButton'} color={'primary'} />
          </IconButton>
        </Grid>
      </Grid>
    );
    return filterTextField;
  }
}

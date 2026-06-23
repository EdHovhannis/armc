import * as React from 'react';
import { createStyles, createTheme, Grid, IconButton, makeStyles, ThemeProvider, Tooltip, Typography } from '@material-ui/core';

import 'react-table/react-table.css';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import MenuIcon from '@material-ui/icons/Menu';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import ReactTable from 'react-table';

import SpecInfoView from '../../containers/monitoring/SpecInfoView';
import { InstanceGenericSupervisorInfo, InstanceQuotaUsage, ConfigQuotaUsage } from '../../store/monitoring/Types';
import { AnalyticIndexUtils } from '../../utils/AnalyticIndexUtils';

import { InstanceQuotaOverride } from './InstanceQuotaOverride';

const useStyles = makeStyles(() =>
  createStyles({
    customWidth: {
      maxWidth: 500,
    },
    noMaxWidth: {
      maxWidth: 'none',
    },
  }),
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#ea9313',
    },
    error: {
      main: '#ff0000',
    },
    success: {
      main: '#4CAF50',
    },
  },
});

enum MENU_TYPE {
  delete,
  start,
  stop,
  reset,
  overrideQuota,
}

export interface SupervisorInstanceTableProps {
  instances?: InstanceGenericSupervisorInfo[];
  supervisorId: number;
  supervisorName: string;
  supervisorProject: string;
  supervisorVersion: string;
  globalConfigurationVersion: Map<string, string>;
  canEdit: boolean;
  isAdmin: boolean;
  deleteSupervisorInstanceById: (taskId: number, zoneId: string) => void;
  updateSupervisorInstanceById: (taskId: number, zoneId: string, version?: string, globalConfigurationVersion?: string) => void;
  stopSupervisorInstance: (taskId: number, zoneId: string) => void;
  resetSupervisorInstance: (taskId: number, zoneId: string) => void;
  startSupervisorInstance: (taskId: number, zoneId: string) => void;
  refreshSupervisor?: (id: number) => void;
}

const ButtonMenu = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-controls={'simple-menu'}
        id={'id' + props.id}
        size={'small'}
        style={{ marginLeft: props.isPadding ? 68 : 0 }}
        color={'primary'}
      >
        <MenuIcon />
      </IconButton>
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          disabled={props.row.status === 'ACTIVE'}
          onClick={(e) => {
            props.onClose(MENU_TYPE.start, props.id, props.row.zoneId);
            handleClose();
          }}
        >
          Старт
        </MenuItem>
        <MenuItem
          disabled={props.row.status === 'DISABLED'}
          onClick={(e) => {
            props.onClose(MENU_TYPE.stop, props.id, props.row.zoneId);
            handleClose();
          }}
        >
          Стоп
        </MenuItem>
        <MenuItem
          disabled={props.row.status === 'DISABLED'}
          onClick={(e) => {
            props.onClose(MENU_TYPE.reset, props.id, props.row.zoneId);
            handleClose();
          }}
        >
          Сброс
        </MenuItem>
        <MenuItem
          disabled={!(props.canEdit || props.isAdmin)}
          onClick={(e) => {
            props.onClose(MENU_TYPE.overrideQuota, props.id, props.row.zoneId, props.original.instanceQuotaUsage, props.original.configQuotaUsage);
            handleClose();
          }}
        >
          Переопределить квоты экземпляра
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            props.onClose(MENU_TYPE.delete, props.id, props.row.zoneId);
            handleClose();
          }}
        >
          <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
        </MenuItem>
      </Menu>
    </>
  );
};

export interface SupervisorInstanceTableStat {
  infoOpen: boolean;
  instanceName?: string;
  infoZoneId?: string;
  overrideQuotaDialogOpen: boolean;
  overrideQuotaZoneId?: string;
  overrideQuotaInstanceId?: number;
  overrideQuotaInstanceQuotaUsage?: InstanceQuotaUsage;
  overrideQuotaConfigQuotaUsage?: ConfigQuotaUsage;
}

export class SupervisorInstanceTable extends React.Component<SupervisorInstanceTableProps, SupervisorInstanceTableStat> {
  constructor(props) {
    super(props);

    this.state = {
      infoOpen: false,
      overrideQuotaDialogOpen: false,
    };

    this.onCloseMenu = this.onCloseMenu.bind(this);
    this.renderUpdateButton = this.renderUpdateButton.bind(this);
    this.renderQuotaOverrideIcon = this.renderQuotaOverrideIcon.bind(this);
  }

  renderQuotaOverrideIcon(props: any) {
    const hasOverrideQuotas = !!props.original.instanceQuotaUsage;

    if (!hasOverrideQuotas) {
      return null;
    }

    const configTaskCount = props.original.configQuotaUsage?.taskCount ?? '-';
    const instanceTaskCount = props.original.instanceQuotaUsage?.taskCount ?? '-';
    const tooltipContent = `Квоты по количеству задач мониторинга конфигурации и экземпляра отличаются. Квота конфигурации ${configTaskCount}. Квота экземпляра ${instanceTaskCount}`;

    return (
      <Tooltip title={tooltipContent}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '2px solid #ea9313',
            boxSizing: 'border-box',
            display: 'inline-block',
          }}
        />
      </Tooltip>
    );
  }

  onCloseMenu(type: MENU_TYPE, id: number, zone: string, instanceQuotaUsage?: InstanceQuotaUsage, configQuotaUsage?: ConfigQuotaUsage) {
    switch (type) {
      case MENU_TYPE.start:
        this.props.startSupervisorInstance(id, zone);
        break;
      case MENU_TYPE.stop:
        this.props.stopSupervisorInstance(id, zone);
        break;
      case MENU_TYPE.delete:
        this.props.deleteSupervisorInstanceById(id, zone);
        break;
      case MENU_TYPE.reset:
        this.props.resetSupervisorInstance(id, zone);
        break;
      case MENU_TYPE.overrideQuota:
        this.setState({
          overrideQuotaDialogOpen: true,
          overrideQuotaZoneId: zone,
          overrideQuotaInstanceId: id,
          overrideQuotaInstanceQuotaUsage: instanceQuotaUsage,
          overrideQuotaConfigQuotaUsage: configQuotaUsage,
        });
        break;
    }
  }

  renderUpdateButton(props: any) {
    const classes = useStyles();

    let mode =
      props.row.version !== this.props.supervisorVersion &&
      props.row.globalConfigurationVersion !== this.props.globalConfigurationVersion.get(props.row.zoneId)
        ? 'both'
        : props.row.version !== this.props.supervisorVersion &&
            props.row.globalConfigurationVersion == this.props.globalConfigurationVersion.get(props.row.zoneId)
          ? 'supervisor'
          : props.row.version === this.props.supervisorVersion &&
              props.row.globalConfigurationVersion !== this.props.globalConfigurationVersion.get(props.row.zoneId)
            ? 'global'
            : 'none';
    if (mode === 'none') {
      return;
    }

    let title;

    if (!this.props.isAdmin && mode == 'both') {
      mode = 'supervisor';
    }

    switch (mode) {
      case 'both':
        title = (
          <React.Fragment>
            <div style={{ color: 'lemonchiffon' }}>
              <b>Версия конфигурации была изменена</b>
            </div>
            <div>Текущая версия экземпляра: {props.row.version}</div>
            <div>Актуальная версия конфигурации: {this.props.supervisorVersion}</div>
            <div style={{ color: 'lightskyblue' }}>
              <b>Версия глобальной конфигурации была изменена</b>
            </div>
            <div>Текущая версия глобальной конфигурации экземпляра: {props.row.globalConfigurationVersion}</div>
            <div>Актуальная версия глобальной конфигурации: {this.props.globalConfigurationVersion.get(props.row.zoneId)}</div>
          </React.Fragment>
        );
        break;
      case 'supervisor':
        title = (
          <React.Fragment>
            <div style={{ color: 'lemonchiffon' }}>
              <b>Версия конфигурации была изменена</b>
            </div>
            <div>Текущая версия экземпляра: {props.row.version}</div>
            <div>Актуальная версия конфигурации: {this.props.supervisorVersion}</div>
          </React.Fragment>
        );
        break;
      case 'global':
        title = (
          <React.Fragment>
            <div style={{ color: 'lightskyblue' }}>
              <b>Версия глобальной конфигурации была изменена</b>
            </div>
            <div>Текущая версия глобальной конфигурации экземпляра: {props.row.globalConfigurationVersion}</div>
            <div>Актуальная версия глобальной конфигурации: {this.props.globalConfigurationVersion.get(props.row.zoneId)}</div>
          </React.Fragment>
        );
        break;
      default:
    }

    if (!this.props.isAdmin) {
      if (mode == 'supervisor') {
        return (
          <Tooltip title={title} classes={{ tooltip: classes.noMaxWidth }} placement={'top-start'}>
            <IconButton
              onClick={() => {
                this.props.updateSupervisorInstanceById(
                  this.props.supervisorId,
                  props.row.zoneId,
                  props.row.version !== this.props.supervisorVersion ? props.row.version : undefined,
                  props.row.globalConfigurationVersion !== this.props.globalConfigurationVersion ? props.row.globalConfigurationVersion : undefined,
                );
              }}
              aria-controls={'simple-menu'}
              id={'id' + props.row.zoneId + this.props.supervisorId}
              size={'small'}
            >
              <SyncProblemIcon color={'primary'} />
            </IconButton>
          </Tooltip>
        );
      } else {
        return;
      }
    }

    return (
      <Tooltip title={title} classes={{ tooltip: classes.noMaxWidth }} placement={'top-start'}>
        <IconButton
          onClick={() => {
            this.props.updateSupervisorInstanceById(
              this.props.supervisorId,
              props.row.zoneId,
              props.row.version !== this.props.supervisorVersion ? props.row.version : undefined,
              props.row.globalConfigurationVersion !== this.props.globalConfigurationVersion.get(props.row.zoneId)
                ? props.row.globalConfigurationVersion
                : undefined,
            );
          }}
          aria-controls={'simple-menu'}
          id={'id' + props.row.zoneId + this.props.supervisorId}
          size={'small'}
        >
          <ThemeProvider theme={theme}>
            <SyncProblemIcon color={mode === 'both' ? 'error' : mode === 'supervisor' ? 'secondary' : 'primary'} />
          </ThemeProvider>
        </IconButton>
      </Tooltip>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ width: '100%' }}>
          <Grid item xs={12}>
            <div style={{ overflow: 'auto', width: '100%' }}>
              <ReactTable
                showPagination={false}
                defaultPageSize={AnalyticIndexUtils.getTablePageSize(this.props.instances)}
                style={{ width: '100%' }}
                columns={
                  this.props.isAdmin || this.props.canEdit
                    ? [
                        {
                          Header: 'Зона',
                          accessor: 'zoneId',
                          style: AnalyticIndexUtils.getTableFonts(),
                        },
                        {
                          Header: 'Статус',
                          accessor: 'status',
                          style: AnalyticIndexUtils.getTableFonts(),
                          Cell: (props) => {
                            return (
                              <Typography color={AnalyticIndexUtils.getTaskColor(props.value)} variant="body2">
                                {props.value}
                              </Typography>
                            );
                          },
                        },
                        {
                          Header: 'Отставание',
                          accessor: 'aggregatedLag',
                          style: AnalyticIndexUtils.getTableFonts(),
                        },
                        {
                          Header: '5 минут',
                          accessor: 'fiveMinuteStats',
                          style: AnalyticIndexUtils.getTableFonts(),
                          Cell: (props) => {
                            return (
                              <React.Fragment>
                                <Tooltip title="Обработано/Обработано с ошибкой/Отброшено/Unparseable">
                                  <Typography variant={'body2'}>{props.row.fiveMinuteStats || 'Undefined'}</Typography>
                                </Tooltip>
                              </React.Fragment>
                            );
                          },
                        },
                        {
                          Header: 'Общая статистика',
                          accessor: 'totalStats',
                          style: AnalyticIndexUtils.getTableFonts(),
                          Cell: (props) => {
                            return (
                              <React.Fragment>
                                <Tooltip title="Обработано/Обработано с ошибкой/Отброшено/Unparseable">
                                  <Typography variant={'body2'}>{props.row.totalStats || 'Undefined'}</Typography>
                                </Tooltip>
                              </React.Fragment>
                            );
                          },
                        },
                        {
                          Header: '',
                          accessor: 'actions',
                          resizable: false,
                          width: 120,
                          style: AnalyticIndexUtils.getTableFonts(),
                          Cell: (props) => {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                {this.renderQuotaOverrideIcon(props)}
                                {this.renderUpdateButton(props)}
                                {this.props.isAdmin && (
                                  <IconButton
                                    onClick={() => {
                                      this.setState({
                                        infoOpen: true,
                                        infoZoneId: props.row.zoneId,
                                        instanceName: `${this.props.supervisorProject}/${this.props.supervisorName} (${props.row.zoneId})`,
                                      });
                                    }}
                                    aria-controls={'simple-menu'}
                                    id={'id' + props.row.zoneId + this.props.supervisorId}
                                    color={'primary'}
                                    size={'small'}
                                  >
                                    <InfoOutlinedIcon />
                                  </IconButton>
                                )}
                                <ButtonMenu
                                  {...props}
                                  isPadding={!this.props.isAdmin && props.row.version === this.props.supervisorVersion}
                                  id={this.props.supervisorId}
                                  canEdit={this.props.canEdit}
                                  isAdmin={this.props.isAdmin}
                                  onClose={this.onCloseMenu}
                                />
                              </div>
                            );
                          },
                        },
                        {
                          Header: '',
                          accessor: 'version',
                          style: AnalyticIndexUtils.getTableFonts(),
                          show: false,
                        },
                        {
                          Header: '',
                          accessor: 'globalConfigurationVersion',
                          show: false,
                        },
                      ]
                    : [
                        {
                          Header: 'Зона',
                          accessor: 'zoneId',
                          style: AnalyticIndexUtils.getTableFonts(),
                        },
                        {
                          Header: 'Статус',
                          accessor: 'status',
                          style: AnalyticIndexUtils.getTableFonts(),
                          Cell: (props) => {
                            return (
                              <Typography color={AnalyticIndexUtils.getTaskColor(props.value)} variant="body2">
                                {props.value}
                              </Typography>
                            );
                          },
                        },
                        {
                          Header: 'Отставание',
                          accessor: 'aggregatedLag',
                          style: AnalyticIndexUtils.getTableFonts(),
                        },
                        {
                          Header: '5 минут',
                          accessor: 'fiveMinuteStats',
                          style: AnalyticIndexUtils.getTableFonts(),
                        },
                        {
                          Header: 'Общая статистика',
                          accessor: 'totalStats',
                          style: AnalyticIndexUtils.getTableFonts(),
                        },
                      ]
                }
                data={AnalyticIndexUtils.createInfoForSupervisorInstanceTable(this.props.instances || [])}
              />
            </div>
          </Grid>
        </Grid>

        {this.state.infoOpen && (
          <SpecInfoView
            zoneId={this.state.infoZoneId}
            id={this.props.supervisorId}
            isUpdate={false}
            instanceName={this.state.instanceName || ''}
            close={() => {
              this.setState({
                infoOpen: false,
                infoZoneId: undefined,
                instanceName: undefined,
              });
            }}
          />
        )}

        {this.state.overrideQuotaDialogOpen && (
          <InstanceQuotaOverride
            open={this.state.overrideQuotaDialogOpen}
            handleClose={() => this.setState({ overrideQuotaDialogOpen: false })}
            supervisorId={this.props.supervisorId}
            supervisorName={this.props.supervisorName}
            projectName={this.props.supervisorProject}
            zone={this.state.overrideQuotaZoneId || ''}
            instanceQuotaUsage={this.state.overrideQuotaInstanceQuotaUsage}
            configQuotaUsage={this.state.overrideQuotaConfigQuotaUsage}
            onUpdate={() => {
              if (this.props.refreshSupervisor) {
                this.props.refreshSupervisor(this.props.supervisorId);
              }
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

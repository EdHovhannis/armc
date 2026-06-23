import { Grid, IconButton, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Delete } from '@material-ui/icons';
import { Alert, AlertTitle } from '@material-ui/lab';
import * as React from 'react';

import GlobalConfigInZoneContainer from '../../containers/globalConfigurations/GlobalConfigInZoneContainer';
import { GlobalConfigs } from '../../store/monitoring/Types';
import { Zone } from '../../store/zone/Types';
import { GlobalConfigsUtil } from '../../utils/GlobalConfigsUtil';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { StyledTab, StyledTabs } from '../utils/StyledTabs';

interface GlobalConfigsProps {
  currentGlobalVersion: Map<string, string>;
  zone: Zone;
  currentZone: string;
  displayError: (msg: string) => void;

  getGlobalConfigsVersions: (
    zoneId: string,
    okCallback?: (versions: string[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;

  getGlobalConfigurationsForDruid: (
    zoneId: string,
    okCallback?: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  deleteUnusedGlobalConfigurations: (
    zoneId: string,
    okCallback: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  saveCurrentGlobalConfigZone: (zone: string) => void;
}

interface GlobalConfigsState {
  confirmDeleteUnused: boolean;
  waitForDeleteUnused: boolean;
  completeDeleteUnused: boolean;
  successDeleteUnused: boolean;

  error?: string;
  errorDetails?: string;
  currentTab: number;
}

export default class GlobalConfigsForm extends React.Component<GlobalConfigsProps, GlobalConfigsState> {
  schemeParts: Array<any> = new Array<any>();

  constructor(props) {
    super(props);
    this.state = {
      confirmDeleteUnused: false,
      waitForDeleteUnused: false,
      completeDeleteUnused: false,
      successDeleteUnused: false,
      currentTab: GlobalConfigsUtil.getCurrentTabFromCurrentZone(this.props.zone.availableZones, this.props.currentZone),
    };
    this.handleConfirmDeleteUnused = this.handleConfirmDeleteUnused.bind(this);
    this.buildSupervisorsParts = this.buildSupervisorsParts.bind(this);
  }

  handleConfirmDeleteUnused(value) {
    this.setState({ confirmDeleteUnused: false });
    if (value === 'Ok') {
      this.setState({
        waitForDeleteUnused: true,
        completeDeleteUnused: false,
        successDeleteUnused: false,
      });
      this.props.deleteUnusedGlobalConfigurations(
        this.schemeParts[this.state.currentTab].name,
        () => {
          this.setState({
            completeDeleteUnused: true,
            successDeleteUnused: true,
          });
        },
        (errorMsg) => {
          this.setState({
            completeDeleteUnused: true,
            successDeleteUnused: false,
            error: 'При удалении неиспользуемых конфигураций произошла ошибка: ' + errorMsg.message,
            errorDetails: errorMsg.details,
          });
        },
      );
    }
  }

  buildSupervisorsParts() {
    this.schemeParts = new Array<any>();
    this.props.zone.availableZones.map((zone, index) => {
      this.schemeParts.push({
        name: zone,
        value: <GlobalConfigInZoneContainer zoneId={zone} currentGlobalVersion={this.props.currentGlobalVersion.get(zone)} />,
      });
    });
  }

  render() {
    this.buildSupervisorsParts();
    return (
      <React.Fragment>
        <div style={{ display: 'flex', direction: 'column' as any, justifyContent: 'space-between', marginTop: 12 }}>
          <Typography variant={'h5'} style={{ marginLeft: 24 }}>
            Глобальная конфигурация аналитических индексов
          </Typography>

          <IconButton
            size={'small'}
            style={{ marginRight: 24 }}
            onClick={() => {
              this.setState({
                confirmDeleteUnused: true,
              });
            }}
          >
            <Tooltip title="Удалить неиспользуемые конфигурации в зоне">
              <Delete color={'primary'} />
            </Tooltip>
          </IconButton>
        </div>

        <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ marginTop: 10, width: '100%', marginLeft: 24 }}>
          <Alert severity="error" style={{ width: '95%' }}>
            <AlertTitle>Важно!</AlertTitle>
            Изменение глобальной конфигурации может оказать влияние на работоспособность всей системы. В конфигурацию стоит вносить только те
            параметры, назначение и воздействие которых на систему заранее известно.
          </Alert>
        </Grid>

        <Grid container justifyContent="center">
          <Grid spacing={2} style={{ width: '100%' }}>
            <Grid item xs={6} style={{ maxWidth: '100%', marginLeft: 10 }}>
              <StyledTabs
                value={this.state.currentTab}
                onChange={(event, value) => {
                  this.setState({ currentTab: value });
                  this.props.saveCurrentGlobalConfigZone(this.schemeParts[value].name);
                }}
              >
                {this.schemeParts.map((part, index) => {
                  return <StyledTab label={part.name} />;
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

        <ConfirmDialog
          warningText={`Вы уверены, что хотите удалить все неиспользуемые глобальные конфигурации в зоне? Их невозможно будет восстановить.`}
          open={this.state.confirmDeleteUnused}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmDeleteUnused}
        />

        <WaitingDialog
          title={'Удаление неиспользуемых глобальных конфигураций'}
          open={this.state.waitForDeleteUnused}
          onClose={() => {
            this.setState({ waitForDeleteUnused: false, currentTab: 0 });
            this.props.getGlobalConfigurationsForDruid(this.props.currentZone);
            this.props.getGlobalConfigsVersions(this.props.currentZone);
          }}
          complete={this.state.completeDeleteUnused}
          success={this.state.successDeleteUnused}
          successMessage={'Глобальные конфигурации успешно удалены'}
          errorMessage={this.state.error}
          customFormat={true}
          needDetailedInfo={true}
          details={this.state.errorDetails}
        />
      </React.Fragment>
    );
  }
}

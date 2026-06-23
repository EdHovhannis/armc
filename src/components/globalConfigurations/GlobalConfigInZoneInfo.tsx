import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import * as _ from 'lodash';
import * as React from 'react';

import GlobalConfigFormContainer from '../../containers/globalConfigurations/GlobalConfigFormContainer';
import { GlobalConfigs, GlobalConfigVersion } from '../../store/monitoring/Types';
import { GlobalConfigsUtil } from '../../utils/GlobalConfigsUtil';
import ConfirmDialog from '../ConfirmDialog';
import WaitingDialog from '../WaitingDialog';
import { StyledTab, StyledTabs } from '../utils/StyledTabs';

interface GlobalConfigInZoneInfoProps {
  zoneId: string;
  currentGlobalVersion: string;
  getGlobalConfigByVersion: (
    version: string,
    okCallback?: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  overwriteGlobalConfigurationsForDruid: (
    config: GlobalConfigs,
    okCallback?: (version: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;

  getGlobalConfigurationForDruid: (
    zoneId: string,
    okCallback?: (config: GlobalConfigs) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigsVersions: (
    zoneId: string,
    okCallback?: (versions: string[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  setGlobalConfigurationActive: (
    zoneId: string,
    version: string,
    okCallback: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getGlobalConfigurationVersionForDruid: (
    okCallback?: (globalVersion: GlobalConfigVersion[]) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  globalConfigVersions: string[];
}

interface GlobalConfigInZoneInfoState {
  currentTab: number;
  globalForOverwrite?: GlobalConfigs;
  version: string;

  globalConfigVersionsWithCurrentAtFirstPlace: string[];

  isConfigNew: boolean;
  activeVersion?: string;

  confirmOverwrite: boolean;
  waitForOverwrite: boolean;
  completeOverwrite: boolean;
  successOverwrite: boolean;

  error?: string;
  errorDetails?: string;
}

export class GlobalConfigInZoneInfo extends React.Component<GlobalConfigInZoneInfoProps, GlobalConfigInZoneInfoState> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
      version: this.props.currentGlobalVersion,
      globalConfigVersionsWithCurrentAtFirstPlace: GlobalConfigsUtil.reorderGlobalVersionsWithCurrent(
        this.props.globalConfigVersions,
        this.props.currentGlobalVersion,
      ),
      isConfigNew: true,
      confirmOverwrite: false,
      completeOverwrite: false,
      waitForOverwrite: false,
      successOverwrite: false,
    };
    this.handleConfirmOverwrite = this.handleConfirmOverwrite.bind(this);
  }

  componentDidUpdate(prevProps: Readonly<GlobalConfigInZoneInfoProps>, prevState: Readonly<GlobalConfigInZoneInfoState>, snapshot?: any) {
    if (
      prevProps.currentGlobalVersion !== this.props.currentGlobalVersion ||
      !_.isEqual(prevProps.globalConfigVersions, this.props.globalConfigVersions)
    ) {
      this.setState({
        version: this.props.currentGlobalVersion,
        globalConfigVersionsWithCurrentAtFirstPlace: GlobalConfigsUtil.reorderGlobalVersionsWithCurrent(
          this.props.globalConfigVersions,
          this.props.currentGlobalVersion,
        ),
      });
    }
  }

  handleConfirmOverwrite(value) {
    this.setState({ confirmOverwrite: false });
    if (value === 'Ok') {
      if (this.state.globalForOverwrite) {
        this.setState({
          waitForOverwrite: true,
          successOverwrite: false,
          completeOverwrite: false,
        });
        if (this.state.isConfigNew) {
          this.props.overwriteGlobalConfigurationsForDruid(
            this.state.globalForOverwrite,
            (version) => {
              this.setState({
                version: version,
                completeOverwrite: true,
                successOverwrite: true,
              });
            },
            (errorMsg) => {
              this.setState({
                completeOverwrite: true,
                successOverwrite: false,
                error: `При обновлении конфигурации для зоны ${this.props.zoneId} произошла ошибка: ` + errorMsg.message,
                errorDetails: errorMsg.details,
              });
            },
          );
        } else if (this.state.activeVersion) {
          this.props.setGlobalConfigurationActive(
            this.props.zoneId,
            this.state.activeVersion,
            () => {
              this.setState({
                version: this.state.activeVersion,
                completeOverwrite: true,
                successOverwrite: true,
              });
            },
            (errorMsg) => {
              this.setState({
                completeOverwrite: true,
                successOverwrite: false,
                error: `При обновлении конфигурации для зоны ${this.props.zoneId} произошла ошибка: ` + errorMsg.message,
                errorDetails: errorMsg.details,
              });
            },
          );
        }
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <div style={{ display: 'flex', direction: 'column' as any, marginTop: 8 }}>
          <Typography variant={'body2'} style={{ marginLeft: 24 }}>
            Дата последнего обновления конфигурации для зоны {this.props.zoneId}: {this.state.version}
          </Typography>
        </div>

        <Grid container direction={'row'} style={{ marginTop: 10, width: '95%', marginLeft: 24 }}>
          <Grid item style={{ width: 'calc(75% - 15px)' }}>
            <GlobalConfigFormContainer
              zoneId={this.props.zoneId}
              isActualConfig={this.state.currentTab === 0}
              overrideConfig={(globalConfig, isNew, version) => {
                this.setState({
                  isConfigNew: isNew,
                  activeVersion: isNew ? undefined : version,
                  globalForOverwrite: globalConfig,
                  confirmOverwrite: true,
                });
              }}
            />
          </Grid>
          <Grid item style={{ width: '25%', marginLeft: 15, marginTop: 20 }}>
            <StyledTabs
              TabIndicatorProps={{ style: { left: 0 } }}
              orientation="vertical"
              variant="scrollable"
              value={this.state.currentTab}
              onChange={(e, value) => {
                this.setState({ currentTab: value });
                this.props.getGlobalConfigByVersion(this.state.globalConfigVersionsWithCurrentAtFirstPlace[value]);
              }}
            >
              {this.state.globalConfigVersionsWithCurrentAtFirstPlace.map((value, index) => {
                return <StyledTab label={index === 0 ? value + ' (current)' : value} />;
              })}
            </StyledTabs>
          </Grid>
        </Grid>

        <ConfirmDialog
          warningText={
            this.state.currentTab === 0
              ? `Вы уверены, что хотите обновить глобальную конфигурацию для зоны ${this.props.zoneId}?`
              : `Вы уверены, что хотите сделать эту глобальную конфигурацию текущей для зоны ${this.props.zoneId}?`
          }
          open={this.state.confirmOverwrite}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmOverwrite}
        />

        <WaitingDialog
          title={`Обновление глобальной конфигурации для зоны ${this.props.zoneId}`}
          open={this.state.waitForOverwrite}
          onClose={() => {
            this.setState({ waitForOverwrite: false, currentTab: 0 });
            this.props.getGlobalConfigurationForDruid(this.props.zoneId);
            this.props.getGlobalConfigsVersions(this.props.zoneId);
            this.props.getGlobalConfigurationVersionForDruid();
          }}
          complete={this.state.completeOverwrite}
          success={this.state.successOverwrite}
          successMessage={`Глобальная конфигурация для зоны ${this.props.zoneId} успешно обновлена`}
          errorMessage={this.state.error}
          customFormat={true}
          needDetailedInfo={true}
          details={this.state.errorDetails}
        />
      </React.Fragment>
    );
  }
}

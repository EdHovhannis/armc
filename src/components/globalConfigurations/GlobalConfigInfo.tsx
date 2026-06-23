import { Grid, Paper } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import AceEditor from 'react-ace';

import { GlobalConfigs } from '../../store/monitoring/Types';
import { GlobalConfigsUtil } from '../../utils/GlobalConfigsUtil';

interface GlobalConfigInfoProps {
  displayError: (error: string) => void;
  overrideConfig: (globalConfig: GlobalConfigs, isNew: boolean, version: string) => void;

  monitoringGlobalConfigs?: GlobalConfigs;
  isActualConfig: boolean;
  zoneId: string;
}

interface GlobalConfigInfoState {
  version: string;
  ioConfig: string;
  tuningConfig: string;
}

export class GlobalConfigInfo extends React.Component<GlobalConfigInfoProps, GlobalConfigInfoState> {
  constructor(props) {
    super(props);
    this.state = {
      version: this.props.monitoringGlobalConfigs?.version || 'неизвестно',
      ioConfig: GlobalConfigsUtil.parseMonitoringConfig(this.props.monitoringGlobalConfigs?.ioConfig),
      tuningConfig: GlobalConfigsUtil.parseMonitoringConfig(this.props.monitoringGlobalConfigs?.tuningConfig),
    };
  }

  componentDidUpdate(prevProps: Readonly<GlobalConfigInfoProps>) {
    if (prevProps.monitoringGlobalConfigs != this.props.monitoringGlobalConfigs) {
      this.setState({
        version: this.props.monitoringGlobalConfigs?.version || 'неизвестно',
        ioConfig: GlobalConfigsUtil.parseMonitoringConfig(this.props.monitoringGlobalConfigs?.ioConfig),
        tuningConfig: GlobalConfigsUtil.parseMonitoringConfig(this.props.monitoringGlobalConfigs?.tuningConfig),
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Typography variant={'h6'} style={{ opacity: 0.84, marginLeft: 24, marginTop: 10 }}>
          ioConfig
        </Typography>
        <Paper style={{ padding: 4, marginTop: 10, marginLeft: 24, width: '95%' }}>
          <AceEditor
            readOnly={!this.props.isActualConfig}
            mode="yaml"
            theme="github"
            height={'250px'}
            value={this.state.ioConfig}
            onChange={(e) => {
              this.setState({ ioConfig: e });
            }}
            highlightActiveLine
            width={'100%'}
            setOptions={{
              showLineNumbers: true,
              tabSize: 4,
            }}
          />
        </Paper>
        <Typography variant={'h6'} style={{ opacity: 0.84, marginLeft: 24, marginTop: 10 }}>
          tuningConfig
        </Typography>
        <Paper style={{ padding: 4, marginTop: 10, marginLeft: 24, width: '95%' }}>
          <AceEditor
            readOnly={!this.props.isActualConfig}
            mode="yaml"
            theme="github"
            height={'250px'}
            value={this.state.tuningConfig}
            onChange={(e) => {
              this.setState({ tuningConfig: e });
            }}
            highlightActiveLine
            width={'100%'}
            setOptions={{
              showLineNumbers: true,
              tabSize: 4,
            }}
          />
        </Paper>
        <Grid container direction="row" justifyContent="flex-end" alignItems="center" style={{ marginTop: 10, marginLeft: 24, width: '95%' }}>
          <Button
            variant={'contained'}
            color={'primary'}
            onClick={() => {
              let ioConfig, tuningConfig;
              try {
                ioConfig = this.state.ioConfig ? GlobalConfigsUtil.serializeMonitoringConfig(this.state.ioConfig) : {};
              } catch (e) {
                this.props.displayError('Ошибка в формате вводимых данных в ioConfig.');
                return;
              }
              try {
                tuningConfig = this.state.tuningConfig ? GlobalConfigsUtil.serializeMonitoringConfig(this.state.tuningConfig) : {};
              } catch (e) {
                this.props.displayError('Ошибка в формате вводимых данных в tuningConfig.');
                return;
              }
              const globalConfig: GlobalConfigs = {
                zoneId: this.props.zoneId,
                version: this.state.version,
                ioConfig: ioConfig,
                tuningConfig: tuningConfig,
              };
              if (
                !this.props.isActualConfig ||
                this.state.ioConfig != GlobalConfigsUtil.parseMonitoringConfig(this.props.monitoringGlobalConfigs?.ioConfig) ||
                this.state.tuningConfig != GlobalConfigsUtil.parseMonitoringConfig(this.props.monitoringGlobalConfigs?.tuningConfig)
              ) {
                this.props.overrideConfig(globalConfig, this.props.isActualConfig, this.state.version);
              }
            }}
          >
            {this.props.isActualConfig ? 'Сохранить' : 'Сохранить как текущую'}
          </Button>
        </Grid>
      </React.Fragment>
    );
  }
}

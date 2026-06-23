import { Grid, Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Alert, AlertTitle } from '@material-ui/lab';
import * as React from 'react';
import AceEditor from 'react-ace';

interface AdditionalConfigurationItemProps {
  ioConfig: string;
  tuningConfig: string;
  canEdit: boolean;

  changeIoConfig: (ioConfig: string) => void;
  changeTuningConfig: (tuningConfig: string) => void;
}

interface AdditionalConfigurationItemState {
  ioConfig: string;
  tuningConfig: string;
}

export default class AdditionalConfigurationItem extends React.Component<AdditionalConfigurationItemProps, AdditionalConfigurationItemState> {
  constructor(props) {
    super(props);
    this.state = {
      ioConfig: this.props.ioConfig,
      tuningConfig: this.props.tuningConfig,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" style={{ marginTop: 10, width: '100%', marginLeft: 24 }}>
          <Alert severity="error" style={{ width: '95%' }}>
            <AlertTitle>Важно!</AlertTitle>
            Изменение параметров ниже может оказать влияние на работоспособность аналитического индекса. В конфигурацию стоит вносить только те
            параметры, назначение и воздействие которых на систему заранее известно.
          </Alert>
        </Grid>

        <Typography variant={'h6'} style={{ opacity: 0.84, marginLeft: 24, marginTop: 10 }}>
          ioConfig
        </Typography>
        <Paper style={{ padding: 4, marginTop: 10, marginLeft: 24, width: '95%' }}>
          <AceEditor
            readOnly={!this.props.canEdit}
            mode="yaml"
            theme="github"
            height={'250px'}
            value={this.state.ioConfig}
            onBlur={(e) => {
              this.props.changeIoConfig(this.state.ioConfig);
            }}
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
            readOnly={!this.props.canEdit}
            mode="yaml"
            theme="github"
            height={'250px'}
            value={this.state.tuningConfig}
            onChange={(e) => {
              this.setState({ tuningConfig: e });
            }}
            onBlur={(e) => {
              this.props.changeTuningConfig(this.state.tuningConfig);
            }}
            highlightActiveLine
            width={'100%'}
            setOptions={{
              showLineNumbers: true,
              tabSize: 4,
            }}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

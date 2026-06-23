import { ThemeProvider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

import { DruidConfigurationInfo } from '../../../store/monitoring/Types';
import { JsonPathUtils, themeJsonColor } from '../../../utils/JsonPathUtils';

interface SpecViewItemProps {
  indexConfiguration?: DruidConfigurationInfo;
}

interface SpecViewItemState {}

export default class SpecViewItem extends React.Component<SpecViewItemProps, SpecViewItemState> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Grid direction={'column'} style={{ marginLeft: 16, width: 'calc(100%-32px)' }}>
          <Grid container direction={'column'} style={{ width: '100%' }}>
            <Grid item direction={'column'} style={{ width: '100%', marginTop: 4 }}>
              <Paper style={{ padding: 4 }}>
                <ThemeProvider theme={themeJsonColor}>
                  <Typography
                    variant="body2"
                    display="block"
                    style={{ marginTop: 6, marginLeft: 6, marginRight: 6, width: '100%', fontSize: '12px' }}
                  >
                    Параметры спецификации, которые берутся из конфигурации индекса
                  </Typography>
                  <Typography
                    variant="body2"
                    display="block"
                    color={'secondary'}
                    style={{ margin: 6, marginTop: 4, width: '100%', fontSize: '12px' }}
                  >
                    Параметры спецификации, которые берутся из блока "Дополнительно"
                  </Typography>
                </ThemeProvider>
              </Paper>
            </Grid>
          </Grid>

          <Paper style={{ padding: 12, marginTop: 10 }}>{JsonPathUtils.createJsonWithColoredInfo(this.props.indexConfiguration)}</Paper>
        </Grid>
      </React.Fragment>
    );
  }
}

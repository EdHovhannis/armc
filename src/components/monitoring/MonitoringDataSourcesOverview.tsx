import { Grid } from '@material-ui/core';
import * as React from 'react';

import DatasourcesZoneView from '../../containers/monitoring/DataSourcesZoneView';
import { StyledTab, StyledTabs } from '../utils/StyledTabs';

export interface MonitoringDataSourcesOverviewProps {
  allZones: string[];
}

export interface MonitoringDataSourcesOverviewStat {
  currentTab: number;
}

export class MonitoringDataSourcesOverview extends React.Component<MonitoringDataSourcesOverviewProps, MonitoringDataSourcesOverviewStat> {
  schemeParts: Array<any>;

  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
    };
  }

  buildSupervisorsParts(zones: string[]) {
    this.schemeParts = zones.map((zone) => {
      return {
        name: zone,
        value: <DatasourcesZoneView zone={zone} />,
      };
    });
  }

  render() {
    this.buildSupervisorsParts(this.props.allZones);

    return (
      <React.Fragment>
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
                  if (index !== this.schemeParts.length) return <StyledTab label={part.name} />;
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

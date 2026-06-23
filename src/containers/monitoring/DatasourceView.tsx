import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import { MonitoringDataSourcesOverview } from '../../components/monitoring/MonitoringDataSourcesOverview';
import StatisticNavigation from '../../components/monitoring/nav/StatisticNavigation';
import { Loader } from '../../components/utils/Loader';
import { withNavigation, WithNavigationProps } from '../../components/utils/withNavigation';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';

export interface DatasourcesViewStateProps {
  allZones: string[];
  isLoading: boolean;
}

export interface DatasourcesViewDispatchProps {
  fetchAllZones: () => void;
}

export class DatasourceView extends React.Component<DatasourcesViewStateProps & DatasourcesViewDispatchProps & WithNavigationProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchAllZones();
  }

  render() {
    return (
      <React.Fragment>
        <StatisticNavigation
          goBackClicked={() => {
            this.props.navigate('/monitoring');
          }}
        />
        {this.props.isLoading && <Loader />}
        {!this.props.isLoading && <MonitoringDataSourcesOverview allZones={this.props.allZones} />}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): DatasourcesViewStateProps {
  return {
    allZones: zoneSelectors.getZones(state).availableZones,
    isLoading: zoneSelectors.isLoading(state),
  };
}

function mapDispatchToProps(dispatch: any): DatasourcesViewDispatchProps {
  return {
    fetchAllZones: () => {
      dispatch(zoneActions.fetchAllZone());
    },
  };
}

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(DatasourceView));

import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import DataSourcesForm from '../../components/monitoring/DataSourcesForm';
import { Loader } from '../../components/utils/Loader';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidDatasource } from '../../store/monitoring/Types';

export interface DataSourcesZoneViewStateProps {
  datasources: Array<DruidDatasource>;
  datasourceIsLoading: boolean;
}

export interface DataSourcesZoneViewProps {
  zone: string;
}

export interface DataSourcesZoneViewDispatchProps {
  fetchDatasources: (zone: string) => void;
}

interface DataSourcesZoneViewStat {
  zone: string;
}

class DataSourcesZoneView extends React.Component<
  DataSourcesZoneViewStateProps & DataSourcesZoneViewDispatchProps & DataSourcesZoneViewProps,
  DataSourcesZoneViewStat
> {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      zone: this.props.zone,
    };
  }

  componentDidMount() {
    this.props.fetchDatasources(this.props.zone);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.zone !== state.zone) {
      props.fetchDatasources(props.zone);
      return {
        zone: props.zone,
      };
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.props.datasourceIsLoading && <Loader />}
        {!this.props.datasourceIsLoading && <DataSourcesForm datasources={this.props.datasources} />}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): DataSourcesZoneViewStateProps {
  return {
    datasources: monitoringSelectors.getDatasources(state),
    datasourceIsLoading: monitoringSelectors.datasourcesIsLoading(state),
  };
}

function mapDispatchToProps(dispatch: any): DataSourcesZoneViewDispatchProps {
  return {
    fetchDatasources: (zone: string) => {
      dispatch(monitoringActions.fetchDatasourcesForZone(zone));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSourcesZoneView);

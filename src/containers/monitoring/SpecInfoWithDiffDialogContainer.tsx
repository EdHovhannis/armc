import * as React from 'react';
import { connect } from 'react-redux';

import SpecInfoWithDiffDialog from '../../components/monitoring/SpecInfoWithDiffDialog';
import { Loader } from '../../components/utils/Loader';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidConfigurationInfo, SupervisorDruidConfigurationInfo } from '../../store/monitoring/Types';
import * as notificationActions from '../../store/notification/Actions';
import { JsonPathUtils } from '../../utils/JsonPathUtils';

interface SpecInfoWithDiffDialogContainerDispatchProps {
  getExpectedIndexTaskConfigurationDruidInfo: (
    id: number,
    zoneId: string,
    okCallback?: (indexConfiguration: SupervisorDruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getCurrentIndexTaskConfigurationDruidInfoFromConfiguration: (id: number, zoneId: string, okCallback?, errorCallback?) => void;
  displayInfo: (info: string) => void;
}

interface SpecInfoWithDiffDialogContainerStateProps {
  isLoading: boolean;
  expectedIndexConfiguration?: SupervisorDruidConfigurationInfo;
  currentIndexConfiguration?: DruidConfigurationInfo;
}

interface SpecInfoWithDiffDialogContainerProps {
  supervisorId: number;
  zoneId: string;
  instanceName: string;
  close: () => void;
}

class SpecInfoWithDiffDialogContainer extends React.Component<
  SpecInfoWithDiffDialogContainerDispatchProps & SpecInfoWithDiffDialogContainerStateProps & SpecInfoWithDiffDialogContainerProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getCurrentIndexTaskConfigurationDruidInfoFromConfiguration(this.props.supervisorId, this.props.zoneId);
    this.props.getExpectedIndexTaskConfigurationDruidInfo(this.props.supervisorId, this.props.zoneId);
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <SpecInfoWithDiffDialog
          displayInfo={this.props.displayInfo}
          instanceName={this.props.instanceName}
          close={this.props.close}
          indexConfiguration={this.props.expectedIndexConfiguration}
          currentSupervisorSpec={this.props.currentIndexConfiguration}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): SpecInfoWithDiffDialogContainerStateProps {
  return {
    isLoading: monitoringSelectors.isDruidConfigurationLoading(state) && monitoringSelectors.isCurrentSpecForConfigurationLoading(state),
    expectedIndexConfiguration: monitoringSelectors.getIndexTaskConfigurationDruidInfo(state),
    currentIndexConfiguration: monitoringSelectors.getCurrentSpecForConfiguration(state),
  };
}

function mapDispatchToProps(dispatch: any): SpecInfoWithDiffDialogContainerDispatchProps {
  return {
    getExpectedIndexTaskConfigurationDruidInfo: (supervisor_id, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.getExpectedIndexTaskConfigurationDruidInfo(supervisor_id, zoneId, okCallback, errorCallback));
    },
    getCurrentIndexTaskConfigurationDruidInfoFromConfiguration: (id, zoneId, okCallback, errorCallback) => {
      dispatch(monitoringActions.getCurrentIndexTaskConfigurationDruidInfoFromConfiguration(id, zoneId, okCallback, errorCallback));
    },
    displayInfo: (info: string) => {
      dispatch(notificationActions.info(info));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SpecInfoWithDiffDialogContainer);

import { string } from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';

import DruidSpecDiffDialog from '../../components/monitoring/DruidSpecDiffDialog';
import { Loader } from '../../components/utils/Loader';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidConfigurationInfo, TaskData } from '../../store/monitoring/Types';
import { JsonPathUtils } from '../../utils/JsonPathUtils';

interface DruidSpecDiffContainerDispatchProps {
  getExpectedDruidSpecForConfiguration: (
    topic_id: number,
    project_id: number,
    task_data: TaskData,
    okCallback?: (indexConfiguration: DruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  getCurrentAnalyticalIndexSupervisorSpec: (
    supervisor_id: number,
    okCallback?: (indexConfiguration: DruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

interface DruidSpecDiffContainerStateProps {
  isLoading: boolean;
  expectedIndexConfiguration?: DruidConfigurationInfo;
  currentIndexConfiguration?: DruidConfigurationInfo;
}

interface DruidSpecDiffContainerProps {
  supervisorId: number;
  topicId: number;
  projectId: number;
  taskData: TaskData;
  close: () => void;
}

class DruidSpecDiffContainer extends React.Component<
  DruidSpecDiffContainerDispatchProps & DruidSpecDiffContainerStateProps & DruidSpecDiffContainerProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getExpectedDruidSpecForConfiguration(this.props.topicId, this.props.projectId, this.props.taskData);
    this.props.getCurrentAnalyticalIndexSupervisorSpec(this.props.supervisorId);
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <DruidSpecDiffDialog
          currentSupervisorSpec={JsonPathUtils.getSupervisorSpec(this.props.currentIndexConfiguration)}
          expectedSupervisorSpec={JsonPathUtils.getSupervisorSpec(this.props.expectedIndexConfiguration)}
          close={this.props.close}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): DruidSpecDiffContainerStateProps {
  return {
    isLoading: monitoringSelectors.isExpectedSpecForConfigurationLoading(state) && monitoringSelectors.isCurrentSpecForConfigurationLoading(state),
    expectedIndexConfiguration: monitoringSelectors.getExpectedSpecForConfiguration(state),
    currentIndexConfiguration: monitoringSelectors.getCurrentSpecForConfiguration(state),
  };
}

function mapDispatchToProps(dispatch: any): DruidSpecDiffContainerDispatchProps {
  return {
    getCurrentAnalyticalIndexSupervisorSpec: (supervisor_id, okCallback, errorCallback) => {
      dispatch(monitoringActions.getCurrentAnalyticalIndexSupervisorSpec(supervisor_id, okCallback, errorCallback));
    },
    getExpectedDruidSpecForConfiguration: (topic_id, project_id, task_data, okCallback, errorCallback) => {
      dispatch(monitoringActions.getExpectedDruidSpecForConfiguration(topic_id, project_id, task_data, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DruidSpecDiffContainer);

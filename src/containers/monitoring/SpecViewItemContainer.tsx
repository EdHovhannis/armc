import * as React from 'react';
import { connect } from 'react-redux';

import SpecViewItem from '../../components/monitoring/taskParts/SpecViewItem';
import { Loader } from '../../components/utils/Loader';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import { DruidConfigurationInfo, TaskData } from '../../store/monitoring/Types';

interface SpecViewItemContainerDispatchProps {
  getExpectedDruidSpecForConfiguration: (
    topic_id: number,
    project_id: number,
    task_data: TaskData,
    okCallback?: (indexConfiguration: DruidConfigurationInfo) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

interface SpecViewItemContainerStateProps {
  indexConfiguration?: DruidConfigurationInfo;
  isLoading: boolean;
}

interface SpecViewItemContainerProps {
  topic_id: number;
  project_id: number;
  taskData: TaskData;
}

class SpecViewItemContainer extends React.Component<
  SpecViewItemContainerDispatchProps & SpecViewItemContainerStateProps & SpecViewItemContainerProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getExpectedDruidSpecForConfiguration(this.props.topic_id, this.props.project_id, this.props.taskData);
  }

  render() {
    if (this.props.isLoading) {
      return <Loader />;
    }

    return (
      <React.Fragment>
        <SpecViewItem indexConfiguration={this.props.indexConfiguration} />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): SpecViewItemContainerStateProps {
  return {
    isLoading: monitoringSelectors.isExpectedSpecForConfigurationLoading(state),
    indexConfiguration: monitoringSelectors.getExpectedSpecForConfiguration(state),
  };
}

function mapDispatchToProps(dispatch: any): SpecViewItemContainerDispatchProps {
  return {
    getExpectedDruidSpecForConfiguration: (topic_id, project_id, task_data, okCallback?, errorCallback?) => {
      dispatch(monitoringActions.getExpectedDruidSpecForConfiguration(topic_id, project_id, task_data, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SpecViewItemContainer);

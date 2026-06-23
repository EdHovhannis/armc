import { IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import * as React from 'react';
import { connect } from 'react-redux';

import FlowService from '../../services/FlowService';
import * as notificationActions from '../../store/notification/Actions';

export interface InstanceFlowParameterProps {
  flowId: number;
  zoneId: string;
  status: string;
  onStatusChange?: (status: string) => void;
}

export interface InstanceFlowDispatchProps {
  displayError(message: string): any;
}

export interface InstanceFlowParameterState {
  status: string;
}

class FlowInstancesStatus extends React.Component<InstanceFlowParameterProps & InstanceFlowDispatchProps, InstanceFlowParameterState> {
  constructor(props) {
    super(props);
    this.state = {
      status: props.status,
    };
  }

  render() {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <>{this.state.status}</>
        <IconButton
          color="primary"
          size={'small'}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            FlowService.refreshFlowInstanceStatus(
              this.props.flowId,
              this.props.zoneId,
              (status: string) => {
                this.setState({ status });
                if (this.props?.onStatusChange) {
                  this.props.onStatusChange(status);
                }
              },
              (msg) => {
                this.props.displayError(msg);
              },
            );
          }}
        >
          <RefreshIcon />
        </IconButton>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch): InstanceFlowDispatchProps {
  return {
    displayError(message: string): any {
      dispatch(notificationActions.error(message));
    },
  };
}

export default connect(null, mapDispatchToProps)(FlowInstancesStatus);

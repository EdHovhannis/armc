import { DialogTitle } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';
import { connect } from 'react-redux';

import AddLabelDialog from '../../components/utils/AddLabelDialog';
import { Loader } from '../../components/utils/Loader';
import { ApplicationState } from '../../store/Store';
import * as monitoringActions from '../../store/monitoring/Actions';
import * as monitoringSelectors from '../../store/monitoring/Reducer';
import * as notificationActions from '../../store/notification/Actions';

export interface AddMonitoringLabelsDialogDispatchProps {
  fetchLabels: (projectId: number, name: string, okCallback?, errorCallback?) => void;
  addLabel: (projectId: number, name: string, label: string, okCallback?, errorCallback?) => void;
  deleteLabel: (projectId: number, name: string, label: string, okCallback?, errorCallback?) => void;
  displayError: (message: string) => void;
}

export interface AddMonitoringLabelsDialogStateProps {
  labels: string[];
  isLabelLoading: boolean;
}

export interface AddMonitoringLabelsDialogProps {
  projectShortName: string;
  projectId: number;
  name: string;
  canEdit: boolean;
  close: () => void;
  refetch: () => void;
}

class AddMonitoringLabelsDialog extends React.Component<
  AddMonitoringLabelsDialogDispatchProps & AddMonitoringLabelsDialogStateProps & AddMonitoringLabelsDialogProps,
  void
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLabels(this.props.projectId, this.props.name);
  }

  render() {
    if (this.props.isLabelLoading) {
      return (
        <Dialog
          maxWidth={'lg'}
          onClose={() => this.props.close()}
          aria-labelledby={'wait-dialog-fulltext-label-loafing'}
          open={this.props.isLabelLoading}
        >
          <DialogTitle>Загрузка меток</DialogTitle>
          <Loader style={{}} />
        </Dialog>
      );
    }
    return (
      <AddLabelDialog
        canEdit={this.props.canEdit}
        projectShortName={this.props.projectShortName}
        name={this.props.name}
        labels={this.props.labels}
        addLabel={(label) => {
          this.props.addLabel(
            this.props.projectId,
            this.props.name,
            label,
            () => {
              this.props.fetchLabels(this.props.projectId, this.props.name);
              this.props.refetch();
            },
            (error) => {
              this.props.displayError(error);
            },
          );
        }}
        displayError={this.props.displayError}
        deleteLabel={(label) => {
          this.props.deleteLabel(
            this.props.projectId,
            this.props.name,
            label,
            () => {
              this.props.fetchLabels(this.props.projectId, this.props.name);
              this.props.refetch();
            },
            (error) => {
              this.props.displayError(error);
            },
          );
        }}
        close={this.props.close}
      />
    );
  }
}

function mapStateToProps(state: ApplicationState): AddMonitoringLabelsDialogStateProps {
  return {
    labels: monitoringSelectors.getLabels(state),
    isLabelLoading: monitoringSelectors.isLabelsLoading(state),
  };
}

function mapDispatchToProps(dispatch): AddMonitoringLabelsDialogDispatchProps {
  return {
    fetchLabels: (projectId: number, name: string, okCallback?, errorCallback?) => {
      dispatch(monitoringActions.fetchLabels(projectId, name, okCallback, errorCallback));
    },
    addLabel: (projectId: number, name: string, label: string, okCallback, errorCallback) => {
      dispatch(monitoringActions.addLabel(projectId, name, label, okCallback, errorCallback));
    },
    deleteLabel: (projectId: number, name: string, label: string, okCallback, errorCallback) => {
      dispatch(monitoringActions.deleteLabels(projectId, name, label, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddMonitoringLabelsDialog);

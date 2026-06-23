import { DialogTitle } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';
import { connect } from 'react-redux';

import AddLabelDialog from '../../components/utils/AddLabelDialog';
import { Loader } from '../../components/utils/Loader';
import { ApplicationState } from '../../store/Store';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import * as notificationActions from '../../store/notification/Actions';

export interface AddMonitoringLabelsDialogDispatchProps {
  fetchLabels: (projectShortName: string, name: string, okCallback?, errorCallback?) => void;
  addLabel: (projectShortName: string, name: string, label: string, okCallback?, errorCallback?) => void;
  deleteLabel: (projectShortName: string, name: string, label: string, okCallback?, errorCallback?) => void;
  displayError: (message: string) => void;
}

export interface AddMonitoringLabelsDialogStateProps {
  labels: string[];
  isLabelLoading: boolean;
}

export interface AddMonitoringLabelsDialogProps {
  projectShortName: string;
  name: string;
  canEdit: boolean;
  close: () => void;
  refetch: () => void;
}

export interface AddMonitoringLabelsDialogState {}

class AddMonitoringLabelsDialog extends React.Component<
  AddMonitoringLabelsDialogDispatchProps & AddMonitoringLabelsDialogStateProps & AddMonitoringLabelsDialogProps,
  AddMonitoringLabelsDialogState
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLabels(this.props.projectShortName, this.props.name);
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
            this.props.projectShortName,
            this.props.name,
            label,
            () => {
              this.props.fetchLabels(this.props.projectShortName, this.props.name);
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
            this.props.projectShortName,
            this.props.name,
            label,
            () => {
              this.props.fetchLabels(this.props.projectShortName, this.props.name);
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
    labels: archiveSelectors.getLabels(state),
    isLabelLoading: archiveSelectors.isLabelsLoading(state),
  };
}

function mapDispatchToProps(dispatch): AddMonitoringLabelsDialogDispatchProps {
  return {
    fetchLabels: (projectShortName: string, name: string, okCallback?, errorCallback?) => {
      dispatch(archiveActions.fetchArchiveLabels(projectShortName, name, okCallback, errorCallback));
    },
    addLabel: (projectShortName: string, name: string, label: string, okCallback, errorCallback) => {
      dispatch(archiveActions.addArchiveLabel(projectShortName, name, label, okCallback, errorCallback));
    },
    deleteLabel: (projectShortName: string, name: string, label: string, okCallback, errorCallback) => {
      dispatch(archiveActions.deleteArchiveLabel(projectShortName, name, label, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddMonitoringLabelsDialog);

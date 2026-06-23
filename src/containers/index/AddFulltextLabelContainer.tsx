import { DialogTitle } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';
import { connect } from 'react-redux';

import AddLabelDialog from '../../components/utils/AddLabelDialog';
import { Loader } from '../../components/utils/Loader';
import { ApplicationState } from '../../store/Store';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import * as notificationActions from '../../store/notification/Actions';

export interface AddFulltextLabelContainerDispatchProps {
  fetchFulltextLabels: (projectShortName: string, name: string, okCallback?, errorCallback?) => void;
  addFulltextLabel: (projectShortName: string, name: string, label: string, okCallback?, errorCallback?) => void;
  deleteFulltextLabel: (projectShortName: string, name: string, label: string, okCallback?, errorCallback?) => void;
  displayError: (message: string) => void;
}

export interface AddFulltextLabelContainerStateProps {
  labels: string[];
  isLabelLoading: boolean;
  close: () => void;
  refetchPipelines: () => void;
}

export interface AddFulltextLabelContainerProps {
  projectShortName: string;
  name: string;
  canEdit: boolean;
}

export interface AddFulltextLabelContainerStat {}

class AddFulltextLabelContainer extends React.Component<
  AddFulltextLabelContainerDispatchProps & AddFulltextLabelContainerStateProps & AddFulltextLabelContainerProps,
  AddFulltextLabelContainerStat
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchFulltextLabels(this.props.projectShortName, this.props.name);
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
          <Loader />
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
          this.props.addFulltextLabel(
            this.props.projectShortName,
            this.props.name,
            label,
            () => {
              this.props.fetchFulltextLabels(this.props.projectShortName, this.props.name);
              this.props.refetchPipelines();
            },
            (error) => {
              this.props.displayError(error);
            },
          );
        }}
        displayError={this.props.displayError}
        deleteLabel={(label) => {
          this.props.deleteFulltextLabel(
            this.props.projectShortName,
            this.props.name,
            label,
            () => {
              this.props.fetchFulltextLabels(this.props.projectShortName, this.props.name);
              this.props.refetchPipelines();
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

function mapStateToProps(state: ApplicationState): AddFulltextLabelContainerStateProps {
  return {
    labels: indexSelectors.getLabels(state),
    isLabelLoading: indexSelectors.isLabelsLoading(state),
  };
}

function mapDispatchToProps(dispatch): AddFulltextLabelContainerDispatchProps {
  return {
    fetchFulltextLabels: (projectShortName: string, name: string, okCallback?, errorCallback?) => {
      dispatch(indexActions.fetchFulltextLabels(projectShortName, name, okCallback, errorCallback));
    },
    addFulltextLabel: (projectShortName: string, name: string, label: string, okCallback?, errorCallback?) => {
      dispatch(indexActions.addFulltextLabel(projectShortName, name, label, okCallback, errorCallback));
    },
    deleteFulltextLabel: (projectShortName: string, name: string, label: string, okCallback?, errorCallback?) => {
      dispatch(indexActions.deleteFulltextLabels(projectShortName, name, label, okCallback, errorCallback));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddFulltextLabelContainer);

import * as React from 'react';
import { connect } from 'react-redux';

import UpdateApiKeyDialog, { UpdateApiKeyDialogProps } from '../../components/apiKeys/UpdateApiKeyDialog';
import * as apiKeyActions from '../../store/apiKeys/Actions';
import * as apiKeySelectors from '../../store/apiKeys/Reducer';

export interface UpdateAPIKeyDialogViewDispatchProps {
  getTimeUnits: () => void;
}

export interface UpdateAPIKeyDialogViewStateProps {
  timeUnits: string[];
  isTimeUnitsLoading: boolean;
}

export interface UpdateAPIKeyDialogViewProps extends UpdateApiKeyDialogProps {}

class UpdateAPIKeyDialogView extends React.Component<
  UpdateAPIKeyDialogViewDispatchProps & UpdateAPIKeyDialogViewStateProps & UpdateAPIKeyDialogViewProps,
  any
> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getTimeUnits();
  }

  render() {
    return (
      <React.Fragment>
        <UpdateApiKeyDialog
          user={this.props.user}
          close={this.props.close}
          onChange={this.props.onChange}
          timeUnits={this.props.timeUnits}
          isTimeUnitsLoading={this.props.isTimeUnitsLoading}
          displayError={this.props.displayError}
          description={this.props.description}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): UpdateAPIKeyDialogViewStateProps {
  return {
    isTimeUnitsLoading: apiKeySelectors.isTimeUnitsLoading(state),
    timeUnits: apiKeySelectors.getTimeUnits(state),
  };
}

function mapDispatchToProps(dispatch: any): UpdateAPIKeyDialogViewDispatchProps {
  return {
    getTimeUnits() {
      dispatch(apiKeyActions.getTimeUnits());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateAPIKeyDialogView);

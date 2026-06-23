import * as React from 'react';
import { connect } from 'react-redux';

import GenerateAPIKeyDialog, { GenerateAPIKeyDialogProps } from '../../components/apiKeys/GenerateAPIKeyDialog';
import * as apiKeyActions from '../../store/apiKeys/Actions';
import * as apiKeySelectors from '../../store/apiKeys/Reducer';
import { User } from '../../store/auth/Types';
import * as configSelectors from '../../store/config/Reducer';
import * as userActions from '../../store/user/Actions';
import * as userSelectors from '../../store/user/Reducer';

export interface GenerateAPIKeyDialogViewDispatchProps {
  fetchUser: (user_id: number, okCallback?, errorCallback?) => void;
  getTimeUnits: () => void;
}

export interface GenerateAPIKeyDialogViewStateProps {
  minCountMask: number;
  user?: User;
  isLoading: boolean;
  timeUnits: string[];
  isTimeUnitsLoading: boolean;
}

export interface GenerateAPIKeyDialogViewProps extends GenerateAPIKeyDialogProps {}

class GenerateAPIKeyDialogView extends React.Component<
  GenerateAPIKeyDialogViewStateProps & GenerateAPIKeyDialogViewDispatchProps & GenerateAPIKeyDialogViewProps,
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
      <GenerateAPIKeyDialog
        isTimeUnitsLoading={this.props.isTimeUnitsLoading}
        timeUnits={this.props.timeUnits}
        fetchUser={this.props.fetchUser}
        user={this.props.user}
        isLoading={this.props.isLoading}
        onChange={this.props.onChange}
        close={this.props.close}
        minCountMask={this.props.minCountMask}
        displayError={this.props.displayError}
      />
    );
  }
}

function mapStateToProps(state): GenerateAPIKeyDialogViewStateProps {
  return {
    user: userSelectors.getSelectedUser(state),
    minCountMask: configSelectors.getMinCountMask(state),
    isLoading: userSelectors.isUserLoadInProgress(state),
    isTimeUnitsLoading: apiKeySelectors.isTimeUnitsLoading(state),
    timeUnits: apiKeySelectors.getTimeUnits(state),
  };
}

function mapDispatchToProps(dispatch: any): GenerateAPIKeyDialogViewDispatchProps {
  return {
    fetchUser(user_id: number, okCallback?, errorCallback?) {
      dispatch(userActions.fetchUser(user_id, okCallback, errorCallback));
    },
    getTimeUnits() {
      dispatch(apiKeyActions.getTimeUnits());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GenerateAPIKeyDialogView);

import * as React from 'react';
import { connect } from 'react-redux';

import { OverdraftConfigOverview } from '../../components/overdraft/OverdraftConfigOverview';
import { Loader } from '../../components/utils/Loader';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftActions from '../../store/overdraft/Actions';
import * as overdraftSelectors from '../../store/overdraft/Reducer';
import { OverdraftConfig } from '../../store/overdraft/Types';

export interface OverdraftConfigViewDispatchProps {
  displayError: (msg: string) => void;
  getArchiveOverdraftConfig: (okCallback?: (overdraft: OverdraftConfig) => void, errorCallback?: (error: string) => void) => void;
  getFulltextOverdraftConfig: (okCallback?: (overdraft: OverdraftConfig) => void, errorCallback?: (error: string) => void) => void;
  setArchiveOverdraftConfig: (
    overdraft: OverdraftConfig,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  setFulltextOverdraftConfig: (
    overdraft: OverdraftConfig,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
}

export interface OverdraftConfigViewStateProps {
  fulltextOverdraftConfig?: OverdraftConfig;
  archiveOverdraftConfig?: OverdraftConfig;
  isFulltextOverdraftConfigLoading: boolean;
  isArchiveOverdraftConfigLoading: boolean;
}

class OverdraftConfigView extends React.Component<OverdraftConfigViewDispatchProps & OverdraftConfigViewStateProps, any> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getArchiveOverdraftConfig();
    this.props.getFulltextOverdraftConfig();
  }

  render() {
    if (this.props.isFulltextOverdraftConfigLoading && this.props.isArchiveOverdraftConfigLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <OverdraftConfigOverview
          displayError={this.props.displayError}
          fulltextOverdraftConfig={this.props.fulltextOverdraftConfig}
          archiveOverdraftConfig={this.props.archiveOverdraftConfig}
          refresh={() => {
            this.props.getFulltextOverdraftConfig();
            this.props.getArchiveOverdraftConfig();
          }}
          setArchiveOverdraftConfig={this.props.setArchiveOverdraftConfig}
          setFulltextOverdraftConfig={this.props.setFulltextOverdraftConfig}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): OverdraftConfigViewStateProps {
  return {
    isArchiveOverdraftConfigLoading: overdraftSelectors.isArchiveOverdraftConfigLoading(state),
    isFulltextOverdraftConfigLoading: overdraftSelectors.isFulltextOverdraftConfigLoading(state),
    fulltextOverdraftConfig: overdraftSelectors.getFulltextOverdraftConfig(state),
    archiveOverdraftConfig: overdraftSelectors.getArchiveOverdraftConfig(state),
  };
}

function mapDispatchToProps(dispatch: any): OverdraftConfigViewDispatchProps {
  return {
    displayError: (msg: string) => {
      dispatch(notificationActions.error(msg));
    },
    getArchiveOverdraftConfig: (okCallback, errorCallback) => {
      dispatch(overdraftActions.getArchiveOverdraftConfig(okCallback, errorCallback));
    },
    getFulltextOverdraftConfig: (okCallback, errorCallback) => {
      dispatch(overdraftActions.getFulltextOverdraftConfig(okCallback, errorCallback));
    },
    setArchiveOverdraftConfig: (overdraft, okCallback, errorCallback) => {
      dispatch(overdraftActions.setArchiveOverdraftConfig(overdraft, okCallback, errorCallback));
    },
    setFulltextOverdraftConfig: (overdraft, okCallback, errorCallback) => {
      dispatch(overdraftActions.setFulltextOverdraftConfig(overdraft, okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OverdraftConfigView);

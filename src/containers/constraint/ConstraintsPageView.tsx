import * as React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { RouterProps } from 'react-router';

import ClusterConstraintsPage from '../../components/constraint/ClusterConstraintsPage';
import { Loader } from '../../components/utils/Loader';
import * as constraintActions from '../../store/constraint/Actions';
import * as constraintSelectors from '../../store/constraint/Reducer';
import {
  BasicAnalyticConstraint,
  BasicArchiveConstraint,
  BasicFulltextConstraint,
  ClusterConstraint,
  ConstraintType,
} from '../../store/constraint/Types';
import * as notificationActions from '../../store/notification/Actions';

export interface ConstraintsPageViewProps {
  isClusterConstraintLoading: boolean;
  clusterConstraint: ClusterConstraint;
}

export interface ConstraintsPageViewDispatchProps {
  displayError: (error: string) => void;
  updateClusterConstraint: (
    constraint: BasicArchiveConstraint | BasicAnalyticConstraint | BasicFulltextConstraint,
    type: ConstraintType,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  fetchDefaultConstraint: (okCallback?, errorCallback?) => void;
}

class ConstraintsPageView extends React.Component<ConstraintsPageViewProps & ConstraintsPageViewDispatchProps & RouterProps, any> {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.fetchDefaultConstraint();
  }

  render() {
    return (
      <React.Fragment>
        {!this.props.isClusterConstraintLoading && this.renderAllConstraints()}
        {this.props.isClusterConstraintLoading && <Loader />}
      </React.Fragment>
    );
  }

  renderAllConstraints() {
    return (
      <React.Fragment>
        <ClusterConstraintsPage
          displayError={this.props.displayError}
          constraint={this.props.clusterConstraint}
          updateClusterConstraint={(constraint, type) => {
            this.props.updateClusterConstraint(
              constraint,
              type,
              () => {
                this.props.fetchDefaultConstraint();
              },
              (error) => {
                this.props.displayError(error);
              },
            );
          }}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state): ConstraintsPageViewProps {
  return {
    isClusterConstraintLoading: constraintSelectors.isClusterConstraintLoading(state),
    clusterConstraint: constraintSelectors.getClusterConstraint(state),
  };
}

function mapDispatchToProps(dispatch: any): ConstraintsPageViewDispatchProps {
  return {
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    updateClusterConstraint: (
      constraint: BasicArchiveConstraint | BasicAnalyticConstraint | BasicFulltextConstraint,
      type: ConstraintType,
      okCallback: () => void,
      errorCallback: (message: string) => void,
    ) => {
      dispatch(constraintActions.updateClusterConstraint(constraint, type, okCallback, errorCallback));
    },
    fetchDefaultConstraint: (okCallback?, errorCallback?) => {
      dispatch(constraintActions.fetchDefaultConstraint(okCallback, errorCallback));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConstraintsPageView);

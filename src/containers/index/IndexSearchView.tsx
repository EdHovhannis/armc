import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';

import FulltextSearchView from '../../components/index/viewer/FulltextSearchView';
import { Loader } from '../../components/utils/Loader';
import { withParams, WithParamsProps } from '../../components/utils/withParams';
import { ApplicationState } from '../../store/Store';
import * as constraintsActions from '../../store/constraint/Actions';
import * as constraintsSelectors from '../../store/constraint/Reducer';
import { ConstraintType, FulltextConstraint } from '../../store/constraint/Types';
import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import { Field, Filter, LuceneQuery, TimeRange } from '../../store/index/Types';
import * as notificationActions from '../../store/notification/Actions';
import * as pipelineActions from '../../store/pipeline/Actions';
import * as pipelineSelectors from '../../store/pipeline/Reducer';
import { Pipeline, PrimaryTimeField, SearchTimeInterval } from '../../store/pipeline/Types';

const mapStateToProps = (state: ApplicationState) => {
  return {
    timeRange: indexSelectors.getTimeRange(state),
    result: indexSelectors.getQueryResult(state),
    fields: indexSelectors.getFields(state),
    primaryTimeField: pipelineSelectors.getCurrentPipeline(state)?.schema.primaryTimeField,
    isQueryLoading: indexSelectors.isQueryLoading(state),
    currentConstraint: constraintsSelectors.getCurrentConstraint(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    clearQueryIndex: (): void => {
      dispatch(indexActions.clearQueryIndex());
    },
    setTimeRange: (timeRange: TimeRange): void => {
      dispatch(indexActions.setCurrentTimeRange(timeRange));
    },
    fetchFieldsByIndexId: (projectShortName: string, indexName: string, callback: (fields: Field[]) => void): void => {
      dispatch(indexActions.fetchFieldsByIndexId(projectShortName, indexName, callback));
    },
    queryIndexById: (
      projectShortName: string,
      indexName: string,
      query: LuceneQuery,
      successFallback: () => void,
      errorFallback: (msg: string) => void,
    ): void => {
      dispatch(indexActions.queryIndexById(projectShortName, indexName, query, successFallback, errorFallback));
    },
    getPipelineInfo: (projectShortName: string, name: string, okCallback?: (pipeline: Pipeline) => void, errorCallback?: any): void => {
      dispatch(pipelineActions.getPipelineInfo(projectShortName, name, okCallback, errorCallback));
    },
    fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?: any, errorCallback?: any): void => {
      dispatch(constraintsActions.fetchConstraintForObject(taskId, type, okCallback, errorCallback));
    },
    getFulltextTaskByProjectAndName: (projectShortName: string, indexName: string, okCallback?: any, errorCallback?: any): void => {
      dispatch(indexActions.getFulltextTaskByProjectAndName(projectShortName, indexName, okCallback, errorCallback));
    },
    displayError: (error: string): void => {
      dispatch(notificationActions.error(error));
    },
  };
};

interface ParamsProps {
  projectShortName: string;
  collection: string;
}

export interface SearchField {
  name: string;
  id: number;
  type: string;
}

export interface IndexSearchViewDispatchProps {
  timeRange: TimeRange;
  isQueryLoading: boolean;
  result: any;
  fields: Field[];
  primaryTimeField: PrimaryTimeField;
  currentConstraint: FulltextConstraint;
  isCurrentConstraintLoading: boolean;

  displayError(msg: string): void;

  clearQueryIndex: () => void;
  setTimeRange: (timeRange: TimeRange) => void;

  fetchFieldsByIndexId(projectShortName: string, indexName: string, callback: (fields: Field[]) => void): void;

  getPipelineInfo(projectShortName: string, name: string, okCallback?: (pipeline: Pipeline) => void, errorCallback?: any): void;

  queryIndexById(
    projectShortName: string,
    indexName: string,
    query: LuceneQuery,
    successFallback: () => void,
    errorFallback: (msg: string) => void,
  ): void;

  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?: any, errorCallback?: any) => void;

  getFulltextTaskByProjectAndName: (projectShortName: string, indexName: string, okCallback?: any, errorCallback?: any) => void;
}

export interface IndexSearchViewState {
  fields: SearchField[];
  available: SearchField[];
  query: string;
  result: any;
  searchTimeInterval?: SearchTimeInterval;
  filter: Filter[];
  currentConstraint: FulltextConstraint;
}

class IndexSearchView extends React.Component<IndexSearchViewDispatchProps & WithParamsProps & ParamsProps, IndexSearchViewState> {
  constructor(props: IndexSearchViewDispatchProps & WithParamsProps & ParamsProps) {
    super(props);
    this.state = {
      currentConstraint: this.props.currentConstraint,
      fields: [],
      available: [],
      query: '*:*',
      result: [],
      filter: [],
    };
  }

  componentDidMount() {
    this.props.setTimeRange({
      start: () => moment.default.utc(moment.default()).subtract(5, 'minute'),
      end: () => moment.default.utc(moment.default()),
    });
    this.props.clearQueryIndex();
    this.props.getFulltextTaskByProjectAndName(this.props.projectShortName, this.props.collection, (fulltextTask: any) => {
      this.props.fetchConstraintForObject(
        fulltextTask.id,
        ConstraintType.fulltext,
        (constr: FulltextConstraint) => {
          this.setState({ currentConstraint: constr });
        },
        () => {
          const tmp: FulltextConstraint = {
            mergedRestrictions: {
              maxRecordCountByQuery: 2000,
              maxSearchTimeIntervalSec: 0,
              maxSizeBytesByQuery: 0,
            },
            inheritedRestrictions: {
              maxRecordCountByQuery: 2000,
              maxSearchTimeIntervalSec: 0,
              maxSizeBytesByQuery: 0,
            },
          };
          this.setState({ currentConstraint: tmp });
        },
      );
    });
    this.props.getPipelineInfo(this.props.projectShortName, this.props.collection);
    this.props.fetchFieldsByIndexId(this.props.projectShortName, this.props.collection, (fields: Field[]) => {});
  }

  render() {
    if (this.props.isCurrentConstraintLoading) {
      return <Loader />;
    } else {
      return (
        <FulltextSearchView
          currentConstraint={this.state.currentConstraint}
          displayError={this.props.displayError}
          indexName={this.props.collection}
          timeRange={this.props.timeRange}
          indexProject={this.props.projectShortName}
          fields={this.props.fields}
          onQuery={this.props.queryIndexById}
          primaryTimeField={this.props.primaryTimeField}
          result={this.props.result}
          isQueryLoading={this.props.isQueryLoading}
        />
      );
    }
  }
}

export default withParams(connect(mapStateToProps, mapDispatchToProps)(IndexSearchView));

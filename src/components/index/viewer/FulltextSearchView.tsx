import * as React from 'react';

import { FulltextConstraint } from '../../../store/constraint/Types';
import { Field, LuceneQuery, TimeRange } from '../../../store/index/Types';
import { PrimaryTimeField, SearchTimeInterval, TypePrimaryField } from '../../../store/pipeline/Types';
import TopicRowDetailForm from '../../kafka/viewer/TopicRowDetailForm';
import BackNavigation from '../../utils/BackNavigation';
import { Loader } from '../../utils/Loader';
import { withNavigation, WithNavigationProps } from '../../utils/withNavigation';

import { FulltextViewerSearchForm } from './FulltextViewerSearchForm';
import { RecordsForm, RecordsFormProps } from './RecordsForm';

export interface FulltextSearchViewProps {
  indexName: string;
  timeRange: TimeRange;
  indexProject: string;
  fields: Field[];
  primaryTimeField: PrimaryTimeField;

  isQueryLoading: boolean;
  currentConstraint: FulltextConstraint;
  result: any;
  displayError(error: string): any;

  onQuery(projectShortName: string, indexName: string, query: LuceneQuery, callback?, errorCallback?);
}

export interface FulltextSearchViewStat {
  selectedFields: Field[];
  query: string;
  sort: string;
  maxCount: number;
  filter: any[];
  selectedRow: string;
  defaultPageSize: number;
}

class FulltextSearchView extends React.Component<FulltextSearchViewProps & WithNavigationProps, FulltextSearchViewStat> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFields: [],
      query: '*:*',
      maxCount: 10,
      sort: 'desc',
      filter: [],
      selectedRow: '',
      defaultPageSize: 10,
    };
  }

  processFilter(filter): string {
    switch (filter.operator) {
      case 'is': {
        return filter.text.replace('is', ':');
      }
      case 'is not': {
        return '!' + filter.text.replace('is not', ':');
      }
      case 'is one of': {
        return '(' + filter.values.map((value) => filter.field + ' : ' + value).join(' OR ') + ')';
      }
      case 'is not one of': {
        return '!(' + filter.values.map((value) => filter.field + ' : ' + value).join(' OR ') + ')';
      }
      default: {
        return '';
      }
    }
  }

  renderRecordsView() {
    return (
      <React.Fragment>
        <div style={{ width: '100%', marginTop: 6 }}>
          <RecordsForm
            defaultPageSize={this.state.defaultPageSize}
            changeDefaultPageSize={(defaultPageSize) => {
              this.setState({ defaultPageSize: defaultPageSize });
            }}
            fields={this.state.selectedFields.length === 0 ? this.props.fields : this.state.selectedFields}
            data={this.props.result.docs}
            recordSelected={(record) => {
              this.setState({ selectedRow: record });
            }}
          />
        </div>
        <div style={{ width: '100%', marginTop: 12 }}>
          <TopicRowDetailForm isJSON={true} selectedRow={this.state.selectedRow} />
        </div>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <BackNavigation
          backString={'Список индексов'}
          titleString={'Просмотр данных индекса ' + this.props.indexProject + '/' + this.props.indexName}
          goBackClicked={() => {
            this.props.navigate('/index');
          }}
        />
        <div style={{ width: '100%', paddingBottom: 0, marginTop: 8 }}>
          <FulltextViewerSearchForm
            currentConstraint={this.props.currentConstraint}
            fields={this.props.fields}
            selectedFields={this.state.selectedFields}
            query={this.state.query}
            maxCount={this.state.maxCount}
            sort={this.state.sort}
            filter={this.state.filter}
            selectedFieldsChange={(selectedFields) => {
              this.setState({ selectedFields: selectedFields });
            }}
            onSearch={() => {
              if (this.state.maxCount < 0 || this.state.maxCount > this.props.currentConstraint?.mergedRestrictions?.maxRecordCountByQuery) {
                this.props.displayError(
                  `Количество записей указано неверно или превышает допустимое значение: ${this.props.currentConstraint?.mergedRestrictions?.maxRecordCountByQuery || 2000}`,
                );
                return;
              }

              const searchTimeInterval: SearchTimeInterval = {
                from: this.props.timeRange.start().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
                to: this.props.timeRange.end().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
              };
              const query: LuceneQuery = {
                query: this.state.filter.length === 0 ? this.state.query : this.state.query + ' AND ' + this.state.filter.join(' AND '),
                searchTimeInterval: searchTimeInterval,
                limit: this.state.maxCount,
              };
              if (this.state.sort != null) {
                query.sort = { __time: this.state.sort };
              }
              if (this.state.selectedFields.length > 0) {
                query.fields = this.state.selectedFields.map((field) => field.name);
              }
              this.props.onQuery(
                this.props.indexProject,
                this.props.indexName,
                query,
                () => {},
                (error) => {
                  this.props.displayError(error);
                },
              );
            }}
            filterChange={(filter) => {
              const filterRes = filter.map((filter) => this.processFilter(filter));
              this.setState({ filter: filterRes });
            }}
            sortChange={(sort) => {
              this.setState({ sort: sort });
            }}
            queryChange={(query) => {
              this.setState({ query });
            }}
            maxCountChange={(maxCount) => {
              this.setState({ maxCount: maxCount });
            }}
          />
        </div>

        {!this.props.isQueryLoading && this.renderRecordsView()}
        {this.props.isQueryLoading && <Loader />}
      </React.Fragment>
    );
  }
}

export default withNavigation(FulltextSearchView);

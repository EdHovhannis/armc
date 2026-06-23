import { withStyles, createStyles } from '@material-ui/core/styles';
import { saveAs } from 'file-saver';
import * as React from 'react';
import { RouterProps } from 'react-router';

import JournalLoader from '../../loader/JournalLoader';
import { withNavigation } from '../../utils/withNavigation';

import TraceSearchNavigation from './TraceSearchNavigation';
import TraceSearchParamsForm, { TraceSearchParamFormDispatchProps, TraceSearchParamFormProps } from './TraceSearchParamsForm';
import TraceSearchResultForm, { TraceSearchResultFormProps } from './TraceSearchResultForm';

export interface TraceSearchFormProps extends TraceSearchParamFormProps, TraceSearchResultFormProps {
  isLoading: boolean;
}

export interface TraceSearchDispatchFormProps extends TraceSearchParamFormDispatchProps {
  traceSelected: (traceId: string) => void;
}

const styles = (theme) =>
  createStyles({
    searchContainer: {
      width: '100%',
      display: 'flex' as any,
      alignItems: 'flex-start',
      flexDirection: 'row' as any,
      marginTop: 16,
      paddingLeft: 16,
    },
    searchResultContainer: {
      display: 'block',
      flexGrow: 1,
      marginLeft: 16,
    },
  });

class TraceSearchForm extends React.Component<TraceSearchFormProps & TraceSearchDispatchFormProps & RouterProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      searchResult: undefined,
    };
  }

  exportHandler = () => {
    const trace = this.props.searchResult?.fetchResult;
    if (trace) {
      const blob = new Blob([JSON.stringify(trace)], { type: 'text/json' });
      saveAs(blob, `${this.props.selectedDatasource?.name}.json`);
    }
  };

  render() {
    if (this.props.isLoading) {
      return <JournalLoader />;
    }

    const { classes } = this.props;
    return (
      <React.Fragment>
        <div>
          <TraceSearchNavigation
            openSettingsClicked={() => {
              this.props.navigate('/tracing/overview');
            }}
            exportDisabled={!this.props.searchResult?.summaryList.length}
            exportHandler={this.exportHandler}
          />
          <div className={classes.searchContainer}>
            <TraceSearchParamsForm
              datasources={this.props.datasources}
              services={this.props.services}
              startTime={this.props.startTime}
              endTime={this.props.endTime}
              filters={this.props.filters}
              keys={this.props.keys}
              limit={this.props.limit}
              rootOnlyMatch={this.props.rootOnlyMatch}
              timeSortEnabled={this.props.timeSortEnabled}
              timeSort={this.props.timeSort}
              lookBack={this.props.lookBack}
              selectedSpans={this.props.selectedSpans}
              spans={this.props.spans}
              spansLoading={this.props.spansLoading}
              servicesLoading={this.props.servicesLoading}
              keysLoading={this.props.keysLoading}
              datasourcesLoading={this.props.datasourcesLoading}
              searchRequested={this.props.searchRequested}
              endTimeChanged={this.props.endTimeChanged}
              fetchDatasources={this.props.fetchDatasources}
              fetchServices={this.props.fetchServices}
              fetchSpans={this.props.fetchSpans}
              fetchKeys={this.props.fetchKeys}
              filterChange={this.props.filterChange}
              filterAdded={this.props.filterAdded}
              filterRemoved={this.props.filterRemoved}
              filtersCleared={this.props.filtersCleared}
              limitChanged={this.props.limitChanged}
              lookBackChanged={this.props.lookBackChanged}
              rootOnlyMatchChanged={this.props.rootOnlyMatchChanged}
              timeSortChanged={this.props.timeSortChanged}
              timeSortEnabledChanged={this.props.timeSortEnabledChanged}
              selectedDatasource={this.props.selectedDatasource}
              selectedServices={this.props.selectedServices}
              datasourceSelected={this.props.datasourceSelected}
              servicesSelected={this.props.servicesSelected}
              spansSelected={this.props.spansSelected}
              startTimeChanged={this.props.startTimeChanged}
              displayError={this.props.displayError}
              traceSelected={(traceId: string) => {
                if (!this.props.selectedDatasource) {
                  this.props.displayError('Необходимо выбрать датасорс');
                  return;
                }
                this.props.traceSelected(traceId);
                this.props.navigate('/tracing/trace/' + this.props.selectedDatasource?.name + '/' + traceId);
              }}
            />
            <div className={classes.searchResultContainer}>
              <TraceSearchResultForm
                searchResult={this.props.searchResult}
                searchInProgress={this.props.searchInProgress}
                traceSelected={(traceId: string) => {
                  this.props.traceSelected(traceId);
                  this.props.navigate('/tracing/trace/' + this.props.selectedDatasource?.name + '/' + traceId);
                }}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default withStyles(styles)(withNavigation(TraceSearchForm));

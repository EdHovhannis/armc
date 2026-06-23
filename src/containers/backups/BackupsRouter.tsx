import { BackupRecovery } from '@src/components/backups/pages/BackupRecovery';
import { BackupsList } from '@src/components/backups/pages/BackupsList';
import { Incidents } from '@src/components/backups/pages/Incidents';
import { RecoveryOverview } from '@src/components/backups/pages/RecoveryOverview';
import { Savepoints } from '@src/components/backups/pages/Savepoints';
import { LoadingSpinner } from '@src/components/constraint/utils/LoadingSpinner';
import { IS_SAVEPOINTS_FEATURE_ENABLED } from '@src/components/shared/constants';
import { Loader } from '@src/components/utils/Loader';
import * as React from 'react';
import { Suspense } from 'react';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router';

import * as indexActions from '../../store/index/Actions';
import * as indexSelectors from '../../store/index/Reducer';
import * as notificationActions from '../../store/notification/Actions';

interface IBackupsRouterProps {
  isLoading: boolean;
  fulltextTasks: any[];
  listFulltextTasks: (labels?: string[], okCallback?: () => void, errorCallback?: (error: any) => void) => void;
  displayError: (error: string) => void;
  displaySuccess: (info: string) => void;
}

interface IBackupsRouterState {
  isLoading: boolean;
}

class BackupsRouter extends React.Component<IBackupsRouterProps, IBackupsRouterState> {
  constructor(props: IBackupsRouterProps) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount(): void {
    if (!this.props.fulltextTasks.length) {
      this.setState({ isLoading: true });
      this.props.listFulltextTasks(
        [],
        () => {
          this.setState({ isLoading: false });
        },
        (error: any) => {
          this.props.displayError(error);
          this.setState({ isLoading: false });
        },
      );
    }
  }

  render() {
    if (this.props.isLoading || this.state.isLoading) {
      return <Loader />;
    }

    return (
      <Routes>
        {/* Восстановление */}
        <Route
          path="/control"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <RecoveryOverview
                indexesList={this.props.fulltextTasks}
                displaySuccess={this.props.displaySuccess}
                displayError={this.props.displayError}
              />
            </Suspense>
          }
        />
        {/* Бэкапы полнотекстовых индексов */}
        <Route
          path="/list"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BackupsList indexesList={this.props.fulltextTasks} displaySuccess={this.props.displaySuccess} displayError={this.props.displayError} />
            </Suspense>
          }
        />
        {/* Задачи восстановления из backups */}
        <Route
          path="/tasks"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BackupRecovery
                indexesList={this.props.fulltextTasks}
                displaySuccess={this.props.displaySuccess}
                displayError={this.props.displayError}
              />
            </Suspense>
          }
        />
        {IS_SAVEPOINTS_FEATURE_ENABLED && (
          /* Задачи восстановления из Savepoints */
          <Route
            path="/savepoints"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Savepoints
                  indexesList={this.props.fulltextTasks}
                  displaySuccess={this.props.displaySuccess}
                  displayError={this.props.displayError}
                />
              </Suspense>
            }
          />
        )}
        {/* Управление инцидентами */}
        <Route
          path="/incidents"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Incidents indexesList={this.props.fulltextTasks} displaySuccess={this.props.displaySuccess} displayError={this.props.displayError} />
            </Suspense>
          }
        />
      </Routes>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    listFulltextTasks: (labels?: string[], okCallback?: () => void, errorCallback?: (error: any) => void) => {
      dispatch(indexActions.getFulltextTasksList(labels, okCallback, errorCallback));
    },
    displayError: (error: string) => {
      dispatch(notificationActions.error(error));
    },
    displaySuccess: (info: string) => {
      dispatch(notificationActions.success(info));
    },
  };
};

const mapStateToProps = (state: any) => {
  return {
    isLoading: indexSelectors.isFulltextTaskListLoading(state),
    fulltextTasks: indexSelectors.getFulltextTasks(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BackupsRouter);

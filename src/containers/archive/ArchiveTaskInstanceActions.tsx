import { getEnableFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { connect } from 'react-redux';

import ArchiveTaskInstanceActions, { Props } from '../../components/archive/ArchiveTaskInstancesTable/ArchiveTaskInstanceActions';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import * as authSelectors from '../../store/auth/Reducer';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftSelectors from '../../store/overdraft/Reducer';

const mapStateToProps = (state, props) => {
  const archiveOverdraftConfig = overdraftSelectors.getArchiveOverdraftConfig(state);
  const archiveTaskInstances = archiveSelectors.getArchiveTaskInstances(state);
  let overdraftedTasksCount = 0;
  archiveTaskInstances.forEach((instance) => {
    if (instance.overdraftPercent > 0) {
      overdraftedTasksCount += 1;
    }
  });

  const user = authSelectors.user(state);

  const instance = archiveSelectors.getArchiveTaskInstance(state, props.archiveTaskInstanceId);
  const archiveTask = instance && archiveSelectors.getArchiveTaskWithRole(state, instance.name, instance.project);
  const instanceStatus = instance?.status;
  const isZone = Boolean(props.isZone);
  return {
    instance,
    instanceStatus: typeof instanceStatus === 'object' ? instanceStatus : undefined,
    archiveTask,
    archiveOverdraftConfig,
    isMaxAvailableOverdraftsReached: overdraftedTasksCount >= (archiveOverdraftConfig?.maxOverdraftedTasks || 0),
    user,
    isZone,
    isLoadingStatusesPagination: archiveSelectors.isLoadingStatusesPagination(state),
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
  };
};

const mapDispatchToProps = (dispatch, props: Omit<Props, 'refetchStatus'>) => {
  return {
    refetchStatus: () => {
      dispatch(archiveActions.fetchArchiveTaskInstanceStatuses([props.archiveTaskInstanceId]));
    },
    suspendArchiveInstance: () => {
      dispatch(archiveActions.suspendArchiveInstances([props.archiveTaskInstanceId]));
    },
    resumeArchiveInstance: () => {
      dispatch(archiveActions.resumeArchiveInstances([props.archiveTaskInstanceId]));
    },
    resetArchiveTaskInstance: () => {
      dispatch(archiveActions.resetArchiveTaskInstance(props.archiveTaskInstanceId));
    },
    deleteArchiveTaskInstance: () => {
      dispatch(archiveActions.deleteArchiveTaskInstances([props.archiveTaskInstanceId]));
    },
    updateArchiveTaskInstance: () => {
      dispatch(archiveActions.updateArchiveTaskInstance(props.archiveTaskInstanceId));
    },
    displayError: (error) => {
      dispatch(notificationActions.error(error));
    },
    setEditArchiveTaskInstanceOverdraft: () => {
      dispatch(archiveActions.editArchiveTaskInstanceOverdraftAction(props.archiveTaskInstanceId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveTaskInstanceActions);

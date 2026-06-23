import { connect } from 'react-redux';

import ArchiveZoneInstancesTable from '../../components/archive/ArchiveZoneInstancesTable';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchiveTaskInstance, ArchiveTaskInstanceStatus } from '../../store/archive/Types';
import * as authSelectors from '../../store/auth/Reducer';
import { getEnableFeatureSettingLimits } from '../../store/featureSettings/Reducer';
import * as notificationActions from '../../store/notification/Actions';

const mapStateToProps = (state, props) => {
  const archiveTaskInstanceStatus: {
    instance: ArchiveTaskInstance;
    status?: ArchiveTaskInstanceStatus;
  }[] = props.archiveTaskInstancesIds.map((archiveTaskInstanceId) => {
    const instance = archiveSelectors.getArchiveTaskInstance(state, archiveTaskInstanceId);
    return {
      instance,
      status: instance?.status,
    };
  });

  return {
    archiveTaskInstanceStatus,
    isAdmin: authSelectors.user(state)?.admin,
    isLoadingStatusesPagination: archiveSelectors.isLoadingStatusesPagination(state),
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchArchiveTaskInstanceStatuses: (archiveTaskInstanceIds: string[]) =>
    dispatch(archiveActions.fetchArchiveTaskInstanceStatuses(archiveTaskInstanceIds)),
  resumeArchiveInstances: (archiveTaskInstancesId: string[]) => dispatch(archiveActions.resumeArchiveInstances(archiveTaskInstancesId)),
  suspendArchiveInstances: (archiveTaskInstancesId: string[]) => dispatch(archiveActions.suspendArchiveInstances(archiveTaskInstancesId)),
  deleteArchiveTaskInstances: (archiveTaskInstancesId: string[]) => dispatch(archiveActions.deleteArchiveTaskInstances(archiveTaskInstancesId)),
  resetInstanceOverdrafts: (archiveTaskInstancesId: string[]) => dispatch(archiveActions.resetInstanceOverdrafts(archiveTaskInstancesId)),
  showUnableToChangeNotification: (archiveTaskInstancesId: string[]) =>
    dispatch(
      archiveTaskInstancesId.length === 1
        ? notificationActions.error(`У вас нет прав на изменение экземпляра  ${archiveTaskInstancesId[0]}`)
        : notificationActions.error(`У вас нет прав на изменение экземпляров ${archiveTaskInstancesId.join(',')}`),
    ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveZoneInstancesTable);

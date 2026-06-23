import { connect } from 'react-redux';

import ArchiveTaskInstancesTable from '../../components/archive/ArchiveTaskInstancesTable/ArchiveTaskInstanceTable';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchivalStatus, ArchiveTaskInstance, ArchiveTaskInstanceStatus } from '../../store/archive/Types';
import { getEnableFeatureSettingLimits } from '../../store/featureSettings/Reducer';

const mapStateToProps = (state, props) => {
  const archiveTaskInstanceStatus: {
    instance: ArchiveTaskInstance;
    status: ArchiveTaskInstanceStatus;
  }[] = props.archiveTaskInstancesIds.map((archiveTaskInstanceId) => {
    const instance = archiveSelectors.getArchiveTaskInstance(state, archiveTaskInstanceId);
    const status = instance?.status
      ? instance?.status
      : { indexing: { status: ArchivalStatus.WITHOUT_RESPONSE }, storage: { currentSizeBytes: 0, maxSizeBytes: 0 } };
    return {
      instance,
      status: status,
    };
  });
  const archives = state.archive.archivesWithRoles;
  return {
    archives,
    archiveTaskInstanceStatus,
    isLimitFeatureSettingEnabled: getEnableFeatureSettingLimits(state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchArchiveTaskInstanceStatuses: (archiveTaskInstanceIds: string[]) => {
    dispatch(archiveActions.fetchArchiveTaskInstanceStatuses(archiveTaskInstanceIds));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveTaskInstancesTable);

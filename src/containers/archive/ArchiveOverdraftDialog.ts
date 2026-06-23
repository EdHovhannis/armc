import { connect } from 'react-redux';

import ArchiveOverdraftDialog from '../../components/archive/ArchiveOverdraftDialog';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import * as authSelectors from '../../store/auth/Reducer';
import * as notificationActions from '../../store/notification/Actions';
import * as overdraftSelectors from '../../store/overdraft/Reducer';
import { ArchiveUtils } from '../../utils/ArchiveUtils';

const mapStateToProps = (state) => {
  const archiveTaskInstanceId = archiveSelectors.getEditArchiveTaskInstanceOverdraftId(state);
  const instance = archiveTaskInstanceId && archiveSelectors.getArchiveTaskInstance(state, archiveTaskInstanceId);
  const archiveOverdraftConfig = overdraftSelectors.getArchiveOverdraftConfig(state);
  return {
    open: Boolean(archiveTaskInstanceId),
    archiveTaskConfig: instance && archiveSelectors.getArchiveTaskConfig(state, ArchiveUtils.getArchiveTaskId(instance.project, instance.name)),
    archiveOverdraftConfig,
    instance,
    isAdmin: authSelectors.user(state)?.admin,
  };
};
const mapDispatchToProps = (dispatch, props) => ({
  refetchArchiveTasks: () => {
    dispatch(archiveActions.fetchListArchivesWithRoles());
  },
  displayError: (error) => {
    dispatch(notificationActions.error(error));
  },
  resetInstanceOverdraft: (
    archiveTaskInstanceId: string,
    okCallback?: () => void,
    errorCallback?: (errors: { msg: string; archiveTaskInstanceId: string }[]) => void,
  ) => {
    dispatch(archiveActions.resetInstanceOverdrafts([archiveTaskInstanceId], okCallback, errorCallback));
  },
  changeInstanceOverdraft: (archiveTaskInstanceId: string, value: number, okCallback?, errorCallback?) => {
    dispatch(archiveActions.changeArchiveInstanceOverdraft(archiveTaskInstanceId, value, okCallback, errorCallback));
  },
  fetchArchiveTaskConfig: (project: string, name: string) => {
    dispatch(archiveActions.fetchArchiveTaskConfig(project, name));
  },
  handleClose: () => {
    dispatch(archiveActions.closeEditArchiveTaskInstanceOverdraft());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveOverdraftDialog);

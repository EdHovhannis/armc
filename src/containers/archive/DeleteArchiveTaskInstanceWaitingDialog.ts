import { connect } from 'react-redux';

import DeleteArchiveTaskInstanceWaitingDialog from '../../components/archive/DeleteArchiveTaskInstanceWaitingDialog';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';

const mapStateToProps = (state) => ({
  archiveTaskInstancesDeletePairs: archiveSelectors.getArchiveTaskInstancesDeletePairs(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClose: (page, nameLike) => {
    dispatch(archiveActions.clearDeleteArchiveTaskInstances());
    dispatch(
      archiveActions.fetchListArchivesWithRoles(
        () => {},
        () => {},
        page,
        nameLike,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteArchiveTaskInstanceWaitingDialog);

import { connect } from 'react-redux';

import ResetArchiveTaskInstanceOverdraftWaitingDialog from '../../components/archive/ResetArchiveTaskInstanceOverdraftWaitingDialog';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';

const mapStateToProps = (state) => ({
  archiveTaskInstancesPairs: archiveSelectors.getResetArchiveTaskInstanceOverdraftPairs(state),
});

const mapDispatchToProps = (dispatch) => {
  return {
    onClose: () => {
      dispatch(archiveActions.clearResetInstanceOverdrafts());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetArchiveTaskInstanceOverdraftWaitingDialog);

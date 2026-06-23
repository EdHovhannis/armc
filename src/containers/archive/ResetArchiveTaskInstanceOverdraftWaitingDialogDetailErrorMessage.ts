import { connect } from 'react-redux';

import ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage from '../../components/archive/ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage';
import * as archiveSelectors from '../../store/archive/Reducer';

const mapStateToProps = (state, props) => ({
  instance: archiveSelectors.getArchiveTaskInstance(state, props.archiveTaskInstanceId),
  requestResult: archiveSelectors.getResetArchiveTaskInstanceOverdraftResult(state, props.archiveTaskInstanceId),
});

export default connect(mapStateToProps)(ResetArchiveTaskInstanceOverdraftWaitingDialogDetailErrorMessage);

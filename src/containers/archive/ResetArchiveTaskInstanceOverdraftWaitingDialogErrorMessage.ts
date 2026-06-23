import { connect } from 'react-redux';

import ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage from '../../components/archive/ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage';
import * as archiveSelectors from '../../store/archive/Reducer';

const mapStateToProps = (state, props) => ({
  instance: archiveSelectors.getArchiveTaskInstance(state, props.archiveTaskInstanceId),
  requestResult: archiveSelectors.getResetArchiveTaskInstanceOverdraftResult(state, props.archiveTaskInstanceId),
});

export default connect(mapStateToProps)(ResetArchiveTaskInstanceOverdraftWaitingDialogErrorMessage);

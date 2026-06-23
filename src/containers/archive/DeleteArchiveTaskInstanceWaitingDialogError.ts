import { connect } from 'react-redux';

import ArchiveTaskInstanceWaitingDialogError from '../../components/archive/DeleteArchiveTaskInstanceWaitingDialogError';
import * as archiveSelectors from '../../store/archive/Reducer';

const mapStateToProps = (state, props) => ({
  instance: archiveSelectors.getArchiveTaskInstance(state, props.archiveTaskInstanceId),
  requestResult: archiveSelectors.getArchiveTaskInstancesDelete(state, props.archiveTaskInstanceId),
});

export default connect(mapStateToProps)(ArchiveTaskInstanceWaitingDialogError);

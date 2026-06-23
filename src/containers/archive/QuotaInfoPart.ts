import { connect } from 'react-redux';

import QuotaInfoPart from '../../components/archive/createArchiveParts/quota/QuotaInfoPart';
import * as archiveActions from '../../store/archive/Actions';
import * as overdraftActions from '../../store/overdraft/Actions';
import * as overdraftSelectors from '../../store/overdraft/Reducer';

const mapStateToProps = (state) => ({
  archiveOverdraftConfig: overdraftSelectors.getArchiveOverdraftConfig(state),
});

const mapDispatchToProps = (dispatch) => ({
  getArchiveOverdraftConfig: (okCallback, errorCallback) => {
    dispatch(overdraftActions.getArchiveOverdraftConfig(okCallback, errorCallback));
  },
  getOverdraftValue: (quota, fetchedCallback?) => {
    dispatch(archiveActions.getOverdraftValue(quota, fetchedCallback));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(QuotaInfoPart);

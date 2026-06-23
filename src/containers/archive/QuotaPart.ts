import { connect } from 'react-redux';

import QuotaPart from '../../components/archive/createArchiveParts/QuotaPart';
import * as archiveActions from '../../store/archive/Actions';

const mapDispatchToProps = (dispatch) => ({
  getOverdraftValue: (quota, fetcedCallback?) => {
    dispatch(archiveActions.getOverdraftValue(quota, fetcedCallback));
  },
});

export default connect(null, mapDispatchToProps)(QuotaPart);

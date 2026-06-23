import { connect } from 'react-redux';

import ArchiveTaskInstanceAddPopup, { Props } from '../../components/archive/ArchiveTaskInstanceAddPopup';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import * as zoneActions from '../../store/zone/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';
import { Zone } from '../../store/zone/Types';

const mapStateToProps = (state, props) => ({
  isZonesLoading: zoneSelectors.isLoading(state),
  isCreatingInstance: archiveSelectors.getArchiveTaskInstanceIsCreating(state),
});

const mapDispatchToProps = (dispatch, props: Props) => ({
  fetchZones(fetchedCallback?: (zone: Zone) => void): any {
    dispatch(zoneActions.fetchAllZone(fetchedCallback));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveTaskInstanceAddPopup);

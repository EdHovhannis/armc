import { connect } from 'react-redux';

import { ArchiveTaskInstanceAddPopupForm, Props } from '../../components/archive/ArchiveTaskInstanceAddPopup/ArchiveTaskInstanceAddPopupForm';
import * as archiveActions from '../../store/archive/Actions';
import * as zoneSelectors from '../../store/zone/Reducer';

const mapStateToProps = (state) => ({
  allZones: zoneSelectors.getZones(state),
});

const mapDispatchToProps = (dispatch, props: Props) => ({
  createInstance(zone: string, okCallback?): void {
    const { project: archiveTaskProject, name: archiveTaskName } = props.archiveTask || {};
    dispatch(archiveActions.createArchiveTaskInstance(archiveTaskProject, archiveTaskName, zone, okCallback));
  },
});

export default connect<Pick<Props, 'allZones'>, Pick<Props, 'createInstance'>, Exclude<Props, 'allZones' | 'createInstance'>>(
  mapStateToProps,
  mapDispatchToProps,
)(ArchiveTaskInstanceAddPopupForm);

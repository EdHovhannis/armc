import { connect } from 'react-redux';

import WaitingDialog from '../../components/WaitingDialog';
import * as archiveActions from '../../store/archive/Actions';
import * as archiveSelectors from '../../store/archive/Reducer';
import { ArchiveTaskDelete } from '../../store/archive/Types';

const mapStateToProps = (state) => {
  const archiveTaskDelete = archiveSelectors.getArchiveTaskDelete(state);
  return {
    title: 'Удаление архива',
    open: Boolean(archiveTaskDelete),
    complete: [ArchiveTaskDelete.success, ArchiveTaskDelete.fail].includes(archiveTaskDelete as ArchiveTaskDelete),
    success: archiveTaskDelete === ArchiveTaskDelete.success,
    successMessage: 'Архив успешно удален',
    errorMessage: 'Произошла ошибка при удалении архива',
  };
};

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(archiveActions.clearDeleteArchiveTaskAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WaitingDialog);

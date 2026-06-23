import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  FormHelperText,
  SelectProps,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';

import { Loader } from '../../../components/utils/Loader';
import ArchiveTaskInstanceAddPopupForm from '../../../containers/archive/ArchiveTaskInstanceAddPopupForm';
import { ShortArchiveTaskWithRole } from '../../../store/archive/Actions';
import { Zone } from '../../../store/zone/Types';

export interface Props {
  isCreatingInstance: boolean;
  archiveTask: ShortArchiveTaskWithRole;
  isZonesLoading: boolean;
  fetchZones(fetchedCallback?: (zone: Zone) => void): any;
  onClose: () => void;
}

const ArchiveTaskInstanceAddPopup: React.FC<Props> = (props) => {
  const { isZonesLoading, fetchZones, isCreatingInstance } = props;
  React.useEffect(() => {
    fetchZones();
  }, []);
  return (
    <Dialog open>
      <DialogTitle>Добавление экземпляра задачи в зону</DialogTitle>
      {isZonesLoading || isCreatingInstance ? (
        <div style={{ minHeight: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress disableShrink />
        </div>
      ) : (
        <ArchiveTaskInstanceAddPopupForm {...props} />
      )}
    </Dialog>
  );
};

export default ArchiveTaskInstanceAddPopup;
